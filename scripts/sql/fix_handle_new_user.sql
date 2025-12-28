-- Fix Mutable Search Path in handle_new_user
-- Redefining the function with explicit search_path = public, pg_temp
-- This prevents the function from being influenced by the caller's search_path,
-- ensuring it always uses the intended schemas (public) and prevents privilege escalation.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$;
