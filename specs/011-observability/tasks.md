# Tasks: Observability

**Input**: Design documents from `/specs/011-observability/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Tests NOT explicitly requested in spec. Skipping test tasks.

**Organization**: Tasks grouped by user story (P1 → P2 → P3) to enable independent implementation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies and configure environment

- [X] T001 Install frontend Application Insights SDK: `npm install @microsoft/applicationinsights-web @microsoft/applicationinsights-react-js web-vitals` in frontend/
- [X] T002 [P] Add VITE_APPINSIGHTS_CONNECTION_STRING to frontend/.env.example
- [X] T003 [P] Add VITE_APPINSIGHTS_CONNECTION_STRING to staticwebapp.config.json environment variables section

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create PII sanitizer utility in backend/src/utils/piiSanitizer.ts with blocklist patterns from research.md
- [X] T005 [P] Create correlation middleware in backend/src/middleware/correlationMiddleware.ts to extract W3C traceparent header
- [X] T006 Add sanitization telemetry processor to backend/src/utils/telemetry.ts using piiSanitizer
- [X] T007 [P] Create TelemetryContext and CustomEvent TypeScript interfaces in backend/src/models/telemetry.ts per data-model.md

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Developer Monitors API Health (Priority: P1) 🎯 MVP

**Goal**: Real-time health and performance metrics visible in Application Insights within 2 minutes

**Independent Test**: Deploy backend, trigger API calls, view metrics in Azure Application Insights dashboard

### Implementation for User Story 1

- [X] T008 [US1] Enhance health.ts to include correlation ID in response header (X-Correlation-Id) in backend/src/functions/health.ts
- [X] T009 [US1] Add trackRequest telemetry call at start/end of health check in backend/src/functions/health.ts
- [X] T010 [P] [US1] Add custom metric tracking for health check latency in backend/src/functions/health.ts
- [X] T011 [P] [US1] Add trackDependency calls for database, blob, AI checks in backend/src/functions/health.ts
- [X] T012 [US1] Add structured error logging with stack trace to all catch blocks in backend/src/functions/health.ts
- [X] T013 [US1] Enhance trackException in backend/src/utils/telemetry.ts to include request context (URL, method, correlation ID)

**Checkpoint**: User Story 1 complete - API health metrics visible in Application Insights

---

## Phase 4: User Story 2 - Developer Traces Requests End-to-End (Priority: P1)

**Goal**: Distributed tracing across frontend → API → database/AI with correlation IDs

**Independent Test**: Make request touching all services, view complete trace in Application Insights

### Implementation for User Story 2

- [X] T014 [US2] Rewrite frontend/src/utils/telemetry.ts to initialize Application Insights SDK per research.md
- [X] T015 [US2] Add ReactPlugin initialization with router history in frontend/src/utils/telemetry.ts
- [X] T016 [P] [US2] Export trackEvent, trackException, trackPageView helper functions from frontend/src/utils/telemetry.ts
- [X] T017 [US2] Initialize telemetry SDK in frontend/src/main.tsx before React render
- [X] T018 [P] [US2] Add global error boundary telemetry in frontend/src/App.tsx using trackException
- [X] T019 [US2] Update all backend API functions to call correlationMiddleware.extractCorrelationId at entry
- [X] T020 [US2] Add correlation ID to all Logger calls in backend/src/utils/logger.ts
- [X] T021 [P] [US2] Add X-Correlation-Id response header to all API functions in backend/src/functions/

**Checkpoint**: User Story 2 complete - end-to-end traces visible with correlation

---

## Phase 5: User Story 3 - Operator Receives Alerts (Priority: P2)

**Goal**: Automated alerts when critical metrics exceed thresholds

**Independent Test**: Trigger alert condition (fail health check), verify email notification received

### Implementation for User Story 3

- [X] T022 [US3] Add metric alert for API error rate >5% over 5min in infra/bicep/monitoring.bicep
- [X] T023 [P] [US3] Add metric alert for API P95 latency >3s in infra/bicep/monitoring.bicep
- [X] T024 [P] [US3] Add scheduled query rule alert for 2 consecutive health check failures in infra/bicep/monitoring.bicep
- [X] T025 [US3] Create new action group for observability alerts (reuse email from existing cost alerts) in infra/bicep/monitoring.bicep
- [X] T026 [US3] Add alert outputs to monitoring.bicep for pipeline validation
- [X] T026b [P] [US3] Configure Log Analytics retention: 30 days interactive, 90 days archive in infra/bicep/monitoring.bicep
- [X] T026c [US3] Configure alert aggregation: group by resource, 5-minute evaluation, 15-minute auto-resolve in infra/bicep/monitoring.bicep

**Checkpoint**: User Story 3 complete - alerts configured and testable

---

## Phase 6: User Story 4 - Developer Analyzes Frontend Performance (Priority: P2)

**Goal**: Core Web Vitals (LCP, FID, CLS) tracked and visible in monitoring dashboard

**Independent Test**: Load frontend in browser, verify performance metrics in Application Insights Metrics

### Implementation for User Story 4

- [X] T027 [US4] Create frontend/src/utils/webVitals.ts with web-vitals library integration per research.md
- [X] T028 [US4] Add sendToAppInsights handler to report CWV as custom metrics in frontend/src/utils/webVitals.ts
- [X] T029 [US4] Initialize webVitals tracking in frontend/src/main.tsx after telemetry init
- [X] T030 [P] [US4] Add page navigation timing tracking in frontend/src/utils/telemetry.ts using SDK auto-tracking
- [X] T031 [P] [US4] Add JavaScript error boundary with trackException in frontend/src/components/ErrorBoundary.tsx
- [X] T032 [US4] Add LCP degradation alert (p75 >2.5s) in infra/bicep/monitoring.bicep

**Checkpoint**: User Story 4 complete - frontend performance metrics visible

---

## Phase 7: User Story 5 - Business Analyst Views Usage Analytics (Priority: P3)

**Goal**: Usage patterns and trends visible in analytics dashboard

**Independent Test**: Generate sample usage data, view aggregated reports in Application Insights

### Implementation for User Story 5

- [X] T033 [P] [US5] Add trackEvent calls for image_analysis_count in backend/src/functions/analyze.ts
- [X] T034 [P] [US5] Add trackEvent calls for signup_count in backend/src/functions/signup.ts
- [ ] T035 [P] [US5] Add trackEvent calls for login_count in backend/src/services/authService.ts
- [ ] T036 [US5] Add trackEvent for checkout events in backend/src/functions/checkout.ts per telemetry-events.md contract
- [ ] T037 [US5] Add trackEvent for upload events in backend/src/functions/upload-url.ts per telemetry-events.md contract
- [ ] T038 [P] [US5] Create Log Analytics workbook query for daily/weekly/monthly analysis counts

**Checkpoint**: User Story 5 complete - usage analytics available

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and cleanup

- [X] T039 [P] Update CSP in frontend/staticwebapp.config.json for dc.services.visualstudio.com if not already present
- [ ] T040 [P] Add telemetry initialization check to frontend health indicator
- [ ] T041 Add PII scanning CI step: grep telemetry output for email regex patterns in .github/workflows/deploy.yml
- [X] T042 [P] Add App Insights connection string to Azure Pipeline variables documentation in PIPELINE-VARIABLES-SETUP.md
- [ ] T043 Run quickstart.md validation steps to verify end-to-end telemetry flow
- [X] T044 Update README.md with observability section describing available dashboards

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 - implement in sequence (US1 → US2)
  - US3 and US4 are both P2 - can run in parallel after US2
  - US5 is P3 - after US3/US4
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - API metrics
- **User Story 2 (P1)**: Foundation + US1 complete - distributed tracing builds on API metrics
- **User Story 3 (P2)**: Foundation only - alerting can be done in parallel with US4
- **User Story 4 (P2)**: Foundation + US2 (frontend telemetry) - extends frontend SDK
- **User Story 5 (P3)**: Foundation + US2 - business events use telemetry SDK

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# Run in parallel:
T002: Add env variable to .env.example
T003: Add env variable to staticwebapp.config.json
```

