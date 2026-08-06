-- ============================================================
-- Hook AI · Schema v4  (Growth layer)
-- 1) Attribution columns on profiles (UTM/referrer)
-- 2) events table — structured product analytics
-- 3) captures table — anonymous email capture funnel
-- Idempotent: safe to run twice.
-- ============================================================

alter table public.profiles add column if not exists utm_source text;
alter table public.profiles add column if not exists utm_medium text;
alter table public.profiles add column if not exists utm_campaign text;
alter table public.profiles add column if not exists referrer text;
alter table public.profiles add column if not exists captured_email boolean default false;

create table if not exists public.events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  props jsonb,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "events public insert" on public.events;
create policy "events public insert" on public.events for insert with check (true);

drop policy if exists "events admin select" on public.events;
create policy "events admin select" on public.events for select using (coalesce(public.is_admin(), false));

create table if not exists public.captures (
  id bigserial primary key,
  email text not null,
  topic text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.captures enable row level security;

drop policy if exists "captures public insert" on public.captures;
create policy "captures public insert" on public.captures for insert with check (true);

drop policy if exists "captures admin select" on public.captures;
create policy "captures admin select" on public.captures for select using (coalesce(public.is_admin(), false));