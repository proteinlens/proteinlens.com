# Email Custom Domain Setup Guide

## Overview

ProteinLens uses Azure Communication Services (ACS) with a **custom domain** (`proteinlens.com`) for sending transactional emails. This improves email deliverability and prevents emails from being marked as spam.

## Why Custom Domain?

Using the Azure-managed domain (`*.azurecomm.net`) results in:
- ❌ Emails marked as spam by Gmail, Outlook, etc.
- ❌ Untrustworthy sender appearance
- ❌ No brand recognition

Using a custom domain provides:
- ✅ Professional sender address (`noreply@proteinlens.com`)
- ✅ Proper SPF, DKIM, DMARC authentication
- ✅ Better inbox placement rates
- ✅ Brand trust and recognition

## Setup Steps

### 1. Deploy Infrastructure (Automatic)

The custom domain is created automatically when deploying the infrastructure:

```bash
# Deploy will create the custom domain resource
gh workflow run "Deploy" --ref main
```

### 2. Get DNS Records from Azure Portal

After deployment:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **Communication Services** > `proteinlens-acs`
3. Click **Email** > **Domains**
4. Select **proteinlens.com**
5. Click **DNS Records** tab

You'll see records like:

| Type | Host | Value |
|------|------|-------|
| TXT | `proteinlens.com` | `ms=ms12345678` |
| TXT | `proteinlens.com` | `v=spf1 include:spf.protection.outlook.com -all` |
| CNAME | `selector1-azurecomm-prod-net._domainkey` | `selector1-...._domainkey.azurecomm.net` |
| CNAME | `selector2-azurecomm-prod-net._domainkey` | `selector2-...._domainkey.azurecomm.net` |

### 3. Add DNS Records

Add these records to your DNS provider (Cloudflare, Route53, etc.):

#### Domain Verification (TXT)
```
Type: TXT
Name: @
Value: ms=ms12345678
TTL: 3600
```

#### SPF Record (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:spf.protection.outlook.com -all
TTL: 3600
```

**Note**: If you already have an SPF record, merge them:
```
v=spf1 include:spf.protection.outlook.com include:_spf.google.com -all
```

#### DKIM Records (CNAME)
```
Type: CNAME
Name: selector1-azurecomm-prod-net._domainkey
Value: selector1-...._domainkey.azurecomm.net
TTL: 3600
```

```
Type: CNAME
Name: selector2-azurecomm-prod-net._domainkey
Value: selector2-...._domainkey.azurecomm.net
TTL: 3600
```

### 4. Verify Domain

1. Return to Azure Portal > Communication Services > Email > Domains
2. Click **Verify** on each record type
3. Wait for verification (can take up to 48 hours for DNS propagation)

### 5. Test Email Delivery

After verification:

```bash
# Trigger a test signup to send verification email
curl -X POST https://api.proteinlens.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@youremail.com", "password": "Test123!@#", "name": "Test"}'
```

Check inbox - email should arrive from `noreply@proteinlens.com` (not spam folder).

## Troubleshooting

### Email Still Going to Spam

1. **Check domain verification status** in Azure Portal
2. **Verify DKIM is enabled** - all CNAME records must be verified
3. **Check SPF** - ensure no conflicts with existing SPF records
4. **Wait 24-48 hours** - DNS changes need time to propagate globally

### Domain Verification Failing

1. **Verify exact values** - copy from Azure Portal, not this doc
2. **Check for typos** in DNS records
3. **Flush DNS cache**: `dig TXT proteinlens.com +short`
4. **Check propagation**: https://www.whatsmydns.net/

### Common DNS Errors

| Error | Cause | Fix |
|-------|-------|-----|
| SPF failure | Multiple SPF records | Merge into single TXT record |
| DKIM failure | CNAME not resolving | Check CNAME target is correct |
| Verification timeout | DNS not propagated | Wait and retry |

## Email Types Sent

The system sends these transactional emails:

| Type | From | Subject |
|------|------|---------|
| Verification | `noreply@proteinlens.com` | Verify your ProteinLens account |
| Password Reset | `noreply@proteinlens.com` | Reset your ProteinLens password |
| Password Changed | `noreply@proteinlens.com` | Your ProteinLens password was changed |

## References

- [Azure Communication Services Email Domains](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/add-custom-verified-domains)
- [Email Authentication Best Practices](https://learn.microsoft.com/en-us/azure/communication-services/concepts/email/email-authentication-best-practices)
- [SPF Record Syntax](https://www.spf-record.com/)
- [DKIM Explained](https://www.cloudflare.com/learning/dns/dns-records/dns-dkim-record/)
