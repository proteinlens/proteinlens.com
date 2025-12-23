# Data Model: One-Click Azure Deploy

Created: 23 Dec 2025

## Entities

- DeploymentRequest
  - fields: environment (string: prod), resourceGroup (string), subscriptionId (string), region (string: northeurope), dnsZone (string: proteinlens.com)
  - relationships: targets ResourceGroup

- ResourceGroup
  - fields: name, location
  - relationships: contains KeyVault, StorageAccount, PostgresServer, FunctionApp, StaticWebApp, FrontDoor, RoleAssignments, DnsZone

- KeyVault
  - fields: name, resourceId
  - relationships: contains Secret

- Secret
  - fields: name, contentType, version
  - relationships: belongsTo KeyVault; referencedBy AppSetting

- StorageAccount
  - fields: name, resourceId, containers[]
  - relationships: grants RBAC to ManagedIdentity

- PostgresServer
  - fields: name, resourceId, sku, version, fqdn
  - relationships: hosts Database

- Database
  - fields: name, owner (managed identity or AAD), connectionPolicy
  - relationships: belongsTo PostgresServer

- FunctionApp
  - fields: name, plan (Premium), runtime (Node 20), url, managedIdentityId
  - relationships: reads Secret via KeyVault reference; has Access to StorageAccount via RBAC

- StaticWebApp
  - fields: name, url, tokenRef (runtime fetch), environment (prod)
  - relationships: publishedBy CI Pipeline; frontedBy FrontDoor

- FrontDoor
  - fields: name, tier (Standard), customDomains [www, api], certificates (managed), routes
  - relationships: routesTo StaticWebApp (www), FunctionApp (api)

- RoleAssignment
  - fields: principalId, roleDefinition, scope
  - relationships: grants to ManagedIdentity or pipeline identity

- AppSetting
  - fields: name, value (Key Vault reference), slotSetting (bool)
  - relationships: belongsTo FunctionApp; references Secret

- WorkflowOutputs
  - fields: frontendUrl, backendUrl, keyVaultName, storageAccountName, postgresFqdn, resourceIds{}
  - relationships: exported by CI
