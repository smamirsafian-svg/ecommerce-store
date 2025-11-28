-- Enhance categories table with additional fields and optimizations
-- Safe migration that checks for existing columns before adding

-- Add updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE 'updated_at column added to categories table';
  ELSE
    RAISE NOTICE 'updated_at column already exists in categories table';
  END IF;
END $$;

-- Add description column (optional)
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
  ELSE
    RAISE NOTICE 'description column already exists in categories table';
  END IF;
END $$;

-- Add is_active column (for soft delete)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'categories' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    
    RAISE NOTICE 'is_active column added to categories table';
  ELSE
    RAISE NOTICE 'is_active column already exists in categories table';
  END IF;
END $$;

-- Ensure unique constraint on slug (partial index for active categories only)
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique 
ON categories(slug) 
WHERE is_active = true;

-- Add index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_categories_created_at 
ON categories(created_at DESC);

-- Add index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_categories_is_active 
ON categories(is_active) 
WHERE is_active = true;

-- Create or replace function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on category updates
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN categories.updated_at IS 'Timestamp when category was last updated';
COMMENT ON COLUMN categories.description IS 'Optional category description for admin use';
COMMENT ON COLUMN categories.is_active IS 'Whether category is active (for soft delete)';

