// RG-scoped: Add Key Vault access policy for Function App identity
param keyVaultName string
param objectId string

resource kv 'Microsoft.KeyVault/vaults@2019-09-01' existing = {
  name: keyVaultName
}

resource accessPolicies 'Microsoft.KeyVault/vaults/accessPolicies@2019-09-01' = {
  name: 'add'
  parent: kv
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: objectId
        permissions: {
          secrets: [ 'get', 'list' ]
        }
      }
    ]
  }
}