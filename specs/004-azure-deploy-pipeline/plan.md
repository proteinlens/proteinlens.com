# Implementation Plan: Azure Deployment Pipeline

**Branch**: `004-azure-deploy-pipeline` | **Date**: December 22, 2024 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-azure-deploy-pipeline/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Establish a production-ready CI/CD pipeline that automates deployment of ProteinLens infrastructure, backend (Azure Functions), and frontend (Static Web Apps) to Azure. The pipeline will provision infrastructure via Bicep templates, run Prisma database migrations safely during backend deployment, and manage all secrets via Azure Key Vault with GitHub Secrets integration. Every push to main branch will trigger automated deployments with health checks and smoke tests.

## Technical Context

**Language/Version**: Node.js 20+ (backend), TypeScript 5.3+ (both frontend and backend), Bicep (infrastructure)  
**Primary Dependencies**: 
- **Infrastructure**: Azure Bicep, Azure CLI 2.50+
- **Backend**: Azure Functions v4, Prisma 5.8+, @azure/identity 4.0+, @azure/storage-blob 12.17+
- **Frontend**: React 18, Vite 5, React Query 5, Tailwind CSS 4
- **CI/CD**: GitHub Actions, Azure/functions-action, Azure/static-web-apps-deploy

**Storage**: 
- PostgreSQL Flexible Server (production database)
- Azure Blob Storage (meal photos)
- Azure Key Vault (secrets management)

**Testing**: 
- Vitest (backend and frontend unit tests)
- Supertest (backend API tests)
- Health endpoint smoke tests (post-deployment)

**Target Platform**: Azure Cloud (Functions on Linux consumption plan, Static Web Apps, PostgreSQL Flexible Server)

**Project Type**: Web application (separate backend API and frontend SPA)

**Performance Goals**: 
- Infrastructure deployment: <15 minutes
- Backend deployment: <3 minutes
- Frontend deployment: <5 minutes
- End-to-end deployment pipeline: <10 minutes

**Constraints**: 
- Prisma migrations must run before backend deployment goes live
- Database must be accessible from GitHub Actions runners (IPv4 firewall rules or Azure-hosted migration runner)
- Zero secrets in Git repository or frontend build artifacts
- All Function App secrets must use Key Vault references
- Workflows must be idempotent (safe to re-run on same commit)

**Scale/Scope**: 
- 3 GitHub Actions workflows (infra.yml, deploy-api.yml, deploy-web.yml)
- 6-8 Bicep modules (main, storage, function-app, postgres, keyvault, static-web-app, optional front-door)
- ~15-20 GitHub Secrets to configure
- ~5-10 Key Vault secrets to provision

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ PASS: Zero Secrets in Client or Repository (Principle I)
- **Compliance**: GitHub Actions workflows will use GitHub Secrets for deployment credentials (AZURE_CREDENTIALS, deployment tokens)
- **Compliance**: Function App will use Key Vault references for all runtime secrets (DATABASE_URL, OPENAI_API_KEY, STRIPE_SECRET_KEY)
- **Compliance**: Frontend build will receive VITE_API_URL as build-time environment variable (public API endpoint, not a secret)
- **Compliance**: Bicep templates will store sensitive outputs (connection strings, storage keys) in Key Vault, not in logs or Git
- **Justification**: N/A - full compliance

### ✅ PASS: Least Privilege Access (Principle II)
- **Compliance**: Function App will use System Managed Identity to access Storage Account (no account keys)
- **Compliance**: Function App Managed Identity will be granted Key Vault access policies (Get, List secrets only)
- **Compliance**: Database connection will use PostgreSQL admin credentials stored in Key Vault (Managed Identity not yet supported for Postgres Flexible Server at time of implementation)
- **Compliance**: GitHub Actions will use Service Principal with Contributor role scoped to resource group (minimum required for deployment)
- **Justification**: PostgreSQL Managed Identity support is planned for future release (Azure roadmap)

### ✅ PASS: Blob-First Ingestion (Principle III)
- **Compliance**: Not applicable to deployment pipeline (this principle applies to meal photo upload feature)
- **Justification**: Deployment pipeline does not handle meal photo uploads

### ✅ PASS: Traceability & Auditability (Principle IV)
- **Compliance**: GitHub Actions provides built-in audit trail for all workflow runs (commit SHA, timestamp, actor, status)
- **Compliance**: Infrastructure deployments will be tracked via Azure Activity Log
- **Compliance**: Deployment workflows will log key events (build start/finish, migration execution, health check results)
- **Justification**: N/A - full compliance

