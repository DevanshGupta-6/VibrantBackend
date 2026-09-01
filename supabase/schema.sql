-- ============================================================================
-- Fest Admin Dashboard — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh
-- project. Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Roles
-- ----------------------------------------------------------------------------
do $$ begin
  create type admin_role as enum ('SUPER_ADMIN', 'COORDINATOR');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_status as enum ('pending', 'active', 'suspended');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- admin_profiles — one row per person who can access /admin.
-- role is NULL until a SUPER_ADMIN assigns one; status starts 'pending'.
-- id matches auth.users.id (1:1).
-- ----------------------------------------------------------------------------
create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role admin_role,
  status admin_status not null default 'pending',
  invited_by uuid references admin_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_profiles_status on admin_profiles(status);

-- ----------------------------------------------------------------------------
-- events
-- ----------------------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'General',
  venue text,
  start_time timestamptz not null,
  end_time timestamptz,
  banner_url text,
  is_published boolean not null default true,
  created_by uuid references admin_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_start_time on events(start_time);

-- ----------------------------------------------------------------------------
-- sponsors
-- ----------------------------------------------------------------------------
create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null default 'Silver', -- Title / Gold / Silver / Bronze / Partner
  logo_url text,
  website_url text,
  created_by uuid references admin_profiles(id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- gallery_photos — public-facing, shown outside the admin dashboard
-- ----------------------------------------------------------------------------
create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text not null,
  caption text,
  event_id uuid references events(id) on delete set null,
  uploaded_by uuid references admin_profiles(id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- faqs — shown on the public home page
-- ----------------------------------------------------------------------------
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  created_by uuid references admin_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_faqs_order on faqs(display_order);

-- ----------------------------------------------------------------------------
-- activity_log — feeds the "Recent Activity" panel on the dashboard
-- ----------------------------------------------------------------------------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references admin_profiles(id),
  actor_name text not null,
  action text not null,          -- e.g. 'created', 'updated', 'deleted', 'approved'
  entity_type text not null,     -- e.g. 'event', 'sponsor', 'photo', 'faq', 'admin'
  entity_label text,             -- human-readable label, e.g. the event title
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_created_at on activity_log(created_at desc);

-- ----------------------------------------------------------------------------
-- auth_rate_limit — sliding-window rate limiting for login/register.
-- Written/read only via the service-role client from server actions, never
-- exposed to the browser, so no RLS policy grants anon/authenticated access.
-- ----------------------------------------------------------------------------
create table if not exists auth_rate_limit (
  id bigint generated always as identity primary key,
  identifier text not null,   -- email or IP address
  action text not null,       -- 'login' | 'register'
  attempted_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_lookup on auth_rate_limit(identifier, action, attempted_at);

-- Housekeeping: drop attempts older than 1 day so the table doesn't grow forever.
create or replace function prune_auth_rate_limit() returns trigger as $$
begin
  -- Prune approximately 5% of the time.
  if random() < 0.05 then
    delete from auth_rate_limit
    where attempted_at < now() - interval '1 day';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prune_auth_rate_limit on auth_rate_limit;

create trigger trg_prune_auth_rate_limit
  after insert on auth_rate_limit
  for each row
  execute function prune_auth_rate_limit();


-- ----------------------------------------------------------------------------
-- updated_at helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_admin_profiles_updated_at on admin_profiles;
create trigger trg_admin_profiles_updated_at before update on admin_profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at before update on events
  for each row execute function set_updated_at();

drop trigger if exists trg_faqs_updated_at on faqs;
create trigger trg_faqs_updated_at before update on faqs
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table admin_profiles enable row level security;
alter table events enable row level security;
alter table sponsors enable row level security;
alter table gallery_photos enable row level security;
alter table faqs enable row level security;
alter table activity_log enable row level security;

-- Helper: current caller's role/status, read once per statement.
create or replace function current_admin_role() returns admin_role as $$
  select role from admin_profiles where id = auth.uid() and status = 'active';
$$ language sql stable security definer;

create or replace function is_active_admin() returns boolean as $$
  select exists (
    select 1 from admin_profiles where id = auth.uid() and status = 'active' and role is not null
  );
$$ language sql stable security definer;

-- admin_profiles: a user can read their own row; active admins can read all
-- rows (needed for the admin-management screen and "assigned by" lookups);
-- only SUPER_ADMIN can insert/update/delete other rows. A user may also
-- insert their own row once, at registration (role NULL, status pending).
drop policy if exists admin_profiles_self_select on admin_profiles;
create policy admin_profiles_self_select on admin_profiles
  for select using (id = auth.uid() or is_active_admin());

drop policy if exists admin_profiles_self_insert on admin_profiles;

create policy admin_profiles_self_insert on admin_profiles
  for insert
  with check (
    id = auth.uid()
    and role is null
    and status = 'pending'
  );


drop policy if exists admin_profiles_superadmin_update on admin_profiles;
create policy admin_profiles_superadmin_update on admin_profiles
  for update using (current_admin_role() = 'SUPER_ADMIN');

-- events: public can read published events; active admins can read all;
-- only active admins (either role — coordinators own this workflow, but
-- super admins can help out) can write.
drop policy if exists events_public_select on events;
create policy events_public_select on events
  for select using (is_published = true or is_active_admin());

drop policy if exists events_admin_write on events;
create policy events_admin_write on events
  for all using (is_active_admin()) with check (is_active_admin());

-- sponsors: public can read; only SUPER_ADMIN can write.
drop policy if exists sponsors_public_select on sponsors;
create policy sponsors_public_select on sponsors for select using (true);

drop policy if exists sponsors_superadmin_write on sponsors;
create policy sponsors_superadmin_write on sponsors
  for all using (current_admin_role() = 'SUPER_ADMIN')
  with check (current_admin_role() = 'SUPER_ADMIN');

-- gallery_photos: public can read; any active admin can write (coordinator duty).
drop policy if exists gallery_public_select on gallery_photos;
create policy gallery_public_select on gallery_photos for select using (true);

drop policy if exists gallery_admin_write on gallery_photos;
create policy gallery_admin_write on gallery_photos
  for all using (is_active_admin()) with check (is_active_admin());

-- faqs: public can read; any active admin can write (coordinator duty).
drop policy if exists faqs_public_select on faqs;
create policy faqs_public_select on faqs for select using (true);

drop policy if exists faqs_admin_write on faqs;
create policy faqs_admin_write on faqs
  for all using (is_active_admin()) with check (is_active_admin());

-- activity_log: only active admins can read; inserts happen via the
-- service-role client from server actions (bypasses RLS), so no insert
-- policy is granted to authenticated/anon.
drop policy if exists activity_log_admin_select on activity_log;
create policy activity_log_admin_select on activity_log
  for select using (is_active_admin());

-- ----------------------------------------------------------------------------
-- Storage bucket for gallery photos + sponsor logos + event banners
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fest-media', 'fest-media', true)
on conflict (id) do nothing;

drop policy if exists "fest-media public read" on storage.objects;
create policy "fest-media public read" on storage.objects
  for select using (bucket_id = 'fest-media');

drop policy if exists "fest-media admin write" on storage.objects;
create policy "fest-media admin write" on storage.objects
  for all using (bucket_id = 'fest-media' and is_active_admin())
  with check (bucket_id = 'fest-media' and is_active_admin());
