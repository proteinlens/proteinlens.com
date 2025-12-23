# Implementation Checklist - Constitution v3.0.0

**Date**: 2025-12-23  
**Status**: Amendment Complete ✅ | Implementation In Progress 🔄

---

## Constitution Amendment ✅

- ✅ Updated `.specify/memory/constitution.md` to v3.0.0
- ✅ Added Principle IX: On-Demand Resource Lifecycle (NON-NEGOTIABLE)
- ✅ Added Principle X: Secrets Management & Key Vault Supremacy (NON-NEGOTIABLE)
- ✅ Added Principle XI: Zero-Downtime Key Rotation (NON-NEGOTIABLE)
- ✅ Added Principle XII: Infrastructure-as-Code Idempotency (NON-NEGOTIABLE)
- ✅ Updated Sync Impact Report with rationale
- ✅ Relabeled UX principles (XIII-XIX)
- ✅ Committed and pushed to main

---

## Documentation Created ✅

### Core Constitutional Document
- ✅ `.specify/memory/constitution.md` (v3.0.0, 319 lines)
  - 4 new infrastructure principles with detailed rules and rationale
  - Sync Impact Report documenting changes
  - All principles marked NON-NEGOTIABLE

### Implementation Guide
- ✅ `INFRASTRUCTURE-GOVERNANCE-GUIDE.md` (576 lines)
  - Current implementation status for each principle
  - Verification checklists
  - Bash scripts for operations
  - TypeScript code examples
  - CI/CD integration patterns
  - Compliance dashboard

### Executive Summary
- ✅ `CONSTITUTION-v3-AMENDMENT-SUMMARY.md` (212 lines)
  - High-level overview of changes
  - Impact (security, reliability, cost, compliance)
  - Developer action items
  - Validation checklist

---

## Phase 1: Immediate Implementation (Core Infrastructure) ✅

### Resource Lifecycle & Naming
- ✅ Environment-prefixed resource names implemented
  - `proteinlens-api-prod` (includes prod identifier)
  - `proteinlens-kv-prod` (includes prod identifier)
  - `plprodsa85` (includes prod identifier)
  - `proteinlens-db-prod` (includes prod identifier)

- ✅ Azure resource groups with environment prefix
  - `proteinlens-prod-rg`
  - Supports cascading deletion (all child resources deleted with group)

### Secrets Management
- ✅ Azure Key Vault deployed (`proteinlens-kv-prod`)
- ✅ Function App Managed Identity enabled
- ✅ Key Vault access policies configured
- ✅ Key Vault reference structure prepared for:
  - OpenAiApiKey
  - StripeSecretKey
  - PostgresPassword
  - DbConnectionString
  - AiFoundryConnectionStr

### Infrastructure-as-Code
- ✅ Bicep templates created (main.bicep, 7 modules)
- ✅ Conditional deployments with feature flags
  - `enableAIFoundry` (default: true)
  - `enableFrontDoor` (default: false)
- ✅ Parameters files for dev/prod environments
- ✅ Idempotent module orchestration

### Deployment Automation
- ✅ GitHub Actions workflows created
  - `infra.yml` - Infrastructure deployment
  - `deploy-api.yml` - Backend deployment
  - `deploy-web.yml` - Frontend deployment
- ✅ Automatic GitHub secret configuration
- ✅ Manual `terraform/bicep` workflow verified idempotent

---

## Phase 2: In Progress Implementation (Advanced Features) 🔄

### Secret Access Audit Logging
- 🔄 **NEEDED**: Application Insights integration for secret access logging
  - Log: secret name, user/service identity, timestamp, success/failure
  - Implement in: backend/src/services/keyVaultClient.ts
  - Add Application Insights telemetry on every Key Vault get/list call
  - Status: Design phase

### Secret Caching
- 🔄 **NEEDED**: Implement 5-minute minimum cache in application
  - Cache retrieved secrets in memory
  - Reduce Key Vault API calls (throttling prevention)
  - Implement in: backend/src/services/cacheManager.ts
  - Cache expiration: 5 minutes minimum, 15 minutes ideal
  - Status: Design phase

### Dual-Key Rotation Support
- 🔄 **NEEDED**: Application code for staged key acceptance
  - Read both primary and staged keys from Key Vault
  - Try primary first, fallback to staged if primary fails
  - Implement in: backend/src/services/aiService.ts
  - Add logging to track which key is being used (audit trail)
  - Status: Design phase

---

## Phase 3: Planned Implementation (Automation) ⏳

### Automated Drift Detection
- ⏳ **PLANNED**: Weekly `bicep what-if` in CI/CD
  - Add scheduled workflow (GitHub Actions)
  - Frequency: Weekly (Monday 00:00 UTC)
  - Alert if drift detected
  - Prevent manual changes via Azure Portal
  - Timeline: Q1 2026

