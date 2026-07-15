-- TIC Platform — initial schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

-- 1. profiles: one row per authenticated user, mirrors auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  gender text,
  is_new_christian boolean not null default false,
  pco_campus_id text,
  pco_campus_name text,
  pco_person_id text,
  pco_synced_at timestamptz,
  created_at timestamptz not null default now()
);

-- Safe to re-run against an existing database — adds the new signup fields
-- (phone / new-christian flag / PCO sync info) without touching existing rows.
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists is_new_christian boolean not null default false;
alter table public.profiles add column if not exists pco_campus_id text;
alter table public.profiles add column if not exists pco_campus_name text;
alter table public.profiles add column if not exists pco_person_id text;
alter table public.profiles add column if not exists pco_synced_at timestamptz;

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, gender, is_new_christian, pco_campus_id, pco_campus_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'gender',
    coalesce((new.raw_user_meta_data ->> 'is_new_christian')::boolean, false),
    new.raw_user_meta_data ->> 'pco_campus_id',
    new.raw_user_meta_data ->> 'pco_campus_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. videos: the TIC session list (managed by admin for now via SQL / Supabase Studio)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  vimeo_id text not null,
  vimeo_hash text, -- unlisted-link hash from vimeo.com/{id}/{hash}, needed to embed
  order_index int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create policy "Anyone signed in can view published videos"
  on public.videos for select
  using (published = true and auth.role() = 'authenticated');

-- 3. video_progress: which user has watched which video
create table if not exists public.video_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, video_id)
);

alter table public.video_progress enable row level security;

create policy "Users can view their own progress"
  on public.video_progress for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own progress"
  on public.video_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.video_progress for update
  using (auth.uid() = user_id);

-- 4. questions: submitted per user per video, private to the submitter (+ admin via service role)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  question_text text not null,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "Users can view their own questions"
  on public.questions for select
  using (auth.uid() = user_id);

create policy "Users can submit their own questions"
  on public.questions for insert
  with check (auth.uid() = user_id);

-- Note: the /admin area reads profiles, video_progress, and questions using the
-- Supabase service_role key from a Netlify Function, which bypasses RLS entirely —
-- that's expected and is how the shared admin password gate is meant to work here.

-- 5. settings: single-row-per-key config store, e.g. which PCO signup the
-- Gathering page currently links to. Only ever read/written via the
-- service_role key from admin routes — no RLS policies needed since it's
-- never queried from the client.
create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;
-- Intentionally no policies — this table is only ever touched via the
-- service_role key (bypasses RLS), never from a client-side query.
