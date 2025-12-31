# Tasks: Protein Target Calculator

**Input**: Design documents from `/specs/015-protein-target-calculator/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and shared infrastructure

- [x] T001 Add Prisma schema enums (TrainingLevel, ProteinGoal, WeightUnit) in backend/prisma/schema.prisma
- [x] T002 Add Prisma models (UserProteinProfile, ProteinTarget, ProteinPreset, ProteinConfig) in backend/prisma/schema.prisma
- [x] T003 Add proteinProfile relation to existing User model in backend/prisma/schema.prisma
- [x] T004 Run Prisma migration: `npx prisma migrate dev --name add-protein-calculator`
- [x] T005 Create seed script for default presets and config in backend/prisma/seed-protein.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Zod schemas for protein types in backend/src/models/proteinTypes.ts
- [x] T007 [P] Implement calculation logic (computeProteinTarget function) in backend/src/services/proteinCalculatorService.ts
- [x] T008 [P] Implement roundTo5, clamp, normalizeSplits utility functions in backend/src/utils/proteinUtils.ts
- [x] T009 Implement getPresets and getConfig database queries in backend/src/services/proteinCalculatorService.ts
- [x] T010 Create frontend API client functions in frontend/src/services/proteinApi.ts
- [x] T011 [P] Create localStorage helper for anonymous persistence in frontend/src/utils/proteinStorage.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 & 2 - Calculate Daily Target + Per-Meal Distribution (Priority: P1) 🎯 MVP

**Goal**: User can calculate their daily protein target and see per-meal breakdown

**Independent Test**: Enter 70kg, regular training, lose goal → see "125g/day" with meal breakdown (30g, 45g, 50g)

### Implementation for User Story 1 & 2

- [x] T012 Implement POST /api/protein/calculate endpoint in backend/src/functions/protein-calculator.ts
- [x] T013 Implement GET /api/protein/config endpoint in backend/src/functions/protein-calculator.ts
- [x] T014 Register protein-calculator functions in backend/src/index.ts
- [x] T015 [P] Create WeightInput component (kg/lbs toggle) in frontend/src/components/protein/WeightInput.tsx
- [x] T016 [P] Create TrainingLevelSelector component in frontend/src/components/protein/TrainingLevelSelector.tsx
- [x] T017 [P] Create GoalSelector component in frontend/src/components/protein/GoalSelector.tsx
- [x] T018 [P] Create MealDistribution component (per-meal breakdown display) in frontend/src/components/protein/MealDistribution.tsx
- [x] T019 Create ProteinCalculator container component in frontend/src/components/protein/ProteinCalculator.tsx
- [x] T020 Create useProteinCalculator hook (state + localStorage) in frontend/src/hooks/useProteinCalculator.ts
- [x] T021 Create ProteinCalculatorPage in frontend/src/pages/ProteinCalculatorPage.tsx
- [x] T022 Add /protein-calculator route to frontend/src/App.tsx
- [x] T023 Add "Protein Calculator" link to main navigation in frontend/src/components/Navigation.tsx

**Checkpoint**: Anonymous user can calculate protein target and see per-meal distribution

---

## Phase 4: User Story 3 - Select Number of Meals Per Day (Priority: P2)

**Goal**: User can choose 2-5 meals per day and see updated distribution

**Independent Test**: Change meals from 3 to 4 → distribution updates to 4 meals

### Implementation for User Story 3

- [x] T024 [P] [US3] Create MealsPerDaySelector component in frontend/src/components/protein/MealsPerDaySelector.tsx
- [x] T025 [US3] Integrate MealsPerDaySelector into ProteinCalculator component in frontend/src/components/protein/ProteinCalculator.tsx
- [x] T026 [US3] Update useProteinCalculator hook to handle meals per day state in frontend/src/hooks/useProteinCalculator.ts

**Checkpoint**: User can select meals per day and see updated distribution

---

## Phase 5: User Story 4 - Save Profile and Protein Target (Priority: P2)

**Goal**: Logged-in user can persist their profile to database

**Independent Test**: Calculate target → save → refresh page → data is restored from database

### Implementation for User Story 4

- [x] T027 [US4] Implement GET /api/protein/profile endpoint in backend/src/functions/protein-calculator.ts
- [x] T028 [US4] Implement POST /api/protein/profile endpoint in backend/src/functions/protein-calculator.ts
- [x] T029 [US4] Implement DELETE /api/protein/profile endpoint in backend/src/functions/protein-calculator.ts
- [x] T030 [US4] Add saveProfile, getProfile, deleteProfile functions to backend/src/services/proteinCalculatorService.ts
- [x] T031 [P] [US4] Create SaveProfileButton component in frontend/src/components/protein/SaveProfileButton.tsx
- [x] T032 [US4] Update useProteinCalculator hook to fetch/save profile for authenticated users in frontend/src/hooks/useProteinCalculator.ts
- [x] T033 [US4] Add localStorage to database migration logic on login in frontend/src/hooks/useProteinCalculator.ts

**Checkpoint**: Logged-in user can save and retrieve their protein profile

---

## Phase 6: User Story 5 - Admin Manages Protein Presets (Priority: P3)

**Goal**: Admin can configure multiplier presets and meal splits

**Independent Test**: Admin changes regular/lose multiplier from 1.8 to 2.0 → new calculations use 2.0

### Implementation for User Story 5

- [x] T034 [US5] Implement GET /api/dashboard/protein/presets endpoint in backend/src/functions/admin-protein.ts
- [x] T035 [US5] Implement PUT /api/dashboard/protein/presets endpoint in backend/src/functions/admin-protein.ts
- [x] T036 [US5] Implement GET /api/dashboard/protein/config endpoint in backend/src/functions/admin-protein.ts
- [x] T037 [US5] Implement PUT /api/dashboard/protein/config endpoint in backend/src/functions/admin-protein.ts
- [x] T038 [US5] Register admin-protein functions in backend/src/index.ts
- [x] T039 [P] [US5] Create PresetEditor component (6-row table) in admin/src/components/PresetEditor.tsx
- [x] T040 [P] [US5] Create MealSplitEditor component in admin/src/components/MealSplitEditor.tsx
- [x] T041 [P] [US5] Create ConfigEditor component (min/max clamps) in admin/src/components/ConfigEditor.tsx
- [x] T042 [US5] Create ProteinPresetsPage in admin/src/pages/ProteinPresetsPage.tsx
- [x] T043 [US5] Add /protein-presets route to admin/src/App.tsx
- [x] T044 [US5] Add "Protein Presets" link to admin navigation in admin/src/components/AdminLayout.tsx
- [x] T045 [US5] Create admin API client functions in admin/src/services/adminProteinApi.ts

**Checkpoint**: Admin can view and edit protein calculation configuration

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, validation, UX polish

- [x] T046 Add input validation and error messages to ProteinCalculator component
- [x] T047 Add loading states and skeleton screens to ProteinCalculatorPage
- [x] T048 Add low-meal warning display (< 20g per meal) to MealDistribution component
- [x] T049 Add mobile-responsive styling (375px breakpoint) to all protein components
- [x] T050 Add touch-friendly targets (44×44px minimum) to all interactive elements
- [x] T051 Update admin PresetEditor validation (multiplier > 0, ≤ 3.0)
- [x] T052 Update admin MealSplitEditor validation (splits sum to ~1.0)

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundation)
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
Phase 3 (US1+2)  Phase 4 (US3)  Phase 5 (US4)
    │              │              │
    └──────────────┴──────────────┘
                   │
                   ▼
              Phase 6 (US5 - Admin)
                   │
                   ▼
              Phase 7 (Polish)
```

