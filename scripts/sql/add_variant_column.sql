-- Add variant column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant TEXT;
