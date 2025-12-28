-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('customer', 'admin')) default 'customer',
  full_name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Trigger to create profile on signup (optional but good practice)
-- function to handle new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- trigger the function every time a user is created
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
