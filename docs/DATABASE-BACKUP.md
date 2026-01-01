# Database Backup System

Automated and manual PostgreSQL database backup solution for ProteinLens.

## 📦 What's Included

1. **Automated Daily Backups** (GitHub Actions)
   - Runs daily at 2 AM UTC
   - Stores compressed dumps in Azure Blob Storage
   - 30-day retention (configurable)
   - Manual trigger available

2. **Manual Backup Script**
   - On-demand backups from your local machine
   - Restore capability
   - Optional Azure upload

## 🚀 Setup

### GitHub Actions (Automated)

The workflow is already configured and will run automatically. No additional setup needed if `AZURE_CREDENTIALS` secret is already configured.

**To verify it's working:**
1. Go to: https://github.com/proteinlens/proteinlens.com/actions/workflows/database-backup.yml
2. Click "Run workflow" to test manually

**Schedule:** Daily at 2 AM UTC

**Storage Location:** Azure Blob Storage
- Container: `database-backups`
- Retention: 30 days (auto-cleanup)

### Manual Backup Script

#### Prerequisites

1. **Azure CLI**
   ```bash
   # macOS
   brew install azure-cli
   
   # Ubuntu/Debian
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **PostgreSQL Client**
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   ```

3. **Azure Login**
   ```bash
   az login
   ```

## 📖 Usage

### Create Local Backup

```bash
./scripts/backup-database.sh
```

Creates compressed backup in `backups/` directory:
- File: `proteinlens_backup_YYYYMMDD_HHMMSS.sql.gz`
- Format: Compressed SQL dump
- Size: ~1-10MB (depending on data)

### Create & Upload to Azure

```bash
./scripts/backup-database.sh --upload
```

Creates backup and uploads to Azure Blob Storage for long-term retention.

### Restore from Backup

```bash
./scripts/backup-database.sh --restore backups/proteinlens_backup_20260101_140000.sql.gz
```

⚠️ **WARNING:** This will overwrite the current database. Confirmation required.

### Download Backup from Azure

```bash
# List all backups
az storage blob list \
  --account-name stproteinlens... \
  --container-name database-backups \
  --auth-mode login \
  --output table

# Download specific backup
az storage blob download \
  --account-name stproteinlens... \
  --container-name database-backups \
  --name proteinlens_backup_20260101_020000.sql.gz \
  --file ./downloaded_backup.sql.gz \
  --auth-mode login
```

## 🔍 Monitoring

### Check GitHub Actions Status

```bash
# View recent workflow runs
gh run list --workflow=database-backup.yml --limit 5

# View logs from latest run
gh run view --workflow=database-backup.yml --log
```

### Verify Azure Backups

```bash
# List all backups in Azure
az storage blob list \
  --account-name $(az storage account list \
    --resource-group rg-proteinlens \
    --query "[?starts_with(name, 'stproteinlens')].name" -o tsv | head -1) \
  --container-name database-backups \
  --auth-mode login \
  --query "[].{Name:name, Size:properties.contentLength, Created:properties.creationTime}" \
  --output table
```

## 📊 Backup Strategy

| Type | Frequency | Retention | Location | Purpose |
|------|-----------|-----------|----------|---------|
| **Azure Built-in** | Daily | 7-35 days | Azure PostgreSQL | Point-in-time restore |
| **GitHub Actions** | Daily (2 AM) | 30 days | Azure Blob Storage | Long-term dumps |
| **Manual** | On-demand | Indefinite | Local/Azure | Development, migrations |

## 🔧 Configuration

### Change Backup Schedule

Edit `.github/workflows/database-backup.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'  # Daily at 2 AM UTC
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * 0'  # Weekly on Sundays
```

### Change Retention Period

**GitHub Actions:**
Run workflow manually with custom retention:
1. Go to Actions → Database Backup
2. Click "Run workflow"
3. Set `retention_days` parameter

**Manual Script:**
Backups in `backups/` directory are never auto-deleted. Clean manually:

```bash
# Delete backups older than 30 days
find backups/ -name "*.sql.gz" -mtime +30 -delete
```

## 🆘 Troubleshooting

### "Not logged in to Azure"
```bash
az login
# Select your subscription
az account set --subscription "YourSubscriptionName"
```

### "pg_dump: command not found"
```bash
# Install PostgreSQL client (not server)
brew install postgresql  # macOS
sudo apt-get install postgresql-client  # Ubuntu
```

### "Permission denied" on script
```bash
chmod +x scripts/backup-database.sh
```

### GitHub Actions Failure

1. Check workflow logs in Actions tab
2. Verify `AZURE_CREDENTIALS` secret is configured
3. Ensure Azure service principal has access to:
   - Function App (to read DATABASE_URL)
   - Key Vault (to resolve secrets)
   - Storage Account (to upload backups)

## 📝 Best Practices

1. **Test Restore Regularly**
   ```bash
   # Download a backup and test restore on a dev database
   ./scripts/backup-database.sh --restore backups/latest.sql.gz
   ```

2. **Monitor Backup Size**
   - Sudden size increases may indicate data issues
   - Normal growth is expected

3. **Secure Backup Storage**
   - Azure Blob Storage uses encryption at rest
   - Access requires Azure authentication
   - Never commit backup files to git

4. **Before Major Changes**
   ```bash
   # Create manual backup before migrations or data updates
   ./scripts/backup-database.sh --upload
   ```

## 🔗 Related Documentation

- [Azure PostgreSQL Backup Documentation](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-backup-restore)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Azure Blob Storage CLI](https://learn.microsoft.com/en-us/cli/azure/storage/blob)
