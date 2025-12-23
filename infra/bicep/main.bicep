// Main orchestration for ProteinLens infrastructure
// Constitution compliance: All 7 principles implemented in infrastructure

// =============================================================================
// PARAMETERS
// =============================================================================

param location string = 'northeurope'
param environmentName string = 'dev'
param appNamePrefix string = 'proteinlens'

// Resource naming (ensure storage account name <=24 chars, lowercase, alphanumeric)
param storageAccountNameOverride string = ''
var saPrefix string = toLower(appNamePrefix)
var saEnv string = toLower(environmentName)
var saSuffix string = substring(uniqueString(resourceGroup().id), 0, 8)
var storageAccountNameRaw string = length(storageAccountNameOverride) > 0 ? storageAccountNameOverride : '${saPrefix}${saEnv}${saSuffix}'
var storageAccountName string = toLower(substring(storageAccountNameRaw, 0, 24))
param functionAppName string = '${appNamePrefix}-api-${environmentName}'

// Key Vault unique naming (avoid VaultAlreadyExists via RG-scoped uniqueString + deployment timestamp)
param keyVaultNamePrefix string = '${appNamePrefix}-kv-${environmentName}'
var kvSuffix string = substring(uniqueString(resourceGroup().id, deployment().name), 0, 8)
var keyVaultName string = toLower(substring('${keyVaultNamePrefix}-${kvSuffix}', 0, 24))
param postgresServerName string = '${appNamePrefix}-db-${environmentName}'
param staticWebAppName string = '${appNamePrefix}-web-${environmentName}'
param frontDoorName string = '${appNamePrefix}-fd-${environmentName}'
param aiHubName string = '${appNamePrefix}-ai-hub-${environmentName}'
param aiProjectName string = '${appNamePrefix}-ai-project-${environmentName}'

// Database parameters
param postgresAdminUsername string = 'pgadmin'
@secure()
param postgresAdminPassword string // Provided from Key Vault at deployment time

// Feature flags
param enableFrontDoor bool = false // Optional CDN/WAF layer
param enableAIFoundry bool = true // Enable AI Foundry for GPT-5.1 integration

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
    apiHostname: functionApp.outputs.functionAppDefaultHostname
    webHostname: staticWebApp.outputs.staticWebAppDefaultHostname
  }
}

// 7. AI Foundry (GPT-5.1 integration for intelligent meal analysis)
module aiFoundry 'ai-foundry.bicep' = if (enableAIFoundry) {
  name: 'ai-foundry-deployment'
  params: {
    location: location
    aiHubName: aiHubName
    aiProjectName: aiProjectName
    keyVaultId: keyVault.outputs.keyVaultId
    storageAccountId: storage.outputs.storageAccountId
    applicationInsightsId: ''  // Will be added if Application Insights created
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
output frontDoorEndpointHostname string = enableFrontDoor ? frontDoor.outputs.frontDoorEndpointHostname : ''
output webCustomDomain string = enableFrontDoor ? frontDoor.outputs.webCustomDomain : ''
output apiCustomDomain string = enableFrontDoor ? frontDoor.outputs.apiCustomDomain : ''

// AI Foundry (GPT-5.1 integration)
output aiFoundryEnabled bool = enableAIFoundry
output aiHubName string = enableAIFoundry ? aiFoundry.outputs.aiHubName : ''
output aiHubId string = enableAIFoundry ? aiFoundry.outputs.aiHubId : ''
output aiProjectName string = enableAIFoundry ? aiFoundry.outputs.aiProjectName : ''
output aiProjectId string = enableAIFoundry ? aiFoundry.outputs.aiProjectId : ''

// Connection strings (for documentation/manual testing)
@description('PostgreSQL connection string (with password placeholder)')
output databaseConnectionString string = 'postgresql://${postgres.outputs.postgresAdminUsername}:***@${postgres.outputs.postgresServerFqdn}:${postgres.outputs.postgresPort}/${postgres.outputs.databaseName}'
