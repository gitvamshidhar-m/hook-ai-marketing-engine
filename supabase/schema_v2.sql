-- ============================================================
-- Hook AI — schema v2 (run AFTER schema.sql in Supabase SQL Editor)
-- Adds: analytics table, persisted share links, referrals,
-- admin role + referral code columns on profiles.
-- ============================================================

-- 1. Analytics — one row per generated run
create table if not exists public.hook_ai_stats (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  topic text not null,
  hooks integer not null default 0,
  best_score integer not null default 0,
  ai_powered boolean not null default false,
  health_score integer,
  created_at timestamptz not null default now()
);

-- Idempotent backfill: if hook_ai_stats pre-existed without health_score,
-- add the column so the dashboard keeps working.
alter table public.hook_ai_stats add column if not exists health_score integer;
alter table public.hook_ai_stats add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.hook_ai_stats enable row level security;

-- Public read so the /analytics page can render without auth.
create policy "hook_ai_stats_public_read" on public.hook_ai_stats
  for select using (true);
-- App inserts rows with the anon key (no user session needed).
create policy "hook_ai_stats_anon_insert" on public.hook_ai_stats
  for insert to anon, authenticated with check (true);

-- 2. Persisted share links — recruiter-clickable campaign URLs
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  title text not null default 'Campaign',
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.shares enable row level security;

create policy "shares_public_read" on public.shares
  for select using (true);
create policy "shares_anon_insert" on public.shares
  for insert to anon, authenticated with check (true);
create policy "shares_owner_delete" on public.shares
  for delete using (auth.uid() = user_id);

-- 3. Referrals — who referred whom, and the bonus granted
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete set null,
  referred_email text,
  code text not null,
  credits_granted integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id);

-- 4. profiles additions: admin role + referral code
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists ref_code text;

-- Backfill a stable 8-char code for existing profiles.
update public.profiles
set ref_code = substr(replace(id::text, '-', ''), 1, 8)
where ref_code is null or ref_code = '';

create unique index if not exists profiles_ref_code_key
  on public.profiles(ref_code)
  where ref_code is not null;

-- 5. Promote the owner to admin (edit the email to match your account).
update public.profiles
set role = 'admin'
where email = 'gitvamshidhar@gmail.com';

-- 6. Security-definer RPC to credit any user (bypasses RLS).
-- Used by referrals and the admin dashboard.
create or replace function public.add_credits(target_user uuid, amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles set credits = credits + amount where id = target_user;
end;
$$;

-- 7. Admin RPCs — gated on profiles.role = 'admin' inside the function.
-- Security definer runs as the table owner, so no service key is needed.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.admin_overview()
returns jsonb
language plpgsql
security definer
as $$
declare
  out jsonb;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'payments', (select count(*) from public.payments),
    'revenue_paise', (select coalesce(sum(amount_paise), 0) from public.payments where status = 'completed'),
    'communityHooks', (select count(*) from public.community_hooks),
    'projects', (select count(*) from public.projects),
    'shares', (select count(*) from public.shares)
  ) into out;
  return out;
end;
$$;

create or replace function public.admin_community_list()
returns table (id bigint, hook text, score integer, topic text, created_at timestamptz)
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query select c.id, c.hook, c.score, c.topic, c.created_at
    from public.community_hooks c
    order by c.created_at desc
    limit 100;
end;
$$;

create or replace function public.admin_community_delete(hook_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  delete from public.community_hooks where id = hook_id;
end;
$$;

create or replace function public.admin_payments_list()
returns table (id uuid, email text, amount_paise integer, credits integer, status text, created_at timestamptz)
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query select p.id, pr.email, p.amount_paise, p.credits, p.status, p.created_at
    from public.payments p
    left join public.profiles pr on pr.id = p.user_id
    order by p.created_at desc
    limit 50;
end;
$$;

-- Note: community_hooks keeps its anon insert policy so the feed keeps
-- working. Spam is moderated from the admin dashboard (service-role API).
