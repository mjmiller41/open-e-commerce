-- Create index on foreign key order_id in order_items table
-- This optimizes:
-- 1. Foreign key constraint checks (specifically ON DELETE CASCADE from orders)
-- 2. Future queries joining orders -> order_items (e.g., viewing order details)
-- 3. Lookups by order_id

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
