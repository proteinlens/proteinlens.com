// Custom domain binding for Azure Static Web App
// Binds www.proteinlens.com to the Static Web App with managed SSL certificate

param staticWebAppName string
param customDomain string = 'www.proteinlens.com'

// Reference existing Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' existing = {
  name: staticWebAppName
}

// Custom domain binding for Static Web App
// Prerequisites:
// 1. DNS CNAME record: www.proteinlens.com -> <staticwebapp>.azurestaticapps.net
// 2. OR for apex domain: DNS ALIAS/A record pointing to Static Web App IP
resource customDomainBinding 'Microsoft.Web/staticSites/customDomains@2023-01-01' = {
  parent: staticWebApp
  name: customDomain
  properties: {
    // Azure automatically provisions and manages the SSL certificate
  }
}

output customDomain string = customDomain
output validationStatus string = customDomainBinding.properties.status
