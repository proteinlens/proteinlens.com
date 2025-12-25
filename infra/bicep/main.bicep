// Main orchestration for ProteinLens infrastructure
// Constitution compliance: All 7 principles implemented in infrastructure

// =============================================================================
// PARAMETERS
// =============================================================================

@allowed([
  'northeurope'
])
param location string = 'northeurope'
@description('Location for Static Web App (not available in all regions)')
@allowed([
  'westus2'
  'centralus'
  'eastus2'
  'westeurope'
  'eastasia'
])
param swaLocation string = 'westeurope'
param environmentName string = 'dev'
param appNamePrefix string = 'proteinlens'
@description('True when deploying production (used by pipeline policies)')
param isProd bool = false
@description('Primary domain for DNS policy checks')
param dnsZoneName string = 'proteinlens.com'
@description('Set by pipeline: whether Azure DNS zone exists (prod requires true)')
param dnsZoneExists bool = false

// Resource naming (ensure storage account name <=24 chars, lowercase, alphanumeric)
param storageAccountNameOverride string = ''
var saPrefix string = toLower(appNamePrefix)
var saEnv string = toLower(environmentName)
var saSuffix string = take(uniqueString(resourceGroup().id), 8)
var storageAccountNameRaw string = length(storageAccountNameOverride) > 0 ? storageAccountNameOverride : '${saPrefix}${saEnv}${saSuffix}'
var storageAccountName string = toLower(take(storageAccountNameRaw, 24))
param functionAppName string = '${appNamePrefix}-api-${environmentName}'

// Key Vault naming - use consistent name based on resource group only (not deployment name)
// This prevents creating a new Key Vault on each deployment
param keyVaultNameOverride string = ''
var kvSuffix string = take(uniqueString(resourceGroup().id), 8)
var keyVaultName string = length(keyVaultNameOverride) > 0 ? keyVaultNameOverride : toLower(take('${appNamePrefix}-kv-${kvSuffix}', 24))
param postgresServerName string = '${appNamePrefix}-db-${environmentName}'
param staticWebAppName string = '${appNamePrefix}-web-${environmentName}'
param frontDoorName string = '${appNamePrefix}-fd-${environmentName}'
param openAIAccountName string = '${appNamePrefix}-openai-${environmentName}'

// Database parameters
param postgresAdminUsername string = 'pgadmin'
@secure()
param postgresAdminPassword string // Provided from Key Vault at deployment time

// Feature flags
param enableFrontDoor bool = false // Optional CDN/WAF layer
param enableAIFoundry bool = true // Enable AI Foundry for GPT-5.1 integration
param enableCustomDomain bool = true // Enable custom domains (api.proteinlens.com, www.proteinlens.com)
param apiCustomDomainName string = 'api.proteinlens.com'
param webCustomDomainName string = 'www.proteinlens.com'

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

// NOTE: Storage RBAC assignments (Blob Data Owner, Queue Data Contributor, Table Data Contributor)
// are handled via Azure CLI in infra.yml workflow because the deployment service principal
// doesn't have Microsoft.Authorization/roleAssignments/write permission for ARM templates.
// See "Verify Function App Storage Access" step in infra.yml.

// 4b. Custom domain for Function App (api.proteinlens.com)
// Prerequisites: DNS CNAME record api.proteinlens.com -> proteinlens-api-prod.azurewebsites.net
module functionAppCustomDomain 'function-app-custom-domain.bicep' = if (enableCustomDomain) {
  name: 'function-app-custom-domain-deployment'
  params: {
    functionAppName: functionApp.outputs.functionAppName
    customDomain: apiCustomDomainName
    location: location
  }
}

// 4d. Key Vault access policy for Function App (uses access policies, not RBAC)
module kvAccessFunctionApp 'kv-access.bicep' = {
  name: 'kv-access-functionapp-deployment'
  params: {
    keyVaultName: keyVault.outputs.keyVaultName
    principalId: functionApp.outputs.functionAppPrincipalId
    secretPermissions: ['get', 'list']
  }
}

// NOTE: Database credentials sync is handled by the CI/CD pipeline (infra.yml)
// The pipeline runs sync-db-credentials after infrastructure deployment
// This avoids requiring Microsoft.Authorization/roleAssignments/write permission

