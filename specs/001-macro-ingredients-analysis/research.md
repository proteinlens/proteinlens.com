# Research: Macro Ingredients Analysis

**Feature**: Macro Ingredients Analysis  
**Phase**: 0 (Research & Discovery)  
**Date**: 2 January 2026

## Research Questions

This document resolves all NEEDS CLARIFICATION items from Technical Context and provides decision rationale for implementation choices.

## 1. AI Prompt Engineering for Macro Extraction

**Question**: How should the GPT-5.1 Vision prompt be modified to extract carbohydrates and fat alongside protein?

**Decision**: Extend existing prompt template with explicit macro requests

**Rationale**:
- Current prompt in `backend/src/services/aiService.ts` requests: `{name, portion, protein}` per food item
- GPT-5.1 Vision can estimate all macros from visual cues (food type, portion size, preparation method)
- Prompt modification is low-risk: maintains existing JSON structure, adds 2 fields
- No additional API tokens required - same image analysis, more structured output

**Implementation Approach**:
```typescript
// Current prompt fragment:
{
  "foods": [{"name": "food name", "portion": "portion size", "protein": number}],
  "totalProtein": number
}

// Extended prompt fragment:
{
  "foods": [{
    "name": "food name", 
    "portion": "portion size", 
    "protein": number,
    "carbs": number,     // NEW
    "fat": number        // NEW
  }],
  "totalProtein": number,
  "totalCarbs": number,  // NEW
  "totalFat": number     // NEW
}
```

**Confidence Handling**:
- Per clarification Q2: AI returns best estimate with "low" confidence for uncertain macro values
- Existing confidence field ("high"/"medium"/"low") applies to entire meal analysis
- No per-macro confidence needed initially - meal-level confidence sufficient

**References**:
- Existing prompt: `backend/src/services/aiService.ts` lines 30-50
- Similar patterns in Feature 017 (diet feedback) - successful prompt extensions

---

## 2. Database Schema Precision

**Question**: What PostgreSQL column type and precision for carbs/fat storage?

**Decision**: `Decimal(6,2)` - matches existing protein column type

**Rationale**:
- Current Food table uses `Decimal(6,2)` for protein (see `backend/prisma/schema.prisma`)
- Consistency benefits: same validation rules, display formatting, database indexing
- Range: 0.00 to 9999.99g - covers any realistic food portion
- Per clarification Q1: Display with 1 decimal place, but store 2 decimals for precision (rounding happens at UI layer)

**Migration Strategy**:
```prisma
model Food {
  id              String        @id @default(uuid())
  mealAnalysisId  String
  name            String        @db.VarChar(200)
  portion         String        @db.VarChar(100)
  protein         Decimal       @db.Decimal(6, 2)
  carbs           Decimal?      @db.Decimal(6, 2)  // NEW - nullable for legacy data
  fat             Decimal?      @db.Decimal(6, 2)  // NEW - nullable for legacy data
  displayOrder    Int           @default(0)
  createdAt       DateTime      @default(now())
  
  @@index([mealAnalysisId])
}
```

**Nullability Decision**:
- New columns nullable to support legacy meals (protein-only data)
- Application layer handles null as "unavailable" (per clarification Q5)
- Non-null constraint can be added in future migration after all meals reprocessed (optional)

**Index Considerations**:
- No new indexes needed - carbs/fat not used in WHERE clauses
- Daily summary aggregations use SUM() over existing mealAnalysisId index

**References**:
- Current schema: `backend/prisma/schema.prisma` lines 470-490
- Decimal precision pattern: Feature 015 (protein targets)

---

## 3. UI Display Formatting

**Question**: How to display macronutrient data in existing meal cards without overcrowding?

**Decision**: Macro grid layout with percentages in secondary position

**Rationale**:
- Current `MealSummaryCard` displays single protein value prominently
- Extend to 3-column grid: Protein | Carbs | Fat (each with gram value)
- Add secondary row: macro percentages (% of total calories)
- Maintains mobile-first design: fits 375px viewport with 16px side padding