## Parallel Execution Opportunities

### Within Phase 2 (Foundation)
- T007, T008, T011 can run in parallel (different files)

### Within Phase 3 (US1+2)
- T015, T016, T017, T018 can run in parallel (independent components)

### Within Phase 6 (US5)
- T039, T040, T041 can run in parallel (independent admin components)

---

## Implementation Strategy

1. **MVP First**: Complete Phase 1-3 for a working anonymous calculator
2. **Incremental Delivery**: Each phase delivers testable functionality
3. **User Story Independence**: US3, US4 can be developed in parallel after foundation

---

## Summary

| Phase | Tasks | Parallel Tasks | Key Deliverable |
|-------|-------|----------------|-----------------|
| 1: Setup | T001-T005 | 0 | Database schema ready |
| 2: Foundation | T006-T011 | 3 | Core logic + API client |
| 3: US1+2 (P1) | T012-T023 | 4 | Anonymous calculator MVP |
| 4: US3 (P2) | T024-T026 | 1 | Meals per day selector |
| 5: US4 (P2) | T027-T033 | 1 | User profile persistence |
| 6: US5 (P3) | T034-T045 | 3 | Admin preset management |
| 7: Polish | T046-T052 | 0 | Error handling + UX |

**Total Tasks**: 52  
**Parallel Opportunities**: 12 tasks can run concurrently  
**MVP Scope**: Phases 1-3 (23 tasks)
