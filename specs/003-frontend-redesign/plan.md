# Implementation Plan: ProteinLens Frontend Redesign

**Branch**: `003-frontend-redesign` | **Date**: 2025-12-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-frontend-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Redesign the ProteinLens frontend into a modern, premium interface with:
- **Hero home screen** with clear value proposition and upload CTA
- **Beautiful upload experience** with progress states (drag/drop, skeleton loading, smooth transitions)
- **Results card** displaying meal analysis with total protein, food items, confidence indicators, and original image
- **Protein gap coaching widget** showing daily gap + 3 high-protein food suggestions
- **Meal history** with weekly trends (7-day bar chart) and grouped meal entries
- **Polished UI states** following mobile-first, fast perceived performance, and accessibility principles from Constitution v2.0.0

Technical approach: React 18 + Vite SPA with React Router, Framer Motion for transitions, React Query for data fetching, shadcn/ui + Tailwind for design system, optimistic UI for edits.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18.2, Node.js v25  
**Primary Dependencies**: 
- **UI Framework**: React 18.2 + React Router 7.11
- **Build Tool**: Vite 5.0.8 (ESM, HMR)
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State/Data**: React Query (TanStack Query) for server state, React Context for client state
- **Animation**: Framer Motion for page transitions, card animations, list insertions
- **Icons**: lucide-react
- **HTTP Client**: Fetch API or axios (wrapped in apiClient utility)
- **Testing**: Vitest + React Testing Library (unit), Playwright (e2e)

**Storage**: 
- Frontend: localStorage for user preferences (theme, goal), sessionStorage for upload state
- Backend: Azure Blob Storage (meal images), Azure SQL (meals, food items, corrections, goals) via existing API

**Testing**: 
- Unit: Vitest + React Testing Library (components, hooks, utilities)
- Integration: Vitest (apiClient, upload flow, state machines)
- E2E: Playwright (existing test suite)
- Accessibility: axe DevTools + eslint-plugin-jsx-a11y

**Target Platform**: 
- Mobile-first web (375px primary viewport, iPhone SE/13/14/15)
- Progressive enhancement to tablet (768px) and desktop (1024px+)
- Modern browsers (last 2 versions: Chrome, Safari, Firefox, Edge)

**Project Type**: Web application (frontend SPA + backend API)

**Performance Goals**: 
- First Contentful Paint (FCP): <300ms
- Time to Interactive (TTI): <3 seconds on 3G
- Upload + analysis flow: <5 seconds median
- Results display: <1 second after analysis completion
- Edit response time: <100ms (optimistic UI)
- History page load: <1 second

**Constraints**: 
- Mobile-first: All features must work on 375px viewport
- Accessibility: WCAG AA compliance (4.5:1 contrast, keyboard nav, focus indicators)
- Design system only: shadcn/ui + Tailwind tokens (no custom CSS except animations)
- No blocking spinners: Skeleton screens and optimistic UI required
- Motion safety: Respect prefers-reduced-motion media query
- Offline viewing: History must work offline (uploads require network)

**Scale/Scope**: 
- 6 user stories (3 P1, 2 P2, 1 P3)
- 37 functional requirements
- ~10-15 React components (HeroUploadCard, AnalyzeProgress, MealSummaryCard, FoodItemEditor, ProteinGapWidget, WeeklyTrendChart, etc.)
- 3 main routes (/, /history, /settings optional)
- Integration with existing backend API (blob upload, meal analysis, CRUD operations)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Backend & Infrastructure Principles (I-VII)

