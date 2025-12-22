# Tasks: ProteinLens Frontend Redesign

**Input**: Design documents from `/specs/003-frontend-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests included per user request (QA section). E2E tests are existing Playwright suite.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- All frontend work in `frontend/src/`
- No backend changes required for this feature

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install React Query dependencies in frontend/package.json (@tanstack/react-query@^5.0.0, @tanstack/react-query-devtools)
- [X] T002 [P] Install Framer Motion in frontend/package.json (framer-motion@^11.0.0)
- [X] T003 [P] Install shadcn/ui CLI and initialize with default config (npx shadcn-ui@latest init)
- [X] T004 [P] Install Recharts for charting in frontend/package.json (recharts@^2.10.0)
- [X] T005 [P] Install browser-image-compression in frontend/package.json (browser-image-compression@^2.0.0)
- [X] T006 [P] Install utility libraries: clsx, tailwind-merge, date-fns in frontend/package.json
- [X] T007 Install testing dependencies: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- [X] T008 [P] Install eslint-plugin-jsx-a11y for accessibility linting
- [X] T009 Configure Tailwind with design tokens in frontend/tailwind.config.js (colors, spacing, breakpoints per research.md)
- [X] T010 [P] Update ESLint config with jsx-a11y plugin in frontend/.eslintrc.cjs
- [X] T011 [P] Add shadcn/ui components: button, card, input, label, toast, skeleton (npx shadcn-ui add)
- [X] T012 [P] Create cn() utility in frontend/src/utils/cn.ts (clsx + tailwind-merge)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T013 Setup React Query QueryClient in frontend/src/App.tsx with config from contracts/state.md
- [X] T014 [P] Create ThemeProvider context in frontend/src/contexts/ThemeContext.tsx (light/dark/system modes)
- [X] T015 [P] Create query keys structure in frontend/src/hooks/queryKeys.ts per contracts/state.md
- [X] T016 [P] Create TypeScript interfaces in frontend/src/types/meal.ts (Meal, FoodItem, Correction per data-model.md)
- [X] T017 [P] Create TypeScript interfaces in frontend/src/types/goal.ts (DailyGoal, ProteinGap per data-model.md)
- [X] T018 [P] Create TypeScript interfaces in frontend/src/types/api.ts (API request/response types)
- [X] T019 Create apiClient wrapper in frontend/src/services/apiClient.ts (fetch with auth, base URL from env)
- [ ] T020 [P] Create mealService in frontend/src/services/mealService.ts (getAll, getById, editFoodItem, delete methods)
- [ ] T021 [P] Create uploadService in frontend/src/services/uploadService.ts (upload, pollAnalysis methods)
- [X] T022 Create upload state machine reducer in frontend/src/utils/uploadStateMachine.ts per contracts/state.md
- [X] T023 [P] Create useUpload hook in frontend/src/hooks/useUpload.ts wrapping state machine
- [X] T024 [P] Setup React Router with lazy loading in frontend/src/App.tsx (/, /history, /settings routes)
- [X] T025 [P] Create PageContainer layout component in frontend/src/components/layout/PageContainer.tsx
- [X] T026 [P] Create BottomNav component in frontend/src/components/layout/BottomNav.tsx (mobile navigation)
- [ ] T027 [P] Create Sidebar component in frontend/src/components/layout/Sidebar.tsx (desktop navigation)
- [X] T028 Configure vitest in frontend/vitest.config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Land on Premium Home Screen (Priority: P1) 🎯 MVP

**Goal**: Hero home screen with clear value proposition, upload CTA, and trust elements

**Independent Test**: Visit / on mobile (375px) and desktop, verify hero loads <300ms, CTA is in thumb zone, trust elements visible

### Implementation for User Story 1

- [X] T029 [P] [US1] Create Home page component in frontend/src/pages/Home.tsx (route handler)
- [X] T030 [P] [US1] Create HeroUploadCard component in frontend/src/components/home/HeroUploadCard.tsx per contracts/components.md
- [ ] T031 [P] [US1] Create ExampleResults static component in frontend/src/components/home/ExampleResults.tsx (mock data preview)
- [X] T032 [US1] Integrate HeroUploadCard into Home page with upload click handler
- [X] T033 [US1] Add Framer Motion page transition to Home in frontend/src/App.tsx (fade + slide, 300ms)
- [X] T034 [US1] Style HeroUploadCard with gradient background + glass effect using Tailwind
- [X] T035 [US1] Ensure CTA button is 44×44px minimum and positioned in bottom third on mobile
- [X] T036 [US1] Add trust elements: "AI-powered", "Edit anytime", "Your data, your control" badges

**Checkpoint**: Home page loads with hero section, CTA, trust elements - FCP <300ms

---

## Phase 4: User Story 2 - Upload Meal Photo with Beautiful Progress (Priority: P1) 🎯 MVP

**Goal**: Drag/drop upload with image preview, progress states, and skeleton loading during analysis

**Independent Test**: Select/upload image on mobile, verify preview displays, skeleton shows during analysis, results fade in smoothly

### Implementation for User Story 2

- [X] T037 [P] [US2] Create UploadDropzone component in frontend/src/components/upload/UploadDropzone.tsx per contracts/components.md
- [X] T038 [P] [US2] Create ImagePreview component in frontend/src/components/upload/ImagePreview.tsx with replace/remove buttons
- [X] T039 [P] [US2] Create AnalyzeProgress component in frontend/src/components/upload/AnalyzeProgress.tsx (skeleton screens, no spinners)
- [X] T040 [US2] Integrate UploadDropzone into Home page (show when user clicks upload CTA)
- [X] T041 [US2] Add file validation in UploadDropzone (max 10MB, image/* only, display errors)
- [X] T042 [US2] Generate preview URL (blob URL) when file selected in useUpload hook
- [X] T043 [US2] Implement upload progress tracking in uploadService with progress callback
- [X] T044 [US2] Add skeleton loading cards in AnalyzeProgress (shimmer effect, matches results structure)
- [X] T045 [US2] Add Framer Motion fade-in transition (300ms) when results replace skeleton
- [X] T046 [US2] Ensure touch targets are 44×44px for "Replace" and "Remove" buttons on mobile
- [X] T047 [US2] Add client-side image compression before upload using browser-image-compression

**Checkpoint**: Upload flow works (idle → selected → uploading → analyzing → done), smooth transitions

---

## Phase 5: User Story 3 - View and Understand Results at a Glance (Priority: P1) 🎯 MVP

**Goal**: Results card with total protein, food items, confidence indicators, and original image

**Independent Test**: After upload completes, verify results show total protein (20px+ font), food list with confidence badges, original image preview

### Implementation for User Story 3

- [X] T048 [P] [US3] Create MealSummaryCard component in frontend/src/components/results/MealSummaryCard.tsx per contracts/components.md
- [X] T049 [P] [US3] Create FoodItemList component in frontend/src/components/results/FoodItemList.tsx
- [X] T050 [P] [US3] Create FoodItem component in frontend/src/components/results/FoodItem.tsx (single item row)
- [X] T051 [P] [US3] Create useMeal hook in frontend/src/hooks/useMeal.ts (React Query fetch single meal)
- [X] T052 [P] [US3] Create useMeals hook in frontend/src/hooks/useMeals.ts (React Query fetch all meals)
- [X] T053 [US3] Display MealSummaryCard in Home page after upload completes (show results inline)
- [X] T054 [US3] Calculate and display total protein prominently (24px font on desktop, 20px on mobile)
- [X] T055 [US3] Display calories and macros if available from analysis (optional fields)
- [X] T056 [US3] Render FoodItemList with columns: name, portion, protein, confidence badge
- [X] T057 [US3] Add confidence badge (e.g., "85% confident") only if confidence <95%
- [X] T058 [US3] Display original meal image in MealSummaryCard with "what AI saw" label
- [X] T059 [US3] Make results scrollable on mobile without blocking total protein display (sticky header)
- [ ] T060 [US3] Add expandable detail view on mobile when tapping food item (show full portion/notes)
- [X] T061 [US3] Ensure layout is responsive: stacked on mobile (<768px), side-by-side on desktop (>=768px)

**Checkpoint**: Results display correctly with all required elements, responsive on mobile and desktop

---

## Phase 6: User Story 4 - Correct Items Quickly and See Totals Update (Priority: P2)

**Goal**: Inline editing for food items with optimistic UI and total protein recalculation

**Independent Test**: Tap food item, edit protein value, verify total updates instantly (<100ms), save persists to backend

### Implementation for User Story 4

- [X] T062 [P] [US4] Create FoodItemEditor component in frontend/src/components/results/FoodItemEditor.tsx per contracts/components.md
- [X] T063 [P] [US4] Create useEditFoodItem hook in frontend/src/hooks/useEditFoodItem.ts with optimistic update per contracts/state.md
- [X] T064 [US4] Add edit mode to FoodItem component (show editor when clicked)
- [X] T065 [US4] Implement inline edit form with fields: name (text), portion (text), protein (number)
- [X] T066 [US4] Display original AI-detected value for reference ("AI detected: 25g, You: —")
- [X] T067 [US4] Add optimistic update logic in useEditFoodItem (instant UI change before server response)
- [X] T068 [US4] Recalculate meal total protein in real-time when protein value changes
- [X] T069 [US4] Add Save and Cancel buttons (44×44px touch targets)
- [ ] T070 [US4] Show confirmation toast on successful save ("Item saved")
- [X] T071 [US4] Rollback optimistic update on error (restore previous value)
- [ ] T072 [US4] Add notes field to meal (optional user context)
- [X] T073 [US4] Ensure form labels are always visible (not placeholder-only) with 4.5:1 contrast
- [X] T074 [US4] Add keyboard support: Enter to save, Escape to cancel
- [X] T075 [US4] Mark edited items with visual indicator (pencil icon or "edited" badge)

**Checkpoint**: Editing works with instant UI feedback, persists to backend, error handling in place

---

## Phase 7: User Story 5 - View Protein Gap and Coaching Suggestions (Priority: P2)

**Goal**: Gap widget showing daily progress + 3 high-protein food suggestions

**Independent Test**: View gap widget, verify calculation is correct (goal - consumed), see 3 suggestions, test quick add

### Implementation for User Story 5

- [X] T076 [P] [US5] Create ProteinGapWidget component in frontend/src/components/coaching/ProteinGapWidget.tsx per contracts/components.md
- [X] T077 [P] [US5] Create SuggestionCard component in frontend/src/components/coaching/SuggestionCard.tsx
- [X] T078 [P] [US5] Create useGoal hook in frontend/src/hooks/useGoal.ts (localStorage + optional backend sync)
- [X] T079 [P] [US5] Create useProteinGap hook in frontend/src/hooks/useProteinGap.ts (computed from meals + goal)
- [X] T080 [P] [US5] Create static suggestions data in frontend/src/data/suggestions.ts (6 high-protein foods per data-model.md)
- [X] T081 [US5] Calculate protein gap client-side (goal - sum of today's meals)
- [X] T082 [US5] Display gap message: "X grams to reach your 150g daily goal" (16px+ font)
- [X] T083 [US5] Display 3 random suggestions from static data with protein content
- [X] T084 [US5] Show "🎯 Goal met!" when gap <= 0 (consumed >= goal)
- [X] T085 [US5] Add color-coding: red (<50% complete), yellow (50-90%), green (90%+)
- [ ] T086 [US5] Display "Set your daily protein goal" CTA if goal not configured
- [ ] T087 [US5] Implement quick add button for suggestions (optional - adds to current meal)
- [X] T088 [US5] Reset gap calculation at midnight UTC (new day starts)
- [X] T089 [US5] Add ProteinGapWidget to Home page below results or in sidebar

**Checkpoint**: Gap widget displays accurate calculation, suggestions rotate, quick add works

---

## Phase 8: User Story 6 - View Meal History with Weekly Trends (Priority: P3)

**Goal**: History page with meals grouped by day + 7-day bar chart

**Independent Test**: Navigate to /history, verify meals grouped by date, chart shows correct daily totals, empty state displays

### Implementation for User Story 6

- [X] T090 [P] [US6] Create History page component in frontend/src/pages/History.tsx (lazy-loaded route)
- [X] T091 [P] [US6] Create MealHistoryList component in frontend/src/components/history/MealHistoryList.tsx per contracts/components.md
- [X] T092 [P] [US6] Create MealHistoryCard component in frontend/src/components/history/MealHistoryCard.tsx (single meal in list)
- [X] T093 [P] [US6] Create WeeklyTrendChart component in frontend/src/components/history/WeeklyTrendChart.tsx using Recharts
- [X] T094 [P] [US6] Create useWeeklyTrend hook in frontend/src/hooks/useWeeklyTrend.ts (computed from meals)
- [X] T095 [US6] Group meals by date (most recent first) with date headers ("Today", "Yesterday", "Dec 20")
- [X] T096 [US6] Display meal cards with: thumbnail image, total protein, timestamp
- [X] T097 [US6] Calculate weekly trend (7 days, today - 6 days) with daily totals
- [X] T098 [US6] Render bar chart with 7 bars (Mon, Tue, Wed... labels)
- [X] T099 [US6] Highlight today's bar with different color
- [X] T100 [US6] Add tooltip on hover/tap: "Monday: 145g protein (3 meals)"
- [X] T101 [US6] Show average line across chart (optional)
- [X] T102 [US6] Ensure chart is responsive (no horizontal scroll on mobile)
- [X] T103 [US6] Add empty state: "No meals yet. Upload your first meal →" with CTA
- [X] T104 [US6] Implement meal click navigation to /meal/:id or inline modal (show full results)
- [X] T105 [US6] Lazy-load Recharts library only when History route is accessed

**Checkpoint**: History page displays grouped meals + weekly chart, empty state works, responsive

---

## Phase 9: Settings Page (Optional MVP)

**Goal**: Settings page for goal configuration, theme toggle, and account info

**Independent Test**: Navigate to /settings, change goal value, toggle dark mode, verify persistence

- [X] T106 [P] Create Settings page component in frontend/src/pages/Settings.tsx (lazy-loaded route)
- [X] T107 [P] Create GoalInput component in frontend/src/components/settings/GoalInput.tsx
- [X] T108 [P] Create ThemeToggle component in frontend/src/components/settings/ThemeToggle.tsx
- [X] T109 Add goal input field with save button (validate >= 0, <= 500)
- [X] T110 Persist goal to localStorage and optionally backend
- [X] T111 Add theme toggle: Light / Dark / System (3-way switch)
- [X] T112 Display account email and subscription status (placeholder for billing)
- [X] T113 Add "Export Meals" button (download CSV - future feature placeholder)
- [X] T114 Add "Delete All Data" button with confirmation dialog
- [X] T115 Ensure settings persist across page refreshes

---

## Phase 10: Delete Meal Functionality

**Goal**: Enable users to delete meals from history with optimistic UI

**Independent Test**: Delete meal from history, verify it disappears instantly, persists after refresh

- [X] T116 [P] Create useDeleteMeal hook in frontend/src/hooks/useDeleteMeal.ts with optimistic delete per contracts/state.md
- [X] T117 Add delete button to MealHistoryCard (icon button, 44×44px touch target)
- [X] T118 Show confirmation dialog before delete: "Delete this meal?"
- [X] T119 Optimistically remove meal from list (instant UI update)
- [X] T120 Call backend API to delete meal and cascade delete analysis records
- [X] T121 Rollback optimistic delete on error (restore meal to list)
- [X] T122 Update protein gap calculation after delete (if today's meal deleted)
- [ ] T123 Show toast notification: "Meal deleted"

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Animations, accessibility, performance, and final polish

### Animations (Framer Motion)

- [X] T124 [P] Add page transition animations (fade + slide, 300ms) to all routes
- [X] T125 [P] Add card expand animation when tapping food item (scale + opacity)
- [X] T126 [P] Add list item insert animation for FoodItemList (slide in from right)
- [X] T127 [P] Add skeleton → content fade-in animation (300-400ms)
- [X] T128 Add button press feedback (scale 0.95 on tap)
- [X] T129 Ensure all animations respect prefers-reduced-motion media query

### Accessibility (WCAG AA Compliance)

- [X] T130 [P] Audit all interactive elements for keyboard navigation (Tab, Enter, Esc)
- [X] T131 [P] Verify focus indicators are visible (3:1 contrast ratio)
- [X] T132 [P] Check color contrast for all text (4.5:1 for normal, 3:1 for large)
- [X] T133 [P] Add alt text to all images (meal photos, icons)
- [X] T134 [P] Ensure form labels are always visible (not placeholder-only)
- [X] T135 [P] Add ARIA labels to icon-only buttons
- [ ] T136 [P] Add skip-to-main-content link
- [ ] T137 Test with screen reader (VoiceOver on macOS/iOS)
- [ ] T138 Run axe DevTools audit (target: zero critical violations)

### Performance Optimization

- [X] T139 [P] Implement code-splitting for History and Settings routes (React.lazy)
- [X] T140 [P] Add lazy loading for images (loading="lazy" attribute)
- [X] T141 [P] Compress images client-side before upload (already in T047)
- [ ] T142 Run Lighthouse audit on Home page (target: FCP <300ms)
- [ ] T143 Run Lighthouse audit on History page (target: load <1s)
- [ ] T144 Optimize bundle size (analyze with vite-bundle-visualizer)
- [ ] T145 Add preload hints for critical routes

### Responsiveness

- [X] T146 [P] Test all pages on 375px viewport (iPhone SE)
- [X] T147 [P] Test all pages on 768px viewport (iPad)
- [X] T148 [P] Test all pages on 1024px+ viewport (desktop)
- [X] T149 Verify no horizontal scrolling on any breakpoint
- [X] T150 Verify all touch targets are >= 44×44px on mobile

---

## Phase 12: Testing & QA

**Purpose**: Unit tests for state machines, calculations, and component logic

**Status**: Test infrastructure complete. Vitest configured, 8 test files created, 29/56 tests passing. Core logic tests (state machine, hooks) working. Component tests need implementation mocking.

### Unit Tests (Vitest + React Testing Library)

- [X] T151 [P] Write unit test for upload state machine in frontend/__tests__/utils/uploadStateMachine.test.ts (all transitions)
- [X] T152 [P] Write unit test for protein gap calculation in frontend/__tests__/hooks/useProteinGap.test.ts
- [X] T153 [P] Write hook test for goal persistence in frontend/__tests__/hooks/useGoal.test.ts
- [X] T154 [P] Write component test for FoodItemEditor (edit flow) in frontend/__tests__/components/FoodItemEditor.test.tsx
- [X] T155 [P] Write component test for MealHistoryCard in frontend/__tests__/components/MealHistoryCard.test.tsx
- [X] T156 [P] Write component test for ThemeToggle in frontend/__tests__/components/ThemeToggle.test.tsx
- [X] T157 [P] Write hook test for useEditFoodItem (optimistic update) in frontend/__tests__/hooks/useEditFoodItem.test.ts
- [X] T158 [P] Vitest configured with jsdom environment for DOM testing
- [ ] T159 [P] Write integration test for upload flow (Playwright e2e)
- [ ] T160 [P] Write integration test for edit flow (Playwright e2e)
- [ ] T161 [P] Write integration test for delete flow (Playwright e2e)

### Integration Tests (E2E - Existing Playwright Suite)

- [ ] T162 [P] Add Playwright test for upload flow (select image → analyze → view results)
- [ ] T163 [P] Add Playwright test for edit flow (edit food item → save → verify total updated)
- [ ] T164 [P] Add Playwright test for navigation (Home → History → Settings → Home)
- [ ] T165 Add Playwright test for delete meal (delete from history → verify removed)
- [ ] T166 Add Playwright test for dark mode toggle (settings → toggle theme → verify UI changes)

---

## Dependencies & Parallel Execution

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation)
  ↓
Phase 3 (US1: Home) ← can start in parallel after Phase 2
  ↓
Phase 4 (US2: Upload) ← depends on US1 (integrates into Home)
  ↓
Phase 5 (US3: Results) ← depends on US2 (displays after upload)
  ↓
Phase 6 (US4: Edit) ← depends on US3 (edits results)
  ↓
Phase 7 (US5: Coaching) ← independent (can run parallel with US4)
  ↓
Phase 8 (US6: History) ← independent (can run parallel with US5)
  ↓
Phase 9-12 (Polish, Testing) ← can start after US1-US6 complete
```

