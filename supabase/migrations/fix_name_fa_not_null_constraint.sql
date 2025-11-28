-- Fix name_fa NOT NULL Constraint
-- Makes name_fa column nullable to resolve insert constraint violations
-- Safe and idempotent - can be run multiple times

-- Step 1: Check if name_fa column exists and make it nullable
DO $$ 
BEGIN
  -- Check if name_fa column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'name_fa'
  ) THEN
    -- Check if it's currently NOT NULL
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'categories' 
      AND column_name = 'name_fa'
      AND is_nullable = 'NO'
    ) THEN
      -- First, populate any NULL values with a safe default from 'name' column
      -- (This handles edge cases where some rows might already be NULL)
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'categories' 
        AND column_name = 'name'
      ) THEN
        -- Update NULL name_fa values with name (if name exists)
        UPDATE categories 
        SET name_fa = name 
        WHERE name_fa IS NULL 
        AND name IS NOT NULL;
      END IF;
      
      -- Now make the column nullable
      ALTER TABLE categories 
      ALTER COLUMN name_fa DROP NOT NULL;
      
      RAISE NOTICE 'name_fa column changed from NOT NULL to nullable';
    ELSE
      RAISE NOTICE 'name_fa column already exists and is nullable';
    END IF;
  ELSE
    RAISE NOTICE 'name_fa column does not exist in categories table - nothing to fix';
  END IF;
END $$;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN categories.name_fa IS 'Persian/Farsi name for category (optional, nullable). Currently unused by CRUD system but preserved for potential future use.';

