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

// Reference the deployed storage account for role assignment
resource storageAccountRef 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

// Grant Function App Storage Blob Data Contributor role for blob access
resource storageBlobDataContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccountRef.id, functionAppName, 'Storage Blob Data Contributor')
  scope: storageAccountRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe') // Storage Blob Data Contributor
    principalId: functionApp.outputs.functionAppPrincipalId
    principalType: 'ServicePrincipal'
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
