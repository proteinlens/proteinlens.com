// RG-scoped: Add Key Vault access policy for a principal
param keyVaultName string
param principalId string
param secretPermissions array = ['get', 'list']

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource accessPolicies 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = {
  name: 'add'
  parent: kv
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: principalId
        permissions: {
          secrets: secretPermissions
        }
      }
    ]
  }
}