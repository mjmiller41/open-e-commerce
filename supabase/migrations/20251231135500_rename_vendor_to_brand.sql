-- Rename 'show_vendor' to 'show_brand' in store_settings table
ALTER TABLE public.store_settings 
RENAME COLUMN show_vendor TO show_brand;
