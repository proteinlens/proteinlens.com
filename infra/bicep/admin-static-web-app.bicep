// Azure Static Web Apps for ProteinLens Admin Dashboard
// Feature: 012-admin-dashboard
// Separate SWA for admin interface at admin.proteinlens.com

param location string = 'westeurope'
param adminStaticWebAppName string
param apiUrl string // Backend API URL (e.g., https://api.proteinlens.com)

// Note: Free tier is sufficient for admin dashboard (low traffic)
// Features: 1 custom domain, CDN, SSL, GitHub Actions integration
resource adminStaticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: adminStaticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appBuildCommand: 'npm run build --prefix admin'
      appLocation: 'admin'
      outputLocation: 'admin/dist'
      skipGithubActionWorkflowGeneration: true // We provide our own workflows
    }
  }
}

// Configure app settings (environment variables)
resource appSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: adminStaticWebApp
  name: 'appsettings'
  properties: {
    VITE_API_URL: apiUrl
  }
}

output adminStaticWebAppName string = adminStaticWebApp.name
output adminStaticWebAppId string = adminStaticWebApp.id
output adminStaticWebAppDefaultHostname string = adminStaticWebApp.properties.defaultHostname
output adminStaticWebAppUrl string = 'https://${adminStaticWebApp.properties.defaultHostname}'
