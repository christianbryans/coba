-- Temporarily disable RLS for development and testing
-- WARNING: This should only be used in development!

-- Disable RLS on activities table for testing
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing is complete with:
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
