-- Create enum for registration type
create type public.registration_type as enum ('fundador', 'comprado', 'herdero');

-- Create registrations table
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lastname text not null,
  phone text not null,
  email text not null,
  tipo registration_type not null,
  signature text not null,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.registrations enable row level security;

-- Allow anyone to insert registrations (public form)
create policy "Anyone can insert registrations"
on public.registrations
for insert
to anon, authenticated
with check (true);

-- Allow anyone to view registrations
create policy "Anyone can view registrations"
on public.registrations
for select
to anon, authenticated
using (true);

-- Allow anyone to delete registrations
create policy "Anyone can delete registrations"
on public.registrations
for delete
to anon, authenticated
using (true);