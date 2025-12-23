// Main orchestration for ProteinLens infrastructure
// Constitution compliance: All 7 principles implemented in infrastructure

// =============================================================================
// PARAMETERS
// =============================================================================

param location string = resourceGroup().location
param environmentName string = 'dev'
param appNamePrefix string = 'proteinlens'

// Resource naming
param storageAccountName string = '${appNamePrefix}${environmentName}${uniqueString(resourceGroup().id)}'
param functionAppName string = '${appNamePrefix}-api-${environmentName}'
param keyVaultName string = '${appNamePrefix}-kv-${environmentName}'
param postgresServerName string = '${appNamePrefix}-db-${environmentName}'
param staticWebAppName string = '${appNamePrefix}-web-${environmentName}'
param frontDoorName string = '${appNamePrefix}-fd-${environmentName}'

// Database parameters
param postgresAdminUsername string = 'pgadmin'
@secure()
param postgresAdminPassword string // Provided from Key Vault at deployment time

// Feature flags
param enableFrontDoor bool = false // Optional CDN/WAF layer

// =============================================================================
// DEPLOYMENTS
// =============================================================================

// 1. Key Vault (deployed first)
module keyVault 'keyvault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    location: location
    keyVaultName: keyVaultName
  }
}

// 2. Storage Account (for meal photos, no dependencies)
module storage 'storage.bicep' = {
  name: 'storage-deployment'
  params: {
    location: location
    storageAccountName: storageAccountName
    blobContainerName: 'meal-photos'
  }
}

// 3. PostgreSQL Database (independent deployment)
module postgres 'postgres.bicep' = {
  name: 'postgres-deployment'
  params: {
    location: location
    postgresServerName: postgresServerName
    postgresAdminUsername: postgresAdminUsername
    postgresAdminPassword: postgresAdminPassword
    databaseName: 'proteinlens'
    skuName: 'Standard_B1ms'
    storageSizeGB: 32
  }
}

// 4. Function App (depends on Key Vault and Storage)
module functionApp 'function-app.bicep' = {
  name: 'function-app-deployment'
  params: {
    location: location
    functionAppName: functionAppName
    storageAccountName: storage.outputs.storageAccountName
    keyVaultUri: keyVault.outputs.keyVaultUri
  }
}

// 5. Static Web App (frontend, can run in parallel with backend)
module staticWebApp 'static-web-app.bicep' = {
  name: 'static-web-app-deployment'
  params: {
    location: location
    staticWebAppName: staticWebAppName
    apiUrl: functionApp.outputs.functionAppUrl
  }
}

// 6. Front Door (optional CDN layer for global distribution)
module frontDoor 'frontdoor.bicep' = if (enableFrontDoor) {
  name: 'frontdoor-deployment'
  params: {
    location: 'global'
    frontDoorName: frontDoorName
    enableFrontDoor: enableFrontDoor
  }
}

// =============================================================================
// OUTPUTS (Referenced by deployment workflow)
// =============================================================================

// Deployment metadata
output deploymentId string = deployment().name

// Resource Group
output resourceGroupName string = resourceGroup().name
output resourceGroupId string = resourceGroup().id

// Key Vault
output keyVaultName string = keyVault.outputs.keyVaultName
output keyVaultId string = keyVault.outputs.keyVaultId
output keyVaultUri string = keyVault.outputs.keyVaultUri

// Backend (Function App)
output functionAppName string = functionApp.outputs.functionAppName
output functionAppUrl string = functionApp.outputs.functionAppUrl
output functionAppManagedIdentityId string = functionApp.outputs.functionAppPrincipalId
output functionAppPrincipalId string = functionApp.outputs.functionAppPrincipalId

// Database
output postgresServerName string = postgres.outputs.postgresServerName
output postgresServerFqdn string = postgres.outputs.postgresServerFqdn
output postgresAdminUsername string = postgres.outputs.postgresAdminUsername
output databaseName string = postgres.outputs.databaseName
output postgresPort int = postgres.outputs.postgresPort

// Storage
output storageAccountName string = storage.outputs.storageAccountName
output storageContainerName string = 'meal-photos'
output storageAccountId string = storage.outputs.storageAccountId

// Frontend (Static Web App)
output staticWebAppName string = staticWebApp.outputs.staticWebAppName
output staticWebAppUrl string = staticWebApp.outputs.staticWebAppUrl
output staticWebAppDefaultHostname string = staticWebApp.outputs.staticWebAppDefaultHostname

// Front Door (optional)
output frontDoorEnabled bool = enableFrontDoor
@description('Front Door URL (empty if disabled)')
output frontDoorUrl string = enableFrontDoor ? frontDoor.outputs.frontDoorEndpointUrl : ''
output frontDoorName string = enableFrontDoor ? frontDoor.outputs.frontDoorName : ''

// Connection strings (for documentation/manual testing)
@description('PostgreSQL connection string (with password placeholder)')
output databaseConnectionString string = 'postgresql://${postgres.outputs.postgresAdminUsername}:***@${postgres.outputs.postgresServerFqdn}:${postgres.outputs.postgresPort}/${postgres.outputs.databaseName}'
