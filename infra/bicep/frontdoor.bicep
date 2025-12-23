// Azure Front Door CDN for ProteinLens (Optional)
// Provides global load balancing, WAF, and caching
// Note: This is an optional module for MVP

param location string = 'global' // Front Door is global resource
param frontDoorName string
param functionAppUrl string = '' // Backend API endpoint (optional)
param staticWebAppUrl string = '' // Frontend endpoint (optional)
param enableFrontDoor bool = false // Gate this optional resource

// Only create if enabled
resource frontDoor 'Microsoft.Cdn/profiles@2023-05-01' = if (enableFrontDoor) {
  name: frontDoorName
  location: location
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

output frontDoorId string = enableFrontDoor ? frontDoor.id : ''
output frontDoorName string = enableFrontDoor ? frontDoor.name : ''
output frontDoorEndpointUrl string = enableFrontDoor ? 'https://${frontDoorName}.azurefd.net' : ''
