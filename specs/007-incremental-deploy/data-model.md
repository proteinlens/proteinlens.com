# Data Model: Incremental CI Deploy

## Entities

- Environment
  - Fields: name (prod|non-prod), branch, dnsPolicy (requireAzureDNS in prod), endpoints (apiUrl, webUrl)
  - Relationships: uses ResourceGroup, RoutingLayer

- ResourceGroup
  - Fields: name, location, deploymentState (idempotent), dnsZoneExists (bool)

- RoutingLayer
  - Fields: apiHostname, webHostname, customDomains (prod), defaultHostnames (non-prod)

- ChangeFilters
  - Fields: infraChanged (bool), backendChanged (bool), frontendChanged (bool)
  - Derived: deployPlan (sequence based on changes)

- BackendArtifact
  - Fields: hasHostJsonRoot (bool), zipPath, packageSize

- FrontendArtifact
  - Fields: hasIndexHtml (bool), buildDir, assetCount

## Validation Rules

- Production requires `dnsZoneExists == true`, else fail-fast
- BackendArtifact must have `hasHostJsonRoot == true` prior to deploy
- FrontendArtifact must have `hasIndexHtml == true` prior to deploy

## State Transitions

- Infra: pending → applied → verified (idempotent)
- Backend: pending → built → validated → deployed → healthy
- Frontend: pending → built → validated → deployed → healthy
