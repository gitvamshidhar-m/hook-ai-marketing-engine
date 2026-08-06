-- ============================================================
-- Hook AI · Schema v3
-- 1) Share view/click tracking
-- 2) Lead capture on shared pages
-- 3) Arbitrary-amount credit spend (for premium AI tiers)
-- Idempotent: safe to run twice.
-- ============================================================

-- 1) Track views & clicks per shared campaign link
alter table public.shares add column if not exists views int not null default 0;
alter table public.shares add column if not exists clicks int not null default 0;
alter table public.shares add column if not exists updated_at timestamptz not null default now();

-- 2) Leads captured on published /s/[slug] pages
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  share_id uuid references public.shares(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  email text not null,
  company text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert" on public.leads for insert with check (true);

drop policy if exists "leads owner select" on public.leads;
create policy "leads owner select" on public.leads for select using (auth.uid() = user_id);

drop policy if exists "leads admin select" on public.leads;
create policy "leads admin select" on public.leads for select using (coalesce(public.is_admin(), false));

-- RPC: atomic increment of a share's views or clicks (anon-safe)
create or replace function public.increment_share_stat(slug_text text, is_view boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.shares
  set views = views + case when is_view then 1 else 0 end,
      clicks = clicks + case when is_view then 0 else 1 end,
      updated_at = now()
  where slug = slug_text;
$$;

-- RPC: atomic credit spend of an arbitrary amount (returns remaining, or -1 if insufficient)
create or replace function public.spend_credits(uid uuid, amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare cur integer;
begin
  update public.profiles
  set credits = credits - amount
  where id = uid and credits >= amount
  returning credits into cur;
  return coalesce(cur, -1);
end;
$$;