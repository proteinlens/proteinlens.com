# Data Model: CI/CD Deploy Workflow

Date: 2025-12-23

## Entities

### Environment
- Fields: `name` (enum: `prod`, `nonprod`), `resourceGroup`, `subscriptionId`, `tenantId`
- Validation: `name=prod` only when ref is `main`
- Relationships: determines domain policy and targets for `FrontDoor`, `StaticWebApp`, `FunctionApp`

### ResourceGroup
- Fields: `name`, `location`
- Validation: must exist or be creatable via Bicep

### DNSZone
- Fields: `name` (e.g., `proteinlens.com`), `provider` (enum: `AzureDNS`)
- Validation: For `prod`, must exist in Azure

### FrontDoorEndpoint
- Fields: `name`, `frontendDomain` (default hostname), `customDomains` (`www.proteinlens.com`, `api.proteinlens.com`)
- Validation: In `prod`, `customDomains` must be bound; in `nonprod`, optional

### StaticWebApp
- Fields: `name`, `defaultHostname`, `token` (ephemeral), `appLocation` (`frontend`), `outputLocation` (`dist`)
- Validation: `frontend/dist/index.html` must exist prior to deploy

### FunctionApp
- Fields: `name`, `defaultHostname`, `packagePath` (zip), `hasHostJson` (bool)
- Validation: `host.json` must be at zip root

### DeployRun
- Fields: `commitSha`, `status` (enum), `startTime`, `endTime`, `logsUrl`
- Validation: `status=success` only when both smoke tests pass

## State Transitions
- `DeployRun`: `pending` → `infra_done` → `backend_done`/`frontend_done` → `smoke_passed` → `success` or `failed`

## Derived/Computed
- `StaticWebApp.token`: fetched via Azure CLI at deploy-time; not stored
- `FrontDoorEndpoint.customDomains`: present only in `prod`

## Constraints
- Storage account names must be 3–24 chars, lowercase letters and digits only; composition uses `take()` in Bicep for safe truncation
- No long-lived secrets in repo or GitHub; use OIDC and runtime token retrieval
