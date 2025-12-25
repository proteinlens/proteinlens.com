# Feature Specification: Main Branch Azure CI Deploy

**Feature Branch**: `001-ci-azure-deploy`  
**Created**: 2025-12-23  
**Status**: Draft  
**Input**: User description: "Objective\nOn each commit to main, run:\n\nProvision/Update infra first\n\nDeploy backend\n\nDeploy frontend\n\nSmoke test both endpoints\n\nAcceptance criteria\n\nWorkflow starts with infra deployment (az deployment group create) to the target RG.\n\nIf env is prod, custom domains are required:\n\nwww.proteinlens.com routes to frontend via Front Door\n\napi.proteinlens.com routes to backend via Front Door\n\nIf Azure DNS zone for proteinlens.com is missing:\n\nfail fast for prod with a clear message\n\nskip domains for non-prod and continue (use Azure default hostnames)\n\nBackend deploy must validate the package contains host.json at zip root. \nMicrosoft Learn\n+1\n\nFrontend deploy must validate frontend/dist/index.html exists (prevents placeholder).\n\nWorkflow is green only if:\n\nGET https://api.proteinlens.com/api/health returns 200 (retry/backoff)\n\nGET https://www.proteinlens.com/ returns 200 and contains a marker like <title>ProteinLens</title> (See attachments above for file contents. You may not need to search or read the file again.)"

## User Scenarios & Testing (mandatory)

### User Story 1 - Auto-provision and deploy on main commit (Priority: P1)

As a maintainer, when I push to the `main` branch, a pipeline runs that first provisions/updates infrastructure for the target environment, then deploys the backend, then deploys the frontend, and finally smoke tests both endpoints. The workflow only succeeds if both endpoints are healthy.

**Why this priority**: Ensures continuous delivery to keep production current and detectable issues caught immediately.

**Independent Test**: Push a trivial commit to `main`; observe the pipeline executes infra → backend → frontend → smoke tests and marks the run green only when both endpoints are verified healthy.

**Acceptance Scenarios**:

1. Given a commit lands on `main`, When the pipeline runs, Then infrastructure deploys to the target resource group before any app deploy, Then backend deploy occurs, Then frontend deploy occurs, Then smoke tests run and the run is marked successful only if both endpoints pass.
2. Given any step fails (infra, backend, frontend, or smoke tests), When the pipeline reaches that step, Then the run stops and is marked failed with a clear error message indicating which validation/step failed.

---

### User Story 2 - Production custom domains and DNS policies (Priority: P1)

As an operator, I need production runs to use `www.proteinlens.com` for the frontend and `api.proteinlens.com` for the backend via Front Door, and I need the run to fail fast if the Azure DNS zone for `proteinlens.com` is not present. For non-production runs, the pipeline should skip custom domain setup and continue using default Azure hostnames.

**Why this priority**: Custom domains and DNS are critical for production correctness and trust; non-prod flexibility avoids unnecessary failures.

**Independent Test**: Run the pipeline once with environment set to production (with DNS zone present) and once with environment set to non-production; verify production requires custom domains and non-prod skips them while continuing.

**Acceptance Scenarios**:

1. Given env is production and the Azure DNS zone for `proteinlens.com` exists, When the pipeline configures Front Door routes, Then `www.proteinlens.com` routes to the frontend and `api.proteinlens.com` routes to the backend.
2. Given env is production and the Azure DNS zone for `proteinlens.com` does not exist, When the pipeline evaluates prerequisites, Then it fails fast with a clear message and does not proceed to application deploys.
3. Given env is non-production, When the pipeline evaluates custom domains, Then it skips custom domains and continues using Azure default hostnames for smoke tests and reporting.

---

### User Story 3 - Validations and smoke tests with retry (Priority: P2)

As a maintainer, I want packaging validations to catch broken artifacts before deployment and smoke tests to verify both API and web endpoints with retry/backoff to tolerate transient propagation.

**Why this priority**: Prevents bad artifacts from reaching users and reduces false negatives from temporary unavailability.

**Independent Test**: Intentionally remove `host.json` from the backend zip and verify the pipeline fails pre-deploy; intentionally omit `frontend/dist/index.html` and verify failure; after a normal deploy, verify smoke tests retry until endpoints are healthy or time out.

**Acceptance Scenarios**:

