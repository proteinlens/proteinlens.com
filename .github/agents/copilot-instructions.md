# proteinlens.com Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-22

## Active Technologies
- TypeScript 5.3+, React 18.2, Node.js v25 (003-frontend-redesign)
- TypeScript (backend), React/TypeScript (frontend), Bicep (infrastructure) (004-azure-deploy-pipeline)
- Bicep (latest), GitHub Actions YAML, Bash; Node.js 20 for helper scripts (optional) + Azure CLI (`az`), Bicep CLI, Azure Resource Manager; Azure Functions (existing) (005-openai-foundry-automation)
- N/A for this feature (Key Vault used solely for secrets) (005-openai-foundry-automation)
- Node.js 20 (Azure Functions), TypeScript (backend/frontend), Bicep (IaC) + Azure Functions, Azure Static Web Apps, Azure Front Door Standard, Azure Key Vault, Azure Storage (Blob), Azure Database for PostgreSQL Flexible Server, Azure AI Foundry (GPT‑5‑1), GitHub Actions (001-unified-azure-deploy)
- PostgreSQL Flexible Server (prod), Azure Blob Storage (for assets/state), Key Vault (secrets) (001-unified-azure-deploy)
- GitHub Actions YAML, Azure CLI 2.63+, Bicep v0.30+ + `azure/login` (OIDC), `azure/cli` action, `actions/upload-artifact`, `actions/download-artifact`, `actions/setup-node` (for smoke), Front Door + Static Web Apps + Function App Azure services (001-ci-azure-deploy)
- N/A (pipeline artifacts only) (001-ci-azure-deploy)
- GitHub Actions YAML; Azure CLI 2.63+; Bicep 0.30+ + `azure/login`, `azure/cli`, `actions/setup-node`, `dorny/paths-filter` (001-incremental-deploy)
- N/A (CI artifacts only; app storage provisioned via infra) (001-incremental-deploy)
- Backend Node.js 20 (TypeScript), Frontend React + Vite (TS), Bicep 0.30+ + Azure CLI, GitHub Actions, Prisma, Vitest, Tailwind (001-incremental-deploy)
- PostgreSQL Flexible Server, Azure Storage (Blob) (001-incremental-deploy)
- Backend: Node.js 20.x (Azure Functions); Frontend: React + Vite + TypeScrip + Azure Functions, Azure Static Web Apps, Azure CLI, GitHub Actions, Prisma, Vites (001-incremental-deploy)
- TypeScript 5.x; Node.js >= 20 (Azure Functions v4) + Azure Functions, Prisma, Stripe, Application Insights, Zod, React 18 + Vite + Tailwind (001-anon-to-pro-upsell)
- PostgreSQL (Prisma), Azure Blob Storage for images (blob-first ingestion) (001-anon-to-pro-upsell)
- TypeScript 5.x; Node.js >= 20 (Azure Functions v4); React 18 + Azure Entra External ID (B2C), MSAL, Azure Functions, Prisma, Zod, Application Insights, React Router (009-user-auth)
- PostgreSQL (Prisma) for local user mapping and audit logs (009-user-auth)
- TypeScript 5.x; Node.js >= 20 (Azure Functions v4); React 18 + Azure Entra External ID (B2C), @azure/msal-browser, Azure Functions, Prisma, Zod, React Router, TailwindCSS, shadcn/ui (010-user-signup)
- PostgreSQL (via Prisma) for user profiles and consent records; B2C for credentials (010-user-signup)
- TypeScript 5.x (Node.js 20.x runtime) + Azure Functions v4, Prisma ORM, jose (JWT), bcrypt, zod (validation), @azure/communication-email (013-self-managed-auth)
- PostgreSQL (Azure Database for PostgreSQL Flexible Server), existing Prisma schema (013-self-managed-auth)
- TypeScript 5.3, Node.js 20 LTS (011-observability)
- Azure Log Analytics Workspace (30-day retention), Application Insights (011-observability)
- TypeScript 5.x (Node 20+ for backend, React 18 for frontend) (012-admin-dashboard)
- PostgreSQL (via Prisma), Azure Blob Storage (existing) (012-admin-dashboard)
- TypeScript 5.x (Node.js 20+) + Native `fetch` API (no new dependencies required) (014-slack-auth-notifications)
- N/A (stateless notifications) (014-slack-auth-notifications)
- TypeScript 5.x (Node 20+) + Azure Functions v4, Prisma ORM, React 18, TanStack Query, Tailwind CSS, Zod (015-protein-target-calculator)
- PostgreSQL (user profiles/targets), localStorage (anonymous users) (015-protein-target-calculator)
- TypeScript 5.x, Node.js 20+ + React 18, Vite, Azure Functions v4, Prisma ORM (016-goal-sync)
- PostgreSQL (via Prisma), localStorage for anonymous users (016-goal-sync)
- TypeScript 5.x (Node.js 20+ backend, React 19 frontend) (001-macro-ingredients-analysis)
- PostgreSQL (Azure Database for PostgreSQL Flexible Server) via Prisma (001-macro-ingredients-analysis)

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
- 001-macro-ingredients-analysis: Added TypeScript 5.x (Node.js 20+ backend, React 19 frontend)
- 017-shareable-meals-diets: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 016-goal-sync: Added TypeScript 5.x, Node.js 20+ + React 18, Vite, Azure Functions v4, Prisma ORM


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
