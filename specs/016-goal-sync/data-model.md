# Data Model: Goal Sync Between Calculator and Settings

**Feature**: 016-goal-sync  
**Date**: 2025-12-31  
**Phase**: 1 - Design

## Entities

### Protein Profile (Backend - PostgreSQL)

**Table**: `UserProteinProfile`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| weightKg | Decimal | User's weight in kg |
| weightUnit | Enum | 'kg' or 'lbs' |
| trainingLevel | Enum | 'none' or 'regular' |
| goal | Enum | 'maintain', 'lose', or 'gain' |
| mealsPerDay | Integer | Number of meals (2-6) |
| updatedAt | DateTime | Last update timestamp |

**Table**: `ProteinTarget`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| profileId | UUID | Foreign key to UserProteinProfile |
| proteinTargetG | Integer | Calculated protein goal in grams |
| perMealTargetsG | Integer[] | Per-meal breakdown |
| multiplierUsed | Decimal | Calculation multiplier used |
| calculatedAt | DateTime | When calculation was performed |

---

### Local Protein Profile (localStorage)

**Key**: `proteinlens_protein_profile`

```typescript
interface LocalProteinProfile {
  version: 1;
  weightKg: number;
  weightUnit: 'kg' | 'lbs';
  trainingLevel: 'none' | 'regular';
  goal: 'maintain' | 'lose' | 'gain';
  mealsPerDay: number;
  proteinTargetG: number;        // ← The goal value
  perMealTargetsG: number[];
  multiplierUsed: number;
  calculatedAt: string;          // ISO 8601
}
```

---

### Legacy Daily Goal (localStorage)

**Key**: `proteinlens_daily_goal`

```typescript
interface DailyGoal {
  goalGrams: number;             // ← The goal value
  lastUpdated: string;           // ISO 8601
}
```

---

## State Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    Goal Retrieval Priority                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Server API (authenticated)                                   │
│     GET /api/protein/profile                                     │
│     → response.target.proteinTargetG                             │
│                                                                  │
│  2. Protein Profile localStorage                                 │
│     proteinlens_protein_profile                                  │
│     → proteinTargetG                                             │
│                                                                  │
│  3. Legacy Goal localStorage                                     │
│     proteinlens_daily_goal                                       │
│     → goalGrams                                                  │
│                                                                  │
│  4. Default                                                      │
│     → 120g                                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Flags

### `hasServerProfile` (useProteinCalculator)

| Value | Meaning | Button State |
|-------|---------|--------------|
| `true` | Current form values match server | "✓ Saved to your profile" (disabled) |
| `false` | Form values changed or never saved | "Save to My Profile" (enabled) |

**Transitions**:
- Page load with existing profile → `true`
- Any form value change → `false`
- Successful save → `true`

---

## Validation Rules

| Field | Rule |
|-------|------|
| proteinTargetG / goalGrams | 0-500g inclusive |
| weightKg | 20-300kg |
| mealsPerDay | 2-6 |