**Phase 2 (Foundational)**:
```bash
# Run in parallel:
T004: Create piiSanitizer.ts
T005: Create correlationMiddleware.ts
T007: Create telemetry models
```

**Phase 3-4 (US1 + US2)**:
```bash
# Within US1, run in parallel:
T010: Custom metric tracking
T011: trackDependency calls

# Within US2, run in parallel:
T016: Export helper functions
T018: Global error boundary
T021: Add X-Correlation-Id to all functions
```

**Phase 5-6 (US3 + US4)** - Can run stories in parallel:
```bash
# US3 parallel tasks:
T022 + T023 + T024: All Bicep alerts

# US4 parallel tasks:
T030 + T031: Page timing + error boundary
```

**Phase 7 (US5)**:
```bash
# All event tracking tasks can run in parallel:
T033 + T034 + T035: analyze, signup, login events
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: User Story 1 - API Health (T008-T013)
4. **VALIDATE**: Check Application Insights shows API metrics
5. Complete Phase 4: User Story 2 - Distributed Tracing (T014-T021)
6. **VALIDATE**: Check end-to-end trace correlation works
7. Deploy/demo - MVP complete with core observability

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (API Health) → **MVP-1**: Basic metrics visible
3. US2 (Tracing) → **MVP-2**: Full distributed tracing
4. US3 (Alerts) + US4 (Frontend Perf) → **v1.0**: Production-ready monitoring
5. US5 (Analytics) → **v1.1**: Business insights

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Backend telemetry.ts already exists - enhance don't replace
- Frontend telemetry.ts is a stub - full rewrite needed
- monitoring.bicep already has cost alerts - add performance alerts alongside
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

---

## Task Count Summary

| Phase | Story | Task Count |
|-------|-------|------------|
| Setup | - | 3 |
| Foundational | - | 4 |
| US1 | API Health | 6 |
| US2 | Tracing | 8 |
| US3 | Alerts | 7 |
| US4 | Frontend Perf | 6 |
| US5 | Analytics | 6 |
| Polish | - | 6 |
| **Total** | | **46** |

**Parallel Opportunities**: 23 tasks marked [P]
