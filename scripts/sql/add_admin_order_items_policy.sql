-- Add policy for admins to view all order items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
TO authenticated 
USING (public.is_admin());
