# Implementation Plan: Azure Deployment Pipeline

**Branch**: `004-azure-deploy-pipeline` | **Date**: 2024-12-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-azure-deploy-pipeline/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature establishes a production-ready CI/CD pipeline for ProteinLens that automates deployment of infrastructure (Bicep), backend (Azure Functions), and frontend (Static Web Apps) to Azure. The pipeline ensures safe database migrations via Prisma, secure secret management via Key Vault references, and automated deployments on every push to the main branch. This eliminates manual deployment steps and enables rapid iteration while maintaining security best practices.

## Technical Context

**Language/Version**: TypeScript (backend), React/TypeScript (frontend), Bicep (infrastructure)  
**Primary Dependencies**: 
- Backend: Azure Functions v4, Node.js 20+, Prisma 5.8, @azure/storage-blob 12.17, @azure/identity 4.0
- Frontend: React 18.2, Vite 5.0, React Query 5.90, Tailwind CSS v4
- Infrastructure: Bicep CLI, Azure CLI 2.50+, GitHub Actions

**Storage**: 
- Database: Azure PostgreSQL Flexible Server (Prisma ORM)
- Blob Storage: Azure Storage Account for meal images
- Secrets: Azure Key Vault for runtime secrets

**Testing**: 
- Backend: Vitest (43 tests), contract/integration/unit split
- Frontend: Vitest (56 tests), Playwright for E2E
- Infrastructure: Bicep validation, deployment testing

**Target Platform**: Azure cloud (Functions Consumption Plan, Static Web Apps Free tier, PostgreSQL Flexible Server)  
**Project Type**: Web application (frontend + backend + infrastructure)  
**Performance Goals**: 
- Infrastructure deployment: <15 minutes first run, <5 minutes updates
- Backend deployment: <3 minutes (build + migrate + deploy)
- Frontend deployment: <5 minutes (build + upload)
- End-to-end pipeline: <10 minutes from push to live

**Constraints**: 
- Secrets MUST NOT be in Git repository or frontend build
- Database migrations MUST run from Azure-hosted environment (not GitHub Actions runner due to PostgreSQL firewall IPv4 restrictions)
- Bicep templates MUST be idempotent (safe to re-run)
- Workflows MUST fail fast on errors (no silent failures)

**Scale/Scope**: 
- Infrastructure: 8 Azure resources (Resource Group, Function App, Static Web App, PostgreSQL, Key Vault, Storage, App Insights, optional Front Door)
- Workflows: 3 GitHub Actions workflows (infra, backend, frontend)
- Bicep modules: 6-8 modular templates
- Secrets: 5-7 Key Vault secrets (DATABASE_URL, OPENAI_API_KEY, STRIPE_SECRET_KEY, etc.)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles (Backend & Infrastructure)

**✅ I. Zero Secrets in Client or Repository**
- **Status**: PASS (with naming constraint clarification)
- **Validation**: 
  - All secrets stored in GitHub Secrets (AZURE_CREDENTIALS, deployment tokens)
  - Runtime secrets stored in Azure Key Vault
  - Function App uses Key Vault references (not direct values)
  - Frontend build uses environment variables (VITE_API_URL), no secrets embedded
  - Bicep templates use secure parameters, outputs do not expose secrets
  - **CRITICAL**: Key Vault secret names MUST use hyphens, not underscores (Azure constraint: underscores invalid)
    - App setting `DATABASE_URL` → Key Vault secret `DATABASE-URL`
    - App setting `OPENAI_API_KEY` → Key Vault secret `OPENAI-API-KEY`
    - App setting `STRIPE_SECRET_KEY` → Key Vault secret `STRIPE-SECRET-KEY`
    - App setting `STRIPE_WEBHOOK_SECRET` → Key Vault secret `STRIPE-WEBHOOK-SECRET`
- **Evidence**: FR-019, FR-020, FR-021, FR-023, FR-024 enforce zero secrets in repo; FR-021 specifies hyphenated naming

**✅ II. Least Privilege Access**
- **Status**: PASS
- **Validation**:
  - Function App uses System-Assigned Managed Identity for Key Vault access
  - Azure service principal for GitHub Actions has minimum RBAC (Contributor on Resource Group only)
  - Key Vault access policies grant only "Get" and "List" secrets to Function App identity
  - PostgreSQL uses Entra ID authentication (Managed Identity) where possible, falls back to username/password in Key Vault
- **Evidence**: FR-022 mandates Managed Identity, constitution principle II enforced

