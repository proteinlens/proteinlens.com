# Implementation Plan: Goal Sync Between Calculator and Settings

**Branch**: `016-goal-sync` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-goal-sync/spec.md`

## Summary

Fix the synchronization issue between the Protein Calculator page and Settings page where saved protein goals were not properly persisting or displaying. The core problem was that the `hasServerProfile` flag wasn't being reset when form values changed, causing the "✓ Saved to your profile" button to show incorrectly. Additionally, the Settings page's `useGoal` hook wasn't reading from the protein profile storage.

**Technical approach**: 
1. Update `useProteinCalculator` hook to reset `hasServerProfile` when any form value changes
2. Update `useGoal` hook to read from protein profile (server API and localStorage) with proper priority ordering

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: React 18, Vite, Azure Functions v4, Prisma ORM  
**Storage**: PostgreSQL (via Prisma), localStorage for anonymous users  
**Testing**: Vitest (unit/integration), Playwright (E2E)  
**Target Platform**: Web (React SPA), Azure Functions backend  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Save operation < 2 seconds, goal retrieval < 500ms  
**Constraints**: Must work offline for anonymous users via localStorage  
**Scale/Scope**: Single-user goal storage, ~10k users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client | ✅ PASS | No secrets involved - goal data only |
| II. Least Privilege Access | ✅ PASS | Uses existing authenticated API endpoints |
| III. Blob-First Ingestion | ✅ N/A | No blob operations |
| IV. Traceability & Auditability | ✅ PASS | Uses existing request ID logging |
| V. Deterministic JSON Output | ✅ PASS | Profile API returns schema-valid JSON |
| VI. Cost Controls | ✅ N/A | No AI inference involved |
| VII. Intelligent Analysis | ✅ N/A | No AI analysis involved |
| VIII. Privacy & User Data Rights | ✅ PASS | Users can delete profile data |
| IX. On-Demand Resource Lifecycle | ✅ N/A | No new resources created |
| X. Secrets Management | ✅ PASS | No new secrets required |
| XI. Zero-Downtime Key Rotation | ✅ N/A | No cryptographic keys involved |
| XII. IaC Idempotency | ✅ N/A | No infrastructure changes |
| XIII. Mobile-First Design | ✅ PASS | Uses existing mobile-first components |
| XIV. Fast Perceived Performance | ✅ PASS | Optimistic UI with loading states |
| XV. Delight Without Friction | ✅ PASS | Button state changes provide feedback |
| XVI. Accessibility Baseline | ✅ PASS | Uses existing accessible components |
| XVII. Design System Consistency | ✅ PASS | Uses existing shadcn/ui Button component |
| XVIII. Trust UI | ✅ PASS | Shows clear saved/unsaved state |
| XIX. Action-First Screens | ✅ PASS | Save button is primary action |

**Constitution Gate**: ✅ PASS - No violations detected

## Project Structure

### Documentation (this feature)

```text
specs/016-goal-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if needed)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   └── protein-calculator.ts    # Existing - no changes needed
│   └── services/
│       └── proteinCalculatorService.ts  # Existing - no changes needed
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── protein/
│   │   │   └── ProteinCalculator.tsx    # Existing - uses fixed hook
│   │   └── settings/
│   │       └── GoalInput.tsx            # Existing - uses fixed hook
│   ├── hooks/
│   │   ├── useProteinCalculator.ts      # MODIFIED - reset hasServerProfile on form change
│   │   └── useGoal.ts                   # MODIFIED - read from protein profile
│   ├── services/
│   │   └── proteinApi.ts                # Existing - getProteinProfile, saveProteinProfile
│   └── utils/
│       └── proteinStorage.ts            # Existing - localStorage helpers
└── tests/
    └── hooks/
        └── useGoal.test.ts              # NEW - unit tests for goal sync
```

**Structure Decision**: Uses existing web application structure. Changes are limited to two frontend hooks - no new files except tests.

## Complexity Tracking

> No constitution violations - complexity tracking not required.

## Implementation Status

**Note**: Core implementation was completed during bug investigation prior to spec creation:

| File | Status | Change |
|------|--------|--------|
| `frontend/src/hooks/useProteinCalculator.ts` | ✅ DONE | Reset `hasServerProfile: false` on all form setters |
| `frontend/src/hooks/useGoal.ts` | ✅ DONE | Read from server API → protein profile localStorage → legacy localStorage → default |

### Remaining Work

1. Unit tests for `useGoal` hook
2. Integration test for Calculator → Settings sync flow
3. Verify changes in production after deployment
