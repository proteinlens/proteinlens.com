# Local Development Setup Guide

This guide helps developers set up the ProteinLens project locally for development and testing.

## Prerequisites

- **Node.js**: 20 LTS or higher (`node --version`)
- **npm**: 10 or higher (`npm --version`)
- **Azure CLI**: Latest (`az --version`)
- **Bicep CLI**: Latest (`az bicep version`)
- **Git**: Latest (`git --version`)
- **PostgreSQL Client**: For database connections (`psql --version`)
- **Docker**: (Optional) For local PostgreSQL and other services

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/proteinlens.com.git
cd proteinlens.com
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm ci  # Use ci instead of install for reproducible builds
cd ..

# Install frontend dependencies
cd frontend
npm ci
cd ..
```

### 3. Create Local Environment Files

Create `.env.local` files for both backend and frontend:

#### Backend (backend/.env.local)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/proteinlens_dev
DATABASE_ADMIN_PASSWORD=your-secure-password

# API Configuration
API_PORT=7071
NODE_ENV=development

# External Services
OPENAI_API_KEY=your-openai-key-here
STRIPE_SECRET_KEY=sk_test_your-test-key
STRIPE_WEBHOOK_SECRET=whsec_test_your-webhook-secret

# Azure Services (for local development)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AI_FOUNDRY_ENDPOINT=https://your-endpoint.region.inference.ml.azure.com
AI_MODEL_DEPLOYMENT=gpt-4

# Application
LOG_LEVEL=debug
```

#### Frontend (frontend/.env.local)

```bash
# API Configuration
VITE_API_URL=http://localhost:7071/api
VITE_ENV=development

# Optional: Analytics (if using)
VITE_ANALYTICS_ID=your-analytics-id
```

### 4. Set Up Local PostgreSQL

Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name proteinlens-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=proteinlens_dev \
  -p 5432:5432 \
  -d postgres:15

# Verify connection
psql -h localhost -U postgres -d proteinlens_dev -c "SELECT version();"
```

Option B: Using Local PostgreSQL Installation

```bash
# Create database
createdb proteinlens_dev

# Verify
psql -d proteinlens_dev -c "SELECT version();"
```

### 5. Set Up Local Azure Storage Emulator (Optional)

For local blob storage testing without Azure credentials:

```bash
# Option 1: Azurite (Node.js based)
npm install -g azurite
azurite --silent --location ./data --debug ./debug.log

# Option 2: Azure Storage Emulator (Windows)
# Download from: https://go.microsoft.com/fwlink/?linkid=717179

# Option 3: Mock in code for development
# Set AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true
```

## Development Workflow

### Backend Development

```bash
cd backend

# Run tests
npm run test

# Run with watch mode for development
npm run dev

# Build TypeScript
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

The API will be available at `http://localhost:7071/api`

### Frontend Development

```bash
cd frontend

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

The frontend will be available at `http://localhost:5173`

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- health.test.ts
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

```bash
# Start backend
cd backend && npm run dev &

# Start frontend
cd frontend && npm run dev &

# Run smoke tests
bash scripts/smoke-test.sh

# Stop processes
pkill -f "npm run dev"
```

## Database Migrations

```bash
cd backend

# Run pending migrations
npm run migrate

# Rollback last migration
npm run migrate:down

# Create new migration
npm run migrate:create CreateMyTable

# Check migration status
npm run migrate:status
```

## Health Checks

Verify your local setup is working:

```bash
# Backend health check
curl http://localhost:7071/api/health | jq

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T10:30:00.000Z",
#   "version": "1.0.0",
#   "checks": {
#     "database": { "status": "ok", "latency": "15ms" },
#     "storage": { "status": "ok", "latency": "25ms" },
#     "ai": { "status": "ok", "latency": "100ms" }
#   }
# }
```

## Debugging

### Backend Debugging

```bash
# Start with Node debugger
node --inspect-brk=9229 node_modules/.bin/tsc-node src/index.ts

# Connect in VSCode: Debug → Attach to Process
# Or use Chrome DevTools: chrome://inspect
```

### Frontend Debugging

Open browser DevTools (F12) and use:
- Elements tab: Inspect DOM
- Console tab: View logs
- Network tab: Monitor API calls
- Sources tab: Set breakpoints

### Database Debugging

```bash
# Connect directly to database
psql -h localhost -U postgres -d proteinlens_dev

# View tables
\dt

# View table schema
\d table_name

# View data
SELECT * FROM table_name LIMIT 10;

# Check active connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

## Linting & Formatting

```bash
# Lint all code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

## Build & Deployment Testing

### Local Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build

# Verify builds
ls -la backend/dist
ls -la frontend/dist
```

### Test Production Build Locally

```bash
# Backend (run compiled code)
cd backend && node dist/index.js

# Frontend (preview production build)
cd frontend && npm run preview
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 7071
lsof -i :7071

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -c "SELECT 1;"

# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs proteinlens-db
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm ci
```

### TypeScript Compilation Errors

```bash
# Check TypeScript version
npm list typescript

# Rebuild TypeScript
cd backend && npm run build -- --force

# Check tsconfig.json for errors
cat backend/tsconfig.json
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test locally
npm run test

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
# Let CI/CD workflows validate before merge
```

## VS Code Setup (Recommended)

### Extensions

Install in VS Code:
- ESLint: `dbaeumer.vscode-eslint`
- Prettier: `esbenp.prettier-vscode`
- Azure Tools: `ms-vscode.vscode-azuretools`
- REST Client: `humao.rest-client`

### Settings (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Debug Configuration (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

## Performance Testing

```bash
# Load test the API (using Artillery)
npm install -g artillery

artillery quick --count 100 --num 1000 http://localhost:7071/api/health
```

## Clean Up

```bash
# Remove Docker PostgreSQL container
docker rm -f proteinlens-db

# Remove local node_modules
rm -rf backend/node_modules frontend/node_modules

# Remove build artifacts
rm -rf backend/dist frontend/dist
```

## Additional Resources

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Azure Development Setup](./docs/AZURE-SETUP.md)
- [Database Schema](./specs/004-azure-deploy-pipeline/data-model.md)
- [API Contracts](./specs/004-azure-deploy-pipeline/contracts/)