1. Given a backend package zip is prepared, When the pipeline validates contents, Then it verifies `host.json` exists at the zip root and fails with a clear error if missing.
2. Given a frontend artifact is prepared, When the pipeline validates contents, Then it verifies `frontend/dist/index.html` exists and fails with a clear error if missing.
3. Given the API endpoint is deployed, When the pipeline performs a GET on the health endpoint with retry/backoff, Then it ultimately passes only if a 200 is returned within the retry window.
4. Given the web endpoint is deployed, When the pipeline performs a GET on the site with retry/backoff, Then it ultimately passes only if the response is 200 and contains a `<title>ProteinLens</title>` marker within the retry window.

### Edge Cases

- DNS and Front Door propagation delays may temporarily return non-200 responses; retry/backoff should cover typical propagation windows.
- Resource locks or quota constraints can cause infra updates to fail; the run should surface clear errors and halt.
- For non-production, smoke tests should target default Azure hostnames produced by the deployment outputs.
- Idempotent infra updates: repeated runs should safely no-op where appropriate.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: The workflow MUST trigger on commits to `main` and run in the following strict order: infrastructure update → backend deploy → frontend deploy → smoke tests.
- **FR-002**: Infrastructure deployment MUST target the specified resource group for the environment and run before any application deployment.
- **FR-003**: For production runs, the system MUST require custom domains: `www.proteinlens.com` routed to the frontend via Front Door and `api.proteinlens.com` routed to the backend via Front Door.
- **FR-004**: For production runs, if the Azure DNS zone for `proteinlens.com` is missing, the workflow MUST fail fast with a clear message and MUST NOT proceed to application deployments.
- **FR-005**: For non-production runs, the workflow MUST skip custom domain configuration and MUST continue using Azure default hostnames for subsequent steps.
- **FR-006**: Backend deployment MUST validate the package zip contains `host.json` at the zip root; if missing, the workflow MUST fail with a clear message before deploy.
- **FR-007**: Frontend deployment MUST validate `frontend/dist/index.html` exists; if missing, the workflow MUST fail with a clear message before deploy.
- **FR-008**: API smoke test MUST perform a GET on the health endpoint and pass only if it returns 200 within a bounded retry/backoff window.
- **FR-009**: Web smoke test MUST perform a GET on the site and pass only if it returns 200 and includes the marker `<title>ProteinLens</title>` within a bounded retry/backoff window.
- **FR-010**: The workflow MUST expose clear, human-readable error messages for validation failures, missing prerequisites, or failed smoke tests.
- **FR-011**: The workflow MUST mark the run successful only when both API and web smoke tests pass; otherwise, it MUST mark the run failed.
- **FR-012**: For non-production runs, smoke tests MUST target the environment’s default Azure hostnames surfaced by the deployment outputs.
- **FR-013**: [NEEDS CLARIFICATION: How is the production environment determined (branch `main`, tag, environment variable, or manual input)?]
- **FR-014**: [NEEDS CLARIFICATION: If DNS is managed outside Azure, should production still fail without an Azure DNS zone, or can an external DNS provider be accepted?]
- **FR-015**: [NEEDS CLARIFICATION: Do all `main` commits deploy directly to the production resource group, or should there be an approval gate/manual promotion?]

### Key Entities (data-relevant)

- **Environment**: The target environment for the run (e.g., production, non-production); determines domain policies and targets.
- **Resource Group**: The Azure resource group where infrastructure changes are applied.
- **Front Door Endpoint**: The routing surface for frontend and backend, including custom domains (production) or default hostnames (non-prod).
- **Backend Package**: The deployable backend artifact (zip), expected to contain `host.json` at its root.
- **Frontend Artifact**: The deployable frontend build output, expected to include `frontend/dist/index.html`.
- **DNS Zone**: Azure DNS zone for `proteinlens.com`, required in production for custom domain configuration.

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: For a passing `main` commit, the end-to-end pipeline (infra → backend → frontend → smoke tests) completes within 30 minutes.
- **SC-002**: 100% of production runs without the Azure DNS zone for `proteinlens.com` fail within 5 minutes with a clear explanatory message.
- **SC-003**: 99% of production deploys reach healthy API and web endpoints (as defined in FR-008/FR-009) within 10 minutes after deploy steps complete.
- **SC-004**: 0 successful deploys occur if the backend package is missing `host.json` or the frontend artifact is missing `frontend/dist/index.html`.
- **SC-005**: For non-production runs, endpoints are validated via default hostnames with the same pass criteria as production.
