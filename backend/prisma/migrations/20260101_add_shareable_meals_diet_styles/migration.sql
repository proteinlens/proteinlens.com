-- Migration: add_shareable_meals_diet_styles
-- Feature 017: Shareable Meal Scans & Diet Style Profiles
-- Constitution compliance: User data rights, traceability

-- ===========================================
-- 1. Create DietStyle table
-- ===========================================

CREATE TABLE "DietStyle" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "netCarbCapG" INTEGER,
    "fatTargetPercent" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietStyle_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on slug
CREATE UNIQUE INDEX "DietStyle_slug_key" ON "DietStyle"("slug");

-- Composite index for active diet styles ordering
CREATE INDEX "DietStyle_isActive_sortOrder_idx" ON "DietStyle"("isActive", "sortOrder");

-- ===========================================
-- 2. Add dietStyleId to User table
-- ===========================================

ALTER TABLE "User" ADD COLUMN "dietStyleId" UUID;

-- Index for efficient lookups
CREATE INDEX "User_dietStyleId_idx" ON "User"("dietStyleId");

-- Foreign key constraint (SetNull on delete)
ALTER TABLE "User" ADD CONSTRAINT "User_dietStyleId_fkey" 
    FOREIGN KEY ("dietStyleId") REFERENCES "DietStyle"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ===========================================
-- 3. Add shareable fields to MealAnalysis
-- ===========================================

-- Add columns (nullable initially for backfill)
ALTER TABLE "MealAnalysis" ADD COLUMN "shareId" VARCHAR(12);
ALTER TABLE "MealAnalysis" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "MealAnalysis" ADD COLUMN "dietStyleAtScanId" UUID;

-- ===========================================
-- 4. Backfill existing meals with shareIds
-- ===========================================

-- Generate unique shareIds for existing meals using substring of uuid
-- This produces URL-safe 10-character strings
UPDATE "MealAnalysis" 
SET "shareId" = replace(substring(gen_random_uuid()::text, 1, 10), '-', 'x')
WHERE "shareId" IS NULL;

-- ===========================================
-- 5. Make shareId required and add constraints
-- ===========================================

-- Make shareId non-nullable after backfill
ALTER TABLE "MealAnalysis" ALTER COLUMN "shareId" SET NOT NULL;

-- Unique constraint for share URLs
CREATE UNIQUE INDEX "MealAnalysis_shareId_key" ON "MealAnalysis"("shareId");

-- Index for efficient share URL lookups
CREATE INDEX "MealAnalysis_shareId_idx" ON "MealAnalysis"("shareId");

-- ===========================================
-- 6. Add foreign key for diet style snapshot
-- ===========================================

ALTER TABLE "MealAnalysis" ADD CONSTRAINT "MealAnalysis_dietStyleAtScanId_fkey" 
    FOREIGN KEY ("dietStyleAtScanId") REFERENCES "DietStyle"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
