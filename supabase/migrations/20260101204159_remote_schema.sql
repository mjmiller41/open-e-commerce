drop policy "Admins can view all reviews" on "public"."reviews";

drop policy "Public can view approved reviews" on "public"."reviews";

drop policy "Users can view their own reviews" on "public"."reviews";

drop policy "Admins can update reviews" on "public"."reviews";

drop policy "Authenticated users can insert reviews" on "public"."reviews";

drop policy "Users can delete their own reviews" on "public"."reviews";

drop policy "Allow admins to update settings" on "public"."store_settings";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_product_review_count(p_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.reviews WHERE product_id = p_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_product_average_rating(p_id bigint)
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    RETURN (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE product_id = p_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_product_review_count(p_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.reviews WHERE product_id = p_id);
END;
$function$
;


  create policy "public_select_reviews_consolidated"
  on "public"."reviews"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'admin'::text)))) OR (status = 'approved'::text) OR ((user_id IS NOT NULL) AND (user_id = ( SELECT auth.uid() AS uid)))));



  create policy "Admins can update reviews"
  on "public"."reviews"
  as permissive
  for update
  to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR ((( SELECT auth.jwt() AS jwt) ->> 'role'::text) = 'admin'::text)));



  create policy "Authenticated users can insert reviews"
  on "public"."reviews"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can delete their own reviews"
  on "public"."reviews"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Allow admins to update settings"
  on "public"."store_settings"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::text)))));



