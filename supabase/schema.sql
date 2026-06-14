-- Ridho Firdaus Portfolio — Supabase schema
-- Run this in the Supabase SQL Editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.catalogs (
  id          uuid primary key default gen_random_uuid(),
  brand_name  text not null,
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists catalogs_brand_idx on public.catalogs(brand_name);

-- Link sub-catalogs to a brand (added after brands table exists).
alter table public.catalogs
  add column if not exists brand_id uuid references public.brands(id) on delete set null;
create index if not exists catalogs_brand_id_idx on public.catalogs(brand_id);

create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  client_name       text not null,
  category_id       uuid not null references public.categories(id),
  catalog_id        uuid references public.catalogs(id) on delete set null,
  year              integer not null,
  role              text not null,
  tools             text not null,
  short_description text not null,
  full_description  text not null,
  challenge         text not null,
  process           text not null,
  result            text not null,
  thumbnail_url     text not null,
  status            text not null default 'draft' check (status in ('draft', 'published')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.projects
  add column if not exists catalog_id uuid references public.catalogs(id) on delete set null;
-- Brand becomes the primary grouping; client_name kept as legacy fallback (nullable).
alter table public.projects
  add column if not exists brand_id uuid references public.brands(id) on delete set null;
alter table public.projects alter column client_name drop not null;
create index if not exists projects_brand_idx on public.projects(brand_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_category_idx on public.projects(category_id);
create index if not exists projects_catalog_idx on public.projects(catalog_id);

create table if not exists public.project_media (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  media_url  text not null,
  alt_text   text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_media_project_idx on public.project_media(project_id);

create table if not exists public.profile (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  headline          text not null,
  bio               text not null,
  profile_image_url text,
  email             text not null,
  whatsapp          text not null,
  instagram_url     text,
  linkedin_url      text,
  cv_url            text,
  updated_at        timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  company      text,
  project_need text not null,
  budget       text,
  message      text not null,
  status       text not null default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at   timestamptz not null default now()
);
create index if not exists contact_messages_status_idx on public.contact_messages(status);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The app reads/writes admin data with the service-role key (which bypasses
-- RLS). These policies only matter for the anon/public key.
-- ---------------------------------------------------------------------------

alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.catalogs enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.profile enable row level security;
alter table public.contact_messages enable row level security;

-- Public read access for portfolio content.
drop policy if exists "public read brands" on public.brands;
create policy "public read brands" on public.brands
  for select using (true);
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);
drop policy if exists "public read catalogs" on public.catalogs;
create policy "public read catalogs" on public.catalogs
  for select using (true);
drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects" on public.projects
  for select using (status = 'published');
drop policy if exists "public read project media" on public.project_media;
create policy "public read project media" on public.project_media
  for select using (true);
drop policy if exists "public read profile" on public.profile;
create policy "public read profile" on public.profile
  for select using (true);

-- Anonymous visitors may submit (but not read) contact messages.
drop policy if exists "public insert contact messages" on public.contact_messages;
create policy "public insert contact messages" on public.contact_messages
  for insert with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded media (public read).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media bucket" on storage.objects;
create policy "public read media bucket" on storage.objects
  for select using (bucket_id = 'media');