**Layout Pattern** (Tailwind classes):
```tsx
// Per Constitution XIII: thumb-reachable, 44x44px touch targets
<div className="grid grid-cols-3 gap-4">
  <MacroColumn label="Protein" grams={42.3} percentage={35} />
  <MacroColumn label="Carbs" grams={45.0} percentage={38} />
  <MacroColumn label="Fat" grams={15.2} percentage={27} />
</div>
```

**Visual Hierarchy**:
- Gram values: `text-2xl font-bold` - primary metric
- Macro labels: `text-sm text-muted-foreground` - context
- Percentages: `text-xs text-muted-foreground` - secondary insight

**Zero-Macro Handling**:
- Per clarification Q3: Display "0.0g" with same styling (consistent format)
- Example: Black coffee shows "0.0g" for all macros

**Legacy Meal Display**:
- Per clarification Q5: Show protein with "Macro data unavailable" message for carbs/fat
- Layout remains 3-column with unavailable indicator in carbs/fat cells

**References**:
- Existing component: `frontend/src/components/results/MealSummaryCard.tsx`
- Design system: Constitution XVII (shadcn/ui components)
- Similar pattern: Feature 017 macro split display

---

## 4. Calorie Calculation Formula

**Question**: How to calculate total calories from macros for percentage display?

**Decision**: Standard 4-4-9 conversion (4 cal/g protein, 4 cal/g carbs, 9 cal/g fat)

**Rationale**:
- Industry standard (USDA, nutrition labels)
- Simple formula: `(protein * 4) + (carbs * 4) + (fat * 9)`
- Accuracy: ±5% for most foods (acceptable for meal tracking)
- Aligns with SC-007: 1% accuracy in percentage calculations

**Implementation**:
```typescript
function calculateMacroPercentages(protein: number, carbs: number, fat: number) {
  const totalCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  
  if (totalCalories < 10) {
    // Edge case: very low calorie meals
    return { protein: 0, carbs: 0, fat: 0, insufficient: true };
  }
  
  return {
    protein: Math.round(((protein * 4) / totalCalories) * 100),
    carbs: Math.round(((carbs * 4) / totalCalories) * 100),
    fat: Math.round(((fat * 9) / totalCalories) * 100),
    insufficient: false
  };
}
```

**Edge Case Handling**:
- Meals <10 calories: show "insufficient data" instead of percentages
- Rounding may cause percentages to sum to 99% or 101% - acceptable variance

**References**:
- Existing calorie estimation: Feature 017 macro split heuristics
- Standard: USDA National Nutrient Database calculation method

---

## 5. User Edit Behavior

**Question**: When user edits one macro, should others auto-update?

**Decision**: Independent editing only (per clarification Q4)

**Rationale**:
- Users edit macros to correct AI errors for specific nutrients
- Auto-recalculation could introduce new errors in non-edited fields
- Simpler UX: each field is independent, no cascading updates
- Maintains audit trail clarity: user changed X, system didn't touch Y

**Implementation**:
- Edit dialog shows 3 independent number inputs (protein, carbs, fat)
- onChange updates only the edited field
- Total calories recalculated from all 3 values
- Validation: each macro 0-999.9g, 1 decimal place

**Audit Trail**:
- `userCorrections` JSON stores original + new value per macro
- Example: User edits carbs from 45.0g → 50.0g, protein/fat unchanged
  ```json
  {
    "carbs": {"original": 45.0, "corrected": 50.0, "timestamp": "..."}
  }
  ```

**References**:
- Existing edit flow: `frontend/src/components/results/EditMealDialog.tsx`
- Constitution FR-007: independent macro editing requirement

---

## 6. API Backward Compatibility

**Question**: How to ensure legacy clients (if any) don't break with extended API responses?

**Decision**: Additive-only changes - add carbs/fat fields without removing protein

**Rationale**:
- JSON schema extension is backward compatible
- Old clients ignore unknown fields (carbs/fat)
- New clients check for field existence before rendering
- TypeScript interfaces use optional fields for carbs/fat

**Schema Evolution**:
```typescript
// Before (legacy response)
interface Food {
  name: string;
  portion: string;
  protein: number;
}

// After (extended response - backward compatible)
interface Food {
  name: string;
  portion: string;
  protein: number;
  carbs?: number;    // NEW - optional
  fat?: number;      // NEW - optional
}
```

