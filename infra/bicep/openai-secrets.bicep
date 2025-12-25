// Store Azure OpenAI configuration in Key Vault
// Constitution Principle X: Key Vault Supremacy

param keyVaultName string
param openAIEndpoint string
param openAIDeploymentName string
param openAIAccountName string

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Store OpenAI endpoint URL
resource secretOpenAIEndpoint 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'ai-foundry-endpoint'
  parent: kv
  properties: {
    value: openAIEndpoint
    contentType: 'Azure OpenAI Endpoint URL'
  }
}

// Store deployment/model name
resource secretOpenAIDeployment 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'ai-model-deployment'
  parent: kv
  properties: {
    value: openAIDeploymentName
    contentType: 'Azure OpenAI Model Deployment Name'
  }
}

// Store account name for key retrieval
resource secretOpenAIAccount 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'openai-account-name'
  parent: kv
  properties: {
    value: openAIAccountName
    contentType: 'Azure OpenAI Account Name'
  }
}

output endpointSecretUri string = secretOpenAIEndpoint.properties.secretUri
output deploymentSecretUri string = secretOpenAIDeployment.properties.secretUri
