// Azure AI Foundry for ProteinLens
// Provides access to GPT-5.1 and other AI models via Azure OpenAI
// Constitution Principle VII: Intelligent Analysis

param location string = 'northeurope'
param aiHubName string
param aiProjectName string
param keyVaultId string
param storageAccountId string
param applicationInsightsId string

// Azure AI Hub (manages AI resources and models)
resource aiHub 'Microsoft.MachineLearningServices/workspaces@2024-04-01' = {
  name: aiHubName
  location: location
  kind: 'Hub'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    friendlyName: 'ProteinLens AI Hub'
    description: 'AI Foundry hub for GPT-5.1 meal analysis'
    keyVault: keyVaultId
    storageAccount: storageAccountId
    applicationInsights: applicationInsightsId
    publicNetworkAccess: 'Enabled'
    hbiWorkspace: false
  }
}

// Azure AI Project (workspace for AI models within the hub)
resource aiProject 'Microsoft.MachineLearningServices/workspaces@2024-04-01' = {
  name: aiProjectName
  location: location
  kind: 'Project'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    friendlyName: 'ProteinLens AI Project'
    description: 'Project for GPT-5.1 integration'
    keyVault: keyVaultId
    storageAccount: storageAccountId
    applicationInsights: applicationInsightsId
    hubResourceId: aiHub.id
    publicNetworkAccess: 'Enabled'
    hbiWorkspace: false
  }
}

// Output the AI Foundry details
output aiHubName string = aiHub.name
output aiHubId string = aiHub.id
output aiProjectName string = aiProject.name
output aiProjectId string = aiProject.id
output aiHubManagedIdentityId string = aiHub.identity.principalId
output aiProjectManagedIdentityId string = aiProject.identity.principalId