**Frontend Handling**:
```typescript
// Graceful degradation
function renderMacros(food: Food) {
  if (food.carbs !== undefined && food.fat !== undefined) {
    return <MacroBreakdown protein={food.protein} carbs={food.carbs} fat={food.fat} />;
  } else {
    return <ProteinOnly protein={food.protein} message="Macro data unavailable" />;
  }
}
```

**References**:
- API contract: `backend/src/models/schemas.ts`
- Version strategy: Constitution V (Deterministic JSON Output)

---

## 7. Daily Summary Aggregation

**Question**: How to calculate daily macro totals across multiple meals?

**Decision**: Database aggregation with SUM() - reuse existing pattern from protein totals

**Rationale**:
- Current daily summary uses `SUM(totalProtein)` across meals for a date
- Extend to: `SUM(totalProtein)`, `SUM(totalCarbs)`, `SUM(totalFat)`
- Efficient: single query with GROUP BY date
- Handles nulls: `SUM()` ignores NULL values (legacy meals don't break totals)

**Query Pattern**:
```typescript
// Extend getDailySummary() in mealService.ts
const dailyTotals = await prisma.$queryRaw`
  SELECT 
    DATE(createdAt) as date,
    SUM(totalProtein) as protein,
    SUM(totalCarbs) as carbs,    -- NEW
    SUM(totalFat) as fat,         -- NEW
    COUNT(*) as mealCount
  FROM MealAnalysis
  WHERE userId = ${userId}
    AND createdAt >= ${startDate}
    AND createdAt < ${endDate}
  GROUP BY DATE(createdAt)
  ORDER BY date DESC
`;
```

**NULL Handling**:
- Legacy meals: carbs/fat are NULL
- `SUM(totalCarbs)` returns sum of non-null values only
- Display: "Macro data incomplete (X of Y meals analyzed)" if some meals lack macros

**References**:
- Existing service: `backend/src/services/mealService.ts` getDailySummary()
- Similar aggregation: Feature 017 diet compliance tracking

---

## 8. Testing Strategy

**Question**: What test coverage is needed to validate macro functionality?

**Decision**: Unit tests for calculations, integration tests for E2E flow, visual regression for UI

**Coverage Plan**:

**Backend Unit Tests** (Vitest):
- `aiService.test.ts`: Validate prompt includes carbs/fat, parse extended JSON response
- `mealService.test.ts`: Test daily summary aggregation with mixed legacy/new meals
- Schema validation: Zod parsing rejects invalid macro values (negative, >999.9)

**Backend Integration Tests**:
- `analyze.test.ts`: Upload meal → receive analysis with all 3 macros
- Legacy meal handling: Fetch old meal → protein present, carbs/fat null

**Frontend Unit Tests** (Vitest + Testing Library):
- `MacroBreakdown.test.tsx`: Render 3 macros with percentages, calorie calculation accuracy
- `MealSummaryCard.test.tsx`: Display "unavailable" message for legacy meals
- Edge cases: zero-macro foods, very low calorie meals

**E2E Tests** (Playwright):
- User uploads meal → sees protein/carbs/fat in results
- User edits carbs → other macros unchanged → daily total updates
- User views history → daily totals show all macros

**References**:
- Test patterns: `backend/tests/unit/aiService.test.ts` (existing)
- E2E setup: `frontend/tests/e2e/` (Playwright config)

---

## Summary

All research questions resolved. No NEEDS CLARIFICATION items remain.

**Key Decisions**:
1. ✅ AI Prompt: Extend JSON schema to request carbs/fat
2. ✅ Database: `Decimal(6,2)` nullable columns, matches protein type
3. ✅ UI Layout: 3-column grid with percentages, mobile-optimized
4. ✅ Calories: 4-4-9 formula, standard industry practice
5. ✅ Editing: Independent per-macro, no auto-recalculation
6. ✅ API: Additive-only changes, backward compatible
7. ✅ Aggregation: Database SUM() with NULL handling
8. ✅ Testing: Unit + integration + E2E coverage

**Ready for Phase 1**: Data model and API contracts design.
