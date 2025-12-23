# proteinlens.com Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-22

## Active Technologies
- TypeScript 5.3+, React 18.2, Node.js v25 (003-frontend-redesign)
- TypeScript (backend), React/TypeScript (frontend), Bicep (infrastructure) (004-azure-deploy-pipeline)
- Bicep (latest), GitHub Actions YAML, Bash; Node.js 20 for helper scripts (optional) + Azure CLI (`az`), Bicep CLI, Azure Resource Manager; Azure Functions (existing) (005-openai-foundry-automation)
- N/A for this feature (Key Vault used solely for secrets) (005-openai-foundry-automation)

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
- 005-openai-foundry-automation: Added Bicep (latest), GitHub Actions YAML, Bash; Node.js 20 for helper scripts (optional) + Azure CLI (`az`), Bicep CLI, Azure Resource Manager; Azure Functions (existing)
- 005-openai-foundry-automation: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 004-azure-deploy-pipeline: Added TypeScript (backend), React/TypeScript (frontend), Bicep (infrastructure)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
