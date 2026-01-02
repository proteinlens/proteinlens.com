# Quickstart: Macro Ingredients Analysis

**Feature**: Macro Ingredients Analysis  
**Branch**: `001-macro-ingredients-analysis`  
**Date**: 2 January 2026

## Overview

This quickstart guide provides the implementation order and key code snippets for adding macronutrient tracking (protein, carbs, fat) to ProteinLens.

## Prerequisites

- Node.js 20+
- PostgreSQL database (Azure Database for PostgreSQL)
- Azure Functions Core Tools v4
- Prisma CLI installed globally or via npx

## Implementation Order

Follow this sequence to avoid dependency issues:

1. **Database Schema** → Migrate database first
2. **Backend Types** → Update TypeScript interfaces
3. **AI Service** → Extend GPT-5.1 prompt
4. **API Endpoints** → Return macro data
5. **Frontend Types** → Update client interfaces
6. **UI Components** → Display macros
7. **Tests** → Validate end-to-end

---

## Step 1: Database Migration

**Location**: `backend/prisma/`

### 1.1 Update Schema

Edit `backend/prisma/schema.prisma`:

```prisma
model Food {
  id              String        @id @default(uuid())
  mealAnalysisId  String
  mealAnalysis    MealAnalysis  @relation(fields: [mealAnalysisId], references: [id], onDelete: Cascade)
  
  name            String        @db.VarChar(200)
  portion         String        @db.VarChar(100)
  protein         Decimal       @db.Decimal(6, 2)
  carbs           Decimal?      @db.Decimal(6, 2)  // ADD THIS
  fat             Decimal?      @db.Decimal(6, 2)  // ADD THIS
  
  displayOrder    Int           @default(0)
  createdAt       DateTime      @default(now())
  
  @@index([mealAnalysisId])
}
```

### 1.2 Generate Migration

```bash
cd backend
npx prisma migrate dev --name add_macros_to_food
```

This creates a migration file in `backend/prisma/migrations/`.

### 1.3 Apply Migration

For local development:
```bash
npx prisma migrate deploy
```

For production (via CI/CD):
```bash
# Migration runs automatically in deployment pipeline
# Verify with: npx prisma migrate status
```

---

## Step 2: Backend Type Extensions

### 2.1 Update Zod Schemas

**Location**: `backend/src/models/schemas.ts`

```typescript
// Extend FoodItemSchema
export const FoodItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  portion: z.string().min(1).max(100),
  protein: z.number().nonnegative().max(999.9),
  carbs: z.number().nonnegative().max(999.9),      // ADD
  fat: z.number().nonnegative().max(999.9),        // ADD
});

// Extend AIAnalysisResponse
export const AIAnalysisResponseSchema = z.object({
  foods: z.array(FoodItemSchema),
  totalProtein: z.number().nonnegative(),
  totalCarbs: z.number().nonnegative(),            // ADD
  totalFat: z.number().nonnegative(),              // ADD
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});
```

### 2.2 Update TypeScript Types

```typescript
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type AIAnalysisResponse = z.infer<typeof AIAnalysisResponseSchema>;
```

---

## Step 3: AI Service Prompt Update

**Location**: `backend/src/services/aiService.ts`

### 3.1 Extend GPT-5.1 Prompt

Find the existing prompt (around line 30) and modify:

```typescript
const prompt = `Analyze this meal image and identify all visible food items with their macronutrients. 
Return a JSON object with this exact structure:
{
  "foods": [{
    "name": "food name",
    "portion": "portion size",
    "protein": number,
    "carbs": number,    // ADD
    "fat": number       // ADD
  }],
  "totalProtein": number,
  "totalCarbs": number,  // ADD
  "totalFat": number,    // ADD
  "confidence": "high" | "medium" | "low",
  "notes": "optional additional observations"
}

Guidelines:
- Be specific with food names (e.g., "Grilled Chicken Breast" not just "Chicken")
- Estimate portion sizes in common units (grams, cups, pieces)
- Provide macronutrient estimates based on typical nutritional values
- Use 1 decimal place precision for all macro values
- If uncertain about carbs or fat, provide best estimate and use "low" confidence
- Set confidence to "low" if any macronutrient is highly uncertain
- Exclude drinks unless they contain significant calories/macros`;
```

### 3.2 Update Response Parsing

Verify Zod validation in the same file:

```typescript
async analyzeMealImage(imageUrl: string, requestId: string): Promise<AIAnalysisResponse> {
  // ... existing GPT API call ...
  
  const parsed = AIAnalysisResponseSchema.safeParse(aiResponse);
  if (!parsed.success) {
    Logger.error('AI response validation failed', parsed.error, { requestId });
    throw new ValidationError('Invalid AI response format');
  }
  
  return parsed.data;  // Now includes carbs and fat
}
```

---

## Step 4: API Endpoint Updates

### 4.1 Analyze Endpoint

**Location**: `backend/src/functions/analyze.ts`

No code changes needed - it already passes through AIAnalysisResponse. Verify response serialization handles new fields:

```typescript
return addResponseHeaders({
  status: 200,
  headers: { 'Content-Type': 'application/json' },
  jsonBody: {
    mealAnalysisId,
    foods: aiResponse.foods,        // Now includes carbs/fat
    totalProtein: aiResponse.totalProtein,
    totalCarbs: aiResponse.totalCarbs,     // Auto-included
    totalFat: aiResponse.totalFat,         // Auto-included
    confidence: aiResponse.confidence,
    notes: aiResponse.notes,
  }
});
```

### 4.2 Get Meals Endpoint

**Location**: `backend/src/functions/get-meals.ts`

Update meal serialization to include macros:

```typescript
const mealsWithSharing = meals.map((meal) => ({
  id: meal.id,
  uploadedAt: meal.createdAt.toISOString(),
  imageUrl: meal.blobUrl,
  totalProtein: Number(meal.totalProtein),
  totalCarbs: meal.foods.some(f => f.carbs === null) ? null : meal.foods.reduce((sum, f) => sum + Number(f.carbs || 0), 0),  // ADD
  totalFat: meal.foods.some(f => f.fat === null) ? null : meal.foods.reduce((sum, f) => sum + Number(f.fat || 0), 0),      // ADD
  confidence: meal.confidence,
  foods: meal.foods.map((food) => ({
    id: food.id,
    name: food.name,
    portion: food.portion,
    protein: Number(food.protein),
    carbs: food.carbs ? Number(food.carbs) : null,    // ADD
    fat: food.fat ? Number(food.fat) : null,          // ADD
  })),
}));
```

---

## Step 5: Frontend Type Updates

**Location**: `frontend/src/types/meal.ts`

```typescript
export interface FoodItem {
  id: string
  mealId: string
  name: string
  portion: string
  proteinGrams: number
  carbsGrams?: number       // ADD
  fatGrams?: number         // ADD
  confidence: number
  aiDetected: boolean
  isEdited: boolean
}

export interface MealAnalysis {
  foods: FoodItem[]
  totalProtein: number
  totalCarbs?: number       // ADD
  totalFat?: number         // ADD
  totalCalories?: number    // ADD
  macroPercentages?: {      // ADD
    protein: number
    carbs: number
    fat: number
  }
}
```

---

## Step 6: UI Components

### 6.1 Create MacroBreakdown Component

**Location**: `frontend/src/components/results/MacroBreakdown.tsx`

```typescript
import React from 'react';

interface MacroBreakdownProps {
  protein: number;
  carbs?: number;
  fat?: number;
}

export function MacroBreakdown({ protein, carbs, fat }: MacroBreakdownProps) {
  // Handle legacy meals
  if (carbs === undefined || fat === undefined) {
    return (
      <div className="space-y-2">
        <MacroColumn label="Protein" grams={protein} />
        <p className="text-sm text-muted-foreground">
          Macro data unavailable for this meal
        </p>
      </div>
    );
  }
  
  // Calculate calories and percentages
  const totalCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  const percentages = {
    protein: Math.round(((protein * 4) / totalCalories) * 100),
    carbs: Math.round(((carbs * 4) / totalCalories) * 100),
    fat: Math.round(((fat * 9) / totalCalories) * 100),
  };
  
  return (
    <div className="space-y-4">
      {/* Total Calories */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Total Calories</p>
        <p className="text-3xl font-bold">{totalCalories}</p>
      </div>
      
      {/* Macro Grid */}
      <div className="grid grid-cols-3 gap-4">
        <MacroColumn
          label="Protein"
          grams={protein}
          percentage={percentages.protein}
          color="text-blue-600"
        />
        <MacroColumn
          label="Carbs"
          grams={carbs}
          percentage={percentages.carbs}
          color="text-green-600"
        />
        <MacroColumn
          label="Fat"
          grams={fat}
          percentage={percentages.fat}
          color="text-yellow-600"
        />
      </div>
    </div>
  );
}

function MacroColumn({ label, grams, percentage, color }: {
  label: string;
  grams: number;
  percentage?: number;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-foreground'}`}>
        {grams.toFixed(1)}g
      </p>
      {percentage !== undefined && (
        <p className="text-xs text-muted-foreground">{percentage}%</p>
      )}
    </div>
  );
}
```

### 6.2 Update MealSummaryCard

**Location**: `frontend/src/components/results/MealSummaryCard.tsx`

Replace protein-only display with MacroBreakdown:

```typescript
import { MacroBreakdown } from './MacroBreakdown';

