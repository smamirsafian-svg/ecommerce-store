-- Safe migration to add role column to profiles table
-- This migration checks if the column exists before adding it
-- Can be executed via Supabase Dashboard SQL Editor or Supabase CLI

DO $$ 
BEGIN
  -- Check if role column exists, if not, add it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    -- Add role column with default value 'user'
    ALTER TABLE profiles 
    ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
    
    -- Add CHECK constraint to ensure only valid roles
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin'));
    
    -- Create index for better query performance
    CREATE INDEX IF NOT EXISTS idx_profiles_role 
    ON profiles(role);
    
    -- Log success (optional, for Supabase logs)
    RAISE NOTICE 'Role column added to profiles table successfully';
  ELSE
    RAISE NOTICE 'Role column already exists in profiles table';
  END IF;
END $$;

-- Optional: Add comment to column for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user (default) or admin';

