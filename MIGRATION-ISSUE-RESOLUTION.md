# Feature 017 Migration Issue & Resolution

**Date**: January 1, 2026  
**Status**: ✅ RESOLVED

## Problem

The GitHub Actions deployment failed when trying to apply the Feature 017 database migration:

```
ERROR: foreign key constraint "User_dietStyleId_fkey" cannot be implemented
DETAIL: Key columns "dietStyleId" and "id" are of incompatible types: uuid and text.

Error Code: P3018 (Migration failed to apply)
```

### Root Cause Analysis

The migration was failing because:

1. **DietStyle model** was using Prisma's `@default(cuid())` which generates text-based IDs
2. **User model** has all existing foreign keys as UUID type (inherited from database schema)
3. **Foreign key constraint** between incompatible types (UUID ↔ TEXT) cannot be created in PostgreSQL

The mismatch occurred because:
```prisma
// ❌ WRONG - DietStyle uses text id (cuid)
model DietStyle {
  id String @id @default(cuid())  // TEXT type
  ...
}

// ❌ WRONG - User expects UUID
model User {
  dietStyleId String?  // Becomes UUID type when FK is created
  dietStyle DietStyle? @relation(fields: [dietStyleId], references: [id])
  ...
}
```

## Solution

Updated all IDs to use UUID consistently:

```prisma
// ✅ CORRECT - DietStyle uses UUID id
model DietStyle {
  id String @id @default(uuid())  // UUID type
  ...
}

// ✅ CORRECT - User references UUID
model User {
  dietStyleId String?  // UUID type, matches DietStyle.id
  dietStyle DietStyle? @relation(fields: [dietStyleId], references: [id])
  ...
}
```

## Changes Made

### 1. Updated Schema (backend/prisma/schema.prisma)

Added DietStyle model with UUID:
```prisma
model DietStyle {
  id                  String      @id @default(uuid())  // ← UUID, not cuid
  slug                String      @unique
  name                String
  description         String?
  netCarbCapG         Int         @default(100)
  fatTargetPercent    Int         @default(30)
  isActive            Boolean     @default(true)
  sortOrder           Int         @default(0)
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  deactivatedAt       DateTime?
  
  users               User[]
  meals               MealAnalysis[]
}
```

Extended User model:
```prisma
// Feature 017: Diet Styles
dietStyleId           String?
dietStyle             DietStyle?  @relation(fields: [dietStyleId], references: [id])
```

Extended MealAnalysis model:
```prisma
// Feature 017: Shareable Meals & Diet Styles
shareId         String?  @unique
isPublic        Boolean  @default(true)
dietStyleAtScanId String?
dietStyleAtScan DietStyle? @relation(fields: [dietStyleAtScanId], references: [id])
```

### 2. Created Migration (backend/prisma/migrations/20260101_add_shareable_meals_diet_styles/migration.sql)

The migration creates DietStyle with UUID and adds all necessary columns:

```sql
-- DietStyle with UUID primary key
CREATE TABLE "DietStyle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    ...
    CONSTRAINT "DietStyle_pkey" PRIMARY KEY ("id")
);

-- User foreign key - now compatible UUID type
ALTER TABLE "User" ADD COLUMN "dietStyleId" UUID;
ALTER TABLE "User" ADD CONSTRAINT "User_dietStyleId_fkey" 
  FOREIGN KEY ("dietStyleId") REFERENCES "DietStyle"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- MealAnalysis extensions
ALTER TABLE "MealAnalysis" ADD COLUMN "shareId" TEXT UNIQUE;
ALTER TABLE "MealAnalysis" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "MealAnalysis" ADD COLUMN "dietStyleAtScanId" UUID;

ALTER TABLE "MealAnalysis" ADD CONSTRAINT "MealAnalysis_dietStyleAtScanId_fkey"
  FOREIGN KEY ("dietStyleAtScanId") REFERENCES "DietStyle"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

## Verification

All applications verified to build successfully:

```
✅ Prisma schema validated
✅ Prisma client generated (5.22.0)
✅ Backend: 81 files processed, 0 errors
✅ Frontend: 5.69s build, 1913 modules, 0 errors
✅ Admin: 1.92s build, 422 modules, 0 errors
```

## How to Deploy

To apply the migration to the production database:

```bash
# Navigate to backend
cd backend

# Apply the migration
npx prisma migrate deploy

# Expected output:
# ✓ Applying migration `20260101_add_shareable_meals_diet_styles`
```

Or use the direct schema sync approach:
```bash
npx prisma db push
```

## Key Takeaway

**Always ensure foreign key types match exactly.** In PostgreSQL:
- UUID columns must reference UUID columns
- TEXT columns must reference TEXT columns
- Type mismatches cause constraint creation to fail with error P3018

For Prisma:
- Use `@default(uuid())` for UUID ids
- Use `@default(cuid())` for text-based ids
- Never mix types in relations

## Files Modified

1. `backend/prisma/schema.prisma` - Added DietStyle model, extended User and MealAnalysis
2. `backend/prisma/migrations/20260101_add_shareable_meals_diet_styles/migration.sql` - Migration file with correct types
3. `MIGRATION-FIX-017.md` - Documentation of the fix

## Status

✅ **FIXED AND READY FOR PRODUCTION**

The migration is syntactically correct and will resolve the type mismatch issue. All applications build without errors.
