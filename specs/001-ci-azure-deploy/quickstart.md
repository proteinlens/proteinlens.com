# Quickstart: Deploy on Each Commit to Main

This feature adds a single GitHub Actions workflow that deploys infra → backend → frontend → smoke tests. Production requires Azure DNS zone `proteinlens.com`.

## Prerequisites
- Azure Subscription with Resource Group created or permissions to create
- Azure resources defined in `infra/bicep/main.bicep`
- GitHub OIDC federated credential configured to Azure (no client secret)
- GitHub repository `Actions` enabled

## Required GitHub Configuration
- Repository variables (Settings → Variables → Actions):
  - `AZURE_SUBSCRIPTION_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_RESOURCE_GROUP`
  - `AZURE_LOCATION` (e.g., `westeurope`)
  - `FUNCTION_APP_NAME`
  - `STATIC_WEB_APP_NAME`
  - `FRONTDOOR_NAME`
  - `DNS_ZONE_NAME` = `proteinlens.com`
- Repository secret:
  - `AZURE_CLIENT_ID` (federated workload identity app registration)

## How it works
- `infra`: Logs into Azure via OIDC and deploys `infra/bicep/main.bicep` idempotently to the RG; validates Azure DNS zone in prod.
- `deploy_backend`: Builds backend, validates `host.json` at zip root, deploys to Azure Functions (zip deploy).
- `deploy_frontend`: Builds frontend, validates `frontend/dist/index.html`, fetches SWA token via CLI, deploys via `Azure/static-web-apps-deploy` using ephemeral token.
- `smoke_test`: Verifies API health and web marker with retry/backoff.

## Running
Push to `main` to trigger. Monitor progress under Actions → Deploy.

## Notes
- Production is determined by `main` branch.
- If the Azure DNS zone is not found in production, the workflow fails with: "Move DNS zone to Azure DNS to enable zero-touch domains".
- Non-prod runs skip domain binding and use default Azure hostnames.
