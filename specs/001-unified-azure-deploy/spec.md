# Feature Specification: One-Click Azure Deploy

**Feature Branch**: `001-unified-azure-deploy`  
**Created**: 23 Dec 2025  
**Status**: Draft  
**Input**: User description: "A single GitHub Actions workflow can deploy ProteinLens into an empty Azure Resource Group, producing: Frontend reachable at https://www.proteinlens.com; Backend reachable at https://api.proteinlens.com; No manual portal steps: provisioning, RBAC, secrets, DNS, TLS, deploys, smoke tests. Acceptance: Infra: Workflow creates or updates in the target RG: Azure OpenAI / Foundry resource + model deployment (gpt-5-1); Postgres Flexible Server + database; Key Vault; Storage account + blob container; Azure Functions app (Premium to avoid cold starts); Azure Static Web App; Azure Front Door Standard/Premium routing (www.proteinlens.com → Static Web App, api.proteinlens.com → Functions); Azure DNS records (CNAME + _dnsauth) if zone is in Azure DNS. Permissions: Workflow grants required roles automatically (Function App Managed Identity can read Key Vault secrets via Key Vault reference; Function App Managed Identity can access Storage via Blob Data Contributor; Pipeline identity can create role assignments). Secrets: AZURE_OPENAI_API_KEY stored only in Key Vault; Function App uses Key Vault reference in app settings; Workflow forces Key Vault reference refresh after setting secrets. Deploy: Backend deploy completes and /api/health returns 200 through Front Door; Frontend deploy serves the real app and returns 200 at /. Reliability: Workflow preflights: confirms frontend/dist/index.html exists before deploy; confirms Functions package has host.json; waits for health endpoint (retries) before success."

## User Scenarios & Testing (mandatory)

### User Story 1 - One-Click Production Deploy (Priority: P1)

A release manager triggers a single workflow that provisions required cloud resources (including Azure AI Foundry for GPT-5.1 model hosting) and deploys both backend and frontend so that www.proteinlens.com and api.proteinlens.com are live without any manual portal steps.

Why this priority: This delivers immediate business value by enabling a repeatable, zero‑touch production deployment for go‑live.

Independent Test: Start the workflow with target resource group inputs; verify both public URLs respond 200 and data paths function.

Acceptance Scenarios:

1. Given an empty target subscription and resource group name, When the workflow runs to completion, Then www.proteinlens.com returns 200 for the home page within 10 minutes of workflow start.
2. Given the same run, When calling GET https://api.proteinlens.com/api/health via the public entrypoint, Then it returns 200 within 10 minutes of workflow start.

---

### User Story 2 - Repeatable Idempotent Provisioning (Priority: P2)

An engineer reruns the workflow against an existing resource group to apply configuration changes (RBAC, secrets, DNS, routes) without manual intervention or drift.

Why this priority: Ensures safe, iterative improvements and mitigates configuration drift in production.

Independent Test: Run the workflow twice; the second run completes successfully with no manual fixes.

Acceptance Scenarios:

1. Given resources already exist from a prior successful run, When the workflow is re‑executed, Then it completes without errors and keeps endpoints healthy.
2. Given updated app settings or content, When redeployed, Then the new version is served and health remains 200.

---

### User Story 3 - Clear Failure Feedback (Priority: P3)

An operator receives actionable, precise failure messages when preflight checks, provisioning, or deployment fail.

Why this priority: Reduces time to recovery and avoids “endless troubleshooting.”

Independent Test: Intentionally break a precondition (e.g., missing artifact) and confirm the workflow halts with a clear reason.

Acceptance Scenarios:

1. Given the frontend build artifact is missing, When the workflow reaches the deploy step, Then it fails early with a message stating that frontend/dist/index.html was not found.
2. Given the Functions package lacks host.json, When packaging is validated, Then the workflow fails with a message stating host.json is required and missing.

---

### Edge Cases

