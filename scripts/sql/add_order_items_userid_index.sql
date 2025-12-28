-- Create index on foreign key user_id in order_items table
-- This optimizes:
-- 1. Foreign key constraint checks (ON DELETE/UPDATE on auth.users)
-- 2. RLS policy checks: "Users can view own order items" using (user_id = auth.uid())
-- 3. Future queries filtering by user_id

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_user_id ON public.order_items (user_id);
