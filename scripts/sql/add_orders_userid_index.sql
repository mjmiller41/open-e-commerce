-- Create index on foreign key user_id in orders table
-- This optimizes:
-- 1. Foreign key constraint checks (ON DELETE/UPDATE on auth.users)
-- 2. RLS policy checks: "Users can view own orders" using (user_id = auth.uid())
-- 3. Queries filtering by user_id (e.g. Profile Page)

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
