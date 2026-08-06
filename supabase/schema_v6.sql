-- ============================================================
-- Schema v6 — Hiring features
-- 1) growth_overview(): public read of funnel aggregates (anon)
-- 2) ab_stats():         A/B hero views/clicks/CTR per variant
-- 3) reengage_email_candidates(): "3 days no return" lifecycle
-- 4) lowbalance_email_candidates(): "3 runs from limit" lifecycle
-- Security-definer so anon clients get aggregates WITHOUT ever
-- reading raw user data. Idempotent: safe to run twice.
-- ============================================================

-- Growth dashboard aggregates (totals + 30-day trend + breakdowns).
create or replace function public.growth_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  select jsonb_build_object(
    'captures',  (select count(*)::int from public.captures),
    'signups',   (select count(*)::int from public.profiles),
    'runs',      (select count(*)::int from public.events where name = 'tool_used'),
    'shares',    (select count(*)::int from public.events where name = 'share_created'),
    'referralSignups', (select count(*)::int from public.events where name = 'signup' and props->>'ref' is not null),
    'challenges',(select count(*)::int from public.events where name = 'challenge_scored'),
    'emailSends',(select count(*)::int from public.email_logs),
    'topups',    (select count(*)::int from public.events where name = 'topup'),
    'daily',     coalesce((select jsonb_agg(x order by x.day) from (
                    select d.day,
                      (select count(*)::int from public.events e      where name='tool_used' and date(e.created_at)=d.day) as runs,
                      (select count(*)::int from public.captures c    where date(c.created_at)=d.day)                     as captures,
                      (select count(*)::int from public.profiles p    where date(p.created_at)=d.day)                     as signups
                    from generate_series(current_date - 29, current_date, '1 day') d(day)
                  ) x), '[]'::jsonb),
    'topEvents', coalesce((select jsonb_agg(t order by t.c desc) from (
                    select name, count(*)::int as c
                    from public.events group by name order by c desc limit 8
                  ) t), '[]'::jsonb),
    'sources',   coalesce((select jsonb_agg(s order by s.c desc) from (
                    select coalesce(utm_source, 'direct') as source, count(*)::int as c
                    from public.profiles where utm_source is not null
                    group by utm_source order by c desc limit 8
                  ) s), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

-- A/B hero test results (views, clicks, and simple CTR per variant).
create or replace function public.ab_stats()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select variant, views, clicks,
      case when views > 0 then round(100.0 * clicks / views, 1) else 0 end as ctr
    from (
      select 'A' as variant,
        (select count(*)::int from public.events where name='hero_view'  and props->>'variant'='A') as views,
        (select count(*)::int from public.events where name='hero_click' and props->>'variant'='A') as clicks
      union all
      select 'B',
        (select count(*)::int from public.events where name='hero_view'  and props->>'variant'='B'),
        (select count(*)::int from public.events where name='hero_click' and props->>'variant'='B')
    ) t
  ) x;
$$;

-- Signed up users with no activity in the last 3 days (re-engage after 3+ days).
create or replace function public.reengage_email_candidates(limit_n int default 200)
returns table(email text)
language sql
security definer
set search_path = public
as $$
  select p.email
  from public.profiles p
  where p.email is not null
    and p.created_at < now() - interval '3 days'
    and not exists (select 1 from public.events e
        where e.user_id = p.id and e.created_at > now() - interval '3 days')
    and not exists (select 1 from public.email_logs el
        where el.email = p.email and el.campaign = 'reengage'
          and el.sent_at > now() - interval '7 days')
  order by p.created_at desc
  limit limit_n;
$$;

-- Signed up users with 1-3 credits left (near the limit, loss-aversion nudge).
create or replace function public.lowbalance_email_candidates(limit_n int default 200)
returns table(email text, credits int)
language sql
security definer
set search_path = public
as $$
  select p.email, p.credits::int as credits
  from public.profiles p
  where p.email is not null
    and coalesce(p.credits, 0) between 1 and 3
    and not exists (select 1 from public.email_logs el
        where el.email = p.email and el.campaign = 'lowbalance'
          and el.sent_at > now() - interval '7 days')
  order by p.created_at desc
  limit limit_n;
$$;

grant execute on function public.growth_overview() to anon, authenticated;
grant execute on function public.ab_stats() to anon, authenticated;
grant execute on function public.reengage_email_candidates(int) to anon, authenticated;
grant execute on function public.lowbalance_email_candidates(int) to anon, authenticated;