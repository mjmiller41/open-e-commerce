-- Consolidate RLS policies for profiles table to fix "Multiple Permissive Policies" lint error
-- and optimize performance.

-- 1. Drop existing conflicting policies
-- We drop both the admin and user-specific policies to replace them with one unified policy.
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles visible to owner and admins" ON profiles; -- prevent duplicate if re-run

-- 2. Create single optimized policy
-- This policy covers both use cases:
-- - Users reading their own profile (id = auth.uid())
-- - Admins reading any profile (is_admin())
-- We uses scalar subqueries (select ...) to ensure Postgres evaluates the functions once per statement.

CREATE POLICY "Profiles visible to owner and admins"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid()) 
    OR 
    (SELECT is_admin())
  );

-- 3. Ensure Update policy is also optimized (from previous step, just to be safe)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" on profiles
  for update using (id = (select auth.uid()));