| Principle | Status | Compliance Notes |
|-----------|--------|------------------|
| **I. Zero Secrets in Client** | ✅ PASS | Frontend contains no API keys or secrets. Backend API endpoints authenticated via existing Azure Entra ID integration. |
| **II. Least Privilege Access** | ✅ PASS | Frontend uses Managed Identity via backend API. No direct storage/database access from client. |
| **III. Blob-First Ingestion** | ✅ PASS | Existing backend API enforces blob-first pattern. Frontend uploads to backend endpoint which persists to Azure Blob before analysis. |
| **IV. Traceability & Auditability** | ✅ PASS | Existing API provides request IDs, blob paths. Frontend displays original images and confidence levels for auditability. |
| **V. Deterministic JSON Output** | ✅ PASS | Frontend consumes existing validated API responses. Analysis results already schema-validated by backend. |
| **VI. Cost Controls & Resource Limits** | ✅ PASS | Backend enforces 10MB file size limit. Frontend will display file size validation before upload. Caching handled by backend. |
| **VII. Privacy & User Data Rights** | ✅ PASS | Delete operations will call backend API which cascades deletes per constitution. Frontend displays deletion confirmation UI. |

### UX & Interface Principles (VIII-XIV)

| Principle | Status | Compliance Notes |
|-----------|--------|------------------|
| **VIII. Mobile-First Design** | ✅ PASS | Spec requires 375px primary viewport, 44×44px touch targets, bottom-third CTAs, one-handed operation. All 6 stories designed mobile-first. |
| **IX. Fast Perceived Performance** | ✅ PASS | Spec mandates <300ms FCP, skeleton screens (no spinners), progressive rendering, lazy-load history. Performance budgets in SC-001-003. |
| **X. Delight Without Friction** | ✅ PASS | Spec requires 100-200ms micro-animations (Framer Motion), optimistic UI for edits, 3s toast auto-dismiss, respects prefers-reduced-motion. |
| **XI. Accessibility Baseline** | ✅ PASS | Spec mandates WCAG AA (4.5:1 contrast), keyboard nav, visible focus states, 16px+ body text, visible form labels. SC-008-009 validate compliance. |
| **XII. Design System Consistency** | ✅ PASS | Technical Context specifies shadcn/ui + Tailwind tokens only. FR-020-031 reference design system. No custom CSS except animations. |
| **XIII. Trust UI** | ✅ PASS | FR-016 requires confidence badges, FR-017 shows original images, FR-021-027 enable editing, FR-022 preserves AI-detected values for reference. |
| **XIV. Action-First Screens** | ✅ PASS | Each story has clear primary action: Upload (US1), Analyze (US2), View Results (US3), Edit (US4), Quick Add (US5), View History (US6). |

**GATE RESULT**: ✅ **PASS** - All 14 constitutional principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── routes.md        # Route definitions (/, /history, /settings)
│   ├── components.md    # Component API contracts
│   └── state.md         # State machine definitions (upload/analyze flow)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/          # Azure Functions HTTP endpoints
│   ├── services/           # Business logic (analysis, blob, subscription, usage)
│   ├── models/             # Prisma models (User, Meal, FoodItem, Correction, Goal)
│   ├── middleware/         # Auth, error handling
│   └── utils/              # Helpers
└── tests/
    ├── unit/               # 43 tests (services, schemas)
    ├── contract/           # API contract tests
    └── integration/        # End-to-end backend tests

