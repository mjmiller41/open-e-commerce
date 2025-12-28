-- Fix 1: Drop potential blocking triggers on auth.users
-- Failing triggers are the most common cause of 400 errors on signup
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Fix 2: Ensure profiles table matches the new schema
-- If the table existed from a previous run, it might be missing columns.
-- We add them here if they are missing.

create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('customer', 'admin')) default 'customer',
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles add column if not exists address_line1 text;
alter table profiles add column if not exists address_line2 text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists state text;
alter table profiles add column if not exists zip_code text;
alter table profiles add column if not exists phone_number text;

-- Fix 3: Re-apply policies (idempotent)
alter table profiles enable row level security;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Note: We are relying on the frontend (ProfilePage) to create/update the profile row via upsert,
-- instead of a backend trigger, to avoid complex permission issues during signup.