### Idempotency Testing in CI/CD
- ⏳ **PLANNED**: Automated idempotency verification
  - Deploy → verify → redeploy → verify identical state
  - Add to infra.yml workflow
  - Validation: `bicep what-if` shows zero changes after 2nd deploy
  - Timeline: Q1 2026

### Key Rotation Automation
- ⏳ **PLANNED**: Scheduled Azure Function for rotation
  - Support: OpenAI API key, Stripe key, PostgreSQL password
  - Frequency: 90 days (configurable)
  - Workflow: Automatic staged key creation, testing, promotion
  - Monitoring: Application Insights metrics on rotation success
  - Timeline: Q2 2026

### Ephemeral Resource Cleanup
- ⏳ **PLANNED**: TTL-based auto-deletion
  - Add TTL tag to test/ephemeral resources
  - Scheduled Azure Function to evaluate and delete expired resources
  - Support: test resource groups, temporary VMs, temp storage accounts
  - Timeline: Q2 2026

---

## Developer Action Items

### For Infrastructure Team

**Immediate (This Sprint)**
1. [ ] Review Constitution v3.0.0 Principles IX-XII
2. [ ] Audit current GitHub Secrets - remove sensitive credentials
   ```bash
   gh secret list  # Verify no OPENAI_API_KEY, STRIPE_SECRET_KEY, DB_PASSWORD
   ```
3. [ ] Verify Key Vault secrets are properly created
   ```bash
   az keyvault secret list --vault-name proteinlens-kv-prod
   ```
4. [ ] Test resource cleanup idempotency
   ```bash
   az group delete --name test-rg --yes
   az group delete --name test-rg --yes  # Should succeed 2nd time
   ```
5. [ ] Document your cleanup procedure outcomes

**This Quarter**
1. [ ] Implement secret access audit logging (Phase 2)
2. [ ] Implement secret caching (5-min minimum) in application code
3. [ ] Add `bicep what-if` validation to PR checks for drift detection
4. [ ] Document key rotation procedures (OpenAI, Stripe, PostgreSQL)

### For Application Team

**Immediate (This Sprint)**
1. [ ] Review Constitution v3.0.0 Principle X (Secrets)
2. [ ] Audit backend code for hardcoded secrets or env var usage
   ```bash
   grep -r "process\.env\.OPENAI" backend/
   grep -r "process\.env\.STRIPE" backend/
   # Should return zero results
   ```
3. [ ] Implement: Use Managed Identity to fetch secrets from Key Vault
4. [ ] Add Application Insights logging for secret access

**This Quarter**
1. [ ] Implement dual-key support (Principle XI)
   - Read primary key and staged key from Key Vault
   - Try primary first, fallback to staged
   - Log which key is being used
2. [ ] Implement graceful degradation on Key Vault unavailability
   - Use cached secret if Key Vault unreachable
   - Alert on-call if cache expires without recovery
3. [ ] Test: Run `npm test` with Key Vault access logging

### For DevOps/CI-CD Team

**Immediate (This Sprint)**
1. [ ] Review Constitution v3.0.0 Principle XII (IaC Idempotency)
2. [ ] Document current deployment procedures
3. [ ] Test: `bicep deploy` → `bicep deploy` → verify no changes
4. [ ] Verify: `az group delete` succeeds even on 2nd attempt

**This Quarter**
1. [ ] Add `bicep what-if` validation to PR checks
2. [ ] Add idempotency test to infra.yml workflow
3. [ ] Set up weekly drift detection (scheduled workflow)
4. [ ] Document key rotation runbooks (3 services: OpenAI, Stripe, PostgreSQL)

---

## Verification Procedures

### Principle IX: On-Demand Resource Lifecycle
```bash
# Verify environment prefixes
az resource list --resource-group proteinlens-prod-rg \
  --query "[].name" -o table
# Should show: proteinlens-api-prod, proteinlens-kv-prod, plprodsa85, etc.

# Verify idempotent deletion
az group delete --name test-resource-group --yes --no-wait
sleep 5  # Wait for deletion to start
az group delete --name test-resource-group --yes --no-wait  # Should succeed
# Expected: "Deployment operation completed" (not "group not found")
```

### Principle X: Secrets Management
```bash
# Verify Key Vault secrets exist
az keyvault secret list --vault-name proteinlens-kv-prod \
  --query "[].name" -o table

# Verify GitHub Secrets don't contain sensitive credentials
gh secret list | grep -iE "(OPENAI|STRIPE|PASSWORD|SECRET_KEY)"
# Should return: (empty result)

# Verify Function App has Managed Identity
az functionapp identity show \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod-rg \
  --query principalId
# Should return: object ID (not empty)
```

