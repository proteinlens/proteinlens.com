# Quickstart: Incremental CI Deploy

## Prerequisites

- GitHub Actions with OIDC configured to Azure
- GitHub repo variables:
  - `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_LOCATION`
  - `DNS_ZONE_NAME`, `FUNCTION_APP_NAME`, `STATIC_WEB_APP_NAME`
- GitHub secrets:
  - `AZURE_CLIENT_ID` (federated credential)
  - `POSTGRES_ADMIN_PASSWORD`
  - Optional: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Run

- Push to `main` for production auto-deploy
- Push to other branches for non-production deploys (default hostnames)

## Incremental Behavior

- Only infra changes → infra job runs
- Backend-only changes → infra → tests → backend → smoke tests
- Frontend-only changes → infra → tests → frontend → smoke tests
- Both app changes → infra → tests → both deploy → smoke tests

## Verification

- API health: GET `/api/health` must return 200 (with retry)
- Web root: GET `/` must return 200 and include product title marker
