# Data Model: Macro Ingredients Analysis

**Feature**: Macro Ingredients Analysis  
**Phase**: 1 (Design & Contracts)  
**Date**: 2 January 2026

## Overview

This document defines the data model changes required to support macronutrient tracking (protein, carbs, fat). Changes are additive-only for backward compatibility with existing protein-only data.

## Entity Changes

### 1. Food (Database Model)

**Location**: `backend/prisma/schema.prisma`

**Current State**:
```prisma
model Food {
  id              String        @id @default(uuid())
  mealAnalysisId  String
  mealAnalysis    MealAnalysis  @relation(fields: [mealAnalysisId], references: [id], onDelete: Cascade)
  
  name            String        @db.VarChar(200)
  portion         String        @db.VarChar(100)
  protein         Decimal       @db.Decimal(6, 2)
  
  displayOrder    Int           @default(0)
  createdAt       DateTime      @default(now())
  
  @@index([mealAnalysisId])
}
```

**Proposed Changes**:
```prisma
model Food {
  id              String        @id @default(uuid())
  mealAnalysisId  String
  mealAnalysis    MealAnalysis  @relation(fields: [mealAnalysisId], references: [id], onDelete: Cascade)
  
  name            String        @db.VarChar(200)
  portion         String        @db.VarChar(100)
  protein         Decimal       @db.Decimal(6, 2)
  carbs           Decimal?      @db.Decimal(6, 2)  // NEW - nullable for legacy
  fat             Decimal?      @db.Decimal(6, 2)  // NEW - nullable for legacy
  
  displayOrder    Int           @default(0)
  createdAt       DateTime      @default(now())
  
  @@index([mealAnalysisId])
}
```

**Field Specifications**:
- **carbs**: Carbohydrate content in grams, 1-2 decimal precision
  - Type: `Decimal(6,2)` - max 9999.99g
  - Nullable: Yes (supports legacy meals)
  - Validation: 0.0 ≤ carbs ≤ 999.9g (UI enforced)
  
- **fat**: Fat content in grams, 1-2 decimal precision
  - Type: `Decimal(6,2)` - max 9999.99g
  - Nullable: Yes (supports legacy meals)
  - Validation: 0.0 ≤ fat ≤ 999.9g (UI enforced)

**Migration Path**:
- Existing rows: carbs and fat default to NULL
- New analyses: carbs and fat populated by AI
- No data loss: protein column unchanged

---

### 2. MealAnalysis (Database Model - Optional Extension)

**Location**: `backend/prisma/schema.prisma`

**Current State**:
```prisma
model MealAnalysis {
  // ... existing fields
  totalProtein    Decimal  @db.Decimal(6, 2)
  // ... other fields
}
```

**Proposed Changes** (OPTIONAL - for query optimization):
```prisma
model MealAnalysis {
  // ... existing fields
  totalProtein    Decimal  @db.Decimal(6, 2)
  totalCarbs      Decimal? @db.Decimal(6, 2)  // OPTIONAL - can calculate from foods
  totalFat        Decimal? @db.Decimal(6, 2)  // OPTIONAL - can calculate from foods
  totalCalories   Int?                        // OPTIONAL - calculated from macros
  // ... other fields
}
```

**Decision**: DEFER denormalization
- **Rationale**: Calculating totals from Food records is fast (indexed query)
- **Future optimization**: Add if daily summary queries become slow (>200ms)
- **Phase 1**: Calculate totals dynamically from Food.carbs/fat
- **Phase 2** (if needed): Migrate to denormalized columns + triggers

---

## TypeScript Interfaces

### 1. FoodItem (Frontend Type)

**Location**: `frontend/src/types/meal.ts`

**Current State**:
```typescript
export interface FoodItem {
  id: string
  mealId: string
  name: string
  portion: string
  proteinGrams: number
  confidence: number
  aiDetected: boolean
  isEdited: boolean
}
```

**Proposed Changes**:
```typescript
export interface FoodItem {
  id: string
  mealId: string
  name: string
  portion: string
  proteinGrams: number
  carbsGrams?: number       // NEW - optional for legacy meals
  fatGrams?: number         // NEW - optional for legacy meals
  confidence: number
  aiDetected: boolean
  isEdited: boolean
}
```

**Field Specifications**:
- **carbsGrams**: Carbohydrate content (1 decimal display)
  - Optional: Yes (null for legacy meals)
  - Range: 0.0 - 999.9
  
- **fatGrams**: Fat content (1 decimal display)
  - Optional: Yes (null for legacy meals)
  - Range: 0.0 - 999.9

---

### 2. MealAnalysis (Frontend Type)