**✅ III. Blob-First Ingestion**
- **Status**: N/A (not modified by this feature)
- **Validation**: Existing backend implementation already enforces blob-first ingestion. Deployment pipeline does not change this.

**✅ IV. Traceability & Auditability**
- **Status**: PASS
- **Validation**:
  - GitHub Actions workflows log all deployment steps with timestamps
  - Azure deployment outputs include correlation IDs
  - Failed deployments captured in workflow logs with error details
  - Health check endpoint logs deployment validation results
- **Evidence**: FR-029 mandates notifications, all workflow steps logged

**✅ V. Deterministic JSON Output**
- **Status**: N/A (not modified by this feature)
- **Validation**: Deployment pipeline does not affect AI inference JSON schemas.

**✅ VI. Cost Controls & Resource Limits**
- **Status**: PASS (with monitoring recommendation)
- **Validation**:
  - Infrastructure templates use cost-effective SKUs (Functions Consumption Plan, Static Web Apps Free tier)
  - No auto-scaling rules that could cause runaway costs
  - Database migrations run once per deployment (not continuously)
  - Workflow timeouts prevent hanging jobs (15 minutes max per FR-030)
- **Recommendation**: Add Azure Cost Management alerts post-deployment (out of scope for this feature)

**✅ VII. Privacy & User Data Rights**
- **Status**: N/A (not modified by this feature)
- **Validation**: Deployment pipeline does not change data retention or deletion policies.

### User Experience & Interface Standards

**Status**: N/A - This feature is infrastructure/DevOps focused, no user-facing UI changes.

### Security & Privacy Standards

**✅ Authentication & Authorization**
- **Status**: PASS
- **Validation**:
  - GitHub Actions authenticates to Azure using service principal (AZURE_CREDENTIALS secret)
  - Function App health endpoint can be anonymously accessed for smoke testing (consistent with existing backend)
  - All other endpoints enforce authentication (unchanged by deployment pipeline)

**✅ Data Protection**
- **Status**: PASS
- **Validation**:
  - Bicep templates enable encryption at rest (default for Azure services)
  - PostgreSQL enforces TLS 1.2+ connections
  - Key Vault secrets encrypted by Azure-managed keys
  - Workflow logs do not expose sensitive data (FR-023)

**✅ Compliance**
- **Status**: PASS
- **Validation**:
  - Deployment pipeline maintains existing compliance posture
  - No new data collection introduced
  - Secrets management aligns with GDPR/CCPA requirements

### Operational Constraints

**✅ Observability**
- **Status**: PASS
- **Validation**:
  - Application Insights created by infrastructure template
  - Function App automatically sends telemetry to App Insights
  - Deployment workflows log structured output (GitHub Actions native JSON logging)
  - Failed deployments trigger GitHub Actions status notifications
- **Evidence**: FR-029 mandates failure notifications

**✅ Performance**
- **Status**: PASS
- **Validation**:
  - Health endpoint smoke test validates API response time post-deployment (FR-010)
  - Deployment pipeline itself meets <10 minute target (SC-001)
  - Database migrations timeout after reasonable duration

**✅ Availability**
- **Status**: PASS
- **Validation**:
  - Infrastructure templates are idempotent (safe to retry on transient failures)
  - Bicep deployments use incremental mode (non-destructive updates)
  - Health endpoint validates service availability post-deployment (FR-010)
  - Workflow retries not implemented (fail fast per constitution), but manual re-run supported

### Summary

**Overall Status**: ✅ PASS - All applicable constitutional principles satisfied.

**No violations requiring justification.**

**Post-Phase 1 Re-check Required**: Yes (after contracts and data-model generated)

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

```text
proteinlens.com/
├── .github/
│   └── workflows/
│       ├── infra.yml              # Infrastructure deployment (manual trigger)
│       ├── deploy-api.yml         # Backend deployment (auto on push to main)
│       └── deploy-web.yml         # Frontend deployment (auto on push to main)
├── infra/
│   ├── main.bicep                 # Main orchestration template
│   ├── modules/
│   │   ├── storage.bicep          # Storage Account + container
│   │   ├── keyvault.bicep         # Key Vault + access policies
│   │   ├── postgres.bicep         # PostgreSQL Flexible Server
│   │   ├── function-app.bicep     # Function App + App Service Plan + App Insights
│   │   ├── static-web-app.bicep   # Static Web Apps
│   │   └── frontdoor.bicep        # (Optional) Front Door + custom domain
│   ├── parameters/
│   │   ├── prod.parameters.json   # Production environment parameters
│   │   └── dev.parameters.json    # (Future) Development environment parameters
│   └── README.md                  # Deployment instructions
├── backend/
│   ├── src/
│   │   ├── functions/
│   │   │   └── health.ts          # Health check endpoint (smoke test)
│   │   └── lib/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Migration files
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.ts
└── specs/
    └── 004-azure-deploy-pipeline/
        ├── spec.md                # Feature specification
        ├── plan.md                # This file
        ├── research.md            # Phase 0 research findings
        ├── data-model.md          # Deployment entities
        ├── quickstart.md          # Deployment guide
        └── contracts/             # Workflow and parameter schemas
```

