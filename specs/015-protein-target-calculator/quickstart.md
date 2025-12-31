# Quickstart: Protein Target Calculator

**Feature**: 015-protein-target-calculator  
**Date**: 2025-12-30

## Overview

The Protein Target Calculator allows users to calculate personalized daily protein intake recommendations based on their weight, training level, and fitness goals.

## Key User Flows

### Flow 1: Anonymous User Calculates Protein Target

```
1. User navigates to /protein-calculator from main nav
2. User enters weight (toggle kg/lbs available)
3. User selects training level (None / Regular)
4. User selects goal (Maintain / Lose / Gain)
5. User selects meals per day (2-5, default 3)
6. System displays:
   - Daily protein target (e.g., "125g per day")
   - Per-meal breakdown (e.g., "Breakfast: 30g, Lunch: 45g, Dinner: 50g")
7. Data persisted to localStorage
8. User returns later → data restored from localStorage
```

### Flow 2: Logged-in User Saves Profile

```
1. User completes Flow 1
2. User clicks "Save to Profile" (or is already logged in)
3. System saves profile to database
4. System displays confirmation
5. User returns later → data loaded from database (localStorage migrated if exists)
```

### Flow 3: Admin Configures Presets

```
1. Admin navigates to /protein-presets in admin dashboard
2. Admin views 6 preset multipliers in editable table
3. Admin modifies a multiplier (e.g., regular/lose from 1.8 to 2.0)
4. Admin clicks Save
5. System validates (multiplier > 0, ≤ 3.0)
6. System updates database
7. New user calculations use updated multiplier
```

## API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/protein/calculate` | POST | None | Calculate targets (preview) |
| `/api/protein/config` | GET | None | Get presets & splits |
| `/api/protein/profile` | GET | User | Get saved profile |
| `/api/protein/profile` | POST | User | Save/update profile |
| `/api/protein/profile` | DELETE | User | Delete profile |
| `/api/dashboard/protein/presets` | GET | Admin | List presets |
| `/api/dashboard/protein/presets` | PUT | Admin | Update preset |
| `/api/dashboard/protein/config` | GET | Admin | Get config |
| `/api/dashboard/protein/config` | PUT | Admin | Update config |

## Calculation Logic

```typescript
// Core calculation
const multiplier = getPreset(trainingLevel, goal);
const rawTarget = weightKg * multiplier;
const clampedTarget = clamp(rawTarget, minGDay, maxGDay);
const dailyTarget = roundTo5(clampedTarget);

// Per-meal distribution
const splits = getMealSplits(mealsPerDay);
const perMealTargets = splits.map(s => roundTo5(dailyTarget * s));
// Adjust last meal to ensure sum equals daily target
```

## Test Scenarios

### Unit Test: Calculation Logic

```typescript
describe('calculateProteinTarget', () => {
  it('calculates 126g for 70kg, regular training, lose goal', () => {
    const result = calculateProteinTarget({
      weightKg: 70,
      trainingLevel: 'regular',
      goal: 'lose',
      mealsPerDay: 3
    });
    expect(result.proteinTargetG).toBe(125); // 70 * 1.8 = 126 → rounded to 125
    expect(result.perMealTargetsG).toEqual([30, 45, 50]); // 25/35/40 split
  });

  it('applies minimum clamp for light user', () => {
    const result = calculateProteinTarget({
      weightKg: 50,
      trainingLevel: 'none',
      goal: 'maintain',
      mealsPerDay: 3
    });
    expect(result.proteinTargetG).toBe(60); // 50 * 1.0 = 50 → clamped to 60
  });

  it('applies maximum clamp for heavy user', () => {
    const result = calculateProteinTarget({
      weightKg: 150,
      trainingLevel: 'regular',
      goal: 'gain',
      mealsPerDay: 3
    });
    expect(result.proteinTargetG).toBe(220); // 150 * 1.8 = 270 → clamped to 220
  });
});
```

### Contract Test: API Response Schema

```typescript
describe('POST /api/protein/calculate', () => {
  it('returns valid protein target schema', async () => {
    const response = await request(app)
      .post('/api/protein/calculate')
      .send({ weightKg: 70, trainingLevel: 'regular', goal: 'lose' });
    
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      proteinTargetG: expect.any(Number),
      perMealTargetsG: expect.any(Array),
      multiplierUsed: expect.any(Number)
    });
  });
});
```

## Development Setup

```bash
# Backend
cd backend
npm run prisma:migrate  # Apply new schema
npm run dev             # Start Azure Functions locally

# Frontend
cd frontend
npm run dev             # Start Vite dev server

# Admin
cd admin
npm run dev             # Start admin dashboard
```

## File Locations

| Component | Path |
|-----------|------|
| API Endpoint | `backend/src/functions/protein-calculator.ts` |
| Service Logic | `backend/src/services/proteinCalculatorService.ts` |
| Zod Schemas | `backend/src/models/proteinTypes.ts` |
| Frontend Page | `frontend/src/pages/ProteinCalculatorPage.tsx` |
| Frontend Hook | `frontend/src/hooks/useProteinCalculator.ts` |
| Admin Page | `admin/src/pages/ProteinPresetsPage.tsx` |
| Prisma Schema | `backend/prisma/schema.prisma` |

## Success Verification

After implementation, verify:

1. ✅ Anonymous user can calculate and see results
2. ✅ Results persist in localStorage across page reloads
3. ✅ Logged-in user can save profile to database
4. ✅ kg/lbs toggle works correctly
5. ✅ Admin can view and edit presets
6. ✅ Preset changes affect new calculations
7. ✅ All API endpoints return valid Zod-validated responses
8. ✅ Mobile layout is thumb-friendly (44×44px touch targets)
