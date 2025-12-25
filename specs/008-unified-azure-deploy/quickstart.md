# Quickstart: One-Click Azure Deploy

This guide explains how to run the unified GitHub Actions workflow that provisions all Azure resources, deploys backend and frontend, configures DNS/TLS, and verifies both public endpoints.

## Prerequisites

- GitHub OIDC configured with Azure App registration (client-id/tenant-id/subscription-id available as non-secret repo variables/secrets)
- Permissions: Pipeline identity can deploy at subscription/RG scope and create role assignments
- DNS: `proteinlens.com` zone hosted in Azure DNS and accessible to the pipeline

## Run the Workflow

1. Push to `main` or dispatch the workflow manually (recommended on `main`).
2. Provide inputs:
   - `subscriptionId`
   - `resourceGroup` (e.g., `proteinlens-prod`)
   - `location` (default: `northeurope`)
3. The workflow performs:
   - Azure login via OIDC
   - Bicep deploy (subscription wrapper → RG modules)
   - Retrieve SWA token via `az staticwebapp secrets list`
   - Validate Functions package (must include `host.json` at zip root)
   - Deploy backend (publish profile)
   - Deploy frontend (SWA)
   - Configure Front Door routes and managed certs for `www` and `api`
   - Create/validate DNS records in Azure DNS
   - Health checks (retries) against Front Door: `/` and `/api/health`

## Verification

- Frontend: https://www.proteinlens.com returns 200 and contains the expected app marker (not SWA placeholder)
- Backend: https://api.proteinlens.com/api/health returns 200

## Outputs

The workflow uploads an artifact `deploy-outputs.json` conforming to [contracts/outputs.schema.json](specs/001-unified-azure-deploy/contracts/outputs.schema.json) and emits job outputs documented in [contracts/actions-outputs.md](specs/001-unified-azure-deploy/contracts/actions-outputs.md).

## Troubleshooting

- Storage naming errors: Ensure computed name ≤24 chars; see Bicep variable logic.
- OIDC login issues: Verify repo variables for `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` and federated credential setup.
- DNS validation pending: Confirm Azure DNS zone authority and that `_dnsauth` records exist; re-run job idempotently.
- Functions deploy 400: Check `host.json` at zip root; rebuild package.
