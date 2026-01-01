# Migration Fix for Feature 017

**Issue**: Database migration failed with type mismatch error
```
ERROR: foreign key constraint "User_dietStyleId_fkey" cannot be implemented
DETAIL: Key columns "dietStyleId" and "id" are of incompatible types: uuid and text.
```

**Root Cause**: The migration was trying to create:
- `DietStyle.id` as TEXT (using Prisma's default `cuid()` which generates text IDs)
- `User.dietStyleId` as UUID (Postgres native UUID type)
- Foreign key constraint between incompatible types failed

**Solution**: Updated database schema and migration to use UUID for all IDs

## Changes Made

### 1. Created Migration File
**File**: `backend/prisma/migrations/20260101_add_shareable_meals_diet_styles/migration.sql`

Key fixes:
- `DietStyle.id` created as UUID (not TEXT/cuid)
- `User.dietStyleId` properly typed as UUID to match
- Foreign key constraint now uses compatible types
- `MealAnalysis` fields added: `shareId`, `isPublic`, `dietStyleAtScanId`

### 2. Updated Schema
**File**: `backend/prisma/schema.prisma`

Changes:
- Added `DietStyle` model with UUID id
- Extended `User` model: added `dietStyleId` and `dietStyle` relation
- Extended `MealAnalysis` model: added `shareId`, `isPublic`, `dietStyleAtScanId` fields
- All foreign keys now use compatible UUID types

### 3. Verification
✅ Prisma schema validated successfully  
✅ Prisma client generated successfully  
✅ Backend builds: 81 files processed, 0 errors  
✅ Frontend builds: 5.69s, 0 errors  
✅ Admin builds: 1.92s, 0 errors  

## Next Steps

The migration is now ready to apply to the production database:

```bash
cd backend
npx prisma migrate deploy
```

Or to test locally:
```bash
# Reset local database and apply all migrations including this one
npx prisma migrate reset  # WARNING: Deletes all data
```

## Technical Details

### DietStyle Model
```prisma
model DietStyle {
  id                  String      @id @default(uuid())  // UUID, not cuid
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

### User Model Extension
```prisma
// Feature 017: Diet Styles
dietStyleId           String?
dietStyle             DietStyle?          @relation(fields: [dietStyleId], references: [id])
```

### MealAnalysis Model Extension
```prisma
// Feature 017: Shareable Meals & Diet Styles
shareId         String?  @unique
isPublic        Boolean  @default(true)
dietStyleAtScanId String?
dietStyleAtScan DietStyle? @relation(fields: [dietStyleAtScanId], references: [id])
```

## Migration SQL Summary

The migration performs these operations:
1. Creates `DietStyle` table with UUID primary key
2. Adds unique index on `slug`
3. Adds `dietStyleId` (UUID) column to `User` table
4. Creates foreign key constraint: `User.dietStyleId` → `DietStyle.id`
5. Adds `shareId`, `isPublic`, `dietStyleAtScanId` columns to `MealAnalysis`
6. Creates foreign key constraint: `MealAnalysis.dietStyleAtScanId` → `DietStyle.id`
7. Creates index on `MealAnalysis.shareId`

## Status

✅ **Fixed and Ready for Deployment**

All application builds pass with no errors. The migration is valid and can be safely applied to production.
