# Research & Decisions: One-Click Azure Deploy

Created: 23 Dec 2025
Feature: [specs/001-unified-azure-deploy/spec.md](specs/001-unified-azure-deploy/spec.md)
Plan: [specs/001-unified-azure-deploy/plan.md](specs/001-unified-azure-deploy/plan.md)

## A) Bicep Naming Rules
- Decision: Enforce storage account name ≤24 chars, lowercase alphanumeric; compute via prefix-env-<8char suffix>. Key Vault name unique per RG avoiding soft-delete collisions.
- Rationale: Complies with Azure constraints; prevents `AccountNameInvalid` and `VaultAlreadyExists`.
- Alternatives: Manual overrides per environment (rejected: increases drift); random full GUID (rejected: unreadable, harder for ops).

## B) Deployment Region
- Decision: Use `northeurope` for Postgres and AI Foundry; co-locate resources unless service limits apply.
- Rationale: Subscription policy and quota alignment; minimizes latency and cross-region egress.
- Alternatives: `westeurope` fallback (viable if quotas block), multi-region active/active (out of scope for initial go-live).

## C) Secrets Handling
- Decision: Store all sensitive values in Key Vault; Functions app settings use Key Vault references; CI validates references only, never prints values.
- Rationale: Constitution X and I; auditability and rotation.
- Alternatives: App Settings plaintext (rejected: violates constitution); GitHub Secrets for values (rejected: violates constitution).

## D) Static Web Apps Deploy Token
- Decision: Fetch token at runtime via `az staticwebapp secrets list --query properties.apiKey` using OIDC-authenticated CLI.
- Rationale: Avoids manual portal steps; supports zero-touch.
- Alternatives: Hardcode SWA token in secrets (rejected: rotation/expiration risk and secret sprawl).

## E) Functions Packaging
- Decision: Validate package layout before deploy; ensure `host.json` at zip root and compiled JS present; fail fast otherwise.
- Rationale: Prevents ZIP deploy errors and opaque 400s; improves operator feedback.
- Alternatives: Retry on failure without validation (rejected: non-deterministic and noisy).

## F) Health & Non-Placeholder Checks
- Decision: Retry health checks with backoff until 200 from Front Door for `/api/health`; verify frontend HTML is not SWA placeholder by checking for app marker string.
- Rationale: "Green means working" at edge, not just origin.
- Alternatives: Origin-only checks (rejected: edge config/cert/DNS might still be propagating).

## G) DNS Zone Authority
- Decision: Assume `proteinlens.com` zone is hosted in Azure DNS within accessible subscription/resource group; automate CNAME and `_dnsauth` records.
- Rationale: Meets "no manual portal steps" acceptance; enables certificate validation automation.
- Alternatives: External DNS provider with manual steps (rejected: violates acceptance); API-based external DNS automation (future option if provider supports safe automation).

## H) AI Service Choice
- Decision: Use Azure AI Foundry project with GPT‑5‑1 model deployment.
- Rationale: Constitution VII explicitly references AI Foundry; infra includes `ai-foundry.bicep`; access models via Foundry is aligned with current docs.
- Alternatives: Azure OpenAI resource (viable if Foundry access blocked); existing resource reuse (fastest if present; would skip provisioning and only set Key Vault references).

## I) Front Door Tier
- Decision: Azure Front Door Standard (managed certs, custom domains, routes). Add WAF later if needed.
- Rationale: Meets routing and TLS needs with lower cost/complexity; acceptance doesn’t require WAF now.
- Alternatives: Premium + WAF (adds security features, higher cost); service-native domains without Front Door (rejected: deviates from acceptance).
