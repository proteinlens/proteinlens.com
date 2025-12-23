# Research: Main Branch Azure CI Deploy

Date: 2025-12-23  
Spec: [specs/001-ci-azure-deploy/spec.md](specs/001-ci-azure-deploy/spec.md)

## Decisions

### D1: Production environment detection
- Decision: `main` branch implies production (auto-deploy to prod RG)
- Rationale: The input requires a single workflow triggered on `push: main` and immediate deployment. Simplest path with least ceremony.
- Alternatives considered:
  - Tag-based releases: adds manual tagging overhead, slower lead time
  - Env variable gating: adds toggle complexity, risk of misconfiguration
  - Manual approval gate: contradicts “on each commit” objective

### D2: DNS provider policy
- Decision: Azure DNS zone for `proteinlens.com` is mandatory for production; fail fast if absent with message “Move DNS zone to Azure DNS to enable zero-touch domains”. Non-prod: skip custom domain binding and proceed with default hostnames.
- Rationale: Aligns with guardrail and enables automated domain binding via Front Door APIs.
- Alternatives considered:
  - Accept external DNS providers: requires complex validation and manual coordination, undermines zero-touch goal
  - Allow external DNS with manual approval: adds friction and deviates from automated pipeline

### D3: Main-to-prod promotion model
- Decision: Auto-deploy every `main` commit to production (no manual approval).
- Rationale: Matches “on each commit to main, run…” and reduces cycle time.
- Alternatives considered:
  - Manual approval gate: improves control but slows delivery; can be reintroduced via GitHub Environments later if needed
  - Two-stage (staging → prod): increases confidence but out of scope for this feature

### D4: Storage account name composition in Bicep
- Decision: Enforce valid name rules (3–24 chars, lowercase digits only) with `toLower()` and `take()` to avoid `substring()` runtime errors.
- Rationale: Bicep `take()` is bounds-safe; `substring()` can throw for short names.
- Alternatives considered: Pad/regex-only validation — not needed with safe composition and `assert()` rules.

### D5: SWA deployment token retrieval
- Decision: Obtain token dynamically using `az staticwebapp secrets list --name <SWA_NAME> --resource-group <RG>` and pass to deploy step as an ephemeral environment variable.
- Rationale: Avoids storing long-lived tokens in repo or GitHub Secrets; aligns with Zero Secrets policy.
- Alternatives considered:
  - Store token in GitHub Secrets: violates principle of minimizing static secrets; rotation burden
  - Use action without token: not supported for SWA deploy

### D6: Functions packaging validation
- Decision: Validate backend zip contains `host.json` at zip root before deployment; fail early if missing.
- Rationale: Prevents broken deploys; Microsoft Learn guidance.
- Alternatives considered: Rely on deployment failure — later and less clear error signal

### D7: SWA build config
- Decision: `app_location: frontend`, `output_location: dist` (Vite default), consistent with repo layout.
- Rationale: Matches current frontend structure and Vite build.
- Alternatives considered: Custom build paths — unnecessary.

### D8: Smoke test strategy
- Decision: Use retry with exponential backoff (e.g., attempts: 10, base: 3s, cap: 30s). API: GET `/api/health` expecting 200. Web: GET `/` expecting 200 and HTML contains `<title>ProteinLens</title>`.
- Rationale: Handles propagation delays and transient issues.
- Alternatives considered: Fixed sleep — brittle; no retry — flaky.

## References
- Azure Bicep string functions: `take()` vs `substring()` (guardrail)
- Azure Static Web Apps CLI: `az staticwebapp secrets list`
- Azure Functions zip deploy & `host.json` requirements
- GitHub Actions OIDC with `azure/login`

