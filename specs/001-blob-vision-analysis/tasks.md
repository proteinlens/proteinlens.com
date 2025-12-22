---
description: "Task list for Blob Upload + GPT-5.1 Vision Analysis feature implementation"
---

# Tasks: Blob Upload + GPT-5.1 Vision Analysis

**Input**: Design documents from `/specs/001-blob-vision-analysis/`  
**Prerequisites**: plan.md ✅, spec.md ✅  
**Tech Stack**: Node.js 24, Azure Functions, React, PostgreSQL, Prisma, Azure Blob Storage, Azure AI Foundry

**Tests**: Tests are included as requested in user requirements (unit, contract, E2E)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`
- **Infra**: `infra/bicep/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend project structure with Azure Functions in backend/ directory
- [X] T002 Initialize Node.js 20 project with package.json in backend/
- [X] T003 [P] Create frontend React project structure in frontend/ directory
- [X] T004 [P] Initialize frontend package.json with Vite and React dependencies in frontend/
- [X] T005 Install backend dependencies: @azure/functions, @azure/storage-blob, @azure/identity in backend/package.json
- [X] T006 [P] Install Prisma and PostgreSQL client in backend/package.json
- [X] T007 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.js
- [X] T008 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.js
- [X] T009 Create Azure Functions host.json configuration in backend/host.json
- [X] T010 [P] Create Vite configuration in frontend/vite.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create Prisma schema with MealAnalysis and Food entities in backend/prisma/schema.prisma
- [X] T012 Run Prisma migration to create database tables
- [X] T013 [P] Configure Azure Blob Storage connection using Managed Identity in backend/src/services/blobService.ts
- [X] T014 [P] Implement structured logging utility with correlation ID support in backend/src/utils/logger.ts
- [X] T015 [P] Implement error handling utilities and custom error classes in backend/src/utils/errors.ts
- [X] T016 [P] Create Zod schema for AI response validation (foods, totalProtein, confidence) in backend/src/models/schemas.ts
- [X] T017 Configure CORS rules for blob storage to allow direct frontend uploads in infra/bicep/storage.bicep
- [X] T018 [P] Create environment configuration loader for backend in backend/src/utils/config.ts
- [X] T019 [P] Set up Azure Key Vault references for AI Foundry endpoint/credentials in infra/bicep/keyvault.bicep
- [X] T020 Configure Function App with Managed Identity and Blob Data Contributor RBAC in infra/bicep/function-app.bicep

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Upload Meal Photo and Get Analysis (Priority: P1) 🎯 MVP

**Goal**: Enable users to upload a meal photo, receive AI-powered nutritional analysis, and view results in the UI

**Independent Test**: Upload a single meal photo and verify analysis results appear within 10 seconds

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T021 [P] [US1] Unit test for SAS URL generation with write permissions in backend/tests/unit/blobService.test.ts
- [X] T022 [P] [US1] Unit test for SAS URL generation with read permissions in backend/tests/unit/blobService.test.ts
- [X] T023 [P] [US1] Unit test for AI response JSON schema validation in backend/tests/unit/schemas.test.ts
- [X] T024 [P] [US1] Contract test for POST /api/upload-url returns valid SAS URL in backend/tests/contract/upload-url.test.ts
- [X] T025 [P] [US1] Contract test for POST /api/meals/analyze returns schema-valid JSON in backend/tests/contract/analyze.test.ts
- [X] T026 [P] [US1] Integration test for full upload → analyze → display flow in backend/tests/integration/meal-flow.test.ts

### Backend Implementation for User Story 1

- [X] T027 [P] [US1] Implement blobService.generateUploadSasUrl() with 10-min expiry in backend/src/services/blobService.ts
- [X] T028 [P] [US1] Implement blobService.generateReadSasUrl() for AI access in backend/src/services/blobService.ts
- [X] T029 [P] [US1] Implement blobService.validateFileType() for JPEG/PNG/HEIC in backend/src/services/blobService.ts
- [X] T030 [US1] Implement POST /api/upload-url function with file type/size validation in backend/src/functions/upload-url.ts
- [X] T031 [P] [US1] Implement aiService.analyzeMealImage() with GPT-5.1 Vision call in backend/src/services/aiService.ts
- [X] T032 [P] [US1] Add retry logic with exponential backoff to aiService in backend/src/services/aiService.ts
- [X] T033 [P] [US1] Implement mealService.createMealAnalysis() to persist meal data in backend/src/services/mealService.ts
- [X] T034 [US1] Implement POST /api/meals/analyze function with blob retrieval and AI call in backend/src/functions/analyze.ts
- [X] T035 [US1] Add error handling for upload failures (SAS expired, blob not found) in backend/src/functions/analyze.ts
- [X] T036 [US1] Add error handling for AI failures (malformed JSON, low confidence) in backend/src/functions/analyze.ts
- [X] T037 [US1] Add request correlation ID logging to all US1 endpoints in backend/src/functions/

