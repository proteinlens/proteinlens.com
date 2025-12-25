# Research: Incremental CI Deploy

## Decisions

- Decision: Path-based changes detection using `dorny/paths-filter`
  - Rationale: Simple and reliable for monorepo layout; avoids unnecessary deploys
  - Alternatives considered: Manual diff scripting; GitHub `if: contains(...)` expressions; custom actions

- Decision: OIDC auth (`azure/login`) for Azure CLI operations
  - Rationale: No secrets in repo; aligns with Principle I and X
  - Alternatives considered: Service principal secrets (rejected for security)

- Decision: Infra-first idempotent deployment with Bicep
  - Rationale: Safe repeatable provisioning; supports non-destructive updates
  - Alternatives considered: Terraform (not in use in repo); ARM templates (less ergonomic)

- Decision: Endpoint discovery via Azure CLI per environment
  - Rationale: Consistent retrieval for non-prod defaults; avoids needing outputs wiring across jobs
  - Alternatives considered: Output propagation only from infra job (limited for incremental runs)

- Decision: Smoke tests via `curl` with exponential backoff
  - Rationale: Lightweight and robust; tolerates propagation delays
  - Alternatives considered: Playwright/E2E (heavier; not necessary for basic availability checks)

- Decision: Production determination = `main` branch
  - Rationale: Simple governance model; developer-friendly
  - Alternatives considered: Tag-based releases; manual approvals (not desired per spec)

- Decision: Production requires Azure DNS for `proteinlens.com` and fails fast if missing
  - Rationale: Enforce zero-touch domain management; avoid misconfigured production
  - Alternatives considered: Accept external DNS (rejected for complexity and governance)

- Decision: CI runs Prisma migrations before backend packaging
  - Rationale: Ensure DB schema is current prior to deployment; runtime migration optional
  - Alternatives considered: Runtime-only migrations (risk of cold-start failures)

## Open Questions

None — clarified in spec (FR-013..FR-015).

## Implementation Notes

- Keep Node.js 20.x with npm caching for faster builds
- Use `concurrency` to avoid overlapping deploys on busy branches
- Ensure KV secret names match Function App KV references
- Add CORS origin for SWA default hostname to Function App
