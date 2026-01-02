# Implementation Plan: Macro Ingredients Analysis

**Branch**: `001-macro-ingredients-analysis` | **Date**: 2 January 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-macro-ingredients-analysis/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend ProteinLens meal analysis to track complete macronutrient data (protein, carbohydrates, fat) instead of protein alone. This requires:
- Updating AI analysis prompts to request carbs and fat alongside protein
- Extending database schema (Food table) to store carbs/fat with 1 decimal precision
- Modifying API contracts (AIAnalysisResponse) to include macro data
- Updating UI components to display all three macros with percentages
- Implementing user correction flows for each macro independently
- Handling legacy protein-only meals with graceful degradation

Technical approach uses existing GPT-5.1 Vision capabilities (no model change), Prisma migration for schema extension, and React component updates following shadcn/ui patterns.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+ backend, React 19 frontend)
**Primary Dependencies**: 
- Backend: Azure Functions v4, Prisma ORM, Zod validation, GPT-5.1 via Azure AI Foundry
- Frontend: React 19, Vite, shadcn/ui components, TanStack Query, Tailwind CSS
**Storage**: PostgreSQL (Azure Database for PostgreSQL Flexible Server) via Prisma
**Testing**: Vitest (unit/integration), Playwright (E2E frontend)
**Target Platform**: Azure Functions (Linux serverless) + Static Web App (frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Sub-3-second meal analysis including macro extraction, 1g precision in daily totals
**Constraints**: Maintain backward compatibility with protein-only legacy meals, no AI model changes (use existing GPT-5.1)
**Scale/Scope**: Extends existing 3-field analysis (food name, portion, protein) to 5-field (+ carbs, fat), affects ~10 components, 3 API endpoints, 1 database table

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Zero Secrets in Client or Repository**: ✅ PASS - No new secrets required, uses existing GPT-5.1 Azure AI Foundry configuration

**II. Least Privilege Access**: ✅ PASS - Reuses existing Managed Identity for database and AI service access

**III. Blob-First Ingestion**: ✅ PASS - No changes to image upload flow, extends analysis of existing blobs

**IV. Traceability & Auditability**: ✅ PASS - Macro data stored in database alongside existing requestId and timestamps, user corrections maintain audit trail (FR-007)

**V. Deterministic JSON Output**: ✅ PASS - AI response schema extended with carbs/fat fields, Zod validation ensures schema compliance

**VI. Cost Controls & Resource Limits**: ✅ PASS - No additional AI tokens required (single prompt modification), caching strategy unchanged

**VII. Intelligent Analysis Infrastructure**: ✅ PASS - Uses existing GPT-5.1 model, no model version change, confidence levels apply to all macros

**VIII. Privacy & User Data Rights**: ✅ PASS - Macro data follows same deletion cascade as protein data, no new PII collected

**IX. On-Demand Resource Lifecycle**: ✅ PASS - No new infrastructure resources, extends existing Function App and database

**X. Secrets Management & Key Vault Supremacy**: ✅ PASS - No new secrets introduced

**XI. Zero-Downtime Key Rotation**: ✅ PASS - No changes to key rotation strategy

**XII. Infrastructure-as-Code Idempotency**: ✅ PASS - Database migration is idempotent (Prisma migrations)

**XIII. Mobile-First Design**: ✅ PASS - Macro display extends existing mobile-optimized meal cards, maintains thumb-reachable layout

**XIV. Fast Perceived Performance**: ✅ PASS - Sub-3-second analysis maintained (SC-008), skeleton screens show macro placeholders during load

**XV. Delight Without Friction**: ✅ PASS - Macro editing follows existing food item edit flow, no new blocking dialogs

**XVI. Accessibility Baseline**: ✅ PASS - Macro values use semantic labels, maintain 4.5:1 contrast, keyboard navigable

**XVII. Design System Consistency**: ✅ PASS - Uses shadcn/ui components and Tailwind tokens for macro display

**XVIII. Trust UI**: ✅ PASS - Low-confidence macro estimates flagged (clarification Q2), original AI values preserved during edits

**XIX. Action-First Screens**: ✅ PASS - Primary action (upload meal) unchanged, macro data enhances existing results screen

**Result**: ✅ ALL GATES PASSED - No Constitution violations, ready for Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-macro-ingredients-analysis/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-extensions.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── schemas.ts              # Extend AIAnalysisResponse, FoodItemSchema
│   ├── services/
│   │   ├── aiService.ts            # Update GPT-5.1 prompt for carbs/fat
│   │   └── mealService.ts          # Update daily summary calculations
│   ├── functions/
│   │   ├── analyze.ts              # Handle extended macro response
│   │   └── get-meals.ts            # Return macro data in response
│   └── utils/
│       └── sanitize.ts             # Extend sanitization for carbs/fat
├── prisma/
│   ├── schema.prisma               # Add carbs/fat to Food model
│   └── migrations/
│       └── [timestamp]_add_macros_to_food/
│           └── migration.sql       # ALTER TABLE Food ADD COLUMN carbs, fat
└── tests/
    ├── unit/
    │   ├── aiService.test.ts       # Test macro parsing
    │   └── mealService.test.ts     # Test daily totals with macros
    └── integration/
        └── analyze.test.ts         # E2E test with macro analysis

frontend/
├── src/
│   ├── components/
│   │   ├── results/
│   │   │   ├── MacroBreakdown.tsx      # NEW: Display carbs/fat/protein
│   │   │   ├── MealSummaryCard.tsx     # Extend with macro percentages
│   │   │   └── FoodItemCard.tsx        # Show carbs/fat alongside protein
│   │   └── history/
│   │       └── DailySummary.tsx        # Add macro totals display
│   ├── types/
│   │   └── meal.ts                 # Extend FoodItem, MealAnalysis interfaces
│   └── services/
│       └── api.ts                  # Handle macro data in responses
└── tests/
    └── components/
        └── MacroBreakdown.test.tsx # Test macro display logic
```

**Structure Decision**: Web application structure (frontend + backend) selected. Feature extends existing meal analysis flow without new microservices. Database migration adds columns to existing Food table. UI components extend shadcn/ui card patterns with macro data.

## Complexity Tracking

> **No Constitution violations to justify** - Feature extends existing patterns without introducing new complexity.

---

# Phase 0: Research & Discovery ✅ COMPLETE

**Output**: [research.md](./research.md)

**Key Decisions Resolved**:
1. AI Prompt Engineering - Extend JSON schema for carbs/fat
2. Database Precision - Decimal(6,2) nullable columns
3. UI Display - 3-column grid with percentages  
4. Calorie Formula - Standard 4-4-9 conversion
5. Edit Behavior - Independent per-macro editing
6. API Compatibility - Additive-only changes
7. Aggregation - Database SUM() with NULL handling
8. Testing - Unit + integration + E2E coverage

---

# Phase 1: Design & Contracts ✅ COMPLETE

**Outputs**:
- [data-model.md](./data-model.md) - Database and TypeScript interfaces
- [contracts/api-extensions.md](./contracts/api-extensions.md) - API specifications
- [quickstart.md](./quickstart.md) - Implementation guide
- [.github/agents/copilot-instructions.md](../../.github/agents/copilot-instructions.md) - Updated agent context

**Data Model Summary**:
- Food table: +2 columns (carbs, fat) - Decimal(6,2) nullable
- TypeScript interfaces: Extended FoodItem, MealAnalysis, new DailySummary
- Migration: Backward-compatible, rollback-safe

**API Contract Summary**:
- 3 extended endpoints (analyze, get-meals, patch-meals)
- 1 new endpoint (daily-summary)
- 100% backward compatible
- Legacy meals return null for carbs/fat

**Constitution Re-check**: ✅ ALL GATES PASSED (no violations introduced)

---

# Next Steps

**Phase 2 (NOT PART OF /speckit.plan)**:
Run `/speckit.tasks` to generate detailed implementation tasks (tasks.md)
