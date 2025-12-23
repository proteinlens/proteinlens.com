# Feature Specification: Azure Deployment Pipeline

**Feature Branch**: `004-azure-deploy-pipeline`  
**Created**: December 22, 2024  
**Status**: Draft  
**Input**: User description: "Add a production-ready Azure deployment pipeline so that: main branch pushes automatically deploy frontend and backend, Infrastructure can be deployed via Bicep (one command / one workflow), Database migrations run safely (Prisma) during deployment, Secrets are not stored in repo; use GitHub Secrets + Key Vault references"

## Overview

This feature establishes a complete CI/CD pipeline for ProteinLens that automates deployment of infrastructure, backend services, and frontend application to Azure. The pipeline ensures safe database migrations, proper secret management via Azure Key Vault, and automated deployments on every push to the main branch. This eliminates manual deployment steps, reduces deployment errors, and enables rapid iteration while maintaining security best practices.

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

### User Story 1 - Infrastructure Provisioning (Priority: P1)

A DevOps engineer needs to provision all Azure resources (Static Web Apps, Functions, PostgreSQL, Key Vault, Front Door, Storage) from scratch or update existing infrastructure using a single command or workflow.

**Why this priority**: Without infrastructure, the application cannot be deployed. This is the foundation for all other deployment activities and must be completed first. It provides the Azure resources that backend and frontend deployments depend on.

**Independent Test**: Can be fully tested by running the infrastructure workflow (or command) against a clean Azure subscription and verifying that all required resources are created with correct configurations. Success means receiving output values (resource names, URLs) that can be used in subsequent deployments.

**Acceptance Scenarios**:

1. **Given** no Azure resources exist, **When** infrastructure workflow runs with valid parameters, **Then** all required resources (Static Web Apps, Functions, PostgreSQL, Key Vault, Storage, Front Door) are created successfully
2. **Given** infrastructure already exists, **When** infrastructure workflow runs with configuration changes, **Then** existing resources are updated without recreating them (unless necessary)
3. **Given** infrastructure deployment completes, **When** workflow finishes, **Then** output includes resource names, URLs, and connection strings needed for app deployment
4. **Given** sensitive values like DB passwords, **When** infrastructure provisions Key Vault, **Then** secrets are stored in Key Vault and not exposed in logs or outputs

---

### User Story 2 - Backend Automated Deployment (Priority: P2)

A developer pushes code changes to the main branch, and the backend (Azure Functions) automatically builds, migrates the database schema, and deploys to Azure without manual intervention.

**Why this priority**: Automated backend deployment is critical for rapid iteration and reduces the risk of manual deployment errors. Database migrations must be safe and automated to prevent data loss or schema inconsistencies. This enables continuous delivery of backend features.

**Independent Test**: Can be tested by pushing a backend code change to main (e.g., new API endpoint or function) and verifying: (1) build succeeds, (2) Prisma migrations run against Azure PostgreSQL, (3) new function is accessible via HTTPS, and (4) health endpoint returns 200. Does not require frontend deployment.

**Acceptance Scenarios**:

1. **Given** code is pushed to main branch, **When** GitHub Actions workflow triggers, **Then** backend builds successfully and deploys to Azure Functions
2. **Given** Prisma schema changes exist, **When** deployment workflow runs, **Then** `prisma migrate deploy` executes against Azure PostgreSQL and applies pending migrations
3. **Given** deployment completes, **When** hitting the health endpoint, **Then** returns HTTP 200 with service status indicating healthy state
4. **Given** deployment fails (build error, migration error), **When** workflow runs, **Then** deployment stops and sends notification with error details
5. **Given** environment secrets are needed (OpenAI API key, Stripe keys), **When** Functions deploy, **Then** secrets are fetched from Key Vault via Key Vault references (not stored in repo)

---

### User Story 3 - Frontend Automated Deployment (Priority: P3)

A developer pushes frontend code changes to the main branch, and the frontend automatically builds and deploys to Azure Static Web Apps with the correct API base URL configured.

