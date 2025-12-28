-- Optimize policies for profiles table
-- Replacing direct auth.uid() calls with (select auth.uid()) for performance

-- 1. Update Policy
-- Users should be able to update their own profile
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using (id = (select auth.uid()));

-- 2. Select Policy
-- If profiles are private to the user:
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles
  for select using (id = (select auth.uid()));

-- Note: If your profiles are intended to be public (viewable by everyone), 
-- you would likely use: create policy "Public profiles" on profiles for select using (true);
-- In that case, you do not need the "Users can view own profile" policy above.

-- 3. Insert Policy
-- Often handled by triggers (like handle_new_user), but if direct insert is allowed:
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (id = (select auth.uid()));
