-- Fix category hierarchy for Audio products
UPDATE products
SET category = 'Electronics > Audio'
WHERE category = 'Audio';

-- Also update any existing subcategories of Audio if they exist
UPDATE products
SET category = 'Electronics > ' || category
WHERE category LIKE 'Audio >%';
