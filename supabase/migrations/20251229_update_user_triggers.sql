-- Update handle_user_email_sync to include full_name from metadata
create or replace function public.handle_user_email_sync()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, email_verified, full_name)
  values (
    new.id,
    new.email,
    (new.email_confirmed_at is not null),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    email_verified = excluded.email_verified,
    full_name = excluded.full_name;
  return new;
end;
$$;

-- Update handle_user_update to include full_name from metadata
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = public, pg_catalog
as $$
begin
  update public.profiles
  set
    email = new.email,
    email_verified = (new.email_confirmed_at is not null),
    full_name = new.raw_user_meta_data->>'full_name'
  where id = new.id;
  return new;
end;
$$;
