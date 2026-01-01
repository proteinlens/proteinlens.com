# Data Model: Shareable Meal Scans & Diet Style Profiles

**Feature**: 017-shareable-meals-diets  
**Date**: 2026-01-01  
**Status**: Draft

## Overview

Schema changes required for shareable meal URLs, Pro Tip persistence, and diet style profiles.

---

## New Entity: DietStyle

Add to `backend/prisma/schema.prisma`:

```prisma
// Diet style configuration (admin-editable)
// Feature 017: Shareable Meals & Diet Styles
model DietStyle {
  id                String    @id @default(uuid())
  
  slug              String    @unique @db.VarChar(50)  // "ketogenic", "mediterranean"
  name              String    @db.VarChar(100)         // Display name
  description       String    @db.Text                 // User-facing explanation
  
  // Macro constraints (null = no constraint)
  netCarbCapG       Int?                               // Daily carb limit in grams
  fatTargetPercent  Int?                               // Target fat percentage (0-100)
  
  // Admin controls
  isActive          Boolean   @default(true)
  sortOrder         Int       @default(0)              // Display order in UI
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  users             User[]
  mealSnapshots     MealAnalysis[]  @relation("dietStyleAtScan")
  
  @@index([isActive, sortOrder])
}
```

### Default Seed Data

```typescript
// backend/prisma/seed.ts (add to existing seed)
const defaultDietStyles = [
  {
    slug: 'balanced',
    name: 'Balanced',
    description: 'Standard nutrition with no specific restrictions. Focus on overall protein goals.',
    netCarbCapG: null,
    fatTargetPercent: null,
    isActive: true,
    sortOrder: 0,
  },
  {
    slug: 'mediterranean',
    name: 'Mediterranean',
    description: 'Heart-healthy eating emphasizing olive oil, fish, whole grains, and vegetables.',
    netCarbCapG: null,
    fatTargetPercent: 35,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: 'low-carb',
    name: 'Low-Carb',
    description: 'Reduced carbohydrate intake while maintaining moderate protein. Good for blood sugar management.',
    netCarbCapG: 100,
    fatTargetPercent: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: 'ketogenic',
    name: 'Ketogenic',
    description: 'Very low carb, high fat diet to achieve ketosis. Strict carb limits with protein moderation.',
    netCarbCapG: 30,
    fatTargetPercent: 70,
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: 'plant-based',
    name: 'Plant-Based',
    description: 'Nutrition from plant sources only. Focus on legumes, tofu, tempeh, and nuts for protein.',
    netCarbCapG: null,
    fatTargetPercent: null,
    isActive: true,
    sortOrder: 4,
  },
];
```

---

## Modified Entity: User

Add `dietStyleId` to existing User model:

```prisma
model User {
  // ... existing fields ...
  
  // Feature 017: Diet Style preference
  dietStyleId       String?           @db.Uuid
  dietStyle         DietStyle?        @relation(fields: [dietStyleId], references: [id], onDelete: SetNull)
  
  // ... rest of model ...
}
```

**Migration notes**:
- Nullable FK allows gradual adoption
- `onDelete: SetNull` - if diet style is deleted, users revert to implicit "Balanced"
- No default value needed; null = Balanced (handled in app logic)

---

## Modified Entity: MealAnalysis

Add shareable URL and diet snapshot fields:

```prisma
model MealAnalysis {
  // ... existing fields ...
  
  // Feature 017: Shareable URLs
  shareId           String    @unique @db.VarChar(12)  // nanoid for short URLs
  isPublic          Boolean   @default(true)           // Privacy toggle
  
  // Feature 017: Diet style at scan time (snapshot)
  dietStyleAtScanId String?   @db.Uuid
  dietStyleAtScan   DietStyle? @relation("dietStyleAtScan", fields: [dietStyleAtScanId], references: [id], onDelete: SetNull)
  
  // Notes field already exists - used for Pro Tips
  // notes           String?  @db.Text  -- ALREADY EXISTS
  
  // ... rest of model ...
  
  // Add index for share URL lookups
  @@index([shareId])
}
```

### Migration Script

