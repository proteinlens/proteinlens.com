// Azure Function App with Managed Identity
// Constitution Principle II: Least Privilege Access

param location string = 'northeurope'
param functionAppName string
param storageAccountName string
param appServicePlanName string = '${functionAppName}-plan'
param keyVaultUri string
@description('Comma-separated list of admin email addresses for admin dashboard access')
param adminEmails string = ''

@description('Azure Communication Services connection string for transactional emails')
@secure()
param acsConnectionString string = ''

@description('Email sender address (from ACS)')
param acsSenderAddress string = ''

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  kind: 'functionapp'
  sku: {
    name: 'EP1'  // Premium plan to avoid cold starts
    tier: 'ElasticPremium'
  }
  properties: {
    reserved: true  // Required for Linux
  }
}

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'  // Enable Managed Identity
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'AzureWebJobsFeatureFlags'
          value: 'EnableWorkerIndexing'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        // Use managed identity for AzureWebJobsStorage
        // RBAC roles (Blob Data Owner, Queue/Table Data Contributor) must be assigned
        // Storage account has allowSharedKeyAccess=false, so connection string won't work
        {
          name: 'AzureWebJobsStorage__accountName'
          value: storageAccountName
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccountName
        }
        {
          name: 'BLOB_CONTAINER_NAME'
          value: 'meal-photos'
        }
        // Azure OpenAI settings (new naming convention)
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/ai-foundry-endpoint/)'
        }
        {
          name: 'AZURE_OPENAI_DEPLOYMENT'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/ai-model-deployment/)'
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/openai-api-key/)'
        }
        // Legacy AI Foundry settings (for backward compatibility)
        {
          name: 'AI_FOUNDRY_ENDPOINT'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/ai-foundry-endpoint/)'
        }
        {
          name: 'AI_MODEL_DEPLOYMENT'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/ai-model-deployment/)'
        }
        {
          name: 'OPENAI_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/openai-api-key/)'
        }
        {
          name: 'DATABASE_URL'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/database-url/)'
        }
        {
          name: 'STRIPE_SECRET_KEY'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/stripe-secret-key/)'
        }
        {
          name: 'STRIPE_WEBHOOK_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/stripe-webhook-secret/)'
        }
        {
          name: 'HCAPTCHA_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/hcaptcha-secret/)'
        }
        {
          name: 'BLOB_STORAGE_CONNECTION'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/blob-storage-connection/)'
        }
        {
          name: 'SAS_TOKEN_EXPIRY_MINUTES'
          value: '10'
        }
        {
          name: 'MAX_FILE_SIZE_MB'
          value: '8'
        }
        // Admin Dashboard configuration (Feature 012)
        {
          name: 'ADMIN_EMAILS'
          value: adminEmails
        }
        // Azure Communication Services for transactional emails (signup verification, password reset)
        {
          name: 'ACS_EMAIL_CONNECTION_STRING'
          value: acsConnectionString
        }
        {
          name: 'ACS_EMAIL_SENDER'
          value: acsSenderAddress
        }
        {
          name: 'ACS_EMAIL_SENDER_NAME'
          value: 'ProteinLens'
        }
        {
          name: 'FRONTEND_URL'
          value: 'https://www.proteinlens.com'
        }
        // App URL for Stripe redirect URLs (checkout success/cancel)
        {
          name: 'APP_URL'
          value: 'https://www.proteinlens.com'
        }
        // Slack notifications for auth events (Feature 014)
        {
          name: 'SLACK_WEBHOOK_URL'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/slack-webhook-url/)'
        }
      ]
      cors: {
        allowedOrigins: [
          'http://localhost:5173'
          'http://localhost:5174'  // Admin dashboard dev server
          'http://localhost:3000'
          'https://www.proteinlens.com'
          'https://proteinlens.com'
          'https://admin.proteinlens.com'  // Admin dashboard
          'https://happy-stone-003f15b1e.azurestaticapps.net'
          'https://api.proteinlens.com'
        ]
        supportCredentials: true
      }
    }
  }
}

output functionAppName string = functionApp.name
output functionAppPrincipalId string = functionApp.identity.principalId
// Always output Azure URL - custom domain binding is separate
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppAzureUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppDefaultHostname string = functionApp.properties.defaultHostName
