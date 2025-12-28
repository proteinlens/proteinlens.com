// Azure Communication Services Email Module
// Creates ACS Communication Service and Email Service with Azure-managed domain
// Idempotent - can be run multiple times safely

@description('Base name for resources')
param baseName string

@description('Location for the Communication Service')
param location string = 'global'

@description('Data location for email service')
@allowed([
  'UnitedStates'
  'Europe'
  'Asia'
  'Australia'
  'Brazil'
  'Canada'
  'France'
  'Germany'
  'India'
  'Japan'
  'Korea'
  'Norway'
  'Switzerland'
  'UAE'
  'UK'
])
param dataLocation string = 'Europe'

@description('Tags for resources')
param tags object = {}

// Email Service (create first, or update if exists)
resource emailService 'Microsoft.Communication/emailServices@2023-06-01-preview' = {
  name: '${baseName}-email'
  location: location
  tags: tags
  properties: {
    dataLocation: dataLocation
  }
}

// Azure-managed domain (free tier with *.azurecomm.net)
resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-06-01-preview' = {
  parent: emailService
  name: 'AzureManagedDomain'
  location: location
  tags: tags
  properties: {
    domainManagement: 'AzureManagedDomain'
    userEngagementTracking: 'Disabled'
  }
}

// Communication Service (with linked email domain)
resource communicationService 'Microsoft.Communication/communicationServices@2023-06-01-preview' = {
  name: '${baseName}-acs'
  location: location
  tags: tags
  properties: {
    dataLocation: dataLocation
    linkedDomains: [
      emailDomain.id
    ]
  }
}

// Outputs
@description('Communication Service name')
output communicationServiceName string = communicationService.name

@description('Email Service name')
output emailServiceName string = emailService.name

@description('Email domain name')
output emailDomainName string = emailDomain.name

@description('Communication Service endpoint')
output endpoint string = communicationService.properties.hostName

@description('Email sender address (Azure-managed domain)')
output senderAddress string = 'DoNotReply@${emailDomain.properties.mailFromSenderDomain}'

@description('Communication Service resource ID')
output communicationServiceId string = communicationService.id
