# proteinlens.com Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-22

## Active Technologies
- TypeScript 5.3+, React 18.2, Node.js v25 (003-frontend-redesign)
- TypeScript (backend), React/TypeScript (frontend), Bicep (infrastructure) (004-azure-deploy-pipeline)
- Bicep (latest), GitHub Actions YAML, Bash; Node.js 20 for helper scripts (optional) + Azure CLI (`az`), Bicep CLI, Azure Resource Manager; Azure Functions (existing) (005-openai-foundry-automation)
- N/A for this feature (Key Vault used solely for secrets) (005-openai-foundry-automation)
- Node.js 20 (Azure Functions), TypeScript (backend/frontend), Bicep (IaC) + Azure Functions, Azure Static Web Apps, Azure Front Door Standard, Azure Key Vault, Azure Storage (Blob), Azure Database for PostgreSQL Flexible Server, Azure AI Foundry (GPT‑5‑1), GitHub Actions (001-unified-azure-deploy)
- PostgreSQL Flexible Server (prod), Azure Blob Storage (for assets/state), Key Vault (secrets) (001-unified-azure-deploy)

- TypeScript 5.3+ / Node.js 20 + Azure Functions v4, Prisma 5.8+, Stripe SDK, React 18, Vite 5 (002-saas-billing)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.3+ / Node.js 20: Follow standard conventions

## Recent Changes
- 001-unified-azure-deploy: Added Node.js 20 (Azure Functions), TypeScript (backend/frontend), Bicep (IaC) + Azure Functions, Azure Static Web Apps, Azure Front Door Standard, Azure Key Vault, Azure Storage (Blob), Azure Database for PostgreSQL Flexible Server, Azure AI Foundry (GPT‑5‑1), GitHub Actions
- 005-openai-foundry-automation: Added Bicep (latest), GitHub Actions YAML, Bash; Node.js 20 for helper scripts (optional) + Azure CLI (`az`), Bicep CLI, Azure Resource Manager; Azure Functions (existing)
- 005-openai-foundry-automation: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
