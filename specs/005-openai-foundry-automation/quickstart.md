# Quickstart: OpenAI Foundry Automation

This guide shows how to provision, teardown, and rotate keys for the Azure OpenAI resource using the GitHub Actions workflow and Bicep.

## Prerequisites
- Azure subscription with permissions to deploy Cognitive Services OpenAI, Key Vault, and assign roles
- GitHub Actions OIDC / SP configured to deploy to Azure (no secrets)
- Bicep templates under `infra/bicep/` (OpenAI account, deployment, Key Vault updates)

## Run via GitHub Actions

Manual dispatch with inputs:

- action: `up` | `down` | `rotate-key`
- env: `dev` | `staging` | `pr-###`
- region (optional): `eastus` (default) | `westus`
- model (optional): `gpt-5-1` (default)

## Example Runs

Provision dev:

1) Go to Actions → openai-foundry → Run workflow
2) Inputs: action=`up`, env=`dev`

Rotate key in staging (zero downtime):

1) Run with: action=`rotate-key`, env=`staging`
2) Workflow regenerates inactive key → updates Key Vault secret → forces refresh

Teardown PR env:

1) Run with: action=`down`, env=`pr-123`
2) Confirms deletion of model deployment, resource, and secret

## Local Verification (Optional)

You can use `az` to verify resource state (read-only):

```bash
az cognitiveservices account show -n protein-lens-openai-dev -g <rg>
az cognitiveservices account deployment list -n protein-lens-openai-dev -g <rg>
az keyvault secret show --vault-name <kv> -n AZURE_OPENAI_API_KEY--dev
```

## Notes
- No raw secrets are printed. Key Vault secret is referenced by Function App setting `AZURE_OPENAI_API_KEY` as a Key Vault reference.
- If quota blocks `eastus`, workflow attempts `westus` when enabled.