### Parallel Execution Examples

**After Phase 2 completes, these can run in parallel**:
- Group A: T029-T036 (US1: Home page)
- Group B: T078-T080 (US5: Goal hooks + data - no UI dependencies)

**After US3 completes, these can run in parallel**:
- Group C: T062-T075 (US4: Edit components)
- Group D: T076-T089 (US5: Coaching widget)
- Group E: T090-T105 (US6: History page)

**Anytime after foundation**:
- Group F: All [P] tasks (parallel-safe, different files)

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Include**: Phase 1-5 (Setup + Foundation + US1 + US2 + US3)
- Total tasks: T001-T061 (61 tasks)
- Delivers: Home page with upload and results display
- User value: Core upload → analyze → view flow works end-to-end

**Defer to v2**: Phase 6-12 (Edit, Coaching, History, Polish)
- Can be delivered incrementally after MVP
- User Story 4-6 are independently testable

### Task Estimates

- **Phase 1 (Setup)**: 1 day (12 tasks)
- **Phase 2 (Foundation)**: 2 days (16 tasks)
- **Phase 3 (US1: Home)**: 1 day (8 tasks)
- **Phase 4 (US2: Upload)**: 1.5 days (11 tasks)
- **Phase 5 (US3: Results)**: 1.5 days (14 tasks)
- **Phase 6 (US4: Edit)**: 1.5 days (14 tasks)
- **Phase 7 (US5: Coaching)**: 1 day (14 tasks)
- **Phase 8 (US6: History)**: 2 days (16 tasks)
- **Phase 9-12 (Polish + Testing)**: 2.5 days (58 tasks)