frontend/
├── src/
│   ├── components/         # React components (NEW: major expansion)
│   │   ├── home/           # HeroUploadCard, ExampleResults
│   │   ├── upload/         # UploadDropzone, ImagePreview, AnalyzeProgress
│   │   ├── results/        # MealSummaryCard, FoodItemList, FoodItemEditor
│   │   ├── coaching/       # ProteinGapWidget, SuggestionCard
│   │   ├── history/        # MealHistoryList, WeeklyTrendChart
│   │   ├── layout/         # BottomNav, Sidebar, PageContainer
│   │   └── ui/             # shadcn/ui components (Button, Card, Toast, Skeleton, etc.)
│   ├── pages/              # Route components (NEW)
│   │   ├── Home.tsx        # / - Hero + upload CTA
│   │   ├── Results.tsx     # /meal/:id - Analysis results (optional, may inline in Home)
│   │   ├── History.tsx     # /history - Meal history + trends
│   │   └── Settings.tsx    # /settings - Goal config + account (optional MVP)
│   ├── hooks/              # Custom React hooks (NEW)
│   │   ├── useUpload.ts    # Upload state machine
│   │   ├── useMeals.ts     # React Query hooks for meals
│   │   ├── useGoal.ts      # Daily goal management
│   │   └── useGap.ts       # Protein gap calculation
│   ├── services/           # API client + utilities (EXPAND)
│   │   ├── apiClient.ts    # Fetch wrapper with auth
│   │   ├── mealService.ts  # CRUD for meals
│   │   └── uploadService.ts # Blob upload + analysis
│   ├── types/              # TypeScript interfaces (EXPAND)
│   │   ├── meal.ts         # Meal, FoodItem, Correction
│   │   ├── goal.ts         # DailyGoal
│   │   └── api.ts          # API request/response types
│   ├── utils/              # Helpers (NEW)
│   │   ├── uploadStateMachine.ts # Upload flow states
│   │   └── proteinCalc.ts  # Gap calculation logic
│   ├── App.tsx             # Root component + routing
│   └── App.css             # Global styles (minimal, Tailwind-based)
└── tests/
    ├── unit/               # Component tests (NEW - currently empty)
    └── e2e/                # Playwright specs (existing)
```

**Structure Decision**: Web application structure (Option 2) selected. Frontend is React SPA with component-driven architecture. Backend is existing Azure Functions API (no changes required for this feature). Frontend expansion focuses on new routes (/history, /settings), 10-15 new components organized by feature domain (home, upload, results, coaching, history, layout), and custom hooks for state management.

---

## Phase 0: Research & Unknowns Resolution ✅ COMPLETE

**Status**: All technology choices resolved. No NEEDS CLARIFICATION markers.

**Output**: [research.md](research.md) - 6 key decisions documented:
1. **React Query (TanStack Query)**: Server state management with automatic caching and optimistic updates
2. **Framer Motion**: Declarative animations with accessibility support (respects prefers-reduced-motion)
3. **shadcn/ui + Tailwind**: Design system with accessible primitives
4. **Upload state machine**: Finite state machine for upload flow (idle → selected → uploading → analyzing → done)
5. **Mobile-first responsive**: 375px → 768px → 1024px breakpoints
6. **Performance optimizations**: Code splitting, lazy loading, image compression, skeleton screens

**Best Practices Identified**:
- React Query optimistic updates for <100ms edit response (FR-024, SC-005)
- Framer Motion layout animations for list insertions (smooth, GPU-accelerated)
- Upload state machine prevents impossible states (can't be "uploading" + "analyzing" simultaneously)
- Mobile-first CSS reduces bundle size (base styles + min-width media queries)
- Accessibility tooling: eslint-plugin-jsx-a11y + axe DevTools + manual keyboard testing

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Data model, API contracts, routes, components, and state management fully defined.

### Outputs

1. **[data-model.md](data-model.md)** - TypeScript interfaces for all entities:
   - 4 core entities: Meal, FoodItem, Correction, DailyGoal
   - 3 computed entities: ProteinGap, WeeklyTrend, UploadState
   - 1 static dataset: HighProteinSuggestion (6 foods)
   - 3 API contracts: Upload, GetMeals, EditFoodItem
   - 2 localStorage schemas: CachedMeals, UserPreferences

2. **[contracts/routes.md](contracts/routes.md)** - Route definitions:
   - / (Home): Hero upload + results (P1, critical for FCP)
   - /meal/:id (Results): Optional, may inline in Home (P1)
   - /history (History): Meal list + trends (P3, lazy-loaded)
   - /settings (Settings): Goal + preferences (optional MVP)
   - Navigation: Mobile bottom nav, desktop sidebar
   - Transitions: Fade + slide (300ms, respects reduced-motion)

3. **[contracts/components.md](contracts/components.md)** - Component APIs:
   - 13 core components defined (Hero, Upload, Preview, Progress, Summary, List, Editor, Gap, Chart, History, Nav, Sidebar, Settings)
   - All props typed (TypeScript interfaces)
   - Responsibilities documented
   - Accessibility requirements (ARIA labels, semantic HTML, keyboard nav)
   - Performance targets (FCP, lazy loading, virtualization)

4. **[contracts/state.md](contracts/state.md)** - State management:
   - Upload state machine: 6 states, 9 actions, deterministic transitions
   - React Query setup: QueryClient config, query keys, 5 hooks (fetch, edit, delete)
   - Optimistic updates: Instant UI feedback for edits/deletes, rollback on error
   - Local state: Goal (localStorage), Theme (Context + localStorage)
   - Computed state: ProteinGap, WeeklyTrend (derived from meals + goal)

5. **[quickstart.md](quickstart.md)** - Developer onboarding:
   - Prerequisites (Node.js v25, npm v10, backend running)
   - Initial setup (install dependencies, configure Tailwind, add shadcn/ui components)
   - Project structure tour (13 directories, 40+ files)
   - Development workflow (dev server, tests, build)
   - 6-phase implementation plan (10 days estimated)
   - Testing checklist (accessibility, performance, responsiveness, functionality)

### Agent Context Update ✅

Updated GitHub Copilot context file (`.github/agents/copilot-instructions.md`) with:
- Language: TypeScript 5.3+, React 18.2, Node.js v25
- Project type: Web application (frontend SPA + backend API)
- New dependencies: React Query, Framer Motion, shadcn/ui, Recharts

---

## Constitution Check (Post-Design) ✅ RE-VALIDATED

All 14 constitutional principles remain satisfied after Phase 1 design:

- **Backend principles (I-VII)**: No violations. Frontend consumes existing API which enforces all backend principles.
- **UX principles (VIII-XIV)**: All requirements validated:
  - Mobile-first (375px primary, 44×44px touch targets) ✅
  - Fast perceived performance (<300ms FCP, skeleton screens) ✅
  - Delight without friction (optimistic UI, 100-200ms animations) ✅
  - Accessibility baseline (WCAG AA, keyboard nav, 4.5:1 contrast) ✅
  - Design system consistency (shadcn/ui + Tailwind only) ✅
  - Trust UI (confidence badges, original images, editable results) ✅
  - Action-first screens (clear primary CTAs per story) ✅

**GATE RESULT**: ✅ **PASS** - Design is fully compliant with Constitution v2.0.0

---

## Phase 2: Task Generation (Next Step)

**Status**: NOT STARTED - Awaits `/speckit.tasks` command

**Purpose**: Break 6 user stories into ~50-80 implementation tasks

**Task Priority**:
1. **P1 tasks first**: Home page, upload flow, results display (US1-US3)
2. **P2 tasks second**: Edit flow, coaching widget (US4-US5)
3. **P3 tasks last**: History + trends (US6)

**Expected Output**: `tasks.md` with numbered tasks, dependencies, acceptance criteria

---

## Summary

✅ **Phase 0 Complete**: All technology choices researched and documented  
✅ **Phase 1 Complete**: Data model, contracts, and quickstart guide ready  
✅ **Constitution Validated**: All 14 principles satisfied  
🔲 **Phase 2 Pending**: Run `/speckit.tasks` to generate implementation tasks

**Branch**: `003-frontend-redesign`  
**Next Command**: `/speckit.tasks` (breaks down 6 user stories into executable tasks)

**Documentation Generated**:
- plan.md (this file)
- research.md
- data-model.md
- contracts/routes.md
- contracts/components.md
- contracts/state.md
- quickstart.md

All artifacts validated and ready for implementation phase.

