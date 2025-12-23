// Azure PostgreSQL Flexible Server for ProteinLens
// Constitution Principle I: Database credentials in Key Vault

param location string = resourceGroup().location
param postgresServerName string
param postgresAdminUsername string
@secure()
param postgresAdminPassword string // Passed from Key Vault during deployment
param databaseName string = 'proteinlens'
param skuName string = 'Standard_B1ms' // Default: burstable tier
param storageSizeGB int = 32 // 32 GB storage (expandable)

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: postgresServerName
  location: location
  sku: {
    name: skuName
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: postgresAdminUsername
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: storageSizeGB
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled' // Can enable for production
    }
    network: {
      delegatedSubnetResourceId: '' // Leave empty for non-VNet deployment
      privateDnsZoneArmResourceId: ''
    }
    highAvailability: {
      mode: 'Disabled' // Disabled for dev/staging, enable for production
    }
    version: '14' // PostgreSQL 14
  }
}

// Allow Azure services to access the database
resource firewallRuleAzureServices 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0' // Special case: allows Azure services
  }
}

// Create database
resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

output postgresServerName string = postgresServer.name
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
output databaseName string = database.name
output postgresPort int = 5432
output postgresAdminUsername string = postgresAdminUsername
