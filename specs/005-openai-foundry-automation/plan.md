# Implementation Plan: OpenAI Foundry Automation

**Branch**: `005-openai-foundry-automation` | **Date**: 2025-12-23 | **Spec**: specs/005-openai-foundry-automation/spec.md
**Input**: Feature specification from `specs/005-openai-foundry-automation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Provision Azure OpenAI (via Azure AI Foundry-managed resource) and a model deployment on-demand using Bicep and GitHub Actions. Centralize the OpenAI API key in Key Vault per environment and configure Function App(s) to consume it via Key Vault reference. Support zero-downtime key rotation by regenerating the inactive key, updating the Key Vault secret, and forcing a safe refresh. Workflows support `action=up|down|rotate-key` and `env=dev|staging|pr-###` and are idempotent.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Bicep (latest), GitHub Actions YAML, Bash; Node.js 20 for helper scripts (optional)  
**Primary Dependencies**: Azure CLI (`az`), Bicep CLI, Azure Resource Manager; Azure Functions (existing)  
**Storage**: N/A for this feature (Key Vault used solely for secrets)  
**Testing**: GitHub Actions `what-if` + idempotency re-run; `az` dry-run where applicable  
**Target Platform**: Azure (Cognitive Services OpenAI, Key Vault, Function App), GitHub Actions runners  
**Project Type**: Web + backend mono-repo (frontend/, backend/, infra/)  
**Performance Goals**: Provision `up` ≤ 10 min; `rotate-key` propagation ≤ 15 min  
**Constraints**: No secrets in repo/logs/frontend; zero-downtime rotation; idempotent `up`/`down`  
**Scale/Scope**: Envs: dev, staging, pr-###; default model deployment `gpt-5-1` (configurable)

## Constitution Check

Gates from Constitution v3:

- IX On-Demand Lifecycle: `down` tears down env-scoped resources with no leftovers; idempotent. PASS
- X Key Vault Supremacy: Secrets only in Key Vault; apps use Key Vault references. PASS
- XI Zero-Downtime Rotation: Dual-key flow (regenerate inactive → update secret → refresh). PASS
- XII IaC Idempotency: Bicep deployments + `what-if`; safe re-runs. PASS

Gate status: PASS. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Use existing backend/frontend split. Place Bicep in `infra/bicep` and GitHub Actions workflow in `.github/workflows/openai-foundry.yml`. Feature docs under `specs/005-openai-foundry-automation/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | — | — |
