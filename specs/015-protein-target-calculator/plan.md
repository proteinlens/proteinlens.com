# Implementation Plan: Protein Target Calculator

**Branch**: `015-protein-target-calculator` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-protein-target-calculator/spec.md`

## Summary

Implement a protein target calculator that computes personalized daily and per-meal protein recommendations based on user weight, training level (none/regular), and fitness goal (maintain/lose/gain). Uses configurable preset multipliers (g/kg) stored in database, with admin UI for tuning. Supports both logged-in users (database persistence) and anonymous users (localStorage persistence). Available as a dedicated page in main navigation with kg/lbs toggle.

## Technical Context

**Language/Version**: TypeScript 5.x (Node 20+)  
**Primary Dependencies**: Azure Functions v4, Prisma ORM, React 18, TanStack Query, Tailwind CSS, Zod  
**Storage**: PostgreSQL (user profiles/targets), localStorage (anonymous users)  
**Testing**: Vitest (unit/contract/integration)  
**Target Platform**: Web (frontend SPA + backend API)
**Project Type**: Web application (frontend + backend + admin)  
**Performance Goals**: <300ms calculation response, <3s page load on 3G  
**Constraints**: Mobile-first design (375px primary), 44×44px touch targets  
**Scale/Scope**: Existing user base, adds ~4 new API endpoints, 2 new frontend pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client or Repository | ✅ PASS | No secrets required for this feature |
| II. Least Privilege Access | ✅ PASS | Uses existing Prisma/DB connection via Managed Identity |
| III. Blob-First Ingestion | N/A | No image uploads in this feature |
| IV. Traceability & Auditability | ✅ PASS | All calculations logged with user_id, timestamp, multiplier used |
| V. Deterministic JSON Output | ✅ PASS | API responses use Zod schema validation |
| VI. Cost Controls & Resource Limits | ✅ PASS | No AI inference, minimal compute |
| VII. Intelligent Analysis Infrastructure | N/A | No AI/GPT usage in this feature |
| VIII. Privacy & User Data Rights | ✅ PASS | User data deletable, profile linked to existing User model |
| IX. On-Demand Resource Lifecycle | ✅ PASS | No new infrastructure resources |
| X. Secrets Management & Key Vault | N/A | No new secrets required |
| XI. Zero-Downtime Key Rotation | N/A | No keys involved |
| XII. Infrastructure-as-Code Idempotency | N/A | No new infrastructure |
| XIII. Mobile-First Design | ✅ PASS | Design starts at 375px, thumb-reachable controls |
| XIV. Fast Perceived Performance | ✅ PASS | Skeleton screens, instant calculation, <300ms response |

**Gate Result**: ✅ PASS - No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/015-protein-target-calculator/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   └── protein-calculator.ts    # NEW: API endpoints
│   ├── services/
│   │   └── proteinCalculatorService.ts  # NEW: Business logic
│   └── models/
│       └── proteinTypes.ts          # NEW: Zod schemas
└── tests/
    ├── unit/
    │   └── proteinCalculator.test.ts
    └── contract/
        └── proteinCalculatorApi.test.ts

frontend/
├── src/
│   ├── pages/
│   │   └── ProteinCalculatorPage.tsx  # NEW: Calculator page
│   ├── components/
│   │   └── protein/                   # NEW: Calculator components
│   │       ├── ProteinCalculator.tsx
│   │       ├── MealDistribution.tsx
│   │       └── WeightInput.tsx
│   ├── hooks/
│   │   └── useProteinCalculator.ts    # NEW: Calculator state
│   └── services/
│       └── proteinApi.ts              # NEW: API client

admin/
├── src/
│   ├── pages/
│   │   └── ProteinPresetsPage.tsx     # NEW: Admin preset config
│   └── components/
│       └── protein/
│           ├── PresetEditor.tsx
│           └── MealSplitEditor.tsx

backend/prisma/
└── schema.prisma                      # MODIFY: Add protein models
```

**Structure Decision**: Follows existing web application pattern with frontend/, backend/, and admin/ directories. New files integrate with established patterns (Azure Functions, React pages, Prisma models).

## Complexity Tracking

> No violations to justify - all constitution checks passed.

## Phase 1 Outputs

✅ **research.md** - Research complete, all unknowns resolved  
✅ **data-model.md** - Prisma schema additions documented  
✅ **contracts/protein-calculator-api.yaml** - OpenAPI 3.0 spec  
✅ **quickstart.md** - Developer onboarding guide  
✅ **Agent context updated** - copilot-instructions.md

## Constitution Re-Check (Post-Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| IV. Traceability | ✅ PASS | ProteinTarget stores multiplierUsed, calculatedAt |
| V. Deterministic JSON | ✅ PASS | All API responses have Zod schemas in OpenAPI |
| VIII. Privacy | ✅ PASS | Cascade delete on User→Profile→Target |
| XIII. Mobile-First | ✅ PASS | Design starts at 375px per quickstart |
| XIV. Performance | ✅ PASS | Simple calculation, no external calls |

**Post-Design Gate**: ✅ PASS

---

## Next Steps

Run `/speckit.tasks` to generate implementation tasks from this plan.
