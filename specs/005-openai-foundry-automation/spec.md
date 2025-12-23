# Feature Specification: OpenAI Foundry Automation

**Feature Branch**: `005-openai-foundry-automation`  
**Created**: 2025-12-23  
**Status**: Draft  
**Input**: Objective: Provision Azure AI Foundry / Azure OpenAI infrastructure on-demand and make OPENAI_API_KEY updates automatic across all apps. User stories: one-command up/down; safe key rotation with automatic pickup; choose env dev/staging/pr-###. Acceptance: workflow_dispatch supports action=up|down|rotate-key and env=dev|staging|pr-###; up creates resource + model deployment; stores key in Key Vault as AZURE_OPENAI_API_KEY; Function App uses Key Vault reference; rotate-key regenerates inactive key, updates secret, and triggers refresh; no raw keys in repo/logs/frontend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-command Provision (Priority: P1)

As a developer, I run a single manual workflow or script with `action=up` and a target environment (dev, staging, or pr-###) and the system provisions the AI resource and a model deployment, stores the API key in a managed secret, and points server apps at the Key Vault reference automatically.

**Why this priority**: Enables fast, consistent environment setup, unblocks development and testing, and reduces manual infra work.

**Independent Test**: Trigger the workflow for an empty environment and verify resource, model deployment, secret creation, and Function App configuration complete without any manual steps.

**Acceptance Scenarios**:

1. Given no prior AI resource for the target env, When I run `action=up` for `env=dev`, Then a new AI resource and model deployment exist, a secret named `AZURE_OPENAI_API_KEY` exists in the environment’s Key Vault, and the Function App setting references that secret.
2. Given a `pr-123` environment, When I run `action=up` with `env=pr-123`, Then an isolated AI resource and model deployment are created with names scoped to `pr-123`, and app settings are updated to use the correct Key Vault reference.

---

### User Story 2 - Safe Key Rotation (Priority: P1)

As an operator, I rotate the OpenAI key with `action=rotate-key` for a target environment, and apps seamlessly pick up the new key without downtime or leaked secrets.

**Why this priority**: Reduces security risk and aligns with key hygiene best practices while preserving availability.

**Independent Test**: Trigger `action=rotate-key` and confirm that the inactive key is regenerated, `AZURE_OPENAI_API_KEY` secret value is updated, and apps reflect the new key without service interruption.

**Acceptance Scenarios**:

1. Given two keys (Key1/Key2) for the AI resource, When I run `action=rotate-key`, Then the currently inactive key is regenerated and the Key Vault secret is updated to the new value.
2. Given the Function App is configured to read from a Key Vault reference, When the secret updates, Then the app reads the new value within the expected refresh window and continues serving requests without errors.

---

### User Story 3 - One-command Teardown (Priority: P2)

As a developer, I run `action=down` for a target environment and the system safely destroys the AI resource and model deployment, cleans up secrets, and leaves other environment resources unaffected.

**Why this priority**: Minimizes cost and clutter for ephemeral or unused environments; supports PR-based workflows.

**Independent Test**: Provision an env with `action=up`, then call `action=down` and verify resources and associated secrets are removed without impacting unrelated services.

**Acceptance Scenarios**:

1. Given a provisioned `pr-123` env, When I run `action=down`, Then the AI resource, model deployment, and specific secret(s) are removed, and the operation does not affect dev/staging.
2. Given failed partial teardown, When I re-run `action=down`, Then the process is idempotent and completes cleanup successfully.

---

### Edge Cases

- PR environments collide on names; ensure unique, deterministic naming and safe reruns.
- Quota or region unavailability blocks model deployment; provide clear failure and guidance.
- Missing permissions to create resources or update secrets; fail with actionable error messages.
- Rotation attempted while apps are mid-request; ensure no downtime or errors surface to users.
- App config drift (manually edited settings) causing Key Vault reference mismatch; detect and reconcile.
- Secret refresh timing window; ensure predictable propagation and optional manual refresh trigger.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A manual workflow (GitHub Actions `workflow_dispatch`) or equivalent script MUST accept `action` in {up, down, rotate-key} and `env` in {dev, staging, pr-###}.
- **FR-002**: `action=up` MUST provision an AI capability for the target env and create at least one model deployment suitable for application use.
- **FR-003**: `action=up` MUST create or update a secret named `AZURE_OPENAI_API_KEY` in the environment’s Key Vault and MUST NOT expose the raw key in logs.
- **FR-004**: `action=up` MUST configure the server app(s) to read the API key via a Key Vault reference (not a raw stored value in app settings or frontend).
- **FR-005**: `action=rotate-key` MUST regenerate the currently inactive key, update the Key Vault secret, and ensure apps read the new value without downtime.
- **FR-006**: `action=down` MUST delete the AI resource and model deployment for the specified env and remove related secrets without affecting other envs.
- **FR-007**: The workflow MUST prevent storing OpenAI keys in repo, CI logs, or frontend environment files; any accidental exposure MUST be blocked and flagged.
- **FR-008**: The solution MUST support `pr-###` ephemeral envs with unique naming and idempotent operations (safe to re-run `up`/`down`).
- **FR-009**: The solution MUST succeed or fail with explicit, human-readable outcomes and guidance for common issues (e.g., quota, permissions).
- **FR-010**: The system MUST maintain a clear mapping between env and its AI resource, model deployment, and Key Vault secret name(s).
- **FR-011**: The workflow MUST avoid downtime during key rotation and MUST document the expected refresh interval and any optional manual refresh trigger.
- **FR-012**: All operations MUST produce audit-friendly logs that exclude secrets (including partials) and avoid echoing sensitive values.
- **FR-013**: The process MUST be repeatable and consistent across dev, staging, and PR envs.

- **FR-014**: Resource and deployment configuration MUST follow organizational naming rules and tagging for cost/ownership tracking. [NEEDS CLARIFICATION: exact naming convention and required tags]
- **FR-015**: The model SKU/variant and region MUST be selected from an approved list per environment. [NEEDS CLARIFICATION: approved models/regions and fallback policy]
- **FR-016**: Apps MUST pick up new secret values within a defined window. [NEEDS CLARIFICATION: refresh mechanism preference — passive refresh interval vs. explicit refresh/restart policy]

### Key Entities *(include if feature involves data)*

- **Environment**: Logical target (dev, staging, pr-###); attributes: name, owner, lifecycle (created/rotated/destroyed).
- **AI Resource**: Provisioned AI service for the env; attributes: name, region, quota, status.
- **Model Deployment**: Deployable model instance tied to AI Resource; attributes: model name, SKU/throughput, status.
- **Secret**: Key material stored under `AZURE_OPENAI_API_KEY`; attributes: secret name, last-rotated timestamp, current key slot.
- **Workflow Action**: User-triggered operation (up/down/rotate-key); attributes: action, env, result, timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: One-command `up` completes in ≤ 10 minutes for an empty env, with resources usable by apps upon completion.
- **SC-002**: `rotate-key` completes with 0 downtime; apps serve requests continuously and use the new key within ≤ 15 minutes of rotation.
- **SC-003**: 0 secret leaks: no raw key material appears in repositories, CI logs, artifacts, or frontend configurations.
- **SC-004**: 100% server apps in scope consume the API key via Key Vault reference (no raw value), verified by configuration inspection.
- **SC-005**: `down` removes targeted resources and secrets completely in ≤ 10 minutes without impacting other environments.
- **SC-006**: Operator/developer satisfaction baseline ≥ 4/5 for ease of use (survey after first successful run), and re-run success rate ≥ 95%.

