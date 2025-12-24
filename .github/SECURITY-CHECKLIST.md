# Pre-Deployment Security Checklist

Complete this checklist **before** your first production deployment to ensure security best practices are met.

## GitHub Secret & Variables Configuration

- [ ] **AZURE_CLIENT_ID** - Azure AD app (OIDC) Client ID set
  - [ ] Federated credential created for this GitHub repo
  - [ ] Not exposed in any logs or commits
  - [ ] Role assignment scoped to target resource group

- [ ] **Repository Variables** configured
  - [ ] `AZURE_TENANT_ID`
  - [ ] `AZURE_SUBSCRIPTION_ID`
  - [ ] `AZURE_RESOURCE_GROUP`
  - [ ] `DNS_ZONE_NAME`

- [ ] **POSTGRES_ADMIN_PASSWORD** (optional) set if Bicep requires
  - [ ] Strong password (16+ chars, mixed case, numbers, symbols)
  - [ ] Not shared in plaintext anywhere
  - [ ] Stored in secure location (1Password, Vault, etc.)

## Azure Setup

- [ ] **Azure AD App Configured for OIDC**
  - [ ] App (Client) ID recorded as `AZURE_CLIENT_ID`
  - [ ] Federated credential added (issuer: GitHub, subject: repo)
  - [ ] Role: Contributor on resource group scope

- [ ] **Resource Group Prepared**
  - [ ] Naming follows pattern: proteinlens-{environment}
  - [ ] Region selected: eastus (or your preferred region)
  - [ ] Tags configured: env, team, cost-center, etc.

- [ ] **Key Vault Setup Verified**
  - [ ] Name follows pattern: proteinlens-kv-{env}
  - [ ] Access policy grants Function App Managed Identity "Get, List" on secrets
  - [ ] Soft delete enabled (90-day retention)
  - [ ] Purge protection enabled
  - [ ] Audit logging enabled

- [ ] **Storage Account Configured**
  - [ ] CORS rules set for frontend domain
  - [ ] Blob container created (proteinlens-uploads)
  - [ ] Access level: Private (not public)
  - [ ] Encryption at rest enabled (default)

- [ ] **PostgreSQL Server Setup**
  - [ ] Server created: proteinlens-db-{env}
  - [ ] Version: 14 or higher
  - [ ] SSL enforcement: REQUIRED
  - [ ] Firewall rule allows Function App subnet
  - [ ] Backup retention: 35 days minimum
  - [ ] Geo-redundant backup: Enabled

- [ ] **Function App Configured**
  - [ ] Runtime: Node.js 20 LTS
  - [ ] Managed Identity: System-assigned enabled
  - [ ] HTTPS only: Enabled
  - [ ] Minimum TLS version: 1.2

- [ ] **Static Web App Configured**
  - [ ] Custom domain configured
  - [ ] HTTPS enforced
  - [ ] API backend linked to Function App

## Code & Deployment

- [ ] **No Hardcoded Secrets**
  - [ ] Grep for common patterns:
    ```bash
    grep -r "password\|secret\|key\|token" \
      backend/src frontend/src --include="*.ts" --include="*.js"
    # Should not find any actual values
    ```
  - [ ] .env files not committed
  - [ ] Secrets only in GitHub Secrets or Key Vault

- [ ] **.gitignore Configured**
  - [ ] Covers all secret file patterns:
    - [ ] *.env
    - [ ] *.env.local
    - [ ] azure-credentials.json
    - [ ] publish-profile.xml
    - [ ] .secrets/
    - [ ] *.key, *.pem, *.p8
  - [ ] Tested: `git check-ignore -v <file>`

- [ ] **Branch Protection Enabled**
  - [ ] Main branch requires PR reviews (min 1)
  - [ ] Status checks required (workflows must pass)
  - [ ] Code owner reviews required
  - [ ] Stale PR approvals dismissed

- [ ] **Workflows Validated**
  - [ ] `deploy.yml` runs infra-first and is incremental
  - [ ] Workflows mask secrets in logs
  - [ ] Artifact uploads don't include secrets
  - [ ] Manual `workflow_dispatch` supported

