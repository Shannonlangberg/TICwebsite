-- TIC Platform — schema v2: native events (replaces PCO Registrations for
-- the Gathering), per-user team admin access (replaces the shared
-- ADMIN_PASSWORD cookie), and dropping the PCO People sync fields' reliance.
-- Run once in the Supabase SQL Editor, after schema.sql.
--
-- Why: signups no longer push to Planning Center at all (was: syncNewChristian
-- in src/lib/pco.ts, called from /api/signup/sync-pco). The Gathering is now
-- a fully standalone event the team creates here, with its own RSVP list —
-- no PCO Registrations dependency. Admin access moves from one shared
-- password to real per-person logins (profiles.is_admin), so team members
-- can be added/removed individually instead of everyone sharing one password.

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles.is_admin — per-user team admin flag
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- ─────────────────────────────────────────────────────────────────────────────
-- events — standalone Gatherings (or any other TIC event), created by admins
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  location text,
  capacity int,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

alter table public.events enable row level security;

create policy "Anyone can view events"
  on public.events for select
  using (true);

-- No insert/update/delete policy — events are only ever written via the
-- service_role key from /api/admin/events, gated by profiles.is_admin.
-- Same convention as the settings table above.

-- ─────────────────────────────────────────────────────────────────────────────
-- event_rsvps — who's coming. Public can submit (name/email/phone), no
-- account required — mirrors how the old PCO registration page worked
-- (no login needed to reserve a spot).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

create index if not exists event_rsvps_event on public.event_rsvps (event_id);

alter table public.event_rsvps enable row level security;

-- No client-side policies — submissions go through /api/rsvp (service_role,
-- validates event exists + capacity), reads go through /api/admin/events/[id]
-- (service_role, admin-gated). Keeps this consistent with settings/events
-- above rather than opening a public insert policy directly on the table.

comment on table public.events is
  'Standalone TIC events (Gatherings etc). Public read, admin-only write via service_role.';
comment on table public.event_rsvps is
  'Who RSVP''d to an event. No account required to submit. Admin-only read via service_role.';
