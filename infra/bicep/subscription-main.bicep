// Subscription-scoped wrapper to provision RG, core resources, RBAC, and secrets in one deployment
targetScope = 'subscription'

// Parameters
param location string = 'eastus2'
param resourceGroupName string
param environmentName string = 'prod'
param appNamePrefix string = 'proteinlens'

// Secure runtime secrets (passed from pipeline)
@secure()
param postgresAdminPassword string
@secure()
param openaiApiKey string = ''
@secure()
param stripeSecretKey string = ''
@secure()
param stripeWebhookSecret string = ''

// Create or ensure Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

// Deploy the existing RG-scoped stack into the new RG
module rgStack './main.bicep' = {
  name: 'rg-stack'
  scope: rg
  params: {
    location: location
    environmentName: environmentName
    appNamePrefix: appNamePrefix
    postgresAdminPassword: postgresAdminPassword
  }
}

// Existing resources references at RG scope
// RBAC and secrets are applied via RG-scoped modules

module kvAccess './kv-access.bicep' = {
  name: 'kv-access-policy'
  scope: rg
  params: {
    keyVaultName: rgStack.outputs.keyVaultName
    objectId: rgStack.outputs.functionAppPrincipalId
  }
}

module storageRbac './storage-rbac.bicep' = {
  name: 'storage-rbac'
  scope: rg
  params: {
    storageAccountName: rgStack.outputs.storageAccountName
    principalId: rgStack.outputs.functionAppPrincipalId
  }
}

module kvSecrets './kv-secrets.bicep' = {
  name: 'kv-secrets'
  scope: rg
  params: {
    keyVaultName: rgStack.outputs.keyVaultName
    postgresAdminPassword: postgresAdminPassword
    postgresAdminUsername: rgStack.outputs.postgresAdminUsername
    postgresServerFqdn: rgStack.outputs.postgresServerFqdn
    postgresPort: rgStack.outputs.postgresPort
    databaseName: rgStack.outputs.databaseName
    openaiApiKey: openaiApiKey
    stripeSecretKey: stripeSecretKey
    stripeWebhookSecret: stripeWebhookSecret
  }
}

// Outputs for workflow summaries
output resourceGroupName string = rg.name
output functionAppUrl string = rgStack.outputs.functionAppUrl
output staticWebAppUrl string = rgStack.outputs.staticWebAppUrl
output keyVaultUri string = rgStack.outputs.keyVaultUri
output storageAccountName string = rgStack.outputs.storageAccountName