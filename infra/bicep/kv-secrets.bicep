// RG-scoped: Seed essential Key Vault secrets
param keyVaultName string
@secure()
param postgresAdminPassword string
param postgresAdminUsername string
param postgresServerFqdn string
param postgresPort int = 5432
param databaseName string
@secure()
param openaiApiKey string = ''
@secure()
param stripeSecretKey string = ''
@secure()
param stripeWebhookSecret string = ''

var dbUrl = 'postgresql://${postgresAdminUsername}:${postgresAdminPassword}@${postgresServerFqdn}:${postgresPort}/${databaseName}'

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource secretDatabaseUrl 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'DATABASE-URL'
  parent: kv
  properties: {
    value: dbUrl
  }
}

resource secretOpenAI 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (openaiApiKey != '') {
  name: 'OPENAI-API-KEY'
  parent: kv
  properties: {
    value: openaiApiKey
  }
}

resource secretStripeKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (stripeSecretKey != '') {
  name: 'STRIPE-SECRET-KEY'
  parent: kv
  properties: {
    value: stripeSecretKey
  }
}

resource secretStripeWebhook 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (stripeWebhookSecret != '') {
  name: 'STRIPE-WEBHOOK-SECRET'
  parent: kv
  properties: {
    value: stripeWebhookSecret
  }
}