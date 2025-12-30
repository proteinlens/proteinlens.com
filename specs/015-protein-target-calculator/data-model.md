# Data Model: Protein Target Calculator

**Feature**: 015-protein-target-calculator  
**Date**: 2025-12-30  
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────────┐
│       User          │       │   ProteinPreset         │
│  (existing model)   │       │   (admin-configurable)  │
├─────────────────────┤       ├─────────────────────────┤
│ id: UUID [PK]       │       │ id: UUID [PK]           │
│ email: String       │       │ trainingLevel: Enum     │
│ ...existing fields  │       │ goal: Enum              │
└─────────┬───────────┘       │ multiplierGPerKg: Float │
          │                   │ active: Boolean         │
          │ 1                 │ updatedAt: DateTime     │
          │                   └─────────────────────────┘
          │
          ▼ 0..1
┌─────────────────────────────┐
│   UserProteinProfile        │
├─────────────────────────────┤
│ id: UUID [PK]               │
│ userId: UUID [FK, UNIQUE]   │
│ weightKg: Float             │
│ weightUnit: Enum            │
│ trainingLevel: Enum         │
│ goal: Enum                  │
│ mealsPerDay: Int            │
│ createdAt: DateTime         │
│ updatedAt: DateTime         │
└─────────┬───────────────────┘
          │
          │ 1
          │
          ▼ 0..1
┌─────────────────────────────┐
│   ProteinTarget             │
│   (calculated result)       │
├─────────────────────────────┤
│ id: UUID [PK]               │
│ profileId: UUID [FK,UNIQUE] │
│ proteinTargetG: Int         │
│ perMealTargetsG: Int[]      │
│ multiplierUsed: Float       │
│ calculatedAt: DateTime      │
└─────────────────────────────┘

┌─────────────────────────────┐
│   ProteinConfig             │
│   (singleton - global cfg)  │
├─────────────────────────────┤
│ id: UUID [PK]               │
│ minGDay: Int                │
│ maxGDay: Int                │
│ defaultMealsPerDay: Int     │
│ mealSplits: JSON            │
│ updatedAt: DateTime         │
└─────────────────────────────┘
```

## Prisma Schema Additions

```prisma
// ===========================================
// Enums for Protein Calculator (Feature 015)
// ===========================================

enum TrainingLevel {
  NONE
  REGULAR
}

enum ProteinGoal {
  MAINTAIN
  LOSE
  GAIN
}

enum WeightUnit {
  KG
  LBS
}

// ===========================================
// Protein Calculator Models (Feature 015)
// ===========================================

model UserProteinProfile {
  id              String        @id @default(uuid())
  
  userId          String        @unique
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  weightKg        Float         // Canonical storage in kg
  weightUnit      WeightUnit    @default(KG)  // User's display preference
  trainingLevel   TrainingLevel
  goal            ProteinGoal
  mealsPerDay     Int           @default(3)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Calculated target (1:1 relationship)
  target          ProteinTarget?
  
  @@index([userId])
}

model ProteinTarget {
  id              String              @id @default(uuid())
  
  profileId       String              @unique
  profile         UserProteinProfile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  proteinTargetG  Int                 // Daily target in grams (rounded to 5)
  perMealTargetsG Int[]               // Array of per-meal targets
  multiplierUsed  Float               // The multiplier used for audit trail
  
  calculatedAt    DateTime            @default(now())
  
  @@index([profileId])
}

model ProteinPreset {
  id                String        @id @default(uuid())
  
  trainingLevel     TrainingLevel
  goal              ProteinGoal
  multiplierGPerKg  Float         // e.g., 1.8 for regular/lose
  
  active            Boolean       @default(true)
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@unique([trainingLevel, goal])  // One preset per combination
  @@index([active])
}

model ProteinConfig {
  id                  String    @id @default(uuid())
  
  minGDay             Int       @default(60)   // Minimum daily protein
  maxGDay             Int       @default(220)  // Maximum daily protein
  defaultMealsPerDay  Int       @default(3)
  
  // JSON structure: { "2": [0.45, 0.55], "3": [0.25, 0.35, 0.40], ... }
  mealSplits          Json      @default("{\"2\":[0.45,0.55],\"3\":[0.25,0.35,0.40],\"4\":[0.25,0.30,0.25,0.20],\"5\":[0.20,0.20,0.25,0.20,0.15]}")
  
  updatedAt           DateTime  @updatedAt
  
  // Singleton pattern - only one config row should exist
}
```

## User Model Extension

Add to existing User model:

```prisma
model User {
  // ... existing fields ...
  
  // Feature 015: Protein Calculator
  proteinProfile    UserProteinProfile?
}
```

## Validation Rules

### UserProteinProfile

| Field | Type | Validation |
|-------|------|------------|
| weightKg | Float | > 0, ≤ 500 |
| trainingLevel | Enum | NONE \| REGULAR |
| goal | Enum | MAINTAIN \| LOSE \| GAIN |
| mealsPerDay | Int | 2-5 inclusive |

### ProteinPreset (Admin)

| Field | Type | Validation |
|-------|------|------------|
| multiplierGPerKg | Float | > 0, ≤ 3.0 |
| active | Boolean | required |

### ProteinConfig (Admin)

| Field | Type | Validation |
|-------|------|------------|
| minGDay | Int | 30-100 |
| maxGDay | Int | 150-300, > minGDay |
| defaultMealsPerDay | Int | 2-5 |
| mealSplits | JSON | Valid JSON, splits sum to ~1.0 |

## State Transitions

### Profile Lifecycle

```
[No Profile] → create → [Profile Exists] → update → [Profile Updated]
                                          → delete → [No Profile]
```

### Target Recalculation Triggers

1. Profile created → Calculate target
2. Profile updated (weight, training, goal, meals) → Recalculate target
3. Admin updates preset multiplier → Existing targets unchanged (audit trail preserved)
4. User deletes profile → Cascade delete target

## Seed Data

### Default Presets (6 rows)

```json
[
  { "trainingLevel": "NONE", "goal": "MAINTAIN", "multiplierGPerKg": 1.0 },
  { "trainingLevel": "NONE", "goal": "LOSE", "multiplierGPerKg": 1.2 },
  { "trainingLevel": "NONE", "goal": "GAIN", "multiplierGPerKg": 1.2 },
  { "trainingLevel": "REGULAR", "goal": "MAINTAIN", "multiplierGPerKg": 1.6 },
  { "trainingLevel": "REGULAR", "goal": "LOSE", "multiplierGPerKg": 1.8 },
  { "trainingLevel": "REGULAR", "goal": "GAIN", "multiplierGPerKg": 1.8 }
]
```

### Default Config (1 row)

```json
{
  "minGDay": 60,
  "maxGDay": 220,
  "defaultMealsPerDay": 3,
  "mealSplits": {
    "2": [0.45, 0.55],
    "3": [0.25, 0.35, 0.40],
    "4": [0.25, 0.30, 0.25, 0.20],
    "5": [0.20, 0.20, 0.25, 0.20, 0.15]
  }
}
```

## localStorage Schema (Anonymous Users)

```typescript
// Key: "proteinlens_protein_profile"
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
  calculatedAt: string; // ISO 8601
}
```

**Migration on Signup**: When anonymous user signs up, migrate localStorage profile to database and clear localStorage.
