#!/bin/bash
# Reset PostgreSQL admin password

az postgres flexible-server update \
  --resource-group proteinlens-prod \
  --name proteinlens-db-prod-1523 \
  --subscription 15728494-f8c0-46c5-aea9-553e6c28e19c \
  --admin-password ProteinLens2025SecureDB \
  --output json

echo ""
echo "Now update the Key Vault secret with:"
echo "DATABASE_URL=postgresql://pgadmin:ProteinLens2025SecureDB@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require"
