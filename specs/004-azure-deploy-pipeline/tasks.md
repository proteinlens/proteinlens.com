# Tasks: Azure Deployment Pipeline

**Input**: Design documents from `/specs/004-azure-deploy-pipeline/`  
**Feature Branch**: `004-azure-deploy-pipeline`  
**Date**: 2024-12-22  
**Total Tasks**: 54 | **Estimated Duration**: 5-7 days

**Prerequisites**: 
- plan.md (technical context, architecture decisions)
- research.md (database migration strategy, Bicep structure, workflow design)
- data-model.md (deployment entities, secrets, parameters)
- contracts/ (Bicep parameters, workflow schemas)
- quickstart.md (deployment guide and troubleshooting)

**Organization**: Tasks grouped by user story (P1, P2, P3) to enable independent implementation and testing of each story. All foundational infrastructure tasks must complete before user story deployments can work.

---

## Phase 1: Setup & Foundation (Prerequisite)

**Purpose**: Repository structure, GitHub configuration, and basic CI/CD foundation

### GitHub & Repository Setup

- [ ] T001 Create `.github/workflows/` directory if not exists
- [ ] T002 Create `.github/secrets/` documentation for required GitHub Secrets (AZURE_CREDENTIALS, AZURE_SUBSCRIPTION_ID, AZURE_RESOURCE_GROUP, DATABASE_ADMIN_PASSWORD, OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] T003 [P] Create `infra/` directory structure: `main.bicep`, `modules/`, `parameters/`
- [ ] T004 [P] Create `infra/README.md` with deployment instructions and prerequisites

### Local Development Setup

- [ ] T005 [P] Install/verify Bicep CLI: `az bicep version` (min 0.20.0)
- [ ] T006 [P] Install/verify Azure CLI: `az --version` (min 2.50.0)
- [ ] T007 Document Node.js 20+ requirement for backend deployment in `DEVELOPMENT-GUIDE.md`

**Checkpoint**: Repository structure ready, developer environment validated

---

## Phase 2: Infrastructure Provisioning (Priority: P1) 🎯 MVP

**Goal**: All Azure resources (Function App, Static Web App, PostgreSQL, Key Vault, Storage) provisioned via Bicep templates that can be deployed with a single command

**Independent Test**: Deploy infrastructure to clean Azure subscription → verify all resources created → output contains resource names, URLs, connection info

### Bicep Modules Implementation

- [ ] T008 [P] Create `infra/modules/keyvault.bicep` with:
  - Key Vault resource definition
  - Access policies for service principal and Function App Managed Identity
  - Output: Key Vault ID, URI (reference: [contracts/bicep-parameters.md](contracts/bicep-parameters.md))

