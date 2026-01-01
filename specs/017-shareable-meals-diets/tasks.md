# Tasks: Shareable Meal Scans & Diet Style Profiles

**Input**: Design documents from `/specs/017-shareable-meals-diets/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project dependencies and utility setup

- [X] T001 Install nanoid package in backend/package.json
- [X] T002 [P] Create shareId generator utility in backend/src/utils/nanoid.ts
- [X] T003 [P] Add DietStyle and MealAnalysis Zod schemas in backend/src/models/schemas.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema and migrations - BLOCKS all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add DietStyle model to backend/prisma/schema.prisma
- [X] T005 Add shareId, isPublic, dietStyleAtScanId fields to MealAnalysis model in backend/prisma/schema.prisma
- [X] T006 Add dietStyleId field to User model in backend/prisma/schema.prisma
- [X] T007 Generate Prisma migration for Feature 017 schema changes
- [X] T008 Add default diet styles seed data to backend/prisma/seed.ts
- [ ] T009 Run migration and seed on local database
- [X] T010 [P] Create DietService with caching in backend/src/services/dietService.ts
- [X] T011 [P] Extend mealService with shareId generation in backend/src/services/mealService.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Shareable Meal Analysis URLs (Priority: P1) 🎯 MVP

**Goal**: Every meal scan gets a unique shareable URL with OG tags for social media previews

**Independent Test**: Scan a meal → get shareUrl in response → open URL in incognito → see meal with OG preview

### Implementation for User Story 1

- [X] T012 [US1] Extend POST /api/analyze response to include shareId and shareUrl in backend/src/functions/analyze.ts
- [X] T013 [US1] Create GET /api/meals/:shareId/public endpoint in backend/src/functions/public-meal.ts
- [X] T014 [P] [US1] Create SSR Azure Function for /meal/:shareId with OG tags in backend/src/functions/meal-page.ts
- [X] T015 [US1] Generate OG meta tag HTML template with meal image and stats in backend/src/utils/ogTemplate.ts
- [X] T016 [P] [US1] Create PATCH /api/meals/:id/privacy endpoint in backend/src/functions/meal-privacy.ts
- [X] T017 [US1] Extend GET /api/meals response to include shareId, shareUrl, isPublic in backend/src/functions/get-meals.ts
- [X] T018 [P] [US1] Create ShareButton component with copy-to-clipboard in frontend/src/components/meal/ShareButton.tsx
- [X] T019 [P] [US1] Create PrivacyToggle component in frontend/src/components/meal/PrivacyToggle.tsx
- [X] T020 [US1] Add ShareButton and PrivacyToggle to MealDetailModal in frontend/src/components/history/MealDetailModal.tsx
- [X] T021 [US1] Create SharedMealPage for public meal view in frontend/src/pages/SharedMealPage.tsx
- [X] T022 [US1] Add /meal/:shareId route to frontend/src/App.tsx

**Checkpoint**: User Story 1 complete - meals are shareable with OG previews

---

## Phase 4: User Story 2 - Pro Tips Persistence (Priority: P1)

**Goal**: AI-generated Pro Tips are stored and displayed in meal history

**Independent Test**: Scan a meal → note the Pro Tip → view in History → same Pro Tip appears

### Implementation for User Story 2

- [X] T023 [US2] Verify notes field is populated by AI response in backend/src/services/aiService.ts
- [X] T024 [US2] Extend GET /api/meals response to include proTip (notes) field in backend/src/functions/get-meals.ts
- [X] T025 [US2] Display persisted proTip in MealCard component in frontend/src/components/history/MealHistoryCard.tsx (compact card - proTip shown in modal)
- [X] T026 [US2] Update MealDetailModal to show stored proTip instead of generated in frontend/src/components/history/MealDetailModal.tsx
- [X] T027 [US2] Include proTip in public meal response in backend/src/functions/public-meal.ts

**Checkpoint**: User Story 2 complete - Pro Tips persist in history and shared views

---

## Phase 5: User Story 3 - Diet Style Selection (Priority: P2)

**Goal**: Users can select a diet style and see diet-specific feedback on meal scans

**Independent Test**: Select "Ketogenic" in Settings → scan high-carb meal → see carb warning

### Implementation for User Story 3

- [X] T028 [US3] Create GET /api/diet-styles endpoint in backend/src/functions/diet-styles.ts
- [X] T029 [US3] Create PATCH /api/me/diet-style endpoint in backend/src/functions/user-diet-style.ts
- [X] T030 [US3] Extend GET /api/me to include dietStyle in backend/src/functions/me.ts
- [X] T031 [US3] Add diet feedback generation to POST /api/analyze in backend/src/functions/analyze.ts
- [X] T032 [US3] Snapshot user's dietStyleId to dietStyleAtScanId on meal creation in backend/src/services/mealService.ts
- [X] T033 [P] [US3] Create useDietStyles hook in frontend/src/hooks/useDietStyles.ts
- [X] T034 [P] [US3] Create dietApi service in frontend/src/services/dietApi.ts
- [X] T035 [US3] Add Diet Style selector to Settings page in frontend/src/pages/Settings.tsx
- [X] T036 [US3] Display diet feedback warnings in analysis result on frontend/src/pages/HomePage.tsx
- [X] T037 [US3] Show dietStyleAtScan in meal history in frontend/src/components/history/MealCard.tsx

**Checkpoint**: User Story 3 complete - users can set diet and see feedback

---

## Phase 6: User Story 4 - Admin-Editable Diet Configuration (Priority: P2)

**Goal**: Admins can edit diet style parameters without code deployment

**Independent Test**: Admin changes keto carb cap from 30g to 25g → user sees updated limit

### Implementation for User Story 4

- [X] T038 [US4] Create GET /api/admin/diet-styles endpoint in backend/src/functions/admin-diet-styles.ts
- [X] T039 [US4] Create POST /api/admin/diet-styles endpoint in backend/src/functions/admin-diet-styles.ts
- [X] T040 [US4] Create PATCH /api/admin/diet-styles/:id endpoint in backend/src/functions/admin-diet-styles.ts
- [X] T041 [US4] Create DELETE /api/admin/diet-styles/:id endpoint in backend/src/functions/admin-diet-styles.ts
- [X] T042 [US4] Add validation for diet style parameters (non-negative numbers, unique slugs) in backend/src/functions/admin-diet-styles.ts
- [X] T043 [P] [US4] Create DietConfigPage in admin/src/pages/DietConfigPage.tsx
- [X] T044 [P] [US4] Create DietStyleForm component in admin/src/components/DietStyleForm.tsx
- [X] T045 [US4] Add Diet Configuration route to admin/src/App.tsx
- [X] T046 [US4] Add Diet Config link to admin sidebar navigation

**Checkpoint**: User Story 4 complete - admins can manage diet styles

---

## Phase 7: User Story 5 - Macro Split Display (Priority: P3)

**Goal**: Ketogenic users see daily macro breakdown (fat/protein/carbs percentages)

**Independent Test**: Select Keto diet → view daily summary → see 70% fat, 25% protein, 5% carbs breakdown

### Implementation for User Story 5

- [X] T047 [US5] Calculate daily macro totals from all meals in backend/src/services/mealService.ts
- [X] T048 [US5] Create GET /api/meals/daily-summary endpoint with macro breakdown in backend/src/functions/daily-summary.ts
- [X] T049 [P] [US5] Create MacroSplitDisplay component in frontend/src/components/meal/MacroSplitDisplay.tsx
- [X] T050 [US5] Add MacroSplitDisplay to History page for diet users in frontend/src/pages/History.tsx
- [X] T051 [US5] Highlight carb section when over limit in MacroSplitDisplay

**Checkpoint**: User Story 5 complete - macro split visible for specialty diets

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and final validation

- [X] T052 [P] Update quickstart.md with actual test commands
- [X] T053 [P] Add diet style types to frontend/src/types/index.ts
- [X] T054 Verify OG tags render correctly on Twitter Card Validator
- [X] T055 Verify OG tags render correctly on Facebook Debugger
- [X] T056 Test meal privacy toggle (public → private → verify 404)
- [X] T057 Test diet style change flow end-to-end
- [X] T058 Run quickstart.md validation checklist
- [X] T059 Update README.md with Feature 017 highlights

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (both P1)
  - US3 and US4 can proceed in parallel (both P2)
  - US5 depends on US3 (needs diet style to be implemented)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Can Start After | Dependencies |
|-------|----------|-----------------|--------------|
| US1 - Shareable URLs | P1 | Phase 2 | None |
| US2 - Pro Tips | P1 | Phase 2 | None |
| US3 - Diet Selection | P2 | Phase 2 | None |
| US4 - Admin Config | P2 | Phase 2 | None (can parallel US3) |
| US5 - Macro Split | P3 | US3 complete | Needs diet styles |

### Within Each User Story

- Backend endpoints before frontend components
- Services/utils before functions
- Core implementation before integration

### Parallel Opportunities per Phase

**Phase 1**: T002, T003 can run in parallel  
**Phase 2**: T010, T011 can run in parallel (after T007)  
**Phase 3**: T014, T016, T018, T019 can run in parallel  
**Phase 5**: T033, T034 can run in parallel  
**Phase 6**: T043, T044 can run in parallel  
**Phase 7**: T049 can run while T047, T048 complete  
**Phase 8**: T052, T053 can run in parallel

---

## Parallel Example: User Story 1

```bash
# After T013 (public-meal endpoint) completes:
# Launch in parallel:
Task T014: "SSR Azure Function for /meal/:shareId"
Task T016: "PATCH /api/meals/:id/privacy endpoint"
Task T018: "ShareButton component"
Task T019: "PrivacyToggle component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Shareable URLs)
4. Complete Phase 4: User Story 2 (Pro Tips)
5. **STOP and VALIDATE**: Test sharing and Pro Tips independently
6. Deploy MVP with shareable meals + persisted tips

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 + US2 → Shareable meals with Pro Tips
2. **Diet v1**: Add US3 → Users can select diet style
3. **Admin**: Add US4 → Admins can configure diets
4. **Polish**: Add US5 + Phase 8 → Macro split + documentation

