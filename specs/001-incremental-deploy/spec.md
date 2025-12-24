# Feature Specification: Incremental CI Deploy

**Feature Branch**: `001-incremental-deploy`  
**Created**: 2025-12-24  
**Status**: Draft  
**Input**: "Automatic incremental deploy: infra first; backend/frontend only on relevant changes."

## Summary

Deliver an automatic, incremental deployment pipeline for the main branch. Infrastructure updates run first. Backend deploys only when backend changes, and frontend deploys only when frontend changes. After any app deploy, smoke tests verify both API and web endpoints. In production, custom domains must be present and enforced; non-production uses default hostnames.

## User Scenarios & Testing (mandatory)

- **US1 – Infra-first incremental deploys** (P1)
  - As a maintainer, when I push changes, the pipeline runs infra first. If only backend changed, only backend deploys; if only frontend changed, only frontend deploys; if both changed, both deploy after infra. The run passes only when smoke tests succeed.
  - Independent Test: Push a commit touching only `backend/` and confirm infra → backend → smoke tests; push a commit touching only `frontend/` and confirm infra → frontend → smoke tests; push touching both and confirm both deploy.

- **US2 – Production domains policy** (P1)
  - As an operator, production runs must use `www.proteinlens.com` (web) and `api.proteinlens.com` (API) via the routing layer. If the Azure DNS zone for `proteinlens.com` is missing, the run fails fast with a clear message. Non-production skips domains and continues using default hostnames.
  - Independent Test: Run once in production (with DNS zone available) to verify custom domains; run once without the zone to verify fail-fast; run in non-production to verify default hostnames.

- **US3 – Validations and smoke tests** (P2)
  - As a maintainer, packaging validations catch broken artifacts before deploy and smoke tests verify both API and web endpoints with retry/backoff.
  - Independent Test: Remove `host.json` from backend package and observe pre-deploy failure; omit `frontend/dist/index.html` and observe failure; normal run passes when endpoints become healthy.

## Functional Requirements (mandatory)

- **FR-001**: The pipeline MUST run infrastructure updates first and then deploy only those app components whose sources changed (backend and/or frontend).
- **FR-002**: Incremental detection MUST be based on repository path changes to ensure only relevant deploys occur.
- **FR-003**: Production runs MUST require custom domains for web and API and fail fast if the `proteinlens.com` Azure DNS zone is absent.
- **FR-004**: Non-production runs MUST skip custom domain binding and use environment default hostnames for testing and reporting.
- **FR-005**: Backend package validation MUST fail if `host.json` is not at the artifact root.
- **FR-006**: Frontend artifact validation MUST fail if `frontend/dist/index.html` is missing.
- **FR-007**: API smoke test MUST retry with backoff until the health endpoint returns success within the window.
- **FR-008**: Web smoke test MUST retry with backoff and pass only if the page returns success and includes a visible marker containing the product name.
- **FR-009**: The pipeline MUST surface clear, human-readable error messages for missing prerequisites, validation failures, or smoke test failures.
- **FR-010**: The pipeline MUST mark the run successful only when both API and Web validations pass when they were deployed in the run; otherwise the run fails.
- **FR-011**: Environment default hostnames MUST be discoverable programmatically to support non-production smoke tests.
- **FR-012**: Idempotency MUST be verified as part of the process: re-applying infrastructure SHOULD detect no changes when the desired state is already applied.
 - **FR-013**: Production determination MUST be by branch: commits to `main` are production; all other branches are non-production.
 - **FR-014**: Production MUST require the `proteinlens.com` Azure DNS zone; external DNS providers are NOT accepted. If the zone is missing, the workflow MUST fail fast and skip application deploys.
 - **FR-015**: All commits to `main` MUST auto-deploy to production without a manual approval gate.

## Success Criteria (mandatory)

- **SC-001**: For incremental runs, end-to-end completes within 30 minutes when both backend and frontend deploy; under 15 minutes when only one component changes.
- **SC-002**: 100% of production runs without the `proteinlens.com` Azure DNS zone fail within 5 minutes with a clear message.
- **SC-003**: 99% of successful deploys reach healthy API and web endpoints within 10 minutes after deploy steps complete.
- **SC-004**: 0 successful deploys occur if backend `host.json` or frontend `dist/index.html` validations fail.
- **SC-005**: Non-production deploys validate endpoints via default hostnames with the same pass criteria.

## Key Entities

- **Environment**: Production vs non-production; determines domain policy and targets.
- **Resource Group / Infra State**: Target environment where infrastructure is applied and observed.
- **Routing Layer**: The public endpoints (custom domains in prod; default hostnames in non-prod).
- **Backend Package**: Deployable artifact containing `host.json` at root.
- **Frontend Artifact**: Build output containing `frontend/dist/index.html`.

## Assumptions

- Path-based change detection is acceptable for incrementality.
- Default hostnames can be obtained from environment metadata.
- Production policy enforces Azure DNS presence unless clarified otherwise.
- Smoke tests use exponential backoff with capped wait times.

## Dependencies

- Access to environment metadata to resolve hostnames.
- Ability to perform infra updates idempotently.
- Access to environment endpoints for smoke tests.

## Edge Cases

- Domain propagation delays may cause temporary unavailability; retry backoff should cover typical windows.
- Infra updates may be blocked by resource locks or quotas; failures must be surfaced clearly.
- Incremental detection ignores non-functional file changes outside `infra/`, `backend/`, and `frontend/`.
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
