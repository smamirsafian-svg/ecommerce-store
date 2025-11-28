-- Complete Products Table Migration
-- Creates the products table with all required columns if it doesn't exist
-- Adds missing columns if the table exists but is incomplete
-- Safe and idempotent - can be run multiple times

-- Step 1: Create table if it doesn't exist with all required columns
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  inventory INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 2: Add missing columns if table exists but is incomplete

-- Add name column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN name TEXT;
    
    UPDATE products SET name = 'Unnamed Product' WHERE name IS NULL;
    
    ALTER TABLE products 
    ALTER COLUMN name SET NOT NULL;
    
    RAISE NOTICE 'name column added to products table';
  END IF;
END $$;

-- Add slug column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN slug TEXT;
    
    UPDATE products 
    SET slug = COALESCE(
      lower(regexp_replace(regexp_replace(name, '\s+', '-', 'g'), '[^a-z0-9\u0600-\u06FF-]', '', 'g')),
      'product-' || id::text
    )
    WHERE slug IS NULL;
    
    ALTER TABLE products 
    ALTER COLUMN slug SET NOT NULL;
    
    RAISE NOTICE 'slug column added to products table';
  END IF;
END $$;

-- Add description column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN description TEXT;
    
    RAISE NOTICE 'description column added to products table';
  END IF;
END $$;

-- Add price column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'price'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN price BIGINT NOT NULL DEFAULT 0;
    
    RAISE NOTICE 'price column added to products table';
  END IF;
END $$;

-- Add inventory column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'inventory'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN inventory INTEGER NOT NULL DEFAULT 0;
    
    RAISE NOTICE 'inventory column added to products table';
  END IF;
END $$;

-- Add category_id column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'category_id column added to products table';
  END IF;
END $$;

-- Add images column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN images TEXT[] DEFAULT '{}';
    
    RAISE NOTICE 'images column added to products table';
  END IF;
END $$;

-- Add specs column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'specs'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN specs JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE 'specs column added to products table';
  END IF;
END $$;

-- Add is_active column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    
    RAISE NOTICE 'is_active column added to products table';
  END IF;
END $$;

-- Add created_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    
    RAISE NOTICE 'created_at column added to products table';
  END IF;
END $$;

-- Add updated_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    
    RAISE NOTICE 'updated_at column added to products table';
  END IF;
END $$;

-- Step 3: Ensure NOT NULL constraints (in case columns existed but were nullable)

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'name'
    AND is_nullable = 'YES'
  ) THEN
    UPDATE products SET name = 'Unnamed' WHERE name IS NULL;
    ALTER TABLE products ALTER COLUMN name SET NOT NULL;
    
    RAISE NOTICE 'name column set to NOT NULL';
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'slug'
    AND is_nullable = 'YES'
  ) THEN
    UPDATE products SET slug = 'unnamed-' || id::text WHERE slug IS NULL;
    ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
    
    RAISE NOTICE 'slug column set to NOT NULL';
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'price'
    AND is_nullable = 'YES'
  ) THEN
    UPDATE products SET price = 0 WHERE price IS NULL;
    ALTER TABLE products ALTER COLUMN price SET NOT NULL;
    
    RAISE NOTICE 'price column set to NOT NULL';
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'inventory'
    AND is_nullable = 'YES'
  ) THEN
    UPDATE products SET inventory = 0 WHERE inventory IS NULL;
    ALTER TABLE products ALTER COLUMN inventory SET NOT NULL;
    
    RAISE NOTICE 'inventory column set to NOT NULL';
  END IF;
END $$;

-- Step 4: Add unique constraint on slug (for active products)
DROP INDEX IF EXISTS products_slug_unique;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique 
ON products(slug) 
WHERE is_active = true;

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_slug 
ON products(slug);

CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_is_active 
ON products(is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

-- Step 6: Create or replace function to auto-update updated_at (if not exists from categories migration)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger to auto-update updated_at on product updates
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add comments for documentation
COMMENT ON TABLE products IS 'Products table for the ecommerce store';
COMMENT ON COLUMN products.id IS 'Unique identifier for the product';
COMMENT ON COLUMN products.name IS 'Product name (required)';
COMMENT ON COLUMN products.slug IS 'URL-friendly slug for the product (unique, required)';
COMMENT ON COLUMN products.description IS 'Optional product description';
COMMENT ON COLUMN products.price IS 'Product price in smallest currency unit (required)';
COMMENT ON COLUMN products.inventory IS 'Product inventory count (required, default 0)';
COMMENT ON COLUMN products.category_id IS 'Foreign key reference to categories table';
COMMENT ON COLUMN products.images IS 'Array of product image URLs';
COMMENT ON COLUMN products.specs IS 'Product specifications as JSONB key-value pairs';
COMMENT ON COLUMN products.is_active IS 'Whether product is active (for soft delete)';
COMMENT ON COLUMN products.created_at IS 'Timestamp when product was created';
COMMENT ON COLUMN products.updated_at IS 'Timestamp when product was last updated';

