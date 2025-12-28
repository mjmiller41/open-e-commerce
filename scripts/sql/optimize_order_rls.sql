-- Optimize policies for orders table
drop policy if exists "Users can view own orders" on orders;
create policy "Users can view own orders" on orders
  for select using (user_id = (select auth.uid()));

drop policy if exists "Users can create orders" on orders;
create policy "Users can create orders" on orders
  for insert with check (user_id = (select auth.uid()));

-- Optimize policies for order_items table
drop policy if exists "Users can view own order items" on order_items;
create policy "Users can view own order items" on order_items
  for select using (user_id = (select auth.uid()));

drop policy if exists "Users can create order items" on order_items;
create policy "Users can create order items" on order_items
  for insert with check (user_id = (select auth.uid()));
