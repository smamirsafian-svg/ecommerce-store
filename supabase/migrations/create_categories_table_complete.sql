-- Complete Categories Table Migration
-- Creates the categories table with all required columns if it doesn't exist
-- Adds missing columns if the table exists but is incomplete
-- Safe and idempotent - can be run multiple times

-- Step 1: Create table if it doesn't exist with all required columns
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 2: Add missing columns if table exists but is incomplete
-- Note: id column is handled by CREATE TABLE IF NOT EXISTS above
-- If table exists without id, it likely has a different structure - handle carefully

-- Add name column if missing (THIS IS THE CRITICAL ONE CAUSING THE ERROR)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'name'
  ) THEN
    -- Add as nullable first (in case table has existing rows)
    ALTER TABLE categories 
    ADD COLUMN name TEXT;
    
    -- Set a default value for any existing NULL rows
    UPDATE categories SET name = 'Unnamed Category' WHERE name IS NULL;
    
    -- Now make it NOT NULL
    ALTER TABLE categories 
    ALTER COLUMN name SET NOT NULL;
    
    RAISE NOTICE 'name column added to categories table';
  END IF;
END $$;

-- Add slug column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'slug'
  ) THEN
    -- Add as nullable first
    ALTER TABLE categories 
    ADD COLUMN slug TEXT;
    
    -- Generate slugs for existing rows
    -- First try to use name if it exists, otherwise use id, otherwise use row number
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'categories' 
      AND column_name = 'name'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'categories' 
      AND column_name = 'id'
    ) THEN
      -- Use name to generate slug, fallback to id
      UPDATE categories 
      SET slug = COALESCE(
        lower(regexp_replace(regexp_replace(name, '\s+', '-', 'g'), '[^a-z0-9\u0600-\u06FF-]', '', 'g')),
        'category-' || id::text
      )
      WHERE slug IS NULL;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'categories' 
      AND column_name = 'id'
    ) THEN
      -- Use id to generate slug
      UPDATE categories 
      SET slug = 'category-' || id::text
      WHERE slug IS NULL;
    ELSE
      -- Use row number as last resort
      UPDATE categories 
      SET slug = 'category-' || row_number() OVER (ORDER BY ctid)
      WHERE slug IS NULL;
    END IF;
    
    -- Now make it NOT NULL
    ALTER TABLE categories 
    ALTER COLUMN slug SET NOT NULL;
    
    RAISE NOTICE 'slug column added to categories table';
  END IF;
END $$;

-- Add description column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN description TEXT;
    
    RAISE NOTICE 'description column added to categories table';
  END IF;
END $$;

-- Add is_active column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    
    RAISE NOTICE 'is_active column added to categories table';
  END IF;
END $$;

-- Add created_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    
    RAISE NOTICE 'created_at column added to categories table';
  END IF;
END $$;

-- Add updated_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    
    RAISE NOTICE 'updated_at column added to categories table';
  END IF;
END $$;

-- Step 3: Ensure NOT NULL constraints (in case columns existed but were nullable)
DO $$ 
BEGIN
  -- Make name NOT NULL if it's currently nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'name'
    AND is_nullable = 'YES'
  ) THEN
    -- First set default for existing NULL values
    UPDATE categories SET name = 'Unnamed' WHERE name IS NULL;
    -- Then add NOT NULL constraint
    ALTER TABLE categories ALTER COLUMN name SET NOT NULL;
    
    RAISE NOTICE 'name column set to NOT NULL';
  END IF;
END $$;

DO $$ 
BEGIN
  -- Make slug NOT NULL if it's currently nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'slug'
    AND is_nullable = 'YES'
  ) THEN
    -- First set default for existing NULL values
    UPDATE categories SET slug = 'unnamed-' || id::text WHERE slug IS NULL;
    -- Then add NOT NULL constraint
    ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;
    
    RAISE NOTICE 'slug column set to NOT NULL';
  END IF;
END $$;

-- Step 4: Add unique constraint on slug (for active categories)
-- Drop existing unique constraint if it exists (to avoid conflicts)
DROP INDEX IF EXISTS categories_slug_unique;
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique 
ON categories(slug) 
WHERE is_active = true;

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_created_at 
ON categories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_categories_is_active 
ON categories(is_active) 
WHERE is_active = true;

-- Step 6: Create or replace function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger to auto-update updated_at on category updates
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add comments for documentation
COMMENT ON TABLE categories IS 'Product categories table for the ecommerce store';
COMMENT ON COLUMN categories.id IS 'Unique identifier for the category';
COMMENT ON COLUMN categories.name IS 'Category name (required)';
COMMENT ON COLUMN categories.slug IS 'URL-friendly slug for the category (unique, required)';
COMMENT ON COLUMN categories.description IS 'Optional category description for admin use';
COMMENT ON COLUMN categories.is_active IS 'Whether category is active (for soft delete)';
COMMENT ON COLUMN categories.created_at IS 'Timestamp when category was created';
COMMENT ON COLUMN categories.updated_at IS 'Timestamp when category was last updated';