### Frontend Implementation for User Story 1

- [X] T038 [P] [US1] Create apiClient service with upload URL request in frontend/src/services/apiClient.ts
- [X] T039 [P] [US1] Create apiClient.uploadToBlob() for direct blob PUT in frontend/src/services/apiClient.ts
- [X] T040 [P] [US1] Create apiClient.analyzeMeal() to call analyze endpoint in frontend/src/services/apiClient.ts
- [X] T041 [P] [US1] Create useMealUpload hook with upload state management in frontend/src/hooks/useMealUpload.ts
- [X] T042 [P] [US1] Implement MealUpload component with file picker in frontend/src/components/MealUpload.tsx
- [X] T043 [US1] Add upload progress indicator to MealUpload component in frontend/src/components/MealUpload.tsx
- [X] T044 [US1] Implement state transitions: uploading → analyzing → results in frontend/src/hooks/useMealUpload.ts
- [X] T045 [P] [US1] Create AnalysisResults component to display foods and protein totals in frontend/src/components/AnalysisResults.tsx
- [X] T046 [US1] Add confidence level display to AnalysisResults component in frontend/src/components/AnalysisResults.tsx
- [X] T047 [US1] Add error display for upload/analysis failures in frontend/src/components/MealUpload.tsx
- [X] T048 [US1] Integrate MealUpload and AnalysisResults into App.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can upload photos and see analysis results

---

## Phase 4: User Story 2 - Edit and Correct Analysis Results (Priority: P2)

**Goal**: Enable users to manually edit AI-generated analysis results and persist corrections

**Independent Test**: Provide pre-populated analysis data, allow edits, verify corrected values persist across sessions

### Tests for User Story 2

- [x] T049 [P] [US2] Contract test for PATCH /api/meals/:id returns updated meal in backend/tests/contract/update-meal.test.ts
- [x] T050 [P] [US2] Integration test for edit → save → reload showing corrected values in backend/tests/integration/corrections.test.ts

### Backend Implementation for User Story 2

- [x] T051 [P] [US2] Implement mealService.updateMealCorrections() to persist user edits in backend/src/services/mealService.ts
- [x] T052 [US2] Implement PATCH /api/meals/:id function for updating corrections in backend/src/functions/update-meal.ts
- [x] T053 [US2] Add validation for correction data (valid protein values, food names) in backend/src/functions/update-meal.ts
- [x] T054 [US2] Ensure original AI response is preserved when storing corrections in backend/src/services/mealService.ts

### Frontend Implementation for User Story 2

- [x] T055 [P] [US2] Create apiClient.updateMeal() to call PATCH endpoint in frontend/src/services/apiClient.ts
- [x] T056 [P] [US2] Create MealEditor component with editable food list in frontend/src/components/MealEditor.tsx
- [x] T057 [US2] Add inline editing for food names, portions, protein values in frontend/src/components/MealEditor.tsx
- [x] T058 [US2] Implement save button and optimistic UI updates in frontend/src/components/MealEditor.tsx
- [x] T059 [US2] Add visual distinction between original AI data and user corrections in frontend/src/components/AnalysisResults.tsx
- [x] T060 [US2] Integrate MealEditor into AnalysisResults component

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can upload, analyze, and edit results ✅

---

## Phase 5: User Story 3 - Delete Meal Data for Privacy (Priority: P3)

**Goal**: Enable users to delete meals with cascade delete of blob and database records

**Independent Test**: Create test meal records, delete them, verify removal from both storage and database

### Tests for User Story 3

- [ ] T061 [P] [US3] Contract test for DELETE /api/meals/:id returns 204 No Content in backend/tests/contract/delete-meal.test.ts
- [ ] T062 [P] [US3] Integration test verifying blob and DB record are both deleted in backend/tests/integration/delete-cascade.test.ts

### Backend Implementation for User Story 3

- [ ] T063 [P] [US3] Implement blobService.deleteBlob() to remove blob from storage in backend/src/services/blobService.ts
- [ ] T064 [P] [US3] Implement mealService.deleteMeal() with cascade delete in backend/src/services/mealService.ts
- [ ] T065 [US3] Implement DELETE /api/meals/:id function in backend/src/functions/delete-meal.ts
- [ ] T066 [US3] Add transaction handling to ensure blob + DB delete both succeed or rollback in backend/src/functions/delete-meal.ts
- [ ] T067 [US3] Add logging for delete operations with user ID and request ID in backend/src/functions/delete-meal.ts

### Frontend Implementation for User Story 3

