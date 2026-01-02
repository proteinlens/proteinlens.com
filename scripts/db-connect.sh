#!/bin/bash
# Quick Database Connection Script
# Usage: ./db-connect.sh [query|shell|meals|users]

set -e

# Configuration
RG="proteinlens-prod"
DB_SERVER="proteinlens-db-prod-1523"
DB_NAME="proteinlens"
DB_USER="pgadmin"
KV_NAME="proteinlens-kv-fzpkp4yb"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get database URL from Key Vault
get_db_url() {
  az keyvault secret show --vault-name "$KV_NAME" --name database-url --query value -o tsv 2>/dev/null
}

# Get password from database URL
get_password() {
  local db_url=$(get_db_url)
  echo "$db_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p'
}

# Export DATABASE_URL for Prisma
export_db_url() {
  DB_URL=$(get_db_url)
  export DATABASE_URL="$DB_URL"
  echo -e "${GREEN}✅ DATABASE_URL exported${NC}"
}

# Run SQL via psql
run_sql() {
  local query="$1"
  PASSWORD=$(get_password)
  PGPASSWORD="$PASSWORD" psql -h "$DB_SERVER.postgres.database.azure.com" -U "$DB_USER" -d "$DB_NAME" -c "$query" 2>&1
}

# Quick queries
show_meals() {
  echo -e "${BLUE}📊 Recent Meals (last 10):${NC}"
  run_sql "SELECT \"shareId\", \"totalProtein\", \"isPublic\", LEFT(\"userId\", 8) || '...' as user, \"createdAt\"::date as date FROM \"MealAnalysis\" ORDER BY \"createdAt\" DESC LIMIT 10;"
}

show_users() {
  echo -e "${BLUE}👥 Recent Users (last 10):${NC}"
  run_sql "SELECT LEFT(id, 8) || '...' as id, email, \"emailVerified\", \"authProvider\", \"createdAt\"::date as joined FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 10;"
}

show_tables() {
  echo -e "${BLUE}📋 Database Tables:${NC}"
  run_sql "SELECT schemaname as schema, tablename as table, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
}

count_records() {
  echo -e "${BLUE}🔢 Record Counts:${NC}"
  run_sql "SELECT 'Users' as table, COUNT(*) as count FROM \"User\" UNION ALL SELECT 'MealAnalysis', COUNT(*) FROM \"MealAnalysis\" UNION ALL SELECT 'Food', COUNT(*) FROM \"Food\" UNION ALL SELECT 'RefreshToken', COUNT(*) FROM \"RefreshToken\";"
}

run_query() {
  echo -e "${BLUE}🔍 Running custom query...${NC}"
  PASSWORD=$(get_password)
  PGPASSWORD="$PASSWORD" psql -h "$DB_SERVER.postgres.database.azure.com" -U "$DB_USER" -d "$DB_NAME"
}

open_shell() {
  echo -e "${BLUE}🐘 Opening PostgreSQL shell...${NC}"
  echo -e "${YELLOW}Use \\dt to list tables, \\d tablename to describe, \\q to quit${NC}"
  PASSWORD=$(get_password)
  PGPASSWORD="$PASSWORD" psql -h "$DB_SERVER.postgres.database.azure.com" -U "$DB_USER" -d "$DB_NAME"
}

# Main script
cd "$(dirname "$0")/../backend"

export_db_url

case "${1:-query}" in
  shell|psql)
    open_shell
    ;;
  meals)
    show_meals
    ;;
  users)
    show_users
    ;;
  tables)
    show_tables
    ;;
  count)
    count_records
    ;;
  query|*)
    if [ -p /dev/stdin ]; then
      # Data is being piped
      run_query
    else
      echo -e "${GREEN}Database connected!${NC}"
      echo ""
      echo "Quick commands:"
      echo "  ${BLUE}./db-connect.sh meals${NC}   - Show recent meals"
      echo "  ${BLUE}./db-connect.sh users${NC}   - Show recent users"
      echo "  ${BLUE}./db-connect.sh tables${NC}  - Show all tables"
      echo "  ${BLUE}./db-connect.sh count${NC}   - Count all records"
      echo "  ${BLUE}./db-connect.sh shell${NC}   - Open psql shell"
      echo ""
      echo "Or pipe a query:"
      echo "  ${BLUE}echo 'SELECT * FROM \"User\" LIMIT 5;' | ./db-connect.sh${NC}"
      echo ""
      echo "Current DATABASE_URL is exported. Run Prisma commands:"
      echo "  ${BLUE}npx prisma studio${NC}         - Open Prisma Studio"
      echo "  ${BLUE}npx prisma migrate status${NC} - Check migrations"
    fi
    ;;
esac
