# Implementation Plan: Blob Upload + GPT-5.1 Vision Analysis

**Branch**: `001-blob-vision-analysis` | **Date**: 2025-12-22 | **Spec**: [spec.md](spec.md)

## Summary

Enable users to upload meal photos and receive AI-powered nutritional analysis. Frontend uploads images directly to Azure Blob Storage using SAS tokens, then triggers backend analysis via GPT-5.1 Vision through Azure AI Foundry. Results are persisted with full traceability, users can edit corrections, and delete functionality ensures GDPR compliance.

## Technical Context

**Language/Version**: Node.js 24 (Backend), React (Frontend)  
**Primary Dependencies**: Azure Functions, @azure/storage-blob, @azure/identity, Prisma, React  
**Storage**: Azure Blob Storage (images), PostgreSQL (meal data)  
**Testing**: Jest (unit), Supertest (contract), Playwright/Cypress (E2E)  
**Target Platform**: Azure Functions (backend), Web browser (frontend SPA)  
**Project Type**: Web application (separate backend + frontend)  
**Performance Goals**: <10s upload-to-results, <200ms SAS generation  
**Constraints**: 8MB max upload, 10-min SAS expiry, schema-valid JSON only, Managed Identity required  
**Scale/Scope**: Multi-user, concurrent uploads, Blob Data Contributor RBAC

## Constitution Check

*GATE: Must pass before implementation.*

**✅ I. Zero Secrets in Client or Repository**
- SAS tokens generated on-demand by backend only
- No storage account keys in code or config
- Azure AI Foundry credentials in Key Vault/app settings only

**✅ II. Least Privilege Access**
- Function App uses Managed Identity for Blob Storage access
- RBAC role: "Blob Data Contributor" (not owner/full access)
- No SQL passwords - Entra ID authentication preferred

**✅ III. Blob-First Ingestion**
- FR-004: Frontend uploads to blob before calling analyze
- FR-008: Analyze endpoint requires blobName (blob must exist)

**✅ IV. Traceability & Auditability**
- FR-016, FR-017: Every analysis links to blobName + requestId
- Structured logging with correlation IDs

**✅ V. Deterministic JSON Output**
- FR-012, FR-013: Schema validation required, reject invalid AI responses
- JSON schema documented in contracts/

**✅ VI. Cost Controls & Resource Limits**
- FR-005: 8MB upload limit enforced
- FR-007: 10-min SAS expiry
- SHA-256 hash for cache-ability (future optimization)
- Token limits on AI calls (configured in Foundry deployment)

**✅ VII. Privacy & User Data Rights**
- FR-027, FR-028: DELETE /api/meals/:id removes blob + DB records
- Cascade delete implemented in Prisma schema

## Project Structure

### Documentation (this feature)

```text
specs/001-blob-vision-analysis/
├── plan.md              # This file
├── spec.md              # Feature specification (completed)
├── contracts/           # API contracts (to be created)
│   ├── upload-url.md
│   ├── analyze.md
│   └── delete.md
└── tasks.md             # Task list (to be generated)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   ├── upload-url.ts       # POST /api/upload-url
│   │   ├── analyze.ts          # POST /api/meals/analyze
│   │   ├── update-meal.ts      # PATCH /api/meals/:id (corrections)
│   │   └── delete-meal.ts      # DELETE /api/meals/:id
│   ├── services/
│   │   ├── blobService.ts      # SAS generation, blob operations
│   │   ├── aiService.ts        # GPT-5.1 Vision calls via Foundry
│   │   └── mealService.ts      # Database operations via Prisma
│   ├── models/
│   │   └── schemas.ts          # Zod schemas for JSON validation
│   └── utils/
│       ├── errors.ts           # Error handling utilities
│       └── logger.ts           # Structured logging with correlation
├── prisma/
│   └── schema.prisma           # MealAnalysis, Food entities
├── tests/
│   ├── unit/                   # Service unit tests
│   ├── contract/               # API contract tests
│   └── integration/            # E2E flow tests
├── package.json
└── host.json                   # Azure Functions configuration

frontend/
├── src/
│   ├── components/
│   │   ├── MealUpload.tsx      # Upload flow UI
│   │   ├── AnalysisResults.tsx # Display analysis
│   │   └── MealEditor.tsx      # Edit corrections
│   ├── services/
│   │   └── apiClient.ts        # Backend API calls
│   ├── hooks/
│   │   └── useMealUpload.ts    # Upload state management
│   └── App.tsx
├── tests/
│   └── e2e/                    # Playwright/Cypress tests
├── package.json
└── vite.config.ts

infra/ (DevOps)
├── bicep/                      # Infrastructure as Code
│   ├── storage.bicep           # Blob storage + CORS
│   ├── function-app.bicep      # Function App + Managed Identity
│   ├── keyvault.bicep          # Secrets management
│   └── main.bicep              # Orchestration
└── azure-pipelines.yml         # CI/CD pipeline
```

**Structure Decision**: Web application architecture selected due to clear frontend/backend separation. Backend uses Azure Functions for serverless scalability, frontend is React SPA for rich client-side interactions. Blob storage accessed directly by frontend via SAS tokens to minimize backend load.

## Implementation Strategy

**Phase 1 (Setup)**: Initialize projects, configure dependencies, set up database schema  
**Phase 2 (Foundational)**: Implement blob service with Managed Identity, establish database connection  
**Phase 3 (User Story 1 - MVP)**: Upload URL generation → Direct blob upload → AI analysis → Display results  
**Phase 4 (User Story 2)**: Edit/correction UI and persistence  
**Phase 5 (User Story 3)**: Delete functionality with cascade  
**Phase 6 (Polish)**: Error handling refinements, observability, performance optimization

**MVP Scope**: User Story 1 only - upload photo and see analysis results. This proves core value proposition before investing in edit/delete features.