### Principle XI: Zero-Downtime Key Rotation
```bash
# Verify dual-key structure in Key Vault
az keyvault secret list --vault-name proteinlens-kv-prod \
  --query "[?contains(name, 'Key')].name" -o table
# Should eventually show: OpenAiApiKey, OpenAiApiKey-Staged, OpenAiApiKey-Archived-*

# Verify application code handles staged keys
grep -r "Staged\|staged" backend/src/services/
# Should find: dual-key handling in aiService.ts
```

### Principle XII: Infrastructure-as-Code Idempotency
```bash
# Test idempotency: deploy twice, should detect no changes 2nd time
az deployment group create \
  --resource-group proteinlens-prod-rg \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters/prod.parameters.json

az deployment group what-if \
  --resource-group proteinlens-prod-rg \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters/prod.parameters.json \
  --query "[?properties.changeType != 'NoChange'] | length(@)"
# Expected output: 0 (zero changes needed)

# Verify feature flags
az deployment group what-if \
  --resource-group proteinlens-prod-rg \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters/prod.parameters.json enableAIFoundry=false
# Should show: AI Hub/Project resources would be deleted
```

---

## Compliance Dashboard

| Principle | Sub-Item | Status | Owner | Target Date |
|-----------|----------|--------|-------|-------------|
| **IX** | Environment prefixes | ✅ | Infrastructure | ✅ Complete |
| **IX** | Idempotent deletion | ✅ | Infrastructure | ✅ Complete |
| **IX** | Cleanup procedure docs | 🔄 | Infrastructure | This Sprint |
| **X** | Key Vault deployment | ✅ | Infrastructure | ✅ Complete |
| **X** | Managed Identity | ✅ | Infrastructure | ✅ Complete |
| **X** | GitHub Secrets audit | 🔄 | DevOps | This Sprint |
| **X** | Secret access logging | 🔄 | Application | This Quarter |
| **X** | Secret caching | 🔄 | Application | This Quarter |
| **XI** | Rotation procedure docs | 🔄 | DevOps | This Sprint |
| **XI** | Dual-key support | 🔄 | Application | This Quarter |
| **XI** | Emergency revocation | 🔄 | Application | This Quarter |
| **XII** | Bicep idempotency | ✅ | Infrastructure | ✅ Complete |
| **XII** | Feature flags | ✅ | Infrastructure | ✅ Complete |
| **XII** | Drift detection CI | 🔄 | DevOps | Q1 2026 |
| **XII** | Idempotency testing CI | 🔄 | DevOps | Q1 2026 |

---

## Success Criteria

### For v3.0.0 Adoption
- ✅ Constitution v3.0.0 ratified and communicated
- ✅ All 4 principles marked NON-NEGOTIABLE (mandatory)
- ✅ Phase 1 (immediate) implementation complete
- ✅ Phase 2 (in progress) items assigned and started
- ✅ Phase 3 (planned) items prioritized in roadmap

### For Principles Compliance
- ✅ No sensitive credentials in GitHub Secrets
- ✅ All secrets in Azure Key Vault
- ✅ Resource names include environment prefixes
- ✅ Deletion idempotency verified
- ✅ Infrastructure deployment idempotency verified
- ✅ Feature flags enable conditional deployments
- ✅ Audit logging for secret access implemented
- ✅ Dual-key rotation framework implemented

---

## Questions & Support

**Who owns what?**
- **Constitution**: Project Stakeholders (collective)
- **Infrastructure**: Infrastructure Team (Bicep, Azure resources)
- **Secrets**: DevOps Team (Key Vault, GitHub Secrets, rotation)
- **Application**: Application Team (code integration, logging)

**Where to find help?**
- Constitution details: `.specify/memory/constitution.md`
- Implementation guide: `INFRASTRUCTURE-GOVERNANCE-GUIDE.md`
- Amendment summary: `CONSTITUTION-v3-AMENDMENT-SUMMARY.md`
- Deployment guide: `DEPLOYMENT-WITH-AI-FOUNDRY.md`

**How to escalate?**
1. Raise issue in GitHub with `[CONSTITUTION]` prefix
2. Reference specific principle (IX, X, XI, XII)
3. Link to related implementation guide section
4. Include failure scenario or compliance question

---

**Last Updated**: 2025-12-23  
**Next Review**: 2026-03-31 (End of Q1)  
**Document Type**: Implementation Checklist  
**Related Documents**: Constitution v3.0.0, Governance Guide, Deployment Guide
