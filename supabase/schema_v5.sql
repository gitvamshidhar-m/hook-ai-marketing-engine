-- ============================================================
-- Schema v5 — Lifecycle email engine
-- email_logs: dedupe + audit for lifecycle sends.
-- Security-definer RPCs let the daily cron (running as anon)
-- read candidate lists and write send logs WITHOUT exposing
-- the underlying tables to anon clients.
-- ============================================================

create table if not exists public.email_logs (
  id bigserial primary key,
  email text not null,
  campaign text not null,
  sent_at timestamptz not null default now()
);

create index if not exists email_logs_lookup on public.email_logs (email, campaign, sent_at);
alter table public.email_logs enable row level security;

-- Insert a send record, returning false if this email+campaign was
-- already mailed within the last 7 days (idempotent for cron reruns).
create or replace function public.log_email(p_email text, p_campaign text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.email_logs
    where email = p_email and campaign = p_campaign
      and sent_at > now() - interval '7 days'
  ) then
    return false;
  end if;
  insert into public.email_logs (email, campaign) values (p_email, p_campaign);
  return true;
end;
$$;

-- Captured emails that have NOT yet signed up (nurture candidates),
-- newest first. Excludes anyone already mailed in the last 7 days.
create or replace function public.nurture_email_candidates(limit_n int default 200)
returns table(email text, topic text)
language sql
security definer
set search_path = public
as $$
  select c.email, coalesce(c.topic, '') as topic
  from public.captures c
  where not exists (select 1 from public.profiles p where p.email = c.email)
    and not exists (
      select 1 from public.email_logs el
      where el.email = c.email and el.campaign = 'nurture'
        and el.sent_at > now() - interval '7 days'
    )
  order by c.created_at desc
  limit limit_n;
$$;

-- Signed-up users with 0 credits for at least 24h (topup candidates).
create or replace function public.topup_email_candidates(limit_n int default 200)
returns table(email text)
language sql
security definer
set search_path = public
as $$
  select p.email
  from public.profiles p
  where p.email is not null
    and coalesce(p.credits, 0) <= 0
    and p.created_at < now() - interval '1 day'
    and not exists (
      select 1 from public.email_logs el
      where el.email = p.email and el.campaign = 'topup'
        and el.sent_at > now() - interval '7 days'
    )
  order by p.created_at desc
  limit limit_n;
$$;

grant execute on function public.log_email(text, text) to anon, authenticated;
grant execute on function public.nurture_email_candidates(int) to anon, authenticated;
grant execute on function public.topup_email_candidates(int) to anon, authenticated;
