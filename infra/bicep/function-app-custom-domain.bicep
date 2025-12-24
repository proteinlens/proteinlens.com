// Custom domain binding for Azure Function App
// Binds api.proteinlens.com to the Function App with managed SSL certificate

param functionAppName string
param customDomain string = 'api.proteinlens.com'

// Reference existing Function App
resource functionApp 'Microsoft.Web/sites@2023-01-01' existing = {
  name: functionAppName
}

// Custom hostname binding
// Prerequisites:
// 1. DNS CNAME record: api.proteinlens.com -> proteinlens-api-prod.azurewebsites.net
// 2. DNS TXT record for domain verification: asuid.api -> Function App custom domain verification ID
resource customHostnameBinding 'Microsoft.Web/sites/hostNameBindings@2023-01-01' = {
  parent: functionApp
  name: customDomain
  properties: {
    siteName: functionAppName
    hostNameType: 'Verified'
    sslState: 'Disabled' // Will be updated after certificate is created
  }
}

// App Service Managed Certificate (free SSL certificate)
// Note: This requires the custom hostname binding to exist first
resource managedCertificate 'Microsoft.Web/certificates@2023-01-01' = {
  name: '${functionAppName}-${replace(customDomain, '.', '-')}-cert'
  location: functionApp.location
  properties: {
    serverFarmId: functionApp.properties.serverFarmId
    canonicalName: customDomain
  }
  dependsOn: [
    customHostnameBinding
  ]
}

// Update hostname binding with SSL after certificate is created
// Note: This needs to be done in a separate deployment or via Azure CLI
// because Bicep doesn't support updating the same resource twice

output customDomain string = customDomain
output certificateThumbprint string = managedCertificate.properties.thumbprint
output certificateName string = managedCertificate.name
