# Research: OpenAI Foundry Automation

Date: 2025-12-23

## Decisions

1) Provisioning Method
- Decision: Use Bicep to deploy `Microsoft.CognitiveServices/accounts` (OpenAI) and `Microsoft.CognitiveServices/accounts/deployments` for model deployment. Execute via GitHub Actions using `az deployment group create` (or subscription-level if needed) with `what-if` for safety.
- Rationale: Native Azure IaC with idempotency, visibility, and drift detection. GitHub Actions aligns with repo-based automation.
- Alternatives considered: Terraform (heavier toolchain), Azure Portal (manual, violates IaC/Idempotency), ARM JSON (harder to author).

2) Central Key Distribution
- Decision: Store the OpenAI key in Key Vault. Secret name per env: `AZURE_OPENAI_API_KEY--{env}`. Configure Function App setting `AZURE_OPENAI_API_KEY` to a Key Vault reference `@Microsoft.KeyVault(SecretUri=...)`. Grant Function App Managed Identity `Key Vault Secrets User`.
- Rationale: Single source of truth, audit trails, no repo or CI exposure; aligns with Constitution X.
- Alternatives considered: GitHub Secrets (forbidden by policy), app settings raw value (no rotation safety, leaks risk).

3) Refresh Strategy
- Decision: Rely on Key Vault reference refresh. For immediate adoption, force refresh via the management endpoint (Function App config update or app setting touch) after secret update.
- Rationale: Passive cache may take hours; a management refresh ensures timely adoption within the SLA window.
- Alternatives considered: Full app restart (heavier), wait-only (unpredictable delay).

4) Key Rotation (Zero Downtime)
- Decision: Follow dual-key rotation: regenerate inactive key → update Key Vault secret to new value → trigger refresh → confirm usage → regenerate the other key.
- Rationale: Ensures continuous service; Constitution XI compliance.
- Alternatives considered: Single-key swap (downtime risk), coordinated app redeploy (heavier ops).

5) Environment Naming
- Decision: Resource name `protein-lens-openai-{env}`. Model deployment name: `gpt-5-1`. Key Vault secret per env `AZURE_OPENAI_API_KEY--{env}`. PR envs use `env=pr-###` with deterministic naming.
- Rationale: Predictable, collision-free, supports idempotent up/down.
- Alternatives considered: Single shared resource with logical isolation (quotas/costs mix, blast radius wider).

6) Models & Regions Policy
- Decision: Default model `gpt-5-1`. Primary region `eastus`; fallback `westus` if quota unavailable. Region configurable via workflow input.
- Rationale: Ensures availability under quota pressure; user can override per run.
- Alternatives considered: Single hard-coded region (fragile), dynamic cross-region random (non-deterministic).

## Clarifications Resolved

- FR-014 Naming/Tags: Use `protein-lens-openai-{env}` and standard tags: `env`, `service=openai`, `owner`, `repo=proteinlens`, `costCenter` (values configurable via workflow inputs/vars).
- FR-015 Model/Region: `gpt-5-1` by default; `eastus` primary, `westus` fallback; both whitelisted. Failure if neither available.
- FR-016 Refresh SLA: Forced management refresh immediately after secret update; target ≤ 15 minutes total propagation.

## Risks & Mitigations

- Quota Unavailable: Mitigate with fallback region; fail fast with guidance.
- Permissions Missing: Check role assignments early; emit actionable error.
- Secret Propagation Delay: Force refresh; add optional manual retry.
- PR Naming Collisions: Include `pr-###` in names; idempotent up/down.

## References

- Microsoft Learn: Cognitive Services OpenAI deployments
- Microsoft Learn: Key Vault references in App Service / Function App
- Microsoft Learn: Managed Identity and Key Vault role assignment
