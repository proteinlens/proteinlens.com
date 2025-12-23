// Azure OpenAI (Cognitive Services) for on-demand provisioning
// Constitution Principles IX (On-Demand Lifecycle), X (Key Vault Supremacy)

param location string = resourceGroup().location
param environmentName string
param openAIAccountName string = 'protein-lens-openai-${environmentName}'
param modelDeploymentName string = 'gpt-5-1'
param modelName string = 'gpt-5.1' // GPT-5.1 multimodal model
param modelVersion string = '2025-11-13' // Latest GPT-5.1 version
param deploymentCapacity int = 10 // TPM capacity

// Tags for cost tracking and governance (FR-014)
param tags object = {
  environment: environmentName
  service: 'openai'
  repo: 'proteinlens'
  managedBy: 'bicep'
}

// OpenAI Cognitive Services Account
resource openAIAccount 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: openAIAccountName
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0' // Standard tier
  }
  tags: tags
  properties: {
    customSubDomainName: openAIAccountName
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

// Model Deployment (e.g., gpt-5-1)
resource modelDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-10-01-preview' = {
  parent: openAIAccount
  name: modelDeploymentName
  sku: {
    name: 'GlobalStandard'
    capacity: deploymentCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: modelName
      version: modelVersion
    }
    raiPolicyName: 'Microsoft.Default' // Responsible AI policy
  }
}

// Outputs
output openAIAccountName string = openAIAccount.name
output openAIAccountId string = openAIAccount.id
output openAIEndpoint string = openAIAccount.properties.endpoint
output modelDeploymentName string = modelDeployment.name
output location string = location
