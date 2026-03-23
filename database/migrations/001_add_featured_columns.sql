-- Migration: Add featured product columns
-- This script adds columns to support featured and best seller products on the homepage

ALTER TABLE products ADD COLUMN IF NOT EXISTS isHomepageFeatured TINYINT(1) DEFAULT 0 AFTER badge;
ALTER TABLE products ADD COLUMN IF NOT EXISTS isBestSeller TINYINT(1) DEFAULT 0 AFTER isHomepageFeatured;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_homepage_featured ON products(isHomepageFeatured);
CREATE INDEX IF NOT EXISTS idx_best_seller ON products(isBestSeller);