### ✅ PASS: Deterministic JSON Output (Principle V)
- **Compliance**: Not applicable to deployment pipeline (this principle applies to AI inference responses)
- **Justification**: Deployment pipeline does not process AI responses

### ✅ PASS: Cost Controls & Resource Limits (Principle VI)
- **Compliance**: Bicep templates will parameterize SKUs (e.g., consumption plan for Functions, Basic tier for PostgreSQL) to control costs
- **Compliance**: Workflows will timeout after 15 minutes to prevent hanging jobs that consume runner minutes
- **Justification**: N/A - full compliance

### ✅ PASS: Privacy & User Data Rights (Principle VII)
- **Compliance**: Not applicable to deployment pipeline (this principle applies to user data handling)
- **Justification**: Deployment pipeline does not handle user data

### ⚠️ ADVISORY: Mobile-First Design (Principle VIII)
- **Compliance**: Not applicable to deployment pipeline (this principle applies to UI design)
- **Justification**: Deployment pipeline has no user-facing UI

### ⚠️ ADVISORY: Fast Perceived Performance (Principle IX)
- **Compliance**: Not applicable to deployment pipeline (this principle applies to frontend performance)
- **Justification**: Deployment pipeline performance affects developers, not end users

### ⚠️ ADVISORY: Remaining UX Principles (X-XIV)
- **Compliance**: Not applicable to deployment pipeline (these principles apply to frontend UI/UX)
- **Justification**: Deployment pipeline has no user-facing UI

### 🎯 Constitution Check Result: **PASS**

All applicable constitutional principles are satisfied. The deployment pipeline focuses on infrastructure automation and does not interact with user data, AI processing, or UI/UX concerns. Security principles (I, II, IV, VI) are fully addressed through Key Vault integration, Managed Identity, audit logging, and resource constraints.

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
.github/
└── workflows/                    # GitHub Actions CI/CD workflows
    ├── infra.yml                # Infrastructure provisioning (manual trigger)
    ├── deploy-api.yml           # Backend deployment (auto on push to main)
    └── deploy-web.yml           # Frontend deployment (auto on push to main)

infra/
└── bicep/                       # Infrastructure-as-Code templates
    ├── main.bicep               # Main orchestration (existing, will be updated)
    ├── storage.bicep            # Storage account + container (existing)
    ├── function-app.bicep       # Function App + App Service Plan (existing)
    ├── keyvault.bicep           # Key Vault + access policies (existing)
    ├── monitoring.bicep         # Application Insights (existing)
    ├── postgres.bicep           # PostgreSQL Flexible Server (NEW)
    ├── static-web-app.bicep     # Azure Static Web Apps (NEW)
    └── front-door.bicep         # Azure Front Door (NEW, optional)

backend/
├── src/                         # Function App code (existing)
├── prisma/
│   ├── schema.prisma           # Database schema (existing)
│   └── migrations/             # Migration files (existing)
├── package.json
└── host.json

frontend/
├── src/                         # React SPA code (existing)
├── dist/                        # Build output (generated)
├── package.json
└── vite.config.ts

specs/004-azure-deploy-pipeline/
├── plan.md                      # This file
├── research.md                  # Phase 0 output (will be generated)
├── data-model.md                # Phase 1 output (will be generated)
├── quickstart.md                # Phase 1 output (will be generated)
└── contracts/                   # Phase 1 output (will be generated)
```

**Structure Decision**: Web application structure with separate backend API (Azure Functions) and frontend SPA (React). Infrastructure-as-Code templates located in `infra/bicep/`. CI/CD workflows will be added to `.github/workflows/` directory (currently does not exist). Existing Bicep modules will be updated, and new modules will be created for PostgreSQL, Static Web Apps, and optionally Front Door.

## Complexity Tracking

> **No violations - this section intentionally left empty**

The deployment pipeline implementation does not violate any constitutional principles and does not require complexity justification. All architectural decisions align with established best practices:

- Uses Azure-native services (Functions, Static Web Apps, PostgreSQL Flexible Server)
- Follows Infrastructure-as-Code principles with Bicep
- Implements secure secrets management via Key Vault
- Leverages GitHub Actions for CI/CD automation (industry standard)
- Maintains separation of concerns (infrastructure, backend, frontend workflows)