**Location**: `frontend/src/types/meal.ts`

**Current State**:
```typescript
export interface MealAnalysis {
  foods: FoodItem[]
  totalProtein: number
  totalCalories?: number
  macros?: {
    carbs: number
    fat: number
    protein: number
  }
}
```

**Proposed Changes**:
```typescript
export interface MealAnalysis {
  foods: FoodItem[]
  totalProtein: number
  totalCarbs?: number       // NEW - undefined for legacy meals
  totalFat?: number         // NEW - undefined for legacy meals
  totalCalories?: number    // Calculated from macros if available
  macroPercentages?: {      // NEW - undefined if incomplete data
    protein: number         // % of calories from protein (0-100)
    carbs: number          // % of calories from carbs (0-100)
    fat: number            // % of calories from fat (0-100)
  }
}
```

**Computed Fields**:
- **totalCarbs**: Sum of all foods' carbsGrams (undefined if any food lacks carbs)
- **totalFat**: Sum of all foods' fatGrams (undefined if any food lacks fat)
- **totalCalories**: `(protein*4) + (carbs*4) + (fat*9)` if all macros present
- **macroPercentages**: Calculated only if totalCalories ≥ 10

---

### 3. DailySummary (Frontend Type - NEW)

**Location**: `frontend/src/types/meal.ts`

**Proposed Addition**:
```typescript
export interface DailySummary {
  date: string                // ISO date (YYYY-MM-DD)
  mealCount: number           // Total meals logged
  totalProtein: number        // Sum of all meals' protein
  totalCarbs?: number         // Sum of meals with carbs (undefined if none)
  totalFat?: number           // Sum of meals with fat (undefined if none)
  totalCalories?: number      // Calculated from macros if available
  macroPercentages?: {
    protein: number
    carbs: number
    fat: number
  }
  mealsWithMacroData: number  // Count of meals that have carbs/fat
  incomplete: boolean         // True if some meals lack macro data
}
```

**Field Specifications**:
- **incomplete**: True if `mealsWithMacroData < mealCount`
- **macroPercentages**: Only present if all meals have complete macro data
- **totalCalories**: Sum of individual meal calories (not recalculated from daily totals)

---

## API Contract Changes

### 1. AIAnalysisResponse (Backend Schema)

**Location**: `backend/src/models/schemas.ts`

**Current Zod Schema**:
```typescript
export const AIAnalysisResponseSchema = z.object({
  foods: z.array(z.object({
    name: z.string(),
    portion: z.string(),
    protein: z.number().nonnegative()
  })),
  totalProtein: z.number().nonnegative(),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional()
});
```

**Proposed Zod Schema**:
```typescript
export const AIAnalysisResponseSchema = z.object({
  foods: z.array(z.object({
    name: z.string(),
    portion: z.string(),
    protein: z.number().nonnegative().max(999.9),
    carbs: z.number().nonnegative().max(999.9),      // NEW
    fat: z.number().nonnegative().max(999.9)         // NEW
  })),
  totalProtein: z.number().nonnegative(),
  totalCarbs: z.number().nonnegative(),              // NEW
  totalFat: z.number().nonnegative(),                // NEW
  totalCalories: z.number().nonnegative().optional(), // NEW - calculated
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional()
});
```

**Validation Rules**:
- All macro fields required for new analyses (non-nullable in schema)
- Maximum 999.9g per macro (prevents data entry errors)
- Totals must equal sum of foods (validated in service layer)

---

### 2. GET /api/meals Response

**Current Response**:
```json
{
  "meals": [
    {
      "id": "uuid",
      "uploadedAt": "2026-01-02T10:00:00Z",
      "foods": [
        {"name": "Chicken Breast", "portion": "150g", "protein": 45.0}
      ],
      "totalProtein": 45.0
    }
  ]
}
```

**Proposed Response** (backward compatible):
```json
{
  "meals": [
    {
      "id": "uuid",
      "uploadedAt": "2026-01-02T10:00:00Z",
      "foods": [
        {
          "name": "Chicken Breast",
          "portion": "150g",
          "protein": 45.0,
          "carbs": 0.0,
          "fat": 7.5
        }
      ],
      "totalProtein": 45.0,
      "totalCarbs": 0.0,
      "totalFat": 7.5,
      "totalCalories": 243
    }
  ]
}
```

**Legacy Meal Response** (null macros):
```json
{
  "meals": [
    {
      "id": "old-uuid",
      "uploadedAt": "2025-12-01T10:00:00Z",
      "foods": [
        {
          "name": "Chicken Breast",
          "portion": "150g",
          "protein": 45.0,
          "carbs": null,
          "fat": null
        }
      ],
      "totalProtein": 45.0,
      "totalCarbs": null,
      "totalFat": null,
      "totalCalories": null
    }
  ]
}
```