- [ ] T068 [P] [US3] Create apiClient.deleteMeal() to call DELETE endpoint in frontend/src/services/apiClient.ts
- [ ] T069 [P] [US3] Add delete button with confirmation dialog to AnalysisResults component in frontend/src/components/AnalysisResults.tsx
- [ ] T070 [US3] Implement delete flow with optimistic UI update in frontend/src/components/AnalysisResults.tsx
- [ ] T071 [US3] Add success/error messaging for delete operations in frontend/src/components/AnalysisResults.tsx

**Checkpoint**: All user stories should now be independently functional - full feature complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, enhanced error handling, observability, and security hardening

- [ ] T072 [P] Add client-side image resize/compression before upload in frontend/src/utils/imageCompression.ts
- [ ] T073 [P] Implement file size validation in frontend before calling upload-url in frontend/src/hooks/useMealUpload.ts
- [ ] T074 [P] Add Application Insights integration for backend telemetry in backend/src/utils/telemetry.ts
- [ ] T075 [P] Add performance monitoring for AI calls (latency, token usage) in backend/src/services/aiService.ts
- [ ] T076 [P] Implement SHA-256 hash calculation for blob caching in backend/src/services/blobService.ts
- [ ] T077 [P] Add cache lookup before calling AI (if hash exists, return cached result) in backend/src/services/aiService.ts
- [ ] T078 [P] Audit and remove any hardcoded secrets from codebase
- [ ] T079 [P] Rotate development storage account keys if any were committed
- [ ] T080 [P] Verify Function App Managed Identity is correctly configured with Blob Data Contributor role
- [ ] T081 [P] Add health check endpoint for backend in backend/src/functions/health.ts
- [ ] T082 [P] Configure CI/CD pipeline with secret scanning in infra/azure-pipelines.yml
- [ ] T083 Create E2E test: upload → analyze → correction → verify daily totals in frontend/tests/e2e/full-flow.spec.ts
- [ ] T084 [P] Add loading states and skeleton screens for better UX in frontend/src/components/
- [ ] T085 [P] Implement proper TypeScript types for all API responses in frontend/src/types/
- [ ] T086 [P] Add input sanitization for user-entered corrections in backend/src/utils/sanitize.ts
- [ ] T087 [P] Configure rate limiting on API endpoints in backend/host.json
- [ ] T088 [P] Add cost monitoring alerts for blob storage and AI usage in infra/bicep/monitoring.bicep

---

## Dependencies Between User Stories

**User Story Dependencies**:
- **US1 (Upload & Analysis)**: No dependencies - can be implemented first (MVP)
- **US2 (Edit/Correct)**: Depends on US1 existing (needs analysis data to edit)
- **US3 (Delete)**: Independent of US2, depends on US1 existing (needs meals to delete)

**Parallel Implementation Opportunities**:
- After foundational phase completes, US1 backend and US1 frontend can be built in parallel
- US2 and US3 backend implementations can be done in parallel after US1 backend is complete
- All frontend polish tasks (T072-T074, T084-T085) can run in parallel

**Suggested Implementation Order**:
1. Phase 1 (Setup) → Phase 2 (Foundation)
2. Phase 3 (US1) - Delivers MVP, immediate value
3. Phase 4 (US2) or Phase 5 (US3) - Either order works (US3 is simpler)
4. Remaining user story + Phase 6 (Polish)

---

## Implementation Strategy

**MVP First**: Focus on Phase 3 (User Story 1) to deliver core value. This represents a complete, testable feature that can be demonstrated to users.

**Incremental Delivery**: Each user story phase should result in a deployable increment. After US1 is complete, the feature is usable. US2 and US3 add refinement but aren't blocking for initial launch.

**Test-First Approach**: Notice all test tasks (T021-T026, T049-T050, T061-T062) are listed BEFORE their corresponding implementation tasks. Write tests first, ensure they fail, then implement.

**Constitution Gates**: Phase 2 foundational tasks (T013, T016, T019, T020) implement constitutional requirements. These are NON-NEGOTIABLE and must be completed before user story work begins.

---

## Task Summary

- **Total Tasks**: 88
- **Setup Phase**: 10 tasks
- **Foundational Phase**: 10 tasks (constitutional compliance)
- **User Story 1 (MVP)**: 28 tasks (6 tests + 11 backend + 11 frontend)
- **User Story 2**: 12 tasks (2 tests + 4 backend + 6 frontend)
- **User Story 3**: 11 tasks (2 tests + 5 backend + 4 frontend)
- **Polish Phase**: 17 tasks (performance, security, observability)

**Parallel Opportunities**: 42 tasks marked [P] can run in parallel within their phase

**Suggested MVP Scope**: Phases 1-3 only (48 tasks) delivers User Story 1 - complete upload and analysis functionality