- [ ] **API Security**
  - [ ] CORS configured for allowed domains only
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] Authentication required for sensitive operations
  - [ ] API keys not exposed in error messages

- [ ] **Database Security**
  - [ ] SQL injection prevention (parameterized queries)
  - [ ] Encryption in transit (SSL/TLS)
  - [ ] Encryption at rest (transparent data encryption)
  - [ ] Regular backups tested and restorable

## Monitoring & Logging

- [ ] **Application Insights Configured**
  - [ ] Connected to Function App
  - [ ] Connected to Static Web App
  - [ ] Log retention: 90 days minimum

- [ ] **Alerts Configured**
  - [ ] Failed function executions alert enabled
  - [ ] Error rate threshold: > 5% = alert
  - [ ] Performance degradation: > 2s response time = alert
  - [ ] Storage quota alerts enabled

- [ ] **Audit Logging**
  - [ ] Key Vault access logs enabled
  - [ ] Storage account access logs enabled
  - [ ] Database audit enabled
  - [ ] Azure AD sign-in logs monitored

## Post-Deployment Verification

- [ ] **Infrastructure Deployed Successfully**
  - [ ] Run: `az resource list --resource-group proteinlens-{env} --output table`
  - [ ] Verify all resources created (Function App, Static Web App, PostgreSQL, Key Vault, Storage)

- [ ] **Health Endpoint Accessible**
  - [ ] `/api/health` returns 200 and healthy status
  - [ ] Database connection working
  - [ ] Blob storage connection working

- [ ] **Frontend Deployment Verified**
  - [ ] Homepage loads without errors
  - [ ] API calls to backend succeed
  - [ ] No secrets exposed in network requests (check DevTools)

- [ ] **Database Accessible**
  - [ ] Connect to PostgreSQL: `psql -h {server}.postgres.database.azure.com -U {user}@{server} -d proteinlens`
  - [ ] Tables migrated successfully
  - [ ] Sample data loaded if applicable

- [ ] **Smoke Tests Pass**
  - [ ] Run: `scripts/smoke-test.sh`
  - [ ] All 3 phases pass (backend, frontend, e2e)
  - [ ] No timeouts or failures

## Security Incident Response

- [ ] **Secret Leaked in Git**
  - [ ] Remove from history: `git filter-branch --tree-filter 'rm -f <file>' HEAD`
  - [ ] Rotate the secret immediately
  - [ ] Update GitHub Secrets
  - [ ] Update Key Vault

- [ ] **Compromised Azure AD App**
  - [ ] Update federated credential configuration
  - [ ] Rotate role assignments as needed
  - [ ] Update `AZURE_CLIENT_ID` secret if app changed
  - [ ] Audit recent deployments

- [ ] **Database Password Compromised**
  - [ ] Change PostgreSQL admin password
  - [ ] Update DATABASE_ADMIN_PASSWORD secret
  - [ ] Update Key Vault secret
  - [ ] Force reconnection of all applications

## Compliance & Documentation

- [ ] **Security Documentation Updated**
  - [ ] Security model documented
  - [ ] Data flow diagrams created
  - [ ] Threat model completed

- [ ] **Team Training**
  - [ ] All team members read SECRETS_README.md
  - [ ] All team members read BRANCH-PROTECTION.md
  - [ ] Secret rotation procedure documented and tested

- [ ] **Deployment Runbook**
  - [ ] Emergency rollback procedure documented
  - [ ] Disaster recovery plan in place
  - [ ] Backup restoration tested

## Final Sign-Off

- [ ] **Security Lead Review**
  - [ ] Name: ____________________
  - [ ] Date: ____________________
  - [ ] Notes: ____________________

- [ ] **DevOps Lead Review**
  - [ ] Name: ____________________
  - [ ] Date: ____________________
  - [ ] Notes: ____________________

- [ ] **Ready for Production**
  - [ ] Date: ____________________
  - [ ] Deployment environment: [ ] Dev [ ] Staging [ ] Production
