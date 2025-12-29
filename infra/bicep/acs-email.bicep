// Azure Communication Services Email Module
// Creates ACS Communication Service and Email Service with custom domain for better deliverability
// Idempotent - can be run multiple times safely

@description('Base name for resources')
param baseName string

@description('Location for Communication Services (must be global)')
param location string = 'global'

@description('Data location for email service')
@allowed([
  'unitedstates'
  'europe'
  'asia'
  'australia'
  'brazil'
  'canada'
  'france'
  'germany'
  'india'
  'japan'
  'korea'
  'norway'
  'switzerland'
  'uae'
  'uk'
])
param dataLocation string = 'europe'

@description('Custom email domain (e.g., proteinlens.com)')
param customEmailDomain string = 'proteinlens.com'

@description('Sender username for emails')
param senderUsername string = 'noreply'

@description('Sender display name')
param senderDisplayName string = 'ProteinLens'

@description('Whether the custom domain is verified and ready to be linked')
param domainVerified bool = false

@description('Tags for resources')
param tags object = {}

// Email Service (create first, or update if exists)
resource emailService 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: '${baseName}-email'
  location: location
  tags: tags
  properties: {
    dataLocation: dataLocation
  }
}

// Custom domain for professional email sending (better deliverability than Azure-managed)
// IMPORTANT: After deployment, you must add the DNS records shown in the Azure Portal
// to verify domain ownership. Navigate to:
// Azure Portal > Communication Services > Email > Domains > proteinlens.com > DNS Records
resource customDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = {
  parent: emailService
  name: customEmailDomain
  location: location
  tags: tags
  properties: {
    domainManagement: 'CustomerManaged'
    userEngagementTracking: 'Disabled'
  }
}

// Sender username for the custom domain (e.g., noreply@proteinlens.com)
resource senderUsernameResource 'Microsoft.Communication/emailServices/domains/senderUsernames@2023-04-01' = {
  parent: customDomain
  name: senderUsername
  properties: {
    username: senderUsername
    displayName: senderDisplayName
  }
}

// Communication Service (with linked custom email domain if verified)
resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: '${baseName}-acs'
  location: location
  tags: tags
  properties: {
    dataLocation: dataLocation
    // Only link domain if it's verified - linking an unverified domain will fail
    linkedDomains: domainVerified ? [
      customDomain.id
    ] : []
  }
}

// Outputs
@description('Communication Service name')
output communicationServiceName string = communicationService.name

@description('Email Service name')
output emailServiceName string = emailService.name

@description('Custom domain name')
output emailDomainName string = customDomain.name

@description('Communication Service endpoint')
output endpoint string = communicationService.properties.hostName

@description('Email sender address (custom domain)')
output senderAddress string = '${senderUsername}@${customEmailDomain}'

@description('Communication Service resource ID')
output communicationServiceId string = communicationService.id

@description('Connection string for email sending')
output connectionString string = communicationService.listKeys().primaryConnectionString

// DNS Records needed for domain verification (output for reference)
// After deployment, check Azure Portal for the exact values to add to your DNS:
// 1. TXT record for domain verification
// 2. TXT record for SPF (Sender Policy Framework)
// 3. CNAME records for DKIM (DomainKeys Identified Mail)
// Navigate to: Azure Portal > Communication Services > Email > Domains > [domain] > DNS Records
