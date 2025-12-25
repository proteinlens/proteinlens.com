# GitHub Actions Outputs Contract

This feature’s unified workflow MUST publish the following outputs for downstream jobs and audit artifacts.

- frontendUrl: Public URL for the frontend (via Front Door) – e.g., https://www.proteinlens.com
- backendUrl: Public URL for the backend API (via Front Door) – e.g., https://api.proteinlens.com
- resourceGroup: Resource group name used for deployment
- subscriptionId: Azure subscription ID
- keyVaultName: Key Vault name storing production secrets
- storageAccountName: Storage account name for blobs
- postgresServerName: PostgreSQL Flexible Server name
- postgresFqdn: Server FQDN for database connections
- functionAppName: Azure Functions app name
- staticWebAppName: Azure Static Web App name
- frontDoorName: Azure Front Door profile name
- dnsZoneResourceId: Resource ID of Azure DNS zone (if applicable)

Validation: The JSON artifact containing these outputs MUST validate against outputs.schema.json.
