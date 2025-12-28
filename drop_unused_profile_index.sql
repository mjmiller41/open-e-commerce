-- Drop unused and redundant index on profiles table
-- The 'id' column is already the primary key, so it has an implicit unique index.
-- This extra index is unused and wastes resources.

DROP INDEX IF EXISTS idx_profiles_id;
