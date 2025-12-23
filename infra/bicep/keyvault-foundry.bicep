// Key Vault secret and role assignment for OpenAI Foundry
// Constitution Principle X: Key Vault Supremacy

param keyVaultName string
param environmentName string
param secretName string = 'AZURE-OPENAI-API-KEY--${environmentName}'
@secure()
param secretValue string
param functionAppPrincipalId string

// Reference existing Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Store OpenAI API key as secret
resource openAISecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: secretName
  properties: {
    value: secretValue
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

// Grant Function App Managed Identity 'Key Vault Secrets User' role
// Role definition ID: 4633458b-17de-408a-b874-0445c86b69e6
resource secretUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, functionAppPrincipalId, '4633458b-17de-408a-b874-0445c86b69e6')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: functionAppPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output secretName string = openAISecret.name
output secretUri string = openAISecret.properties.secretUri
output secretUriWithVersion string = openAISecret.properties.secretUriWithVersion
