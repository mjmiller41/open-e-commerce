-- Allow admins to view all orders
-- Uses a secure server-side check via the is_admin() security definer function
create policy "Admins can view all orders" on orders
  for select using (
    is_admin()
  );

-- Allow admins to update orders (e.g. status)
-- Uses a secure server-side check via the is_admin() security definer function
create policy "Admins can update orders" on orders
  for update using (
    is_admin()
  );
