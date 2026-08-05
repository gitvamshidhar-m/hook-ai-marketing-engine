-- ============================================================
-- Hook AI — schema + policies
-- Run this once in Supabase SQL Editor.
-- ============================================================

-- 1. User profiles with credit balance
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text default 'Marketer',
  credits integer not null default 10,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 2. Atomic credit spend
create or replace function public.spend_credit(user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  current_credits integer;
begin
  select credits into current_credits from public.profiles where id = user_id;
  if current_credits is null or current_credits <= 0 then
    return -1;
  end if;
  update public.profiles set credits = credits - 1 where id = user_id;
  return current_credits - 1;
end;
$$;

-- 3. Saved projects (per-user campaigns)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  topic text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- 4. Community feed — anonymous top hooks
create table if not exists public.community_hooks (
  id bigserial primary key,
  hook text not null,
  score integer not null,
  channel text,
  psychology text,
  topic text,
  created_at timestamptz not null default now()
);

alter table public.community_hooks enable row level security;

-- Public read (feed page), insert is controlled from the API only.
create policy "community_hooks_public_read" on public.community_hooks
  for select using (true);

-- 5. Payments ledger (Stripe webhooks)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_checkout_id text,
  stripe_event_id text unique,
  amount_cents integer not null default 0,
  credits integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

-- 6. Grants every existing user 10 credits (idempotent)
insert into public.profiles (id, email, credits)
select id, email, 10 from auth.users
on conflict (id) do nothing;
