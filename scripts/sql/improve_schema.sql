-- Improvement: Add missing Foreign Key and Index for product_id on order_items

-- 1. Add Foreign Key constraint to ensure data integrity
-- This prevents a product from being deleted if it is referenced in an order item.
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES public.products(id)
  ON DELETE RESTRICT;

-- 2. Add Index to improve join performance
-- This speeds up queries that join orders to products or filter by product.
CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items(product_id);
