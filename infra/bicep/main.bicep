// Main orchestration for ProteinLens infrastructure
// Constitution compliance: All 7 principles implemented in infrastructure

param location string = resourceGroup().location
param environmentName string = 'dev'
param appNamePrefix string = 'proteinlens'
param storageAccountName string = '${appNamePrefix}${environmentName}${uniqueString(resourceGroup().id)}'
param functionAppName string = '${appNamePrefix}-api-${environmentName}'
param keyVaultName string = '${appNamePrefix}-kv-${environmentName}'
param postgresServerName string = '${appNamePrefix}-db-${environmentName}'
param staticWebAppName string = '${appNamePrefix}-web-${environmentName}'

// Deploy Key Vault first (needed by other modules)
module keyVault './keyvault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    location: location
    keyVaultName: keyVaultName
  }
}

// Deploy storage account with CORS
module storage './storage.bicep' = {
  name: 'storage-deployment'
  params: {
    location: location
    storageAccountName: storageAccountName
    blobContainerName: 'meal-photos'
  }
}

// Deploy Function App with Managed Identity
module functionApp './function-app.bicep' = {
  name: 'function-app-deployment'
  params: {
    location: location
    functionAppName: functionAppName
    storageAccountName: storage.outputs.storageAccountName
    keyVaultUri: keyVault.outputs.keyVaultUri
  }
}

// Grant Function App access to Key Vault after it's created
resource keyVaultAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = {
  name: '${keyVaultName}/add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: functionApp.outputs.functionAppPrincipalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
  }
}

// Output all critical infrastructure details
output resourceGroupName string = resourceGroup().name
output deploymentId string = deployment().name
output functionAppName string = functionApp.outputs.functionAppName
output functionAppUrl string = functionApp.outputs.functionAppUrl
output functionAppManagedIdentityId string = functionApp.outputs.functionAppPrincipalId
output staticWebAppName string = staticWebAppName
output staticWebAppUrl string = 'https://${staticWebAppName}.azurewebsites.net'
output postgresServerName string = postgresServerName
output postgresServerFqdn string = '${postgresServerName}.postgres.database.azure.com'
output keyVaultName string = keyVault.outputs.keyVaultName
output keyVaultUri string = keyVault.outputs.keyVaultUri
output storageAccountName string = storage.outputs.storageAccountName
output storageContainerName string = 'meal-photos'
