# Research: Protein Target Calculator

**Feature**: 015-protein-target-calculator  
**Date**: 2025-12-30  
**Status**: Complete

## Research Tasks

### 1. Protein Calculation Formula Best Practices

**Decision**: Use simple multiplier-based formula: `daily_protein_g = weight_kg × multiplier`

**Rationale**:
- Industry standard approach used by nutrition apps (MyFitnessPal, Cronometer)
- Easy to understand and explain to users
- Configurable via admin panel without code changes
- Evidence-based multiplier ranges (0.8-2.2 g/kg) cover all healthy adults

**Alternatives Considered**:
- Lean body mass calculation: Rejected for MVP - requires body fat % input, adds complexity
- Harris-Benedict equation: Rejected - designed for calorie calculation, not protein
- Machine learning model: Rejected - overkill for simple multiplier lookup

### 2. Multiplier Ranges Research

**Decision**: Use 6 presets based on training × goal matrix

| Training | Goal | Multiplier | Scientific Basis |
|----------|------|------------|------------------|
| none | maintain | 1.0 g/kg | RDA baseline for sedentary adults |
| none | lose | 1.2 g/kg | Higher protein preserves muscle during deficit |
| none | gain | 1.2 g/kg | Modest increase supports muscle synthesis |
| regular | maintain | 1.6 g/kg | ISSN recommendation for trained individuals |
| regular | lose | 1.8 g/kg | Maximum muscle preservation during cut |
| regular | gain | 1.8 g/kg | Optimal for muscle protein synthesis |

**Rationale**:
- Based on International Society of Sports Nutrition (ISSN) position stand
- Covers 95% of healthy adult population needs
- Simple 2×3 matrix is easy UX without overwhelming choices

**Alternatives Considered**:
- More granular activity levels (light/moderate/intense): Rejected - adds UX complexity, marginal benefit
- Age-adjusted multipliers: Rejected for MVP - can add later via config
- Sex-based adjustments: Rejected - research shows g/kg approach works across sexes

### 3. Safety Clamps Research

**Decision**: Clamp output to 60-220g/day range

**Rationale**:
- 60g minimum: Below this, most adults risk protein deficiency
- 220g maximum: Above 2.2g/kg for a 100kg person; beyond this offers no additional benefit and may stress kidneys in susceptible individuals
- Clamps protect against unrealistic user inputs (typos, unrealistic weights)

**Alternatives Considered**:
- No clamps: Rejected - poor UX for edge cases
- Per-kg clamps (0.8-2.2 g/kg): Considered but absolute clamps are simpler to explain

### 4. Meal Distribution Patterns

**Decision**: Use percentage-based splits with weighted distribution toward dinner

| Meals | Split | Rationale |
|-------|-------|-----------|
| 2 | 45%/55% | Larger dinner is typical pattern |
| 3 | 25%/35%/40% | Progressive increase through day |
| 4 | 25%/30%/25%/20% | Main meals larger, snacks smaller |
| 5 | 20%/20%/25%/20%/15% | Even with slight lunch emphasis |

**Rationale**:
- Reflects typical Western eating patterns
- Larger evening meals align with social eating habits
- Minimum 20g/meal threshold ensures muscle protein synthesis activation

**Alternatives Considered**:
- Equal split: Rejected - doesn't match real eating patterns
- User-customizable per-meal percentages: Rejected for MVP - adds complexity

### 5. localStorage Persistence Strategy

**Decision**: Store anonymous user data in localStorage with structured JSON

```typescript
interface LocalStorageProteinProfile {
  weightKg: number;
  weightUnit: 'kg' | 'lbs';
  trainingLevel: 'none' | 'regular';
  goal: 'maintain' | 'lose' | 'gain';
  mealsPerDay: number;
  calculatedAt: string; // ISO timestamp
  proteinTargetG: number;
  perMealTargetsG: number[];
}
```

**Rationale**:
- Provides seamless UX for anonymous users (try-before-signup)
- No backend calls needed for anonymous calculations
- Clear data lifecycle (cleared with browser storage)
- Easy migration path when user signs up

**Alternatives Considered**:
- Session storage: Rejected - lost on tab close, too ephemeral
- Cookies: Rejected - size limits, not designed for structured data
- IndexedDB: Rejected - overkill for small structured data

### 6. Existing Codebase Integration Patterns

**Decision**: Follow established patterns from existing features

**API Endpoints Pattern** (from backend/src/functions/):
- Use Azure Functions v4 with HttpRequest/HttpResponseInit
- Zod validation for request/response schemas
- Existing middleware for auth (requireUser, requireAdmin)

**Frontend Pattern** (from frontend/src/):
- React functional components with TypeScript
- TanStack Query for server state
- Tailwind CSS for styling
- Custom hooks for business logic

**Admin Pattern** (from admin/src/):
- Similar React/Tailwind stack
- Protected routes with admin auth
- Table/form patterns for CRUD operations

**Rationale**: Consistency with existing codebase reduces learning curve and maintenance burden.

### 7. Weight Unit Conversion

**Decision**: Implement client-side conversion with kg as canonical storage

**Conversion**: 1 kg = 2.20462 lbs (rounded to 2.205 for display)

**Implementation**:
- UI shows toggle between kg/lbs
- User's preferred unit stored in profile
- All calculations and storage use kg internally
- Display converts on-the-fly based on preference

**Rationale**:
- Single source of truth (kg) prevents rounding drift
- Client-side conversion is fast and avoids API complexity
- Consistent with international nutrition databases

## Unknowns Resolved

| Unknown | Resolution |
|---------|------------|
| Formula for protein calculation | Multiplier × weight_kg |
| Scientific basis for multipliers | ISSN position stand |
| Safe output ranges | 60-220g/day absolute clamps |
| Anonymous user persistence | localStorage with structured JSON |
| Weight unit handling | Client-side conversion, kg canonical |
| Meal distribution logic | Percentage splits, normalize to 100% |

## Dependencies Identified

| Dependency | Version | Purpose |
|------------|---------|---------|
| @prisma/client | ^5.8.0 | Database access (existing) |
| zod | ^3.22.4 | Schema validation (existing) |
| @tanstack/react-query | ^5.x | Server state management (existing) |
| react-router-dom | ^7.x | Navigation (existing) |

No new dependencies required - all needs covered by existing stack.
