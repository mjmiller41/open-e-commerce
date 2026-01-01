-- Drop the incorrect uuid overload of the function that causes ambiguity with the bigint version
DROP FUNCTION IF EXISTS public.get_product_review_count(uuid);