**Why this priority**: Frontend deployment completes the CI/CD pipeline and enables continuous delivery of UI improvements. While important, it can be tested independently after infrastructure and backend are working. Users can still test backend APIs directly even if frontend deployment is not yet automated.

**Independent Test**: Can be tested by pushing a frontend change (e.g., UI text update) to main and verifying: (1) build succeeds with correct API URL, (2) deployment to Static Web Apps completes, and (3) deployed site is accessible via HTTPS with changes visible. Backend APIs can remain unchanged.

**Acceptance Scenarios**:

1. **Given** frontend code is pushed to main, **When** deployment workflow triggers, **Then** frontend builds with production configuration (minified, optimized)
2. **Given** Static Web Apps deployment token exists, **When** deployment runs, **Then** built assets upload to Azure Static Web Apps successfully
3. **Given** deployment completes, **When** accessing the site URL, **Then** frontend loads correctly and can communicate with backend APIs via Front Door URL
4. **Given** API base URL is environment-specific, **When** building frontend, **Then** `VITE_API_URL` is set to Front Door origin or direct Function App URL
5. **Given** build fails (TypeScript errors, missing dependencies), **When** workflow runs, **Then** deployment stops and reports error details

### Edge Cases

- **What happens when Prisma migrations fail during deployment?** Deployment must fail fast, rollback should not be attempted automatically (risk of data loss), and alerts must notify the team. Manual intervention required.
- **What happens when Key Vault is unreachable during deployment?** Functions cannot start without secrets. Deployment must fail with clear error message indicating Key Vault connectivity issue.- **What happens if Key Vault secret names contain underscores?** Azure Key Vault only allows alphanumerics and hyphens in secret names. Secret names with underscores will fail to be created. Deployment must use hyphenated secret names (e.g., `DATABASE-URL`, `OPENAI-API-KEY`, `STRIPE-SECRET-KEY`, `STRIPE-WEBHOOK-SECRET`).- **What happens when multiple developers push to main simultaneously?** GitHub Actions queues workflows sequentially. Each deployment must wait for the previous to complete to avoid race conditions.
- **What happens when infrastructure workflow runs while apps are deployed?** Infrastructure updates should be non-destructive where possible (in-place updates). Critical resources (database, storage) should not be deleted/recreated. Use `existing` resource references where appropriate.
- **What happens if deployment succeeds but health check fails?** Deployment is marked as failed, and rollback notification is sent. Previous deployment remains active if using deployment slots.
- **What happens if GitHub Secrets are missing or invalid?** Workflow fails at authentication step with clear error message indicating which secret is missing or invalid.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

#### Infrastructure Deployment

- **FR-001**: System MUST provide Bicep templates that define all required Azure resources (Resource Group, Static Web Apps, Function App, App Service Plan, PostgreSQL Flexible Server, Key Vault, Storage Account, Front Door)
- **FR-002**: System MUST support infrastructure deployment via a single workflow trigger or CLI command that orchestrates all Bicep deployments
- **FR-003**: System MUST output resource names, URLs, and connection information after successful infrastructure deployment (e.g., Function App URL, Static Web Apps URL, Front Door endpoint)
- **FR-004**: Infrastructure templates MUST use parameterization for environment-specific values (resource names, SKUs, regions, admin usernames)
- **FR-005**: System MUST store sensitive infrastructure outputs (database connection strings, storage keys) in Azure Key Vault, not in workflow logs or Git

#### Backend Deployment

- **FR-006**: System MUST trigger backend deployment workflow automatically on push to main branch when backend files change
- **FR-007**: Backend workflow MUST build the Azure Functions app (compile TypeScript, install dependencies, package functions)
- **FR-008**: Backend workflow MUST run Prisma migrations (`prisma migrate deploy`) against Azure PostgreSQL BEFORE deploying function code. Migrations MUST execute from the Function App process at cold start (when first HTTP request arrives after deployment). See [research.md](research.md#database-migration-strategy) for strategy rationale. Prisma will automatically apply any pending migrations from the `prisma/migrations/` directory. If any migration fails, Function App startup must fail gracefully and workflow must detect this via health endpoint returning HTTP 503.
- **FR-009**: Backend workflow MUST deploy built Functions app to Azure Functions using deployment credentials or service principal
- **FR-010**: Backend workflow MUST verify deployment success by calling a health endpoint (`GET /api/health`) and expecting HTTP 200 response with JSON matching [contracts/health-check-response.md](contracts/health-check-response.md). Health endpoint MUST check: database connectivity, blob storage access, and AI service reachability. Endpoint MUST return `{"status": "healthy"}` or `{"status": "degraded"}` to pass deployment; `{"status": "unhealthy"}` (HTTP 503) fails deployment. (Reference: [contracts/health-check-response.md](contracts/health-check-response.md))
- **FR-011**: System MUST configure Function App with Key Vault references for all sensitive settings. App setting keys use underscores (e.g., `DATABASE_URL`), but Key Vault secret names MUST use hyphens (e.g., `DATABASE-URL`). Reference syntax: `@Microsoft.KeyVault(SecretUri=https://vault.azure.net/secrets/DATABASE-URL/)`
- **FR-012**: Backend workflow MUST fail and stop deployment if build, migration, or deployment steps encounter errors

#### Frontend Deployment

- **FR-013**: System MUST trigger frontend deployment workflow automatically on push to main branch when frontend files change
- **FR-014**: Frontend workflow MUST build the frontend app with production optimizations (minify, tree-shake, compress)
- **FR-015**: Frontend workflow MUST inject correct API base URL (`VITE_API_URL`) as environment variable during build (pointing to Front Door or Function App)
- **FR-016**: Frontend workflow MUST deploy built static assets to Azure Static Web Apps using deployment token
- **FR-017**: System MUST ensure frontend build does NOT contain any secrets or sensitive configuration values
- **FR-018**: Frontend workflow MUST fail and stop deployment if build or upload steps encounter errors

#### Security & Secrets Management

- **FR-019**: System MUST store all deployment credentials and secrets in GitHub Secrets (Azure service principal, deployment tokens, API keys)
- **FR-020**: System MUST use Azure Key Vault to store runtime secrets accessed by Function App (database passwords, API keys, connection strings)
- **FR-021**: Function App MUST access Key Vault secrets using Key Vault references with hyphenated secret names (syntax: `@Microsoft.KeyVault(SecretUri=https://vault.azure.net/secrets/SECRET-NAME/)`). Key Vault secret names MUST NOT contain underscores; use hyphens instead (e.g., `DATABASE-URL` not `DATABASE_URL`)
- **FR-022**: System MUST grant Function App managed identity appropriate Key Vault access policies (Get, List secrets)
- **FR-023**: System MUST NOT log or expose secret values in workflow outputs, console logs, or error messages
- **FR-024**: System MUST NOT commit secrets, credentials, or sensitive configuration to Git repository

#### Workflow Configuration

- **FR-025**: System MUST provide GitHub Actions workflow files (.github/workflows/) for infrastructure, backend, and frontend deployments
- **FR-026**: Workflows MUST support manual triggering (workflow_dispatch) in addition to automatic triggers
- **FR-027**: Workflows MUST include appropriate triggers (push to main, path filters for backend/frontend, manual dispatch)
- **FR-028**: Workflows MUST use matrix strategy or conditional logic to skip deployments when irrelevant files change (e.g., don't deploy backend if only frontend changed)
- **FR-029**: Workflows MUST send notifications on deployment success or failure (via GitHub Actions status, email, or Slack)
- **FR-030**: Workflows MUST timeout after reasonable duration (e.g., 15 minutes) to prevent hanging jobs
- **FR-031**: System MUST validate that Function App Managed Identity has Get and List permissions on Key Vault BEFORE attempting deployment. If permissions are missing, deployment workflow MUST fail with clear error message: "Function App Managed Identity does not have Get + List permissions on Key Vault. Run: `az keyvault set-policy --name <kv-name> --object-id <identity-id> --secret-permissions get list`"  (Reference: T023, T043)
- **FR-032**: Infrastructure deployment MUST be idempotent. Running the deployment twice with identical parameters MUST result in no resource changes on the second run (except for intentional resource updates specified in parameters). Bicep templates MUST use `existing` keyword for resources that should not be recreated. (Reference: plan.md, notes for implementer)

### Key Entities *(data entities involved)*

- **Bicep Templates**: Infrastructure-as-code files defining Azure resources with parameters for environment-specific configuration
- **GitHub Actions Workflows**: YAML workflow definitions for infrastructure, backend, and frontend deployments
- **GitHub Secrets**: Encrypted key-value pairs storing deployment credentials, service principal details, and deployment tokens
- **Key Vault Secrets**: Runtime secrets accessed by Function App (database credentials, API keys, connection strings)
- **Deployment Artifacts**: Compiled backend Functions app (zip) and built frontend static assets (dist folder)
- **Environment Configuration**: Parameters and variables defining environment-specific values (resource names, regions, SKUs)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Developer can push code to main branch and see automated deployment complete within 10 minutes without manual intervention
- **SC-002**: Infrastructure deployment workflow successfully provisions all required Azure resources in under 15 minutes on first run
- **SC-003**: Backend deployment workflow runs Prisma migrations successfully and deploys Functions with health endpoint returning HTTP 200 within 3 minutes
- **SC-004**: Frontend deployment workflow builds and deploys Static Web Apps with correct API URL in under 5 minutes
- **SC-005**: Zero secrets are committed to Git repository (verified by secret scanning tools)
- **SC-006**: Function App successfully retrieves all runtime secrets from Key Vault using Key Vault references (verified by app startup logs)
- **SC-007**: Deployment workflows fail gracefully with clear error messages when build, migration, or deployment errors occur
- **SC-008**: 100% of deployments to main branch are performed via automated workflows (zero manual deployments after pipeline is established)

## Assumptions & Dependencies

### Assumptions

- Azure subscription exists with appropriate permissions to create resources
- GitHub repository has Actions enabled
- Domain for Front Door (if custom domain required) is available and can be configured
- PostgreSQL Flexible Server can accept connections from Azure services (firewall rules configured)
- OpenAI API key, Stripe keys, and other third-party credentials are available for Key Vault storage
- Development team has access to Azure Portal for initial setup and troubleshooting
- Existing Prisma schema and migrations are stable and compatible with Azure PostgreSQL

### Dependencies

- **Azure CLI**: Required for local infrastructure deployment testing
- **Bicep CLI**: Required for authoring and validating infrastructure templates
- **GitHub Actions**: Required for CI/CD automation
- **Azure Service Principal**: Required for workflow authentication to Azure
- **Azure Static Web Apps Deployment Token**: Required for frontend deployment
- **Prisma CLI**: Required for database migration execution
- **Node.js and npm**: Required for building backend and frontend applications
- **Existing Backend**: Backend Functions app code (TypeScript) must be deployable to Azure Functions
- **Existing Frontend**: Frontend app (React/Vite) must build to static assets compatible with Static Web Apps

## Out of Scope

### Explicitly Not Included

- **Multi-environment pipelines**: This feature focuses on main branch deployment to production. Separate staging or development environments are not included (can be added later with environment-specific workflows)
- **Automated rollback**: Automatic rollback on failed deployments is not included. Manual rollback via Azure Portal or previous commit redeployment is expected
- **Blue-green deployments**: Advanced deployment strategies like blue-green or canary deployments are not included. Standard Azure Functions and Static Web Apps deployment mechanisms are used
- **Infrastructure drift detection**: Automated detection of manual infrastructure changes outside of Bicep templates is not included
- **Cost monitoring and alerts**: Budget alerts or cost analysis for Azure resources are not included in deployment pipeline
- **Performance testing**: Automated load testing or performance validation after deployment is not included
- **Database backup automation**: Automated PostgreSQL backups are assumed to be configured separately via Azure backup policies
- **Monitoring and observability**: Application Insights, logging, and alerting configuration are assumed to exist separately (not part of deployment pipeline setup)
- **Branch protection and approval gates**: Manual approval steps or required reviewers before deployment are not included (assumed to be configured separately in GitHub repo settings)
- **Third-party integrations**: Notifications to Slack, Microsoft Teams, or other external services beyond GitHub Actions built-in notifications are not included
