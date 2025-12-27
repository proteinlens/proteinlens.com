# Quickstart: Admin Dashboard

**Feature**: 012-admin-dashboard  
**Date**: 2024-12-26

## Prerequisites

- Node.js 20+
- pnpm or npm
- Azure Functions Core Tools v4
- PostgreSQL (local or Azure)
- Access to admin email allowlist

## Local Development Setup

### 1. Clone and Install

```bash
# From repo root
cd /path/to/proteinlens.com

# Install backend dependencies
cd backend && npm install && cd ..

# Install admin frontend dependencies (after creation)
cd admin && npm install && cd ..
```

### 2. Configure Environment

**Backend (.env or local.settings.json)**:
```json
{
  "Values": {
    "ADMIN_EMAILS": "admin@example.com,ops@example.com",
    "DATABASE_URL": "postgresql://...",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

**Admin Frontend (.env)**:
```bash
VITE_API_URL=http://localhost:7071/api
```

### 3. Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add-admin-dashboard
npx prisma generate
```

### 4. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# API available at http://localhost:7071
```

**Terminal 2 - Admin Frontend**:
```bash
cd admin
npm run dev
# Admin UI at http://localhost:5174
```

## Testing Admin Endpoints

### List Users
```bash
curl -X GET "http://localhost:7071/api/admin/users" \
  -H "X-Admin-Email: admin@example.com" \
  -H "Authorization: Bearer <jwt>"
```

### Get User Details
```bash
curl -X GET "http://localhost:7071/api/admin/users/user-123" \
  -H "X-Admin-Email: admin@example.com" \
  -H "Authorization: Bearer <jwt>"
```

### Override User Plan
```bash
curl -X PUT "http://localhost:7071/api/admin/users/user-123/plan" \
  -H "X-Admin-Email: admin@example.com" \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"newPlan": "PRO", "reason": "Courtesy upgrade for beta tester"}'
```

### Suspend User
```bash
curl -X POST "http://localhost:7071/api/admin/users/user-123/suspend" \
  -H "X-Admin-Email: admin@example.com" \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Terms of service violation"}'
```

### Get Platform Metrics
```bash
curl -X GET "http://localhost:7071/api/admin/metrics" \
  -H "X-Admin-Email: admin@example.com" \
  -H "Authorization: Bearer <jwt>"
```

### View Audit Log
```bash
curl -X GET "http://localhost:7071/api/admin/audit-log?action=PLAN_OVERRIDE" \
  -H "X-Admin-Email: admin@example.com" \
  -H "Authorization: Bearer <jwt>"
```

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/functions/admin-users.ts` | User list endpoint |
| `backend/src/functions/admin-plan-override.ts` | Plan override endpoint |
| `backend/src/functions/admin-suspend.ts` | Suspend/reactivate endpoints |
| `backend/src/functions/admin-metrics.ts` | Platform metrics endpoint |
| `backend/src/functions/admin-audit-log.ts` | Audit log endpoint |
| `backend/src/middleware/adminMiddleware.ts` | Admin auth & audit logging |
| `backend/prisma/schema.prisma` | Data models |
| `admin/src/pages/DashboardPage.tsx` | Admin dashboard home |
| `admin/src/pages/UsersPage.tsx` | User management |
| `admin/src/pages/AuditLogPage.tsx` | Audit log viewer |

## Deployment

### Azure Static Web App (Admin)

1. Create separate SWA for admin subdomain
2. Configure custom domain: admin.proteinlens.com
3. Link to same backend Function App
4. Set environment variables in SWA configuration

### Infrastructure

```bash
# Deploy admin SWA via Bicep
az deployment group create \
  --resource-group proteinlens-rg \
  --template-file infra/bicep/main.bicep \
  --parameters deployAdminSwa=true
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Verify email in ADMIN_EMAILS env var |
| User not found | Check user externalId matches route param |
| Audit log empty | Ensure migrations ran for AdminAuditLog table |
| Metrics incorrect | Check database connection, verify aggregation queries |
