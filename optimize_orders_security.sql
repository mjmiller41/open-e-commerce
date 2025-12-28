-- Optimize RLS policies for orders table
-- Fixes "Multiple Permissive Policies" lint warning
-- Consolidates "Admins can view all orders" and "Users can view own orders" into one policy

-- 1. Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- 2. Create single combined policy for SELECT
-- This ensures the query planner evaluates the condition efficiently in one pass.
-- Uses scalar subqueries for auth.uid() and is_admin() to ensure single evaluation.
CREATE POLICY "Access to orders (Admin or Owner)"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (SELECT public.is_admin()) 
  OR 
  user_id = (SELECT auth.uid())
);

-- Note: "Admins can update orders" (FOR UPDATE) remains separate as it is likely specific to admins 
-- and doesn't conflict with a general "user can update" policy (which doesn't exist yet for status).