// 5. Static Web App (frontend, can run in parallel with backend)
module staticWebApp 'static-web-app.bicep' = {
  name: 'static-web-app-deployment'
  params: {
    location: swaLocation
    staticWebAppName: staticWebAppName
    apiUrl: functionApp.outputs.functionAppUrl
  }
}

// 5b. Custom domain for Static Web App (www.proteinlens.com)
// Prerequisites: DNS CNAME record www.proteinlens.com -> <staticwebapp>.azurestaticapps.net
module staticWebAppCustomDomain 'static-web-app-custom-domain.bicep' = if (enableCustomDomain) {
  name: 'static-web-app-custom-domain-deployment'
  params: {
    staticWebAppName: staticWebApp.outputs.staticWebAppName
    customDomain: webCustomDomainName
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

// 7. Azure OpenAI (GPT-5.1 integration for intelligent meal analysis)
// Note: GPT-5.1 is only available in Sweden Central, not North Europe
module openAI 'openai-foundry.bicep' = if (enableAIFoundry) {
  name: 'openai-deployment'
  params: {
    location: 'swedencentral' // GPT-5.1 requires Sweden Central region
    environmentName: environmentName
    openAIAccountName: openAIAccountName
    modelDeploymentName: 'gpt-5-1'
    modelName: 'gpt-5.1'
    modelVersion: '2025-11-13'
    deploymentCapacity: 10
  }
}

// 7b. Store OpenAI secrets in Key Vault
module openAISecrets 'openai-secrets.bicep' = if (enableAIFoundry) {
  name: 'openai-secrets-deployment'
  params: {
    keyVaultName: keyVault.outputs.keyVaultName
    openAIEndpoint: openAI.outputs.openAIEndpoint
    openAIDeploymentName: openAI.outputs.modelDeploymentName
    openAIAccountName: openAI.outputs.openAIAccountName
  }
}

// =============================================================================
// OUTPUTS (Referenced by deployment workflow)
// =============================================================================

// Deployment metadata
output deploymentId string = deployment().name
output isProduction bool = isProd
output dnsZone string = dnsZoneName
output dnsZoneFound bool = dnsZoneExists

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
output functionAppAzureUrl string = functionApp.outputs.functionAppAzureUrl
output functionAppManagedIdentityId string = functionApp.outputs.functionAppPrincipalId
output functionAppPrincipalId string = functionApp.outputs.functionAppPrincipalId
output functionAppCustomDomainEnabled bool = enableCustomDomain

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
output staticWebAppUrl string = enableCustomDomain ? 'https://${webCustomDomainName}' : staticWebApp.outputs.staticWebAppUrl
output staticWebAppAzureUrl string = staticWebApp.outputs.staticWebAppUrl
output staticWebAppDefaultHostname string = staticWebApp.outputs.staticWebAppDefaultHostname
output staticWebAppCustomDomainEnabled bool = enableCustomDomain

// Front Door (optional)
output frontDoorEnabled bool = enableFrontDoor
@description('Front Door URL (empty if disabled)')
output frontDoorUrl string = enableFrontDoor ? frontDoor.outputs.frontDoorEndpointUrl : ''
output frontDoorName string = enableFrontDoor ? frontDoor.outputs.frontDoorName : ''
output frontDoorEndpointHostname string = enableFrontDoor ? frontDoor.outputs.frontDoorEndpointHostname : ''
output webCustomDomain string = enableFrontDoor ? frontDoor.outputs.webCustomDomain : ''
output apiCustomDomain string = enableFrontDoor ? frontDoor.outputs.apiCustomDomain : ''

// Azure OpenAI (GPT-5.1 integration)
output openAIEnabled bool = enableAIFoundry
output openAIAccountName string = enableAIFoundry ? openAI.outputs.openAIAccountName : ''
output openAIEndpoint string = enableAIFoundry ? openAI.outputs.openAIEndpoint : ''
output openAIDeploymentName string = enableAIFoundry ? openAI.outputs.modelDeploymentName : ''

// Connection strings (for documentation/manual testing)
@description('PostgreSQL connection string (with password placeholder)')
output databaseConnectionString string = 'postgresql://${postgres.outputs.postgresAdminUsername}:***@${postgres.outputs.postgresServerFqdn}:${postgres.outputs.postgresPort}/${postgres.outputs.databaseName}'
