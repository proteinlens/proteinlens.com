# Bicep Parameter Contract: Production Environment

**Purpose**: Defines the required parameters for deploying ProteinLens infrastructure to production

**File**: `infra/parameters/prod.parameters.json`

## Schema

```jsonc
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    // Environment Configuration
    "environmentName": {
      "value": "prod"  // REQUIRED: "dev" | "staging" | "prod"
    },
    "location": {
      "value": "eastus"  // REQUIRED: Azure region (e.g., "eastus", "westus2", "westeurope")
    },
    "appNamePrefix": {
      "value": "proteinlens"  // REQUIRED: Prefix for all resource names (alphanumeric, no spaces)
    },
    
    // Function App Configuration
    "functionAppSku": {
      "value": "Y1"  // REQUIRED: "Y1" (Consumption) | "EP1" (Elastic Premium) | "P1V2" (Premium V2)
    },
    
    // PostgreSQL Configuration
    "postgresSkuName": {
      "value": "Standard_B1ms"  // REQUIRED: "Burstable_B1ms" | "Standard_B1ms" | "Standard_D2s_v3"
    },
    "postgresStorageSizeGB": {
      "value": 32  // REQUIRED: 32 | 64 | 128 | 256 (storage size in GB)
    },
    "postgresAdminUsername": {
      "value": "pgadmin"  // REQUIRED: Admin username (alphanumeric, not 'admin' or 'postgres')
    },
    "postgresAdminPassword": {
      "reference": {
        "keyVault": {
          "id": "/subscriptions/{subscription-id}/resourceGroups/{rg-name}/providers/Microsoft.KeyVault/vaults/{kv-name}"
        },
        "secretName": "database-admin-password"
      }
    },
    
    // Key Vault Configuration
    "keyVaultAccessObjectId": {
      "value": "00000000-0000-0000-0000-000000000000"  // REQUIRED: Object ID of service principal or managed identity
    },
    
    // Feature Flags
    "enableFrontDoor": {
      "value": false  // OPTIONAL: true | false (Phase 1: false, Phase 2: true)
    },
    "enableApplicationInsights": {
      "value": true  // OPTIONAL: true | false (default: true)
    }
  }
}
```

## Parameter Definitions

| Parameter | Type | Required | Description | Valid Values | Default |
|-----------|------|----------|-------------|--------------|---------|
| `environmentName` | String | Yes | Environment identifier | "dev", "staging", "prod" | N/A |
| `location` | String | Yes | Azure region | Any valid Azure region | N/A |
| `appNamePrefix` | String | Yes | Resource name prefix | Alphanumeric, 3-20 chars | N/A |
| `functionAppSku` | String | Yes | Function App pricing tier | "Y1", "EP1", "P1V2" | N/A |
| `postgresSkuName` | String | Yes | PostgreSQL server SKU | "Burstable_B1ms", "Standard_B1ms", "Standard_D2s_v3" | N/A |
| `postgresStorageSizeGB` | Int | Yes | PostgreSQL storage size | 32, 64, 128, 256 | N/A |
| `postgresAdminUsername` | String | Yes | PostgreSQL admin user | Alphanumeric, 1-63 chars | N/A |
| `postgresAdminPassword` | SecureString | Yes | PostgreSQL admin password | From Key Vault | N/A |
| `keyVaultAccessObjectId` | String | Yes | Object ID for Key Vault access | Valid AAD object ID | N/A |
| `enableFrontDoor` | Bool | No | Enable Azure Front Door | true, false | false |
| `enableApplicationInsights` | Bool | No | Enable App Insights | true, false | true |

## Resource Naming Convention

Resources will be named using the pattern: `{appNamePrefix}-{resourceType}-{environmentName}`

**Examples** (with `appNamePrefix="proteinlens"`, `environmentName="prod"`):
- Resource Group: `proteinlens-rg-prod`
- Function App: `proteinlens-api-prod`
- Static Web App: `proteinlens-web-prod`
- PostgreSQL Server: `proteinlens-pg-prod`
- Key Vault: `proteinlens-kv-prod`
- Storage Account: `proteinlensstorageprod` (no hyphens, globally unique)

## Deployment Command

```bash
az deployment group create \
  --resource-group proteinlens-rg-prod \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/prod.parameters.json
```

## Validation Rules

Bicep template enforces:
- `appNamePrefix`: Length 3-20, alphanumeric only
- `postgresAdminUsername`: Cannot be "admin", "postgres", "root"
- `postgresAdminPassword`: Minimum 8 characters, must include uppercase, lowercase, digit, special char
- `location`: Must be a valid Azure region
- `functionAppSku`: Must be one of allowed values

## Notes

- **Secrets**: Database password is referenced from Key Vault, never in plaintext
- **Idempotency**: Safe to re-run deployment; Bicep uses incremental mode
- **Outputs**: Deployment outputs resource IDs, URLs, and connection info (non-sensitive)
