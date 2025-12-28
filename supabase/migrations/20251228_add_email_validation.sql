-- Add email and email_verified columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create function to sync user data on insert/update
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = NEW.email,
    email_verified = (NEW.email_confirmed_at IS NOT NULL)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync updates from auth.users to public.profiles
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- Create function to sync user data on insert (if not already handled by another trigger)
-- Note: Often there is already a handle_new_user trigger. We should modify that or ensure this runs too.
-- For safety, let's create a specific trigger for this sync if the row exists
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- We use UPSERT (INSERT ... ON CONFLICT) to ensure we behave correctly if profile was created by another trigger
  INSERT INTO public.profiles (id, email, email_verified)
  VALUES (
    NEW.id, 
    NEW.email, 
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger for INSERT as well, to capture initial email state
DROP TRIGGER IF EXISTS on_auth_user_created_email_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_email_sync
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_user_email_sync();

-- Backfill existing data
DO $$
DECLARE
  user_record record;
BEGIN
  FOR user_record IN SELECT id, email, email_confirmed_at FROM auth.users LOOP
    UPDATE public.profiles
    SET 
      email = user_record.email,
      email_verified = (user_record.email_confirmed_at IS NOT NULL)
    WHERE id = user_record.id;
  END LOOP;
END;
$$;