**Total**: ~13-15 days (2-3 weeks with testing)

---

## Success Criteria Validation

After completing all tasks, verify:

- [ ] SC-001: Home page FCP <300ms on 3G (Lighthouse audit)
- [ ] SC-002: Upload + analysis flow <5 seconds median
- [ ] SC-003: Results display <1 second after analysis
- [ ] SC-004: 95% of users identify CTA within 3 seconds
- [ ] SC-005: Edit response time <100ms (optimistic UI)
- [ ] SC-006: History page load <1 second
- [ ] SC-007: Protein gap calculation 100% accurate
- [ ] SC-008: Keyboard navigation works for all flows
- [ ] SC-009: All text meets WCAG AA contrast (4.5:1)
- [ ] SC-010: Motion respects prefers-reduced-motion
- [ ] SC-011: Fully functional on 375px and 1024px+ viewports
- [ ] SC-012: All touch targets >= 44×44px on mobile
- [ ] SC-013: Zero critical accessibility violations (axe)
- [ ] SC-014: Dark mode displays correctly
- [ ] SC-015: Empty states show clear CTAs
- [ ] SC-016: Optimistic UI works for edits and deletes

---

**Total Tasks**: 166
**Parallel-Safe Tasks**: 89 (marked with [P])
**Estimated Duration**: 13-15 days
**MVP Scope**: T001-T061 (61 tasks, ~7 days)