- [ ] T009 [P] Create `infra/modules/storage.bicep` with:
  - Storage Account resource (Standard LRS, no public blob access)
  - Blob container for meal photos
  - Output: Storage Account name, connection string reference (reference: [research.md](research.md#6-front-door-vs-direct-function-app-url))

- [ ] T010 [P] Create `infra/modules/postgres.bicep` with:
  - PostgreSQL Flexible Server (Standard_B1ms default, configurable)
  - Database name: `proteinlens`
  - Admin username from parameter (not 'admin' or 'postgres')
  - Admin password from Key Vault reference
  - Firewall rule: Allow Azure services (all)
  - Output: PostgreSQL FQDN, database name (reference: [research.md](research.md#1-database-migration-strategy-from-github-actions))

- [ ] T011 [P] Create `infra/modules/function-app.bicep` with:
  - App Service Plan (Consumption tier, no auto-scale)
  - Function App (Node 20 runtime, identity type: SystemAssigned)
  - Application Insights for monitoring
  - App settings with Key Vault references for:
    - `DATABASE_URL` → `@Microsoft.KeyVault(SecretUri=...)`
    - `OPENAI_API_KEY` → `@Microsoft.KeyVault(SecretUri=...)`
    - `STRIPE_SECRET_KEY` → `@Microsoft.KeyVault(SecretUri=...)`
    - `STRIPE_WEBHOOK_SECRET` → `@Microsoft.KeyVault(SecretUri=...)`
    - `BLOB_STORAGE_CONNECTION` → `@Microsoft.KeyVault(SecretUri=...)`
  - Output: Function App name, default hostname, Managed Identity object ID

- [ ] T012 [P] Create `infra/modules/static-web-app.bicep` with:
  - Static Web Apps resource (Free tier)
  - App settings with `VITE_API_URL` environment variable
  - Output: Static Web App name, default domain, deployment token

- [ ] T013 [P] Create `infra/modules/frontdoor.bicep` (optional, gated by parameter) with:
  - Azure Front Door instance
  - Backend pools for Function App and Static Web App
  - Routing rules for `/api/*` → Function App, `/*` → Static Web App
  - Output: Front Door endpoint URL, custom domain (if configured)
  - Note: This module is optional and not required for MVP (Phase 1)

### Bicep Main Template & Parameters

- [ ] T014 Create `infra/main.bicep` that:
  - Declares all parameters per [contracts/bicep-parameters.md](contracts/bicep-parameters.md)
  - Imports and orchestrates all modules
  - Passes outputs from one module as inputs to next (Key Vault ID to Function App, Storage name to Function App, etc.)
  - Uses symbolic references for idempotency (e.g., `existing` keyword for Key Vault)

- [ ] T015 Create `infra/parameters/prod.parameters.json` with:
  - Environment-specific values (region, SKUs, resource names)
  - Secure parameter references for passwords
  - All parameters per [contracts/bicep-parameters.md](contracts/bicep-parameters.md) (reference: [quickstart.md](quickstart.md#step-3-create-bicep-parameter-file))

- [ ] T016 [P] Create `infra/parameters/dev.parameters.json` for future dev environment support

### Bicep Validation & Outputs

- [ ] T017 Validate all Bicep files: `az bicep build infra/main.bicep` (no errors)

- [ ] T018 Add outputs to `infra/main.bicep` that include:
  - `resourceGroupName`: Name of created resource group
  - `functionAppName`: Function App name (e.g., `proteinlens-api-prod`)
  - `functionAppUrl`: HTTPS endpoint (e.g., `https://proteinlens-api-prod.azurewebsites.net`)
  - `staticWebAppName`: Static Web App name
  - `staticWebAppUrl`: Default domain URL
  - `postgresServerName`: PostgreSQL FQDN
  - `keyVaultName`: Key Vault name
  - `storageAccountName`: Storage Account name
  - `storageContainerName`: Blob container name
  - `deploymentId`: Correlation ID for tracking

### Infrastructure Workflow Setup

- [ ] T019 Create `.github/workflows/infra.yml` with:
  - Trigger: `workflow_dispatch` only (manual approval required for infra changes)
  - Input parameters: `environment` (prod/staging/dev), `confirm_deploy` (confirmation string)
  - Jobs: validate → deploy → output
  - Reference: [contracts/github-workflows.md](contracts/github-workflows.md#1-infrastructure-deployment-workflow)

- [ ] T020 Implement infrastructure validation step in `infra.yml`:
  - `az bicep build infra/main.bicep`
  - `az deployment group validate --template-file infra/main.bicep --parameters @infra/parameters/$ENVIRONMENT.parameters.json`
  - Fail workflow if validation fails

- [ ] T021 Implement infrastructure deployment step in `infra.yml`:
  - Login to Azure: `az login` via AZURE_CREDENTIALS secret
  - Create resource group: `az group create --name $RESOURCE_GROUP --location $LOCATION`
  - Deploy template: `az deployment group create --template-file infra/main.bicep --parameters ...`
  - Capture outputs via `az deployment group show`

- [ ] T022 Seed Key Vault secrets from GitHub Secrets in `infra.yml`:
  - After infrastructure deployment, populate Key Vault with:
    - `database-url`: Constructed from PostgreSQL FQDN + admin user (from GitHub Secret)
    - `openai-api-key`: From GitHub Secret `OPENAI_API_KEY`
    - `stripe-secret-key`: From GitHub Secret `STRIPE_SECRET_KEY`
    - `stripe-webhook-secret`: From GitHub Secret `STRIPE_WEBHOOK_SECRET`
  - Use: `az keyvault secret set --vault-name $KEY_VAULT --name $SECRET_NAME --value $SECRET_VALUE`

- [ ] T023 Grant Function App Managed Identity access to Key Vault in `infra.yml`:
  - After Function App deployment, get its Managed Identity object ID from outputs
  - Create access policy: `az keyvault set-policy --name $KEY_VAULT --object-id $IDENTITY_ID --secret-permissions get list`

**Checkpoint**: Infrastructure can be deployed with `github.com/{org}/proteinlens.com/actions/workflows/infra.yml` → Manual Run

---

## Phase 3: Backend Deployment Automation (Priority: P2)

**Goal**: Backend (Azure Functions) automatically builds, migrates database, and deploys to Azure on every push to main

**Independent Test**: Push code change to main → verify backend builds → Prisma migrations run → health endpoint returns 200 → no frontend deployment needed

### Database Migrations Setup

- [ ] T024 Add health check function to `backend/src/functions/health.ts`:
  - Endpoint: `GET /api/health`
  - Checks: database connection, blob storage access, Key Vault secret retrieval
  - Response: JSON with status (healthy/unhealthy) and detailed checks
  - Status code: 200 if healthy, 503 if any check fails
  - Reference: [research.md](research.md#5-health-endpoint-design-for-deployment-validation)

- [ ] T025 Add database migration to Function App cold start in `backend/host.json` or startup script:
  - Before Function App starts handling requests, execute `prisma migrate deploy`
  - Log migration results (applied migrations count, any errors)
  - Fail gracefully if migrations fail (Function App won't start, Azure shows deployment error)
  - Note: Migrations run inside Azure VNet (safe database access, no firewall workarounds needed)

### Backend Deployment Workflow

- [ ] T026 Create `.github/workflows/deploy-api.yml` with:
  - Trigger: Push to `main` branch, path filter: `backend/**`, `.github/workflows/deploy-api.yml`
  - Also support manual trigger: `workflow_dispatch`
  - Reference: [contracts/github-workflows.md](contracts/github-workflows.md#2-backend-deployment-workflow)

- [ ] T027 Implement Node.js setup and dependency installation in `deploy-api.yml`:
  - Setup Node.js 20: `actions/setup-node@v4`
  - Install backend dependencies: `npm ci --prefix backend` (clean install)
  - Display versions: `node --version`, `npm --version`

- [ ] T028 Implement backend build step in `deploy-api.yml`:
  - Compile TypeScript: `npm run build --prefix backend`
  - Run linting: `npm run lint --prefix backend`
  - Fail workflow if build or lint fails
  - Publish version info (git commit SHA) for traceability

- [ ] T029 Implement Azure Functions deployment step in `deploy-api.yml`:
  - Login to Azure: `az login` via AZURE_CREDENTIALS secret
  - Deploy Function App: `azure/functions-action@v1` with:
    - `app-name`: From GitHub Secret `AZURE_FUNCTION_APP_NAME`
    - `package`: `backend/dist/` (compiled functions)
    - `publish-profile`: Generated during infrastructure deployment
  - Capture deployment status (success/failure)

- [ ] T030 Add health endpoint verification in `deploy-api.yml`:
  - After deployment, wait 10 seconds for cold start
  - Call health endpoint: `curl -f -v https://$FUNCTION_APP_URL/api/health`
  - Parse response: Expect status 200 and `"status":"healthy"` in JSON
  - Retry up to 3 times with 5-second backoff
  - Fail workflow if health check fails
  - This validates: database connection, secrets available, all dependencies working

- [ ] T031 Add error handling and notifications to `deploy-api.yml`:
  - Capture error details from failed steps
  - Post to GitHub Actions summary with error message
  - Optionally send to Slack/Teams if webhook configured (future enhancement)
  - Logs should include: build output, deployment logs, health check response

**Checkpoint**: Backend deploys automatically on push to main, migrations run, health check validates

---

## Phase 4: Frontend Deployment Automation (Priority: P3)

**Goal**: Frontend automatically builds with correct API URL and deploys to Static Web Apps on every push to main

**Independent Test**: Push frontend code change to main → verify build succeeds with API URL → deployment to Static Web Apps completes → site accessible at HTTPS

### Frontend Build Configuration

- [ ] T032 [P] Ensure `frontend/.env` or build process sets `VITE_API_URL`:
  - Default (development): `http://localhost:7071` (local backend)
  - Production (via workflow): `https://proteinlens-api-prod.azurewebsites.net` (or Front Door URL)
  - Variable must be injected during build: `VITE_API_URL=... npm run build`
  - Verify frontend components use this variable: `const API_URL = import.meta.env.VITE_API_URL`

- [ ] T033 [P] Verify frontend build optimizations in `frontend/vite.config.ts`:
  - Tree-shaking enabled
  - Minification enabled
  - CSS bundling enabled
  - Result: dist/ folder <300KB (target from constitution principle IX)

### Frontend Deployment Workflow

- [ ] T034 Create `.github/workflows/deploy-web.yml` with:
  - Trigger: Push to `main` branch, path filter: `frontend/**`, `.github/workflows/deploy-web.yml`
  - Also support manual trigger: `workflow_dispatch`
  - Reference: [contracts/github-workflows.md](contracts/github-workflows.md#3-frontend-deployment-workflow)

- [ ] T035 Implement Node.js setup and build in `deploy-web.yml`:
  - Setup Node.js 20
  - Install frontend dependencies: `npm ci --prefix frontend`
  - Build frontend: `VITE_API_URL=$API_URL npm run build --prefix frontend`
    - Where `$API_URL` comes from environment variable (set in workflow)
  - Display build artifacts size: `du -sh frontend/dist/`
  - Fail workflow if build fails

- [ ] T036 Implement Static Web Apps deployment in `deploy-web.yml`:
  - Use `azure/static-web-apps-deploy@v1` action with:
    - `azure_static_web_apps_api_token`: From GitHub Secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
    - `repo_token`: GitHub token (GITHUB_TOKEN, automatic)
    - `action`: "upload"
    - `app_location`: "frontend/dist"
    - `skip_app_build`: true (already built above)
  - Reference: [contracts/github-workflows.md](contracts/github-workflows.md#3-frontend-deployment-workflow)

- [ ] T037 Add smoke test to `deploy-web.yml`:
  - After deployment, wait for Static Web Apps to be ready
  - Fetch deployed site homepage: `curl -f https://$SWA_URL/`
  - Verify HTTP 200 response (site is accessible)
  - Fail workflow if site not accessible

- [ ] T038 Add error handling and reporting to `deploy-web.yml`:
  - Capture build size in workflow output
  - Report deployment status to GitHub Actions summary
  - Include deployment URL in summary for easy access

**Checkpoint**: Frontend deploys automatically on push to main, accessible at production URL

---

## Phase 5: Security & Secrets Management (Cross-Cutting)

**Goal**: No secrets in repository, all runtime secrets in Key Vault, secure workflow credentials

### Repository Security

- [ ] T039 Add `.gitignore` entries to prevent secret commits:
  - `*.env`, `*.env.local`, `*.env.*.local`
  - `local.settings.json` (Azure Functions local settings)
  - `.azure/` (Azure SDK cache)
  - Verify no existing secrets in git history: `git log -p -- '*.env' | head -50`

- [ ] T040 [P] Configure GitHub secret scanning:
  - Enable Dependabot alerts in repo settings
  - Add custom patterns for secrets (OpenAI, Stripe keys) in `.github/secret_scanning.yml`
  - Verify no secrets in recent commits

- [ ] T041 [P] Add GitHub branch protection rule for `main`:
  - Require status checks to pass (infra, backend, frontend workflows)
  - Dismiss stale pull request approvals
  - Require code review from at least 1 reviewer (team-dependent)

### Key Vault Integration

- [ ] T042 Verify Function App uses Key Vault references for all secrets:
  - Application settings in `infra/modules/function-app.bicep` use syntax: `@Microsoft.KeyVault(SecretUri=...)`
  - Do not commit actual secret values in Bicep files
  - Secrets are populated during infrastructure deployment (T022)

- [ ] T043 [P] Configure Function App Managed Identity to access Key Vault:
  - In `infra.yml` (T023), grant Identity access to Key Vault
  - Permissions: `get`, `list` secrets only (least privilege)
  - No `delete`, `purge`, or admin permissions

- [ ] T044 [P] Document GitHub Secrets required in `.github/SECRETS_README.md`:
  - List all required secrets: AZURE_CREDENTIALS, AZURE_SUBSCRIPTION_ID, etc.
  - Document format and how to obtain each (reference: [quickstart.md](quickstart.md#step-2-configure-github-secrets))
  - Include security note: Never log these values in workflows

### Workflow Security Best Practices

- [ ] T045 [P] Add secret masking to all workflows:
  - Ensure `AZURE_CREDENTIALS`, passwords, API keys are never logged
  - Use GitHub Actions `::add-mask::` for any secrets created during workflow
  - Verify workflow logs don't contain secrets

- [ ] T046 [P] Add timeout to all workflow jobs:
  - Infrastructure workflow: 30 min timeout
  - Backend deployment: 10 min timeout
  - Frontend deployment: 10 min timeout
  - Prevents hanging jobs that consume action minutes

**Checkpoint**: All secrets secured, no secrets in repository, workflows follow security best practices

---

## Phase 6: Documentation & Troubleshooting (Cross-Cutting)

**Goal**: Developers can self-serve deployment and troubleshooting

### Deployment Documentation

- [ ] T047 Update `infra/README.md` with:
  - Prerequisites checklist (tools, Azure subscription, GitHub secrets)
  - Step-by-step infrastructure deployment instructions (via GitHub UI and Azure CLI)
  - Expected output values (function app URL, etc.)
  - Troubleshooting common Bicep errors

- [ ] T048 [P] Update `DEVELOPMENT-GUIDE.md` or main README with:
  - How to trigger backend and frontend deployments (push to main or manual GitHub Actions)
  - How to verify deployment succeeded (health endpoint, site accessibility)
  - How to check logs (Azure portal, Application Insights)
  - Links to [quickstart.md](quickstart.md) for detailed deployment guide

- [ ] T049 [P] Create `.github/DEPLOYMENT_TROUBLESHOOTING.md` with:
  - Common failure scenarios and resolutions
  - Example error messages and what they mean
  - How to rollback a failed deployment
  - How to manually run a workflow with specific parameters

### Implementation Verification

- [ ] T050 [P] Add comments to all workflow YAML files explaining each step

- [ ] T051 [P] Verify all file paths match actual repository structure (referenced in tasks above)

- [ ] T052 Test infrastructure deployment locally:
  - Validate Bicep: `az bicep build infra/main.bicep`
  - Validate deployment: `az deployment group validate --resource-group test-rg --template-file infra/main.bicep --parameters @infra/parameters/prod.parameters.json`
  - Do not deploy to live environment yet (wait for full implementation)

### Final Integration Testing

- [ ] T053 [P] Execute full deployment on staging environment:
  - Run `infra.yml` to create infrastructure
  - Run `deploy-api.yml` to deploy backend
  - Run `deploy-web.yml` to deploy frontend
  - Verify all 3 workflows succeed
  - Verify health endpoint returns 200
  - Verify frontend loads and can call backend API

- [ ] T054 Document actual URLs and resources created:
  - Function App URL
  - Static Web App URL
  - PostgreSQL connection string (masked for security)
  - Key Vault name and secret count

**Checkpoint**: All documentation complete, deployment validated end-to-end

---

## Testing Summary

**No test tasks included** (not requested in feature specification)

If automated testing desired in future, would include:
- Contract tests for Bicep parameter validation
- Integration tests for workflow execution (using GitHub Actions test environments)
- E2E tests for deployment path (infra → backend → frontend)

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)

1. **Phase 1** (Setup): T001-T007 (any order, ~2 hours)
2. **Phase 2** (Infrastructure): T008-T023 (T008-T013 parallel, then T014-T023 sequential, ~1-2 days)
3. **Phase 3** (Backend): T024-T031 (depends on Phase 2 complete, ~1-2 days)
4. **Phase 4** (Frontend): T032-T038 (depends on Phase 3 for API URL, ~1 day)
5. **Phase 5** (Security): T039-T046 (can start after Phase 1, finalize before go-live, ~1 day)
6. **Phase 6** (Documentation): T047-T054 (can run in parallel with phases 3-5, ~1 day)

### Parallelization Opportunities

- **Within Phase 2**: Bicep modules (T008-T013) can be developed in parallel (different files)
- **Within Phase 5**: Security checks (T039-T046) are independent
- **Phases 3 & 4**: Can start Phase 4 as soon as Phase 2 completes (don't need Phase 3 finish)
- **Phase 6**: Documentation can be written while implementing other phases

### Expected Timeline

- **Minimum (optimal parallelization)**: 3-4 days
  - Day 1: Phase 1 + Phase 2 (parallel Bicep modules)
  - Day 2: Phase 3 + Phase 4 (parallel backend/frontend workflows)
  - Day 3: Phase 5 + Phase 6 (finalize security and docs)
  - Day 4: Integration testing and validation

- **Realistic (sequential with reasonable parallelization)**: 5-7 days
  - Some blockers (e.g., infrastructure must be complete before health check can be tested)
  - Time for testing and troubleshooting each phase
  - Handling dependency issues and edge cases

---

## Acceptance Criteria by User Story

### User Story 1: Infrastructure Provisioning (P1)

✅ **Complete when**:
- All Bicep modules created and validated
- Infrastructure workflow (`infra.yml`) created and tested
- Single workflow trigger provisions all 8 Azure resources
- Workflow outputs include resource names, URLs, connection info
- Workflow can be re-run without errors (idempotent)
- Infrastructure can be created via GitHub Actions or Azure CLI
- Key Vault is provisioned and secrets seeded

### User Story 2: Backend Automated Deployment (P2)

✅ **Complete when**:
- Backend deployment workflow (`deploy-api.yml`) created
- Pushing code to `main` triggers automatic deployment
- Prisma migrations run before Function App serves requests
- Health endpoint validates all dependencies (database, secrets)
- Health endpoint returns 200 after successful deployment
- Workflow fails fast on build, migration, or deployment errors
- Function App starts with Key Vault references resolved

### User Story 3: Frontend Automated Deployment (P3)

✅ **Complete when**:
- Frontend deployment workflow (`deploy-web.yml`) created
- Pushing code to `main` triggers automatic deployment
- Frontend builds with production optimizations
- `VITE_API_URL` environment variable correctly injected
- Deployment to Static Web Apps succeeds
- Deployed site is accessible at HTTPS with changes visible
- No secrets or sensitive data in frontend build

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Infrastructure deployment time | <15 min (first run), <5 min (updates) | Time from workflow start to completion |
| Backend deployment time | <3 min | Time from push to health check pass |
| Frontend deployment time | <5 min | Time from push to site accessible |
| Workflow reliability | 100% (zero silent failures) | All failures explicitly reported |
| Secret security | Zero secrets in repo | git history scan + secret scanning |
| Documentation completeness | All procedures documented | Quick start + troubleshooting + examples |

---

## Notes for Implementer

1. **Bicep Idempotency**: Use `existing` keyword for resources that should not be recreated. Test by running deployment twice.

2. **Key Vault Secrets**: Populate in `infra.yml` after infrastructure created. Use `az keyvault secret set` in workflow.

3. **Managed Identity**: Grant Function App access to Key Vault in `infra.yml` after both are created.

4. **Database Migrations**: Run from Function App cold start, not from GitHub Actions runner (avoids firewall complexity per research.md).

5. **Health Endpoint**: Should check all critical dependencies; returning 503 on any failure helps diagnose deployment issues.

6. **Path Filters**: Workflows only run when relevant files change, reducing action minutes and feedback time.

7. **Reusability**: Bicep modules should be parameterized for future multi-environment support (dev/staging/prod).

8. **Error Messages**: Workflows should output clear error messages (not generic "deployment failed") for self-service troubleshooting.

---

**Implementation Complete Criteria**: All 54 tasks marked complete, all 3 user stories independently testable and deployed to production via automated workflows.