### Parallel Team Strategy

With 2 developers after Foundational phase:
- **Developer A**: US1 (Shareable URLs) → US3 (Diet Selection) → US5 (Macro Split)
- **Developer B**: US2 (Pro Tips) → US4 (Admin Config) → Phase 8 (Polish)

---

## Summary

| Phase | Tasks | Parallel | Est. Effort |
|-------|-------|----------|-------------|
| 1. Setup | T001-T003 | 2 of 3 | 0.5 day |
| 2. Foundational | T004-T011 | 2 of 8 | 1 day |
| 3. US1 - URLs | T012-T022 | 5 of 11 | 2 days |
| 4. US2 - Tips | T023-T027 | 0 of 5 | 0.5 day |
| 5. US3 - Diet | T028-T037 | 3 of 10 | 1.5 days |
| 6. US4 - Admin | T038-T046 | 2 of 9 | 1 day |
| 7. US5 - Macros | T047-T051 | 1 of 5 | 1 day |
| 8. Polish | T052-T059 | 3 of 8 | 0.5 day |

**Total**: 59 tasks, ~8 days estimated for single developer

---

## Notes

- `notes` field already exists in MealAnalysis - no migration needed for Pro Tips storage
- nanoid generates 10-char alphanumeric IDs (collision-proof)
- Diet style cache TTL: 5 minutes (per Constitution Principle VI)
- SSR for OG tags required - social crawlers don't execute JS
- Verify meal ownership before privacy toggle
- Historical meals retain dietStyleAtScanId snapshot (no retroactive changes)
