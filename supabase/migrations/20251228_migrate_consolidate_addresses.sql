-- 1. Migrate existing data from profiles to addresses
-- We only migrate if the user doesn't already have an address in the addresses table to avoid duplication/conflicts
INSERT INTO public.addresses (user_id, address_line1, address_line2, city, state, zip_code, country, is_default)
SELECT 
    id as user_id,
    address_line1,
    address_line2,
    city,
    state,
    zip_code,
    'US' as country,
    true as is_default
FROM public.profiles
WHERE address_line1 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.addresses WHERE addresses.user_id = profiles.id
  );

-- 2. Update Foreign Key on addresses table to reference profiles instead of auth.users
-- This ensures strict referential integrity with our application's user model
ALTER TABLE public.addresses DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;
ALTER TABLE public.addresses
    ADD CONSTRAINT addresses_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 3. Remove address columns from profiles table
ALTER TABLE public.profiles
    DROP COLUMN IF EXISTS address_line1,
    DROP COLUMN IF EXISTS address_line2,
    DROP COLUMN IF EXISTS city,
    DROP COLUMN IF EXISTS state,
    DROP COLUMN IF EXISTS zip_code;
