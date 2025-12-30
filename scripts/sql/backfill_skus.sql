-- Backfill SKUs for products that don't have one
-- Pattern: SKU-{ID} (e.g., SKU-101)

UPDATE products
SET sku = 'SKU-' || id
WHERE sku IS NULL OR sku = '';
