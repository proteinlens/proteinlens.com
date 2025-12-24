# Implementation Plan: Main Branch Azure CI Deploy

**Branch**: `001-ci-azure-deploy` | **Date**: 2025-12-23 | **Spec**: [specs/001-ci-azure-deploy/spec.md](specs/001-ci-azure-deploy/spec.md)
**Input**: Feature specification from `/specs/001-ci-azure-deploy/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Primary requirement: On each commit to `main`, run a single GitHub Actions workflow that deploys infrastructure first (Bicep via `az deployment group create`), then deploys backend (Azure Functions zip deploy with `host.json` validation), then deploys frontend (Azure Static Web Apps with dynamic token retrieval), and finally smoke tests the API and web endpoints. In production, require `proteinlens.com` Azure DNS zone and configure Front Door custom domains; non-prod skips domains and uses default hostnames.

Technical approach: Implement `.github/workflows/deploy.yml` with jobs `infra` → `deploy_backend`/`deploy_frontend` → `smoke_test` using Azure OIDC (`azure/login`) for credentials. Infra step deploys `infra/bicep/main.bicep` idempotently. Guardrails: validate storage account name composition via Bicep `take()`; enforce Azure DNS presence in prod with clear failure; validate backend zip (`host.json` at root) and frontend artifact (`frontend/dist/index.html`). Smoke tests use retry/backoff until endpoints healthy; targets are Front Door custom domains in prod and default hostnames in non-prod, discovered from deployment outputs or Azure CLI.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: GitHub Actions YAML, Azure CLI 2.63+, Bicep v0.30+  
**Primary Dependencies**: `azure/login` (OIDC), `azure/cli` action, `actions/upload-artifact`, `actions/download-artifact`, `actions/setup-node` (for smoke), Front Door + Static Web Apps + Function App Azure services  
**Storage**: N/A (pipeline artifacts only)  
**Testing**: GitHub Actions job validations + smoke tests via `curl`/Node.js with retry/backoff  
**Target Platform**: GitHub-hosted runners (`ubuntu-latest`) authenticating to Azure via OIDC federated credentials
**Project Type**: Monorepo with `infra/`, `backend/` (Functions), `frontend/` (Vite + SWA)  
**Performance Goals**: End-to-end deploy under 30 minutes on P50; smoke tests stabilize within 10 minutes  
**Constraints**: No secrets in repo; use Key Vault/App Settings; IaC idempotency; DNS gating in prod; storage account names must meet Azure rules; Front Door/domain propagation delay tolerance  
**Scale/Scope**: Single prod environment off `main`; non-prod branches may reuse workflow with default hostnames

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

- Zero Secrets in Repo (I, X): PASS WITH PLAN — use OIDC (`azure/login` with federated credentials). No client or repo-stored secrets. SWA token fetched at runtime via Azure CLI and passed ephemeral to deploy step only.
- Least Privilege (II): PASS WITH PLAN — use per-workflow federated identity with minimal RBAC (Resource Group scope: `Contributor` for group deploy, `Static Web App Contributor`, `WebSite Contributor`/`Contributor` for Functions, `DNS Zone Contributor` only if managing records; read-only where possible).
- Traceability & Auditability (IV): PASS — GitHub Actions logs + Azure deployment operations records. Include correlation IDs in smoke tests where applicable.
- Infrastructure Idempotency (XII): PASS WITH PLAN — Bicep `main.bicep` deployment is idempotent; workflow redeploys should no-op when no changes. Will add a CI step to run `what-if` (optional) and document redeploy behavior.
- On-Demand Lifecycle (IX): N/A to pipeline; infra modules must support clean delete; outside current scope.
- Secrets Rotation (XI): N/A to pipeline; ensure no long-lived secrets used.

Gate Decision: PROCEED. All violations have mitigation plans; no hard blockers.

Re-check (post-design): No changes — design maintains OIDC auth, no static secrets, idempotent Bicep deploys, early validation gates, and production DNS enforcement.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
infra/
├── bicep/
│   ├── main.bicep
│   └── modules...

backend/
├── src/
└── functions/

frontend/
├── src/
└── dist/ (build output)

.github/workflows/
└── deploy.yml (to be implemented by this feature)
```

**Structure Decision**: Monorepo with `infra/`, `backend/` (Azure Functions), `frontend/` (SWA). Introduce `.github/workflows/deploy.yml` as the single CI/CD entrypoint. Specs and contracts under `specs/001-ci-azure-deploy/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
