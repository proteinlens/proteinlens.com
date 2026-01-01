#!/bin/bash
# Manual Database Backup Script
# Creates a compressed PostgreSQL dump and optionally uploads to Azure Blob Storage
#
# Usage:
#   ./scripts/backup-database.sh                    # Create local backup only
#   ./scripts/backup-database.sh --upload           # Create and upload to Azure
#   ./scripts/backup-database.sh --restore FILE     # Restore from backup file

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
RESOURCE_GROUP="rg-proteinlens"
FUNCTION_APP="func-proteinlens"
BACKUP_DIR="${PROJECT_ROOT}/backups"
CONTAINER_NAME="database-backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI not found. Install it from: https://aka.ms/installazurecli"
        exit 1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        log_error "PostgreSQL client (pg_dump) not found."
        log_info "Install on macOS: brew install postgresql"
        log_info "Install on Ubuntu: sudo apt-get install postgresql-client"
        exit 1
    fi
    
    # Check Azure login
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Run: az login"
        exit 1
    fi
    
    log_success "Prerequisites met"
}

# Fetch DATABASE_URL from Azure
get_database_url() {
    log_info "Fetching DATABASE_URL from Azure..."
    
    DATABASE_URL_RAW=$(az functionapp config appsettings list \
        --name "$FUNCTION_APP" \
        --resource-group "$RESOURCE_GROUP" \
        --query "[?name=='DATABASE_URL'].value" -o tsv)
    
    if [ -z "$DATABASE_URL_RAW" ]; then
        log_error "DATABASE_URL not found in Function App settings"
        exit 1
    fi
    
    # Resolve Key Vault reference if needed
    if [[ "$DATABASE_URL_RAW" == @Microsoft.KeyVault* ]]; then
        log_info "Resolving Key Vault reference..."
        VAULT_NAME=$(echo "$DATABASE_URL_RAW" | sed -n 's/.*VaultName=\([^;)]*\).*/\1/p')
        SECRET_NAME=$(echo "$DATABASE_URL_RAW" | sed -n 's/.*SecretName=\([^;)]*\).*/\1/p')
        
        DATABASE_URL=$(az keyvault secret show \
            --vault-name "$VAULT_NAME" \
            --name "$SECRET_NAME" \
            --query "value" -o tsv)
    else
        DATABASE_URL="$DATABASE_URL_RAW"
    fi
    
    log_success "DATABASE_URL retrieved"
    echo "$DATABASE_URL"
}

# Create backup
create_backup() {
    local database_url="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="proteinlens_backup_${timestamp}.sql.gz"
    local backup_path="${BACKUP_DIR}/${backup_file}"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    log_info "Creating database backup: $backup_file"
    
    # Extract connection details
    DB_HOST=$(echo "$database_url" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$database_url" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$database_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo "$database_url" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$database_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    # Create compressed backup
    PGPASSWORD="$DB_PASS" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        | gzip > "$backup_path"
    
    local backup_size=$(du -h "$backup_path" | cut -f1)
    log_success "Backup created: $backup_size at $backup_path"
    
    echo "$backup_path"
}

# Upload to Azure Blob Storage
upload_to_azure() {
    local backup_file="$1"
    local blob_name=$(basename "$backup_file")
    
    log_info "Uploading to Azure Blob Storage..."
    
    # Get storage account name
    STORAGE_ACCOUNT=$(az storage account list \
        --resource-group "$RESOURCE_GROUP" \
        --query "[?starts_with(name, 'stproteinlens')].name" -o tsv | head -1)
    
    if [ -z "$STORAGE_ACCOUNT" ]; then
        log_error "Storage account not found in resource group: $RESOURCE_GROUP"
        exit 1
    fi
    
    log_info "Storage account: $STORAGE_ACCOUNT"
    
    # Create container if it doesn't exist
    az storage container create \
        --name "$CONTAINER_NAME" \
        --account-name "$STORAGE_ACCOUNT" \
        --auth-mode login \
        --only-show-errors || true
    
    # Upload backup
    az storage blob upload \
        --account-name "$STORAGE_ACCOUNT" \
        --container-name "$CONTAINER_NAME" \
        --name "$blob_name" \
        --file "$backup_file" \
        --auth-mode login \
        --overwrite
    
    log_success "Backup uploaded to: $STORAGE_ACCOUNT/$CONTAINER_NAME/$blob_name"
}

# Restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_warning "⚠️  RESTORE OPERATION - This will overwrite the current database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    local database_url=$(get_database_url)
    
    # Extract connection details
    DB_HOST=$(echo "$database_url" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$database_url" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$database_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo "$database_url" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$database_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    log_info "Restoring database from: $backup_file"
    
    # Restore from compressed backup
    gunzip -c "$backup_file" | PGPASSWORD="$DB_PASS" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME"
    
    log_success "Database restored successfully"
}

# Main
main() {
    local upload=false
    local restore_file=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --upload)
                upload=true
                shift
                ;;
            --restore)
                restore_file="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Usage: $0 [--upload] [--restore FILE]"
                exit 1
                ;;
        esac
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 ProteinLens Database Backup Tool"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    check_prerequisites
    
    if [ -n "$restore_file" ]; then
        restore_backup "$restore_file"
    else
        database_url=$(get_database_url)
        backup_file=$(create_backup "$database_url")
        
        if [ "$upload" = true ]; then
            upload_to_azure "$backup_file"
        fi
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "Operation completed successfully"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main "$@"