```sql
-- Migration: add_shareable_meals_diet_styles
-- Feature 017: Shareable Meal Scans & Diet Style Profiles

-- 1. Create DietStyle table
CREATE TABLE "DietStyle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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

CREATE UNIQUE INDEX "DietStyle_slug_key" ON "DietStyle"("slug");
CREATE INDEX "DietStyle_isActive_sortOrder_idx" ON "DietStyle"("isActive", "sortOrder");

-- 2. Add dietStyleId to User
ALTER TABLE "User" ADD COLUMN "dietStyleId" UUID;
ALTER TABLE "User" ADD CONSTRAINT "User_dietStyleId_fkey" 
    FOREIGN KEY ("dietStyleId") REFERENCES "DietStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Add shareable fields to MealAnalysis
ALTER TABLE "MealAnalysis" ADD COLUMN "shareId" VARCHAR(12);
ALTER TABLE "MealAnalysis" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "MealAnalysis" ADD COLUMN "dietStyleAtScanId" UUID;

-- Generate shareIds for existing meals
UPDATE "MealAnalysis" SET "shareId" = substring(encode(gen_random_bytes(8), 'base64'), 1, 10)
WHERE "shareId" IS NULL;

-- Make shareId required and unique after backfill
ALTER TABLE "MealAnalysis" ALTER COLUMN "shareId" SET NOT NULL;
CREATE UNIQUE INDEX "MealAnalysis_shareId_key" ON "MealAnalysis"("shareId");

-- Add FK for diet style snapshot
ALTER TABLE "MealAnalysis" ADD CONSTRAINT "MealAnalysis_dietStyleAtScanId_fkey" 
    FOREIGN KEY ("dietStyleAtScanId") REFERENCES "DietStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    DietStyle    │       │       User       │       │  MealAnalysis   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ dietStyleId (FK) │       │ id (PK)         │
│ slug (unique)   │       │ email            │       │ userId (FK)     │
│ name            │       │ ...              │       │ shareId (unique)│
│ description     │       └──────────────────┘       │ isPublic        │
│ netCarbCapG     │                                  │ dietStyleAtScan │──┐
│ fatTargetPercent│◄─────────────────────────────────│   Id (FK)       │  │
│ isActive        │                                  │ notes (Pro Tip) │  │
│ sortOrder       │                                  │ ...             │  │
│ createdAt       │◄─────────────────────────────────┴─────────────────┘  │
│ updatedAt       │                                                       │
└─────────────────┴───────────────────────────────────────────────────────┘
                     (dietStyleAtScan relation - snapshot at meal creation)
```

---

## Field Specifications

### DietStyle Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Primary key |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL-safe identifier |
| name | VARCHAR(100) | NOT NULL | Display name for UI |
| description | TEXT | NOT NULL | User-facing explanation |
| netCarbCapG | INT | NULL | Daily carb limit, null = no limit |
| fatTargetPercent | INT | NULL, 0-100 | Target fat %, null = no target |
| isActive | BOOLEAN | DEFAULT true | Admin can disable |
| sortOrder | INT | DEFAULT 0 | Order in UI dropdowns |
| createdAt | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | Auto-update | Last modified |

### MealAnalysis New Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| shareId | VARCHAR(12) | UNIQUE, NOT NULL | Short URL identifier (nanoid) |
| isPublic | BOOLEAN | DEFAULT true | Privacy toggle |
| dietStyleAtScanId | UUID | FK, NULL | Snapshot of user's diet at scan time |

---

## Validation Rules

### DietStyle Validation
```typescript
const DietStyleSchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  netCarbCapG: z.number().int().min(0).max(500).nullable(),
  fatTargetPercent: z.number().int().min(0).max(100).nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});
```

### ShareId Validation
```typescript
const shareIdSchema = z.string().length(10).regex(/^[A-Za-z0-9]+$/);
```

---

## Index Strategy

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| DietStyle | Primary | id | Primary key |
| DietStyle | Unique | slug | Lookup by slug |
| DietStyle | Composite | (isActive, sortOrder) | Active diet list ordered |
| MealAnalysis | Unique | shareId | Fast share URL lookup |
| User | Regular | dietStyleId | Users by diet preference |

---

## Data Migration Considerations

1. **Existing meals without shareId**: Generate unique nanoids for all existing MealAnalysis records
2. **Existing users without dietStyleId**: Leave as NULL (implicit Balanced)
3. **Notes field**: Already exists, no migration needed for Pro Tips
4. **Default diet styles**: Seed data inserted as part of migration

---

## Rollback Strategy

```sql
-- Rollback migration if needed
ALTER TABLE "MealAnalysis" DROP CONSTRAINT "MealAnalysis_dietStyleAtScanId_fkey";
ALTER TABLE "MealAnalysis" DROP COLUMN "dietStyleAtScanId";
ALTER TABLE "MealAnalysis" DROP COLUMN "isPublic";
DROP INDEX "MealAnalysis_shareId_key";
ALTER TABLE "MealAnalysis" DROP COLUMN "shareId";

ALTER TABLE "User" DROP CONSTRAINT "User_dietStyleId_fkey";
ALTER TABLE "User" DROP COLUMN "dietStyleId";

DROP TABLE "DietStyle";
```
