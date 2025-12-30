// Azure Blob Storage with CORS for direct frontend uploads
// Constitution Principle III: Blob-First Ingestion

param location string = 'northeurope'
param storageAccountName string
param blobContainerName string = 'meal-photos'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false  // Comply with Azure security policy
    networkAcls: {
      defaultAction: 'Allow' // Can be restricted to specific VNets in production
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: [
            'http://localhost:5173'
            'http://localhost:5174'
            'http://localhost:5175'
            'http://localhost:3000'
            'https://www.proteinlens.com'
            'https://proteinlens.com'
            'https://admin.proteinlens.com'
            'https://white-moss-07b3a9303.6.azurestaticapps.net'
          ]
          allowedMethods: [
            'GET'
            'PUT'
            'POST'
            'OPTIONS'
          ]
          allowedHeaders: [
            '*'
          ]
          exposedHeaders: [
            '*'
          ]
          maxAgeInSeconds: 3600
        }
      ]
    }
    deleteRetentionPolicy: {
      enabled: true
      days: 7  // Soft delete for 7 days (recovery window)
    }
  }
}

resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: blobContainerName
  properties: {
    publicAccess: 'None'
  }
}

output storageAccountName string = storageAccount.name
output containerName string = container.name
output storageAccountId string = storageAccount.id
