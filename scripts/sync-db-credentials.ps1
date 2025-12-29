#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Synchronizes PostgreSQL credentials and JWT secrets with Azure Key Vault.
    Ensures both the database and the backend have the same credentials.

.DESCRIPTION
    This script is idempotent and should be run as part of infrastructure deployment.
    It guarantees that:
    1. PostgreSQL server has the correct admin password
    2. Key Vault DATABASE-URL secret is updated
    3. JWT secret exists in Key Vault (generates if missing)
    4. Function App settings are refreshed with Key Vault references
    5. Function App is restarted to apply changes

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

.PARAMETER JwtIssuer
    JWT issuer claim (default: proteinlens-api)

.PARAMETER JwtAudience
    JWT audience claim (default: proteinlens-frontend)

.PARAMETER RotateJwtSecret
    Force rotation of JWT secret (invalidates all existing tokens)

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
    [string]$JwtIssuer = 'proteinlens-api',

    [Parameter(Mandatory = $false)]
    [string]$JwtAudience = 'proteinlens-frontend',

    [Parameter(Mandatory = $false)]
    [switch]$RotateJwtSecret,

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

    # 5. Ensure JWT secret exists in Key Vault
    Write-Information "Checking JWT secret in Key Vault..."
    $jwtSecretName = 'jwt-secret'
    $jwtSecretExists = $false
    
    try {
        $existingJwtSecret = Get-AzKeyVaultSecret -VaultName $KeyVaultName -Name $jwtSecretName -ErrorAction SilentlyContinue
        $jwtSecretExists = $null -ne $existingJwtSecret
    }
    catch {
        $jwtSecretExists = $false
    }

    if (-not $jwtSecretExists -or $RotateJwtSecret) {
        if ($RotateJwtSecret) {
            Write-Information "Rotating JWT secret as requested..."
        } else {
            Write-Information "JWT secret not found, generating new one..."
        }
        
        # Generate cryptographically secure JWT secret (64 bytes = 512 bits)
        $jwtSecretBytes = New-Object byte[] 64
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($jwtSecretBytes)
        $jwtSecretValue = [Convert]::ToBase64String($jwtSecretBytes)
        
        $contentType = if ($RotateJwtSecret) {
            "JWT signing key - rotated $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
        } else {
            "JWT signing key"
        }
        
        Set-AzKeyVaultSecret -VaultName $KeyVaultName `
            -Name $jwtSecretName `
            -SecretValue (ConvertTo-SecureString $jwtSecretValue -AsPlainText -Force) `
            -ContentType $contentType | Out-Null
        Write-Information "✓ JWT secret stored in Key Vault"
    } else {
        Write-Information "✓ JWT secret already exists in Key Vault"
    }

    # 6. Update Function App settings (if name provided)
    if (-not [string]::IsNullOrEmpty($FunctionAppName)) {
        Write-Information "Refreshing Function App settings..."
        try {
            # Force Key Vault reference refresh by re-setting the app setting
            $functionApp = Get-AzFunctionApp -ResourceGroupName $ResourceGroupName -Name $FunctionAppName

            # Get Key Vault URI
            $keyVault = Get-AzKeyVault -VaultName $KeyVaultName
            $keyVaultUri = $keyVault.VaultUri.TrimEnd('/')

            # Update app settings to force refresh of Key Vault references
            $settings = $functionApp.ApplicationSettings
            $settings['WEBSITE_OVERRIDE_STICKY_DIAGNOSTICS_SETTINGS'] = '0'
            $settings['WEBSITE_SLOT_POLL_WORKER_FOR_CHANGE_NOTIFICATION'] = '1'
            
            # Set DATABASE_URL as Key Vault reference
            $settings['DATABASE_URL'] = "@Microsoft.KeyVault(SecretUri=$keyVaultUri/secrets/database-url)"
            
            # Set JWT settings
            $settings['JWT_SECRET'] = "@Microsoft.KeyVault(SecretUri=$keyVaultUri/secrets/jwt-secret)"
            $settings['JWT_ISSUER'] = $JwtIssuer
            $settings['JWT_AUDIENCE'] = $JwtAudience
            
            # Track when credentials were last synced
            $settings['CREDENTIALS_SYNCED_AT'] = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
            
            if ($RotateJwtSecret) {
                $settings['JWT_SECRET_ROTATED_AT'] = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
            }
            
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
