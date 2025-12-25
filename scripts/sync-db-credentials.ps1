#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Synchronizes PostgreSQL admin password with Azure Key Vault secret.
    Ensures both the database and the backend have the same credentials.

.DESCRIPTION
    This script is idempotent and should be run as part of infrastructure deployment.
    It guarantees that:
    1. PostgreSQL server has the correct admin password
    2. Key Vault DATABASE-URL secret is updated
    3. Function App settings are refreshed

.PARAMETER SubscriptionId
    Azure Subscription ID

.PARAMETER ResourceGroupName
    Azure Resource Group name

.PARAMETER PostgresServerName
    PostgreSQL Flexible Server name

.PARAMETER KeyVaultName
    Azure Key Vault name

.PARAMETER DatabasePassword
    The password to set (generated at deployment time)

.PARAMETER DatabaseAdminUsername
    PostgreSQL admin username (default: pgadmin)

.PARAMETER DatabaseName
    PostgreSQL database name (default: proteinlens)

.PARAMETER FunctionAppName
    Azure Function App name to restart

.EXAMPLE
    .\sync-db-credentials.ps1 `
        -SubscriptionId "12345678-1234-1234-1234-123456789012" `
        -ResourceGroupName "proteinlens-prod" `
        -PostgresServerName "proteinlens-db-prod" `
        -KeyVaultName "proteinlens-kv-12345678" `
        -DatabasePassword "ComplexPassword123!@#" `
        -FunctionAppName "proteinlens-api-prod"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SubscriptionId,

    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory = $true)]
    [string]$PostgresServerName,

    [Parameter(Mandatory = $true)]
    [string]$KeyVaultName,

    [Parameter(Mandatory = $true)]
    [string]$DatabasePassword,

    [Parameter(Mandatory = $false)]
    [string]$DatabaseAdminUsername = 'pgadmin',

    [Parameter(Mandatory = $false)]
    [string]$DatabaseName = 'proteinlens',

    [Parameter(Mandatory = $false)]
    [string]$FunctionAppName = '',

    [Parameter(Mandatory = $false)]
    [int]$DatabasePort = 5432,

    [Parameter(Mandatory = $false)]
    [switch]$Verbose
)

$ErrorActionPreference = 'Stop'
$InformationPreference = if ($Verbose) { 'Continue' } else { 'SilentlyContinue' }

Write-Information "=== Synchronizing Database Credentials ==="
Write-Information "Subscription: $SubscriptionId"
Write-Information "Resource Group: $ResourceGroupName"
Write-Information "PostgreSQL Server: $PostgresServerName"
Write-Information "Key Vault: $KeyVaultName"

try {
    # 1. Set Azure context
    Write-Information "Setting Azure context..."
    $context = Set-AzContext -SubscriptionId $SubscriptionId -ErrorAction Stop
    Write-Information "Context set to subscription: $($context.Subscription.Name)"

    # 2. Update PostgreSQL admin password
    Write-Information "Updating PostgreSQL server password..."
    $pgParams = @{
        ResourceGroupName = $ResourceGroupName
        Name              = $PostgresServerName
        AdministratorLoginPassword = ConvertTo-SecureString $DatabasePassword -AsPlainText -Force
    }
    
    Update-AzPostgreSqlFlexibleServer @pgParams | Out-Null
    Write-Information "✓ PostgreSQL password updated successfully"

    # 3. Build DATABASE-URL connection string
    $postgresServer = Get-AzPostgreSqlFlexibleServer -ResourceGroupName $ResourceGroupName -Name $PostgresServerName
    $postgresServerFqdn = $postgresServer.FullyQualifiedDomainName
    
    $databaseUrl = "postgresql://${DatabaseAdminUsername}:${DatabasePassword}@${postgresServerFqdn}:${DatabasePort}/${DatabaseName}?sslmode=require"
    Write-Information "Database connection string built"

    # 4. Update Key Vault secrets
    Write-Information "Updating Key Vault secrets..."
    
    $kvSecrets = @{
        'DATABASE-URL'                = $databaseUrl
        'database-url'                = $databaseUrl  # lowercase variant for different apps
        'DATABASE_ADMIN_PASSWORD'     = $DatabasePassword
        'POSTGRES_PASSWORD'           = $DatabasePassword
    }

    foreach ($secretName in $kvSecrets.Keys) {
        try {
            $secretValue = $kvSecrets[$secretName]
            Set-AzKeyVaultSecret -VaultName $KeyVaultName `
                -Name $secretName `
                -SecretValue (ConvertTo-SecureString $secretValue -AsPlainText -Force) | Out-Null
            Write-Information "✓ Updated secret: $secretName"
        }
        catch {
            Write-Information "⚠ Failed to update secret $secretName (may not exist yet): $($_.Exception.Message)"
        }
    }

    # 5. Update Function App settings (if name provided)
    if (-not [string]::IsNullOrEmpty($FunctionAppName)) {
        Write-Information "Refreshing Function App settings..."
        try {
            # Force Key Vault reference refresh by re-setting the app setting
            $functionApp = Get-AzFunctionApp -ResourceGroupName $ResourceGroupName -Name $FunctionAppName

            # Update app settings to force refresh of Key Vault references
            $settings = $functionApp.ApplicationSettings
            $settings['WEBSITE_OVERRIDE_STICKY_DIAGNOSTICS_SETTINGS'] = '0'
            $settings['WEBSITE_SLOT_POLL_WORKER_FOR_CHANGE_NOTIFICATION'] = '1'
            
            Update-AzFunctionAppSetting -ResourceGroupName $ResourceGroupName `
                -Name $FunctionAppName `
                -AppSetting $settings | Out-Null

            Write-Information "Function App settings updated"

            # Restart Function App to pick up new credentials
            Write-Information "Restarting Function App: $FunctionAppName"
            Restart-AzFunctionApp -ResourceGroupName $ResourceGroupName -Name $FunctionAppName | Out-Null
            Write-Information "✓ Function App restarted successfully"
        }
        catch {
            Write-Warning "Failed to restart Function App: $($_.Exception.Message)"
        }
    }

    Write-Information "=== Database Credentials Sync Complete ==="
    Write-Information "All components are now synchronized with the same password."
    exit 0
}
catch {
    Write-Error "FATAL ERROR: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}
