// Azure Static Web Apps for ProteinLens frontend
// Provides CDN, SSL, authentication, and serverless functions

param location string = 'northeurope'
param staticWebAppName string
param repositoryUrl string = 'https://github.com/your-org/proteinlens.com'
param repositoryToken string = '' // GitHub personal access token (optional)
param apiUrl string // Backend API URL (e.g., https://proteinlens-api-prod.azurewebsites.net)

// Note: Free tier is sufficient for MVP
// Features: 1 custom domain, CDN, SSL, GitHub Actions integration
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // Repository configuration (optional - can be configured via GitHub UI)
    repositoryUrl: repositoryUrl
    repositoryToken: repositoryToken
    branch: 'main'
    buildProperties: {
      appBuildCommand: 'npm run build --prefix frontend'
      appLocation: 'frontend'
      outputLocation: 'frontend/dist'
      skipGithubActionWorkflowGeneration: true // We provide our own workflows
    }
  }
}

// Configure app settings (environment variables)
resource appSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    VITE_API_URL: apiUrl
  }
}

output staticWebAppName string = staticWebApp.name
output staticWebAppId string = staticWebApp.id
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
