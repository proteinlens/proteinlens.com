# API Contracts: Goal Sync

**Feature**: 016-goal-sync  
**Date**: 2025-12-31

## No New Contracts Required

This feature uses existing API endpoints without modifications:

### Existing Endpoints Used

#### GET /api/protein/profile

**Response** (200 OK):
```json
{
  "profile": {
    "id": "uuid",
    "weightKg": 80,
    "weightUnit": "kg",
    "trainingLevel": "none",
    "goal": "maintain",
    "mealsPerDay": 3,
    "updatedAt": "2025-12-31T16:10:02.566Z"
  },
  "target": {
    "proteinTargetG": 80,
    "perMealTargetsG": [20, 28, 32],
    "multiplierUsed": 1
  }
}
```

**Response** (404 Not Found):
```json
{
  "error": "not_found",
  "message": "No protein profile exists for this user"
}
```

---

#### POST /api/protein/profile

**Request**:
```json
{
  "weightKg": 80,
  "weightUnit": "kg",
  "trainingLevel": "regular",
  "goal": "lose",
  "mealsPerDay": 3
}
```

**Response** (200 OK):
```json
{
  "profile": {
    "id": "uuid",
    "weightKg": 80,
    "weightUnit": "kg",
    "trainingLevel": "regular",
    "goal": "lose",
    "mealsPerDay": 3,
    "updatedAt": "2025-12-31T16:35:00.000Z"
  },
  "target": {
    "proteinTargetG": 96,
    "perMealTargetsG": [24, 34, 38],
    "multiplierUsed": 1.2
  }
}
```

---

## localStorage Contracts

### proteinlens_protein_profile

```typescript
interface LocalProteinProfile {
  version: 1;
  weightKg: number;
  weightUnit: 'kg' | 'lbs';
  trainingLevel: 'none' | 'regular';
  goal: 'maintain' | 'lose' | 'gain';
  mealsPerDay: number;
  proteinTargetG: number;
  perMealTargetsG: number[];
  multiplierUsed: number;
  calculatedAt: string;
}
```

### proteinlens_daily_goal (legacy)

```typescript
interface DailyGoal {
  goalGrams: number;
  lastUpdated: string;
}
```
