-- WaterWise / Water Conservation Tracker
-- This is a shared demo tracker: entries and the daily goal are visible to anyone
-- who can access the app. Do not store names, addresses, or other personal data.
create extension if not exists pgcrypto;

create table if not exists public.water_entries (
  id uuid primary key default gen_random_uuid(),
  activity text not null check (activity in ('Shower','Bath','Toilet','Laundry','Dishwashing','Cooking & drinking','Gardening','Cleaning','Other')),
  litres numeric(10,1) not null check (litres >= 0.1 and litres <= 100000),
  entry_date date not null default current_date check (entry_date <= current_date),
  note varchar(180),
  created_at timestamptz not null default now()
);
create index if not exists water_entries_entry_date_idx on public.water_entries(entry_date desc);
create index if not exists water_entries_activity_idx on public.water_entries(activity);

create table if not exists public.app_settings (
  id integer primary key check (id = 1),
  daily_goal_litres numeric(10,1) not null default 150 check (daily_goal_litres >= 1 and daily_goal_litres <= 100000),
  updated_at timestamptz not null default now()
);
insert into public.app_settings(id,daily_goal_litres) values (1,150)
on conflict (id) do nothing;

alter table public.water_entries enable row level security;
alter table public.app_settings enable row level security;

-- Intentionally public demo policies: this app has no accounts, so data is shared.
-- Restrict or replace these policies before using the app for private or production data.
drop policy if exists "Public can read water entries" on public.water_entries;
create policy "Public can read water entries" on public.water_entries for select to anon, authenticated using (true);
drop policy if exists "Public can add water entries" on public.water_entries;
create policy "Public can add water entries" on public.water_entries for insert to anon, authenticated with check (true);
drop policy if exists "Public can delete water entries" on public.water_entries;
create policy "Public can delete water entries" on public.water_entries for delete to anon, authenticated using (true);
drop policy if exists "Public can read app settings" on public.app_settings;
create policy "Public can read app settings" on public.app_settings for select to anon, authenticated using (true);
drop policy if exists "Public can update app settings" on public.app_settings;
create policy "Public can update app settings" on public.app_settings for update to anon, authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, delete on public.water_entries to anon, authenticated;
grant select, update on public.app_settings to anon, authenticated;
