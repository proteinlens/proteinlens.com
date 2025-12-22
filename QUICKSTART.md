# ProteinLens Quick Start Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (local or Azure)
- Azure subscription with:
  - Blob Storage account
  - AI Foundry endpoint (GPT-5.1 Vision)
  - (Optional) Key Vault for production

## 1. Clone and Install

```bash
git clone <repository-url>
cd proteinlens.com

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Database Setup

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
DATABASE_URL="postgresql://username:password@localhost:5432/proteinlens"
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
BLOB_CONTAINER_NAME=meals
AI_FOUNDRY_ENDPOINT=https://your-foundry.azure.com
AI_MODEL_DEPLOYMENT=gpt-5.1-vision
AI_API_KEY=your-ai-key
EOF

# Run Prisma migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

## 3. Azure Storage Setup

### Option A: Local Development with Azure CLI

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name proteinlens-rg --location eastus

# Create storage account
az storage account create \
  --name proteinlensstorage \
  --resource-group proteinlens-rg \
  --location eastus \
  --sku Standard_LRS

# Create blob container
az storage container create \
  --name meals \
  --account-name proteinlensstorage \
  --auth-mode login

# Update .env with storage account name
# AZURE_STORAGE_ACCOUNT_NAME=proteinlensstorage
```

### Option B: Use Azure Portal

1. Go to [portal.azure.com](https://portal.azure.com)
2. Create Storage Account
3. Create container named "meals"
4. Copy account name to `.env`

## 4. AI Foundry Setup

```bash
# Get your AI Foundry endpoint and API key
# From Azure Portal → AI Foundry → Keys and Endpoint

# Update .env:
# AI_FOUNDRY_ENDPOINT=https://your-foundry.azure.com
# AI_MODEL_DEPLOYMENT=gpt-5.1-vision
# AI_API_KEY=your-key-here
```

## 5. Run the Application

### Terminal 1: Backend

```bash
cd backend
npm run start

# Azure Functions Core Tools will start on http://localhost:7071
# You should see:
# - upload-url: [POST] http://localhost:7071/api/upload-url
# - analyze: [POST] http://localhost:7071/api/meals/analyze
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev

# Vite will start on http://localhost:5173
# Open browser to http://localhost:5173
```

## 6. Test the Application

1. Open http://localhost:5173
2. Click "Choose Photo"
3. Select a meal photo (JPEG/PNG, max 8MB)
4. Click "Analyze Protein"
5. Wait for AI analysis (may take 5-10 seconds)
6. View results with protein breakdown

## 7. Run Tests

```bash
cd backend

# Unit tests (no Azure connection needed)
npm test -- tests/unit

# Contract tests (requires backend running)
npm run start &
npm test -- tests/contract

# Integration tests (requires Azure credentials)
npm test -- tests/integration
```

## Troubleshooting

### "DefaultAzureCredential failed to retrieve token"

**Solution**: Login with Azure CLI:
```bash
az login
```

### "Database connection error"

**Solution**: Check PostgreSQL is running and DATABASE_URL is correct:
```bash
# Test connection
psql $DATABASE_URL
```

### "AI analysis failed"

**Solution**: Verify AI Foundry credentials:
```bash
# Test endpoint
curl -X POST $AI_FOUNDRY_ENDPOINT/chat/completions \
  -H "api-key: $AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

### "Blob upload failed"

**Solution**: Check storage account CORS settings:
```bash
az storage cors add \
  --services b \
  --methods PUT \
  --origins http://localhost:5173 \
  --allowed-headers "*" \
  --max-age 3600 \
  --account-name $AZURE_STORAGE_ACCOUNT_NAME
```

### "Frontend can't reach backend"

**Solution**: Vite proxy is configured for `/api` → `http://localhost:7071`.  
Check `frontend/vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:7071',
      changeOrigin: true
    }
  }
}
```

## Development Workflow

1. **Make changes to backend** → Functions auto-reload
2. **Make changes to frontend** → Vite HMR updates instantly
3. **Database schema changes**:
   ```bash
   cd backend
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name your_change_name
   ```

## Production Deployment

### Deploy Infrastructure

```bash
cd infra
az deployment group create \
  --resource-group proteinlens-rg \
  --template-file bicep/main.bicep \
  --parameters location=eastus
```

### Deploy Backend

```bash
cd backend
func azure functionapp publish proteinlens-func-app
```

### Deploy Frontend

```bash
cd frontend
npm run build

# Option 1: Azure Static Web Apps
az staticwebapp create \
  --name proteinlens-frontend \
  --resource-group proteinlens-rg \
  --source dist/

# Option 2: Azure App Service
az webapp up \
  --name proteinlens-frontend \
  --resource-group proteinlens-rg \
  --runtime "node:18" \
  --sku B1
```

## Configuration Checklist

- [ ] PostgreSQL database running
- [ ] `backend/.env` configured with all variables
- [ ] Azure Storage account created
- [ ] Blob container "meals" exists
- [ ] CORS enabled on storage account
- [ ] AI Foundry endpoint configured
- [ ] Azure CLI logged in (`az login`)
- [ ] Prisma migration run
- [ ] Backend running on port 7071
- [ ] Frontend running on port 5173

## Next Steps

- ✅ Phase 3 (User Story 1) - Complete
- ⏳ Phase 4 (User Story 2) - Edit and correct analysis
- ⏳ Phase 5 (User Story 3) - Delete meal data
- ⏳ Phase 6 - Polish and optimization

## Resources

- [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
- [Azure Blob Storage SDK](https://learn.microsoft.com/azure/storage/blobs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React + Vite Guide](https://vitejs.dev/guide/)
- [Project Constitution](../.specify/constitution/constitution.md)
- [Feature Specification](./specs/001-blob-vision-analysis/spec.md)