export function MealSummaryCard({ meal }: MealSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meal Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <MacroBreakdown
          protein={meal.analysis.totalProtein}
          carbs={meal.analysis.totalCarbs}
          fat={meal.analysis.totalFat}
        />
        {/* ... rest of component */}
      </CardContent>
    </Card>
  );
}
```

---

## Step 7: Testing

### 7.1 Backend Unit Tests

**Location**: `backend/tests/unit/aiService.test.ts`

```typescript
describe('analyzeMealImage', () => {
  it('should include carbs and fat in response', async () => {
    const mockResponse = {
      foods: [
        { name: 'Chicken', portion: '100g', protein: 30, carbs: 0, fat: 5 }
      ],
      totalProtein: 30,
      totalCarbs: 0,
      totalFat: 5,
      confidence: 'high'
    };
    
    // Mock GPT API
    mockGPTResponse(mockResponse);
    
    const result = await aiService.analyzeMealImage(imageUrl, requestId);
    
    expect(result.foods[0]).toHaveProperty('carbs', 0);
    expect(result.foods[0]).toHaveProperty('fat', 5);
    expect(result).toHaveProperty('totalCarbs', 0);
    expect(result).toHaveProperty('totalFat', 5);
  });
});
```

### 7.2 Frontend Component Tests

**Location**: `frontend/tests/components/MacroBreakdown.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { MacroBreakdown } from '@/components/results/MacroBreakdown';

describe('MacroBreakdown', () => {
  it('should display all three macros with percentages', () => {
    render(<MacroBreakdown protein={50} carbs={45} fat={15} />);
    
    expect(screen.getByText('50.0g')).toBeInTheDocument();  // Protein
    expect(screen.getByText('45.0g')).toBeInTheDocument();  // Carbs
    expect(screen.getByText('15.0g')).toBeInTheDocument();  // Fat
    
    // Percentages: (50*4)=200, (45*4)=180, (15*9)=135, total=515 cal
    expect(screen.getByText('39%')).toBeInTheDocument();    // Protein
    expect(screen.getByText('35%')).toBeInTheDocument();    // Carbs
    expect(screen.getByText('26%')).toBeInTheDocument();    // Fat
  });
  
  it('should show unavailable message for legacy meals', () => {
    render(<MacroBreakdown protein={30} />);  // No carbs/fat
    
    expect(screen.getByText(/macro data unavailable/i)).toBeInTheDocument();
    expect(screen.getByText('30.0g')).toBeInTheDocument();  // Protein still shown
  });
});
```

### 7.3 E2E Test

**Location**: `frontend/tests/e2e/meal-analysis.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should display macros after meal upload', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Upload Meal');
  
  // Upload test image
  await page.setInputFiles('input[type="file"]', './test-fixtures/meal.jpg');
  
  // Wait for analysis
  await page.waitForSelector('text=Meal Analysis', { timeout: 5000 });
  
  // Verify all three macros displayed
  await expect(page.locator('text=/Protein/i')).toBeVisible();
  await expect(page.locator('text=/Carbs/i')).toBeVisible();
  await expect(page.locator('text=/Fat/i')).toBeVisible();
  
  // Verify percentages shown
  await expect(page.locator('text=/%/')).toHaveCount(3);
});
```

---

## Deployment

### Local Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Deployment

```bash
# Backend (Azure Functions)
cd backend
npm run build
func azure functionapp publish proteinlens-backend-prod

# Frontend (Static Web App)
cd frontend
npm run build
# Deployment handled by GitHub Actions
```

---

## Verification Checklist

- [ ] Database migration applied successfully
- [ ] Backend types include carbs/fat fields
- [ ] AI prompt requests all three macros
- [ ] API responses include macro data
- [ ] Frontend types updated
- [ ] MacroBreakdown component renders correctly
- [ ] Legacy meals show "unavailable" message
- [ ] Unit tests pass (backend + frontend)
- [ ] E2E test passes
- [ ] Manual test: Upload meal → see all macros
- [ ] Manual test: View history → legacy meals handled gracefully

---

## Troubleshooting

**Issue**: Migration fails with "column already exists"
**Solution**: Check if previous migration partially succeeded. Run `npx prisma migrate resolve --applied [migration_name]`

**Issue**: AI returns null for carbs/fat
**Solution**: Verify prompt update deployed. Check GPT response logs in Application Insights.

**Issue**: Frontend shows undefined for macros
**Solution**: Clear browser cache. Verify API response includes new fields (check Network tab).

**Issue**: Percentages don't sum to 100%
**Solution**: Expected behavior due to rounding. Variance of ±1% is acceptable.

---

## Next Steps

After verifying this feature works:

1. **Optional Backfill**: Re-analyze legacy meals to populate macro data
2. **Advanced Features**: Macro goals/targets based on user diet style
3. **Analytics**: Track macro trends over time in dashboard

See [tasks.md](./tasks.md) (generated by `/speckit.tasks`) for detailed implementation tasks.
