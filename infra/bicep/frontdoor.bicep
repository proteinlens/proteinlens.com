// Azure Front Door CDN for ProteinLens (Optional)
// Provides global load balancing, WAF, and caching
// Note: This is an optional module for MVP

param location string = 'global' // Front Door is global resource
param frontDoorName string
param apiHostname string = '' // e.g., myfunc.azurewebsites.net
param webHostname string = '' // e.g., purple-rock-1234.z01.azurestaticapps.net
param customDomainRoot string = 'proteinlens.com'
param enableFrontDoor bool = true // Gate this optional resource
// DNS automation handled in workflow (CLI) to allow cross-RG updates

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

// Endpoint
resource endpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = if (enableFrontDoor) {
  name: '${frontDoor.name}/${frontDoorName}-ep'
  location: location
  properties: {
    enabledState: 'Enabled'
  }
}

// Origin groups
resource apiOriginGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = if (enableFrontDoor && !empty(apiHostname)) {
  name: '${frontDoor.name}/api-origins'
  properties: {
    healthProbeSettings: {
      probePath: '/api/health'
      probeRequestType: 'GET'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 60
    }
    loadBalancingSettings: {
      additionalLatencyInMilliseconds: 0
      sampleSize: 4
      successfulSamplesRequired: 3
    }
  }
}

resource webOriginGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = if (enableFrontDoor && !empty(webHostname)) {
  name: '${frontDoor.name}/web-origins'
  properties: {
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'GET'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 60
    }
    loadBalancingSettings: {
      additionalLatencyInMilliseconds: 0
      sampleSize: 4
      successfulSamplesRequired: 3
    }
  }
}

// Origins
resource apiOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = if (enableFrontDoor && !empty(apiHostname)) {
  name: '${frontDoor.name}/${apiOriginGroup.name}/api-origin'
  properties: {
    hostName: apiHostname
    httpPort: 80
    httpsPort: 443
    originHostHeader: apiHostname
    priority: 1
    weight: 50
    enabledState: 'Enabled'
  }
}

resource webOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = if (enableFrontDoor && !empty(webHostname)) {
  name: '${frontDoor.name}/${webOriginGroup.name}/web-origin'
  properties: {
    hostName: webHostname
    httpPort: 80
    httpsPort: 443
    originHostHeader: webHostname
    priority: 1
    weight: 50
    enabledState: 'Enabled'
  }
}

// Custom domains (managed certificates)
var wwwDomain string = 'www.${customDomainRoot}'
var apiDomain string = 'api.${customDomainRoot}'

resource wwwCd 'Microsoft.Cdn/profiles/customDomains@2023-05-01' = if (enableFrontDoor) {
  name: '${frontDoor.name}/www'
  properties: {
    hostName: wwwDomain
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource apiCd 'Microsoft.Cdn/profiles/customDomains@2023-05-01' = if (enableFrontDoor) {
  name: '${frontDoor.name}/api'
  properties: {
    hostName: apiDomain
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

// Routes mapping custom domains to origin groups via endpoint
resource routeWeb 'Microsoft.Cdn/profiles/routes@2023-05-01' = if (enableFrontDoor && !empty(webHostname)) {
  name: '${frontDoor.name}/route-web'
  properties: {
    supportedProtocols: [ 'Http', 'Https' ]
    patternSets: []
    patternsToMatch: [ '/' ]
    forwardingProtocol: 'MatchRequest'
    httpsRedirect: 'Enabled'
    originGroup: {
      id: webOriginGroup.id
    }
    customDomains: [
      {
        id: wwwCd.id
      }
    ]
    deploymentStatus: 'NotStarted'
    enabledState: 'Enabled'
    endpointName: endpoint.name
    linkToDefaultDomain: 'Disabled'
  }
}

resource routeApi 'Microsoft.Cdn/profiles/routes@2023-05-01' = if (enableFrontDoor && !empty(apiHostname)) {
  name: '${frontDoor.name}/route-api'
  properties: {
    supportedProtocols: [ 'Http', 'Https' ]
    patternSets: []
    patternsToMatch: [ '/api/*' ]
    forwardingProtocol: 'MatchRequest'
    httpsRedirect: 'Enabled'
    originGroup: {
      id: apiOriginGroup.id
    }
    customDomains: [
      {
        id: apiCd.id
      }
    ]
    deploymentStatus: 'NotStarted'
    enabledState: 'Enabled'
    endpointName: endpoint.name
    linkToDefaultDomain: 'Disabled'
  }
}


output frontDoorId string = enableFrontDoor ? frontDoor.id : ''
output frontDoorName string = enableFrontDoor ? frontDoor.name : ''
output frontDoorEndpointUrl string = enableFrontDoor ? 'https://${frontDoorName}.azurefd.net' : ''
output frontDoorEndpointHostname string = enableFrontDoor ? '${frontDoorName}.azurefd.net' : ''
output webCustomDomain string = enableFrontDoor ? wwwDomain : ''
output apiCustomDomain string = enableFrontDoor ? apiDomain : ''
