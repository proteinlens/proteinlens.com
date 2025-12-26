# Implementation Plan: Observability

**Branch**: `011-observability` | **Date**: 2025-01-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-observability/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement comprehensive application observability for ProteinLens using Azure Application Insights SDK for both frontend and backend, with enhanced telemetry correlation, performance monitoring, alerting, and PII-safe logging. The backend already has a telemetry utility (`backend/src/utils/telemetry.ts`); this feature enhances it with correlation IDs and extends observability to the frontend SPA.

## Technical Context

**Language/Version**: TypeScript 5.3, Node.js 20 LTS  
**Primary Dependencies**: 
- Backend: `applicationinsights@3.12.1` (existing), Azure Functions v4
- Frontend: `@microsoft/applicationinsights-web` (to be added), React 18
- Infra: Azure Bicep, Azure Monitor, Log Analytics  
**Storage**: Azure Log Analytics Workspace (30-day retention), Application Insights  
**Testing**: Vitest (unit), Playwright (e2e), contract tests  
**Target Platform**: Azure Functions (backend), Azure Static Web Apps (frontend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- Health endpoint: <100ms p95
- Telemetry overhead: <5ms per request
- Frontend FCP: <1.5s  
**Constraints**: 
- PII must never be logged (email, names, passwords)
- Log Analytics retention: 30 days
- Alert response: <5 min detection  
**Scale/Scope**: Current: 1k users/month, Target: 10k users/month

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **IV. Traceability** | ✅ PASS | Implementing correlation IDs, structured JSON logging |
| **X. Observable By Default** | ✅ PASS | Full App Insights integration, health endpoints exist |
| **XIV. Security First** | ✅ PASS | PII sanitization required (FR-014 to FR-016) |
| **Operational Constraints** | ✅ PASS | Structured logging, App Insights, alerts all specified |

All gates pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/011-observability/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - SDK options, best practices
├── data-model.md        # Phase 1 output - telemetry entities
├── quickstart.md        # Phase 1 output - setup instructions
├── contracts/           # Phase 1 output - API contracts
│   └── health-api.yaml  # OpenAPI spec for health endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   └── health.ts         # Existing - enhance with correlation
│   ├── middleware/
│   │   └── correlationMiddleware.ts  # NEW - correlation ID injection
│   ├── utils/
│   │   ├── telemetry.ts      # Existing - enhance with PII sanitization
│   │   └── piiSanitizer.ts   # NEW - PII redaction utility
│   └── services/
└── tests/
    └── unit/
        ├── telemetry.test.ts
        └── piiSanitizer.test.ts

frontend/
├── src/
│   ├── utils/
│   │   ├── telemetry.ts      # Existing - replace with App Insights SDK
│   │   └── webVitals.ts      # NEW - Core Web Vitals tracking
│   └── services/
└── tests/

infra/
└── bicep/
    └── monitoring.bicep      # Existing - add performance alerts
```

**Structure Decision**: Web application structure (frontend + backend). Observability integrates into existing utility layers. No new top-level directories needed.

## Complexity Tracking

> No Constitution violations found. This feature uses existing patterns.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| SDK Choice | `@microsoft/applicationinsights-web` | Official MS SDK, matches backend, tree-shakeable |
| Correlation | X-Correlation-Id header | Industry standard, works across services |
| PII Handling | Blocklist sanitization | Simpler than allowlist, catches new fields |
