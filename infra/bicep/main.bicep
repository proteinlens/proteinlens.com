// Main orchestration for ProteinLens infrastructure
// Constitution compliance: All 7 principles implemented in infrastructure

param location string = resourceGroup().location
param environmentName string = 'dev'
param storageAccountName string = 'proteinlens${environmentName}${uniqueString(resourceGroup().id)}'
param functionAppName string = 'proteinlens-api-${environmentName}'
param keyVaultName string = 'proteinlens-kv-${environmentName}'

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
    storageAccountId: storage.outputs.storageAccountId
    keyVaultUri: keyVault.outputs.keyVaultUri
  }
}

// Deploy Key Vault
module keyVault './keyvault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    location: location
    keyVaultName: keyVaultName
    functionAppPrincipalId: functionApp.outputs.functionAppPrincipalId
  }
}

output storageAccountName string = storage.outputs.storageAccountName
output functionAppUrl string = functionApp.outputs.functionAppUrl
output keyVaultName string = keyVault.outputs.keyVaultName
