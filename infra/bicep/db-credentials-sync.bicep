// Database Credentials Synchronization
// This module ensures PostgreSQL password, Key Vault secret, and Function App settings
// are all synchronized, preventing authentication failures during deployments.

param location string = 'northeurope'
param subscriptionId string
param resourceGroupName string
param postgresServerName string
param keyVaultName string
@secure()
param postgresAdminPassword string
param postgresAdminUsername string = 'pgadmin'
param databaseName string = 'proteinlens'
param databasePort int = 5432
param functionAppName string = ''

// This uses a deployment script to run PowerShell
resource syncCredentialsScript 'Microsoft.Resources/deploymentScripts@2023-07-01' = {
  name: 'sync-db-credentials-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'AzurePowerShell'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    azPowerShellVersion: '11.0'
    scriptContent: '''
param(
    [string]$subscriptionId,
    [string]$resourceGroupName,
    [string]$postgresServerName,
    [string]$keyVaultName,
    [string]$databasePassword,
    [string]$databaseAdminUsername,
    [string]$databaseName,
    [int]$databasePort,
    [string]$functionAppName
)

$ErrorActionPreference = 'Stop'

Write-Host "=== Synchronizing Database Credentials ==="
Write-Host "PostgreSQL: $postgresServerName"
Write-Host "Key Vault: $keyVaultName"

try {
    # Set Azure context
    Set-AzContext -SubscriptionId $subscriptionId | Out-Null
    
    # Update PostgreSQL password
    Write-Host "Updating PostgreSQL password..."
    Update-AzPostgreSqlFlexibleServer `
        -ResourceGroupName $resourceGroupName `
        -Name $postgresServerName `
        -AdministratorLoginPassword (ConvertTo-SecureString $databasePassword -AsPlainText -Force) | Out-Null
    Write-Host "✓ PostgreSQL password updated"
    
    # Get FQDN and build connection string
    $postgresServer = Get-AzPostgreSqlFlexibleServer -ResourceGroupName $resourceGroupName -Name $postgresServerName
    $postgresServerFqdn = $postgresServer.FullyQualifiedDomainName
    $databaseUrl = "postgresql://${databaseAdminUsername}:${databasePassword}@${postgresServerFqdn}:${databasePort}/${databaseName}?sslmode=require"
    
    # Update Key Vault secrets
    Write-Host "Updating Key Vault secrets..."
    @('DATABASE-URL', 'database-url', 'DATABASE_ADMIN_PASSWORD', 'POSTGRES_PASSWORD') | ForEach-Object {
        $secretName = $_
        $secretValue = if ($secretName -match 'PASSWORD|PASS') { $databasePassword } else { $databaseUrl }
        
        try {
            Set-AzKeyVaultSecret -VaultName $keyVaultName `
                -Name $secretName `
                -SecretValue (ConvertTo-SecureString $secretValue -AsPlainText -Force) | Out-Null
            Write-Host "✓ Updated: $secretName"
        }
        catch {
            Write-Host "⚠ Skipped $secretName (may not exist): $($_.Exception.Message)"
        }
    }
    
    # Restart Function App if provided
    if ($functionAppName) {
        Write-Host "Restarting Function App..."
        Restart-AzFunctionApp -ResourceGroupName $resourceGroupName -Name $functionAppName | Out-Null
        Write-Host "✓ Function App restarted"
    }
    
    Write-Host "=== Credentials Synchronized ==="
}
catch {
    Write-Error "FAILED: $($_.Exception.Message)"
    exit 1
}
'''
    parameters: {
      subscriptionId: subscriptionId
      resourceGroupName: resourceGroupName
      postgresServerName: postgresServerName
      keyVaultName: keyVaultName
      databasePassword: postgresAdminPassword
      databaseAdminUsername: postgresAdminUsername
      databaseName: databaseName
      databasePort: databasePort
      functionAppName: functionAppName
    }
    timeout: 'PT30M'
    cleanupPreference: 'OnSuccess'
    retentionInterval: 'P1D'
  }
}

// Managed identity for the deployment script (needs permissions to manage resources)
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'sync-db-credentials-${uniqueString(resourceGroup().id)}'
  location: location
}

// Grant required permissions to the managed identity
resource postgresContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, managedIdentity.id, 'PostgreSQL')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8e3af657-a8ff-443c-a75c-2fe8c4bcb635') // Contributor
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output syncStatus string = 'Database credentials synchronized'
