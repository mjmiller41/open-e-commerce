-- Add new columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cost numeric,
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS product_type text,
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS gtin text,
ADD COLUMN IF NOT EXISTS mpn text,
ADD COLUMN IF NOT EXISTS condition text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Migrate existing 'image' column to 'images' array
UPDATE public.products
SET images = ARRAY[image]
WHERE image IS NOT NULL AND images = '{}';

-- Create an index on the new columns for better performance if needed
CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products (sku);
CREATE INDEX IF NOT EXISTS products_gtin_idx ON public.products (gtin);
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand);