**Structure Decision**: 

This feature adds deployment infrastructure to the existing web application structure. Key additions:

1. **`.github/workflows/`**: GitHub Actions workflow files (3 workflows)
2. **`infra/`**: Bicep infrastructure-as-code templates (1 main + 6 modules)
3. **`backend/src/functions/health.ts`**: Health check endpoint for deployment validation
4. **Existing `backend/` and `frontend/`**: No structural changes, only workflow integration

The deployment pipeline integrates with existing code via:
- Backend: Builds from `backend/`, deploys to Azure Functions
- Frontend: Builds from `frontend/`, deploys to Static Web Apps
- Infrastructure: Provisions Azure resources that host backend and frontend

No new projects or directories are created within `backend/` or `frontend/`. This feature is purely infrastructure and CI/CD automation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations identified.** All constitutional principles are satisfied by this design.

---

## Phase 1 Complete: Design & Contracts ✅

**Date**: 2024-12-22

### Deliverables

✅ **research.md**: All NEEDS CLARIFICATION items resolved
- Database migration strategy: Run from Function App cold start (Azure-hosted)
- Bicep structure: Modular templates (6-8 modules)
- Workflow triggers: Path filters per component
- Secret storage: Deployment creds in GitHub, runtime in Key Vault
- Health endpoint: Multi-level dependency checks
- API URL: Direct Function URL (Phase 1), Front Door (Phase 2)
- Environment params: Parameter files per environment

✅ **data-model.md**: Deployment entities documented
- GitHub Secrets entity (8 secrets)
- Key Vault Secrets entity (7 runtime secrets)
- Bicep Parameter Files (prod.parameters.json structure)
- Workflow Outputs (resource names, URLs, status)
- Deployment Artifacts (Function App zip, Static Web App dist/)
- Health Check Response (JSON schema)

✅ **contracts/**: Workflow and parameter schemas
- bicep-parameters.md: Parameter contract with validation rules
- github-workflows.md: All 3 workflow contracts (infra, backend, frontend)

✅ **quickstart.md**: Step-by-step deployment guide
- Prerequisites checklist
- Azure service principal creation
- GitHub Secrets configuration
- Infrastructure deployment (2 options: GitHub Actions + Azure CLI)
- Backend and frontend deployment
- Troubleshooting guide
- Routine operations (secret rotation, logs, rollback)

✅ **Agent context updated**: `.github/agents/copilot-instructions.md`
- Added: TypeScript (backend), React/TypeScript (frontend), Bicep (infrastructure)
- Project type: Web application (frontend + backend + infrastructure)

### Constitution Re-Check (Post-Design)

**Overall Status**: ✅ PASS - All constitutional principles remain satisfied after Phase 1 design.

**Changes from Initial Check**: None - design phase did not introduce any constitutional violations.

**Key Confirmations**:
- Zero secrets in repo: ✅ GitHub Secrets + Key Vault only
- Least privilege: ✅ Managed Identity for Key Vault access
- Traceability: ✅ All workflow steps logged with timestamps
- Cost controls: ✅ Consumption plan, timeouts prevent runaway jobs
- Observability: ✅ Application Insights, health checks, structured logs

**No complexity justification required** - design follows simplest approach for each decision.

### Next Steps

**Ready for Phase 2**: `/speckit.tasks` command to generate tasks.md

**Phase 2 will produce**:
- `tasks.md`: Detailed task breakdown with time estimates
- Implementation checklist for all 30 functional requirements
- Testing scenarios for each user story

**Estimated Implementation Time**: 5-7 days (based on research findings)
- Infrastructure setup: 1-2 days
- GitHub Actions workflows: 2-3 days
- Testing and documentation: 1-2 days

---

**Planning Phase Complete** 🎉

Feature 004-azure-deploy-pipeline is fully planned and ready for task breakdown and implementation.