---

## Database Migration

### Migration Script

**File**: `backend/prisma/migrations/[timestamp]_add_macros_to_food/migration.sql`

```sql
-- Migration: Add carbohydrate and fat tracking to Food table
-- Feature: Macro Ingredients Analysis
-- Author: /speckit.plan
-- Date: 2026-01-02

-- Add new columns (nullable for backward compatibility)
ALTER TABLE "Food"
  ADD COLUMN "carbs" DECIMAL(6,2),
  ADD COLUMN "fat" DECIMAL(6,2);

-- Add check constraints for data quality
ALTER TABLE "Food"
  ADD CONSTRAINT "Food_carbs_range" 
    CHECK ("carbs" IS NULL OR ("carbs" >= 0 AND "carbs" <= 999.99));

ALTER TABLE "Food"
  ADD CONSTRAINT "Food_fat_range"
    CHECK ("fat" IS NULL OR ("fat" >= 0 AND "fat" <= 999.99));

-- Optional: Create partial index for performance (if querying by macros)
-- CREATE INDEX CONCURRENTLY "Food_macros_available_idx"
--   ON "Food" ("mealAnalysisId")
--   WHERE "carbs" IS NOT NULL AND "fat" IS NOT NULL;

COMMENT ON COLUMN "Food"."carbs" IS 'Carbohydrate content in grams (nullable for legacy meals)';
COMMENT ON COLUMN "Food"."fat" IS 'Fat content in grams (nullable for legacy meals)';
```

**Rollback Script** (for safety):
```sql
-- Rollback: Remove macro columns
ALTER TABLE "Food"
  DROP CONSTRAINT IF EXISTS "Food_carbs_range",
  DROP CONSTRAINT IF EXISTS "Food_fat_range",
  DROP COLUMN IF EXISTS "carbs",
  DROP COLUMN IF EXISTS "fat";
```

---

## Data Relationships

```
User (1) ──< (N) MealAnalysis
                      │
                      │ (1)
                      │
                      ├< (N) Food
                      │       ├─ protein (Decimal 6,2)
                      │       ├─ carbs   (Decimal 6,2 NULL) ← NEW
                      │       └─ fat     (Decimal 6,2 NULL) ← NEW
                      │
                      └─ totalProtein (Decimal 6,2)
                          [Future: totalCarbs, totalFat - deferred]
```

**Key Constraints**:
- Food.carbs/fat nullable: Supports legacy meals without breaking foreign keys
- Cascade delete: Deleting MealAnalysis removes associated Food records (existing behavior preserved)
- No new indexes: Macro queries use existing mealAnalysisId index

---

## Validation Rules Summary

| Field | Type | Min | Max | Nullable | Display Precision |
|-------|------|-----|-----|----------|-------------------|
| Food.protein | Decimal(6,2) | 0.00 | 999.99 | No | 1 decimal (42.3g) |
| Food.carbs | Decimal(6,2) | 0.00 | 999.99 | Yes (legacy) | 1 decimal (45.0g) |
| Food.fat | Decimal(6,2) | 0.00 | 999.99 | Yes (legacy) | 1 decimal (15.2g) |
| totalCalories | Integer | 0 | 9999 | Yes (calculated) | 0 decimals (243 cal) |

---

## Backward Compatibility Matrix

| Scenario | Behavior |
|----------|----------|
| Old backend + old frontend | ✅ Works (no changes) |
| New backend + old frontend | ✅ Works (frontend ignores carbs/fat) |
| New backend + new frontend, legacy meal | ✅ Shows "unavailable" for carbs/fat |
| New backend + new frontend, new meal | ✅ Full macro display |

---

## Summary

**Database Changes**:
- 2 new columns on Food table (carbs, fat) - nullable Decimal(6,2)
- 2 check constraints for data range validation
- No new indexes required (uses existing mealAnalysisId)

**TypeScript Changes**:
- Extended FoodItem interface (+2 optional fields)
- Extended MealAnalysis interface (+3 computed fields)
- New DailySummary interface (replaces ad-hoc aggregation)

**API Changes**:
- AIAnalysisResponse schema: +3 fields (carbs, fat per food, totalCarbs, totalFat)
- GET /api/meals: +3 fields in response (backward compatible, nulls for legacy)

**Migration Strategy**:
- Non-breaking: Additive-only changes
- Rollback-safe: Migration includes explicit rollback script
- Zero downtime: Nullable columns allow gradual data population

**Ready for**: API contract documentation in contracts/ directory
