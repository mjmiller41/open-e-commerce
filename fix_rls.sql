-- Secure RLS Fix

-- 1. Create a secure helper function to check admin status
-- This function runs with the privileges of the creator (SECURITY DEFINER),
-- allowing it to check the profiles table even if the user doesn't have direct access.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Revoke execute permission from public to ensure controlled usage (optional but good practice)
-- In this case we actually need it executable by authenticated users so they can pass the RLS check,
-- but we rely on the internal logic to return false if not admin.
-- However, standard practice for sensitive functions is to be careful.
-- Since this is used in RLS for the user themselves, we keep it executable.

-- 3. Drop insecure policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- 4. Create new secure policies
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin());