- DNS zone not hosted in Azure DNS: workflow completes successfully and emits manual CNAME/TXT record instructions in logs.
- Model access unavailability in the selected region (northeurope): workflow fails with actionable error suggesting quota increase request or region fallback.
- Resource name collisions or policy constraints (e.g., storage naming, SKU restrictions) handled with deterministic naming and friendly diagnostics.
- Re-run after partial failure resumes safely without orphaned resources or broken endpoints.

## Assumptions

- Production environment name is "prod" with a dedicated resource group provided as input.
- Managed certificates are acceptable for public domains; no BYO certificates required initially.
- Default region will use the primary region configured for the subscription/team unless specified in workflow inputs; latency-sensitive resources are co-located.

## Requirements (mandatory)

### Functional Requirements

- FR-001: The workflow MUST provision or update cloud resources necessary to run the application end‑to‑end (application hosting, data, identity/permissions, networking, DNS, certificates).
- FR-002: The workflow MUST deploy the backend artifact and verify a public health endpoint returns 200 through the primary entrypoint.
- FR-003: The workflow MUST deploy the frontend artifact and verify the root path returns 200 on the public domain.
- FR-004: The workflow MUST set secrets in a secure secret store and reference them from the application configuration without exposing secret values in logs.
- FR-005: The workflow MUST assign required permissions so the application identity can read secrets and access data storage at runtime.
- FR-006: The workflow MUST support idempotent re‑runs: re‑executing against an existing environment completes successfully without manual cleanup.
- FR-007: The workflow MUST perform preflight checks for required artifacts: confirm frontend/dist/index.html exists and Functions package includes host.json before deployment proceeds.
- FR-008: The workflow MUST configure public routing so that the frontend is reachable at www.proteinlens.com and the backend at api.proteinlens.com.
- FR-009: The workflow MUST automate DNS records (CNAME and TXT validation records for _dnsauth) when an Azure DNS zone for proteinlens.com is detected in the subscription (via `az network dns zone list`); if no Azure DNS zone is found, the workflow MUST complete successfully and emit explicit manual DNS configuration steps in the deployment log.
- FR-010: The workflow MUST register or bind managed TLS certificates for public endpoints and poll domain validation status (up to 30 attempts with 20-second intervals, ~10 minutes total) before declaring success; if validation times out, the workflow SHOULD log the validation tokens and proceed (certificates will complete asynchronously).
- FR-011: The workflow MUST provision a production‑grade application plan to avoid cold starts for the API.
- FR-012: The workflow MUST provision Azure AI Foundry with a GPT-5.1 model deployment pinned to the northeurope region and surface a clear error if quota or regional capacity is unavailable, including remediation guidance (e.g., request quota increase or select alternative region).
- FR-013: The workflow MUST emit structured outputs (endpoints, resource names, credentials references) as JSON artifacts validated against a defined schema and retain them for 30 days for auditing and troubleshooting.
- FR-014: The workflow MUST fail fast with clear, human‑readable reasons when a precondition, quota, or policy violation prevents success.
- FR-015: The workflow SHOULD complete a greenfield end‑to‑end run within 45 minutes and subsequent incremental runs within 15 minutes.

### Key Entities

- Deployment Request: inputs for environment, subscription/resource group, region, and optional domain control flags.
- Application Identity: the runtime identity that requires secret read and data access permissions.
- Secret Reference: a named secret material (e.g., model API key) stored in a managed secret store and referenced from app settings.
- Public Endpoint: user‑facing URLs (frontend root and backend health) used for verification and monitoring.

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: A single workflow run brings both public endpoints live with 200 responses (frontend root and backend health) without manual portal steps.
- SC-002: End‑to‑end greenfield run completes in ≤45 minutes; repeat runs after initial provisioning complete in ≤15 minutes.
- SC-003: All secrets remain confined to the secret store with no plaintext exposure in logs or configuration files.
- SC-004: Re‑running the workflow on an already provisioned environment completes successfully with no manual fixes and keeps endpoints healthy.
- SC-005: On failure, logs provide specific, actionable causes (e.g., missing artifact, policy denial, quota limits) enabling remediation within 30 minutes by an on‑call engineer.
