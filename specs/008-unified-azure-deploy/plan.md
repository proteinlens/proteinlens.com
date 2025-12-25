# Implementation Plan: One-Click Azure Deploy

**Branch**: `001-unified-azure-deploy` | **Date**: 23 Dec 2025 | **Spec**: [specs/001-unified-azure-deploy/spec.md](specs/001-unified-azure-deploy/spec.md)
**Input**: Feature specification from `/specs/001-unified-azure-deploy/spec.md`

**Note**: This plan follows `.specify/templates/commands/plan.md` phases.

## Summary

Goal: A single GitHub Actions workflow provisions Azure infrastructure (AI model deployment, Postgres, Key Vault, Storage, Functions Premium, Static Web Apps, Front Door), configures DNS/TLS, deploys backend and frontend, and verifies health at https://www.proteinlens.com and https://api.proteinlens.com without manual steps.

Approach: Use Bicep for idempotent infra at subscription/RG scope; RBAC with managed identity; secrets stored only in Key Vault with app settings as Key Vault references; GitHub OIDC for login; publish‑profile deploy for Functions package validated to include host.json; retrieve SWA token at runtime; Front Door Standard routes www→SWA and api→Functions; preflight checks and robust health retries.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js 20 (Azure Functions), TypeScript (backend/frontend), Bicep (IaC)  
**Primary Dependencies**: Azure Functions, Azure Static Web Apps, Azure Front Door Standard, Azure Key Vault, Azure Storage (Blob), Azure Database for PostgreSQL Flexible Server, Azure AI Foundry (GPT‑5‑1), GitHub Actions  
**Storage**: PostgreSQL Flexible Server (prod), Azure Blob Storage (for assets/state), Key Vault (secrets)  
**Testing**: Vitest (code), GitHub Actions workflow preflights + HTTP health checks  
**Target Platform**: Azure (northeurope for Postgres and AI), Linux Function App Premium plan  
**Project Type**: Web (frontend + backend + infra)  
**Performance Goals**: API warm start avoided (Premium plan); health endpoints returning 200 within 10 minutes on greenfield  
**Constraints**: Bicep idempotency; storage account naming ≤24 chars lowercase; secrets never logged; no shared keys for storage  
**Scale/Scope**: Single production environment (prod), repeatable redeploys, DNS under Azure DNS authority

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

- Principle I (Zero Secrets in Client/Repo): PASS – All secrets (OpenAI key, DB) stored only in Key Vault; app settings use Key Vault references; no plaintext secrets in GitHub. Logs never print values; scripts only validate references exist.
- Principle II (Least Privilege): PASS – Managed Identity for Function to read Key Vault and access Blob via RBAC (Blob Data Contributor). No storage account keys used. Pipeline identity limited to role assignment scope.
- Principle X (Secrets Mgmt & KV Supremacy): PASS – Single source of truth in Key Vault; refresh Key Vault references post‑set; no GitHub secret values besides non-sensitive IDs.
- Principle XI (Zero‑Downtime Key Rotation): PASS (Design) – Supports dual secrets via separate Key Vault versions; app reads via references with cache ≤5m. Rotation runbook to be added in ops tasks.
- Principle XII (IaC Idempotency): PASS – Bicep modules designed for re‑runs; naming stable; RG‑scoped idempotency; no manual portal changes.
- Principle IX (On‑Demand Lifecycle): PASS – Deterministic naming with env prefix; modules remove disabled resources cleanly; teardown scripts planned.

Gate Evaluation: PASS – No unresolved blockers; proceed to Phase 0.

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
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Web application structure with separate backend and frontend, plus infra IaC

- backend/ (Azure Functions TypeScript service)
- frontend/ (Vite React app)
- infra/bicep/ (Bicep modules and main orchestrator)
- .github/workflows/ (CI/CD pipelines including unified deploy)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

No violations requiring justification at this time.

---

## Phase 0: Outline & Research

Unknowns extracted and resolved:
- DNS zone authority → DECIDED: Azure DNS (automated records/certs)
- AI service choice → DECIDED: Azure AI Foundry (GPT‑5‑1)
- Front Door tier → DECIDED: Standard (WAF optional later)

Research output: [specs/001-unified-azure-deploy/research.md](specs/001-unified-azure-deploy/research.md)

Gate Status: PASS (no unresolved clarifications)

---

## Phase 1: Design & Contracts

- Data model defined: [data-model.md](specs/001-unified-azure-deploy/data-model.md)
- Contracts defined: [contracts/outputs.schema.json](specs/001-unified-azure-deploy/contracts/outputs.schema.json), [contracts/actions-outputs.md](specs/001-unified-azure-deploy/contracts/actions-outputs.md)
- Quickstart authored: [quickstart.md](specs/001-unified-azure-deploy/quickstart.md)
- Agent context updated via `.specify/scripts/bash/update-agent-context.sh copilot`

Post-Design Constitution Re-Check: PASS – Designs maintain Key Vault supremacy, idempotent IaC, and least privilege.

---

## Phase 2: Planning Next Steps (Preview)

Planned deliverables (not created by this command):
- tasks.md with actionable implementation tasks (CI workflow, Bicep module updates, preflight scripts, smoke tests)
- Checklist updates ensuring all acceptance criteria are covered and testable
