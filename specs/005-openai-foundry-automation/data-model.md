# Data Model: OpenAI Foundry Automation

Date: 2025-12-23

## Entities

### Environment
- Fields: `name` (dev|staging|pr-###), `resourceGroup` (string), `region` (string), `createdAt` (datetime), `owner` (string), `ttl` (optional, for PR envs)
- Rules: `name` determines resource naming; PR envs MUST include numeric suffix; `region` must be in approved list

### AIResource
- Represents: Azure Cognitive Services OpenAI account
- Fields: `name` (protein-lens-openai-{env}), `region`, `status` (provisioning|succeeded|failed), `tags` (map)
- Relationships: belongs to `Environment`
- Rules: name is unique per env; tags include `env`, `service=openai`, `repo`, `owner`, `costCenter`

### ModelDeployment
- Represents: Model deployment within AI resource
- Fields: `deploymentName` (e.g., gpt-5-1), `model` (gpt-5-1), `sku/throughput` (optional), `status`
- Relationships: belongs to `AIResource`
- Rules: one default deployment per env; configurable in workflow input

### Secret
- Represents: Key Vault secret backing app configuration
- Fields: `secretName` (AZURE_OPENAI_API_KEY--{env}), `kvUri` (SecretUri), `lastRotatedAt`, `currentKeySlot` (1|2)
- Relationships: scoped to `Environment`
- Rules: value never logged; updated by `rotate-key`; referenced by app setting

### WorkflowAction
- Represents: User-triggered workflow run or script execution
- Fields: `action` (up|down|rotate-key), `env`, `region?`, `model?`, `result` (succeeded|failed), `startedAt`, `endedAt`
- Rules: idempotent; must emit human-readable outcome and error guidance

## Validation Rules
- `Environment.region` ∈ {eastus, westus} (configurable)
- `ModelDeployment.model` ∈ {gpt-5-1} (initial; extensible)
- `Secret.secretName` format: `AZURE_OPENAI_API_KEY--{env}`
- `AIResource.name` format: `protein-lens-openai-{env}`

## State Transitions
- `up`: Environment → AIResource(provisioning) → AIResource(succeeded) → ModelDeployment(succeeded) → Secret(created) → AppSettings(updated)
- `rotate-key`: Secret(updated) → AppRefresh(triggered) → App(uses new key)
- `down`: AppSettings(detach) → ModelDeployment(deleted) → AIResource(deleted) → Secret(deleted)
