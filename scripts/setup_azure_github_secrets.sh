#!/usr/bin/env bash
set -euo pipefail

# -----------------------------
# Config (edit if you want)
# -----------------------------
REPO_DEFAULT="lucab85/proteinlens.com"
APP_NAME_DEFAULT="github-proteinlens-deploy"
BRANCH_DEFAULT="main"

# Main Azure resources (can be overridden by args or env)
RESOURCE_GROUP_DEFAULT="${RESOURCE_GROUP:-proteinlens-prod}"
FUNCTIONAPP_NAME_DEFAULT="${FUNCTIONAPP_NAME:-proteinlens-api-prod}"
STORAGE_ACCOUNT_DEFAULT="${STORAGE_ACCOUNT:-plprodsa85}"
STORAGE_CONTAINER_DEFAULT="${STORAGE_CONTAINER:-deployments}"

# Base RBAC (management plane) - kept for backwards compat
ROLE_DEFAULT="Contributor"
SCOPE_DEFAULT=""   # if empty, will auto-use /subscriptions/<SUBSCRIPTION_ID>

# -----------------------------
# Args
# -----------------------------
REPO="${REPO_DEFAULT}"
APP_NAME="${APP_NAME_DEFAULT}"
BRANCH="${BRANCH_DEFAULT}"
ROLE="${ROLE_DEFAULT}"
SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-}"
TENANT_ID="${TENANT_ID:-}"
SCOPE="${SCOPE_DEFAULT}"
SETUP_OIDC="true"      # default: true
REUSE_EXISTING="true"  # default: true

RESOURCE_GROUP="${RESOURCE_GROUP_DEFAULT}"
FUNCTIONAPP_NAME="${FUNCTIONAPP_NAME_DEFAULT}"
STORAGE_ACCOUNT="${STORAGE_ACCOUNT_DEFAULT}"
STORAGE_CONTAINER="${STORAGE_CONTAINER_DEFAULT}"

usage() {
  cat <<EOF
Usage:
  ./setup_azure_github_secrets.sh [options]

Options:
  --repo <owner/name>          GitHub repo (default: ${REPO_DEFAULT})
  --app-name <name>            Azure app registration name (default: ${APP_NAME_DEFAULT})
  --branch <branch>            GitHub branch for OIDC subject (default: ${BRANCH_DEFAULT})
  --subscription <id>          Azure subscription ID (optional; auto-detected if logged in)
  --tenant <id>                Azure tenant ID (optional; auto-detected if logged in)

  --resource-group <name>      Azure resource group (default: ${RESOURCE_GROUP_DEFAULT})
  --functionapp <name>         Function App name (default: ${FUNCTIONAPP_NAME_DEFAULT})
  --storage-account <name>     Storage Account name (default: ${STORAGE_ACCOUNT_DEFAULT})
  --storage-container <name>   Blob container name (default: ${STORAGE_CONTAINER_DEFAULT})

  --scope <scope>              Base RBAC scope (default: /subscriptions/<SUB_ID>)
  --role <role>                Base RBAC role (default: Contributor)
  --no-oidc                    Do NOT create federated credential (still sets secrets)
  --no-reuse                   Do NOT reuse existing app (always create new)
  -h, --help                   Show help

Examples:
  ./setup_azure_github_secrets.sh
  ./setup_azure_github_secrets.sh --repo lucab85/proteinlens.com --branch main
  ./setup_azure_github_secrets.sh --resource-group proteinlens-prod --storage-account plprodsa85
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2 ;;
    --app-name) APP_NAME="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --subscription) SUBSCRIPTION_ID="$2"; shift 2 ;;
    --tenant) TENANT_ID="$2"; shift 2 ;;
    --scope) SCOPE="$2"; shift 2 ;;
    --role) ROLE="$2"; shift 2 ;;

    --resource-group) RESOURCE_GROUP="$2"; shift 2 ;;
    --functionapp) FUNCTIONAPP_NAME="$2"; shift 2 ;;
    --storage-account) STORAGE_ACCOUNT="$2"; shift 2 ;;
    --storage-container) STORAGE_CONTAINER="$2"; shift 2 ;;

    --no-oidc) SETUP_OIDC="false"; shift 1 ;;
    --no-reuse) REUSE_EXISTING="false"; shift 1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

# -----------------------------
# Checks
# -----------------------------
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1"; exit 1; }; }
need az
need gh
need jq

echo "==> Logging in (if needed)"
az account show >/dev/null 2>&1 || az login >/dev/null
gh auth status >/dev/null 2>&1 || gh auth login

# -----------------------------
# Resolve subscription + tenant
# -----------------------------
if [[ -z "${SUBSCRIPTION_ID}" ]]; then
  SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
fi
if [[ -z "${TENANT_ID}" ]]; then
  TENANT_ID="$(az account show --query tenantId -o tsv)"
fi
if [[ -z "${SCOPE}" ]]; then
  SCOPE="/subscriptions/${SUBSCRIPTION_ID}"
fi

OWNER="${REPO%%/*}"
REPO_NAME="${REPO##*/}"

echo "==> Using repo: ${REPO}"
echo "==> Using subscription: ${SUBSCRIPTION_ID}"
echo "==> Using tenant: ${TENANT_ID}"
echo "==> Resource group: ${RESOURCE_GROUP}"
echo "==> Function App: ${FUNCTIONAPP_NAME}"
echo "==> Storage account: ${STORAGE_ACCOUNT}"
echo "==> Storage container: ${STORAGE_CONTAINER}"
echo "==> Base RBAC scope: ${SCOPE}"
echo "==> OIDC setup: ${SETUP_OIDC}"

# -----------------------------
# Create or reuse App Registration
# -----------------------------
APP_ID=""
if [[ "${REUSE_EXISTING}" == "true" ]]; then
  APP_ID="$(az ad app list --display-name "${APP_NAME}" --query "[0].appId" -o tsv 2>/dev/null || true)"
fi

if [[ -z "${APP_ID}" || "${APP_ID}" == "null" ]]; then
  echo "==> Creating Azure App Registration: ${APP_NAME}"
  APP_ID="$(az ad app create --display-name "${APP_NAME}" --query appId -o tsv)"
else
  echo "==> Reusing existing App Registration: ${APP_NAME} (clientId=${APP_ID})"
fi

# Ensure Service Principal exists
echo "==> Ensuring Service Principal exists"
SP_OBJECT_ID="$(az ad sp list --filter "appId eq '${APP_ID}'" --query "[0].id" -o tsv 2>/dev/null || true)"
if [[ -z "${SP_OBJECT_ID}" || "${SP_OBJECT_ID}" == "null" ]]; then
  az ad sp create --id "${APP_ID}" >/dev/null
  SP_OBJECT_ID="$(az ad sp list --filter "appId eq '${APP_ID}'" --query "[0].id" -o tsv)"
fi

# -----------------------------
# Resolve resource scopes
# -----------------------------
echo "==> Resolving Azure resource scopes"

RG_SCOPE="/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}"

# Storage account resource ID
SA_SCOPE="$(az storage account show -g "${RESOURCE_GROUP}" -n "${STORAGE_ACCOUNT}" --query id -o tsv)"

# Function app resource ID
FUNC_SCOPE="$(az functionapp show -g "${RESOURCE_GROUP}" -n "${FUNCTIONAPP_NAME}" --query id -o tsv 2>/dev/null || true)"
if [[ -z "${FUNC_SCOPE}" || "${FUNC_SCOPE}" == "null" ]]; then
  echo "⚠️  Function App not found (yet). Will assign Contributor on Resource Group instead."
  FUNC_SCOPE="${RG_SCOPE}"
fi

echo "    RG_SCOPE   = ${RG_SCOPE}"
echo "    SA_SCOPE   = ${SA_SCOPE}"
echo "    FUNC_SCOPE = ${FUNC_SCOPE}"

# -----------------------------
# RBAC role assignments
# -----------------------------
assign_role() {
  local role="$1"
  local scope="$2"
  echo "==> Assigning role '${role}' on scope: ${scope}"
  set +e
  az role assignment create \
    --assignee-object-id "${SP_OBJECT_ID}" \
    --assignee-principal-type ServicePrincipal \
    --role "${role}" \
    --scope "${scope}" >/dev/null 2>&1
  local rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    echo "   (role may already exist or you lack permission to assign it)"
  fi
}

# Base management role (kept)
assign_role "${ROLE}" "${SCOPE}"

# Needed to set app settings / restart function app
assign_role "Contributor" "${FUNC_SCOPE}"

# Needed for `az storage blob upload --auth-mode login`
assign_role "Storage Blob Data Contributor" "${SA_SCOPE}"

# Needed for `az storage blob generate-sas --as-user`
assign_role "Storage Blob Delegator" "${SA_SCOPE}"

# -----------------------------
# Optional: Configure GitHub Actions OIDC federated credential
# -----------------------------
if [[ "${SETUP_OIDC}" == "true" ]]; then
  echo "==> Creating/Updating federated credential for GitHub OIDC (branch: ${BRANCH})"

  FC_NAME="github-${OWNER}-${REPO_NAME}-${BRANCH}"
  SUBJECT="repo:${OWNER}/${REPO_NAME}:ref:refs/heads/${BRANCH}"

  FC_JSON="$(jq -n \
    --arg name "${FC_NAME}" \
    --arg issuer "https://token.actions.githubusercontent.com" \
    --arg subject "${SUBJECT}" \
    --arg desc "GitHub Actions OIDC for ${OWNER}/${REPO_NAME} on branch ${BRANCH}" \
    '{
      name: $name,
      issuer: $issuer,
      subject: $subject,
      description: $desc,
      audiences: ["api://AzureADTokenExchange"]
    }')"

  EXISTING_ID="$(az ad app federated-credential list --id "${APP_ID}" \
    --query "[?name=='${FC_NAME}'].id | [0]" -o tsv 2>/dev/null || true)"

  if [[ -n "${EXISTING_ID}" && "${EXISTING_ID}" != "null" ]]; then
    az ad app federated-credential delete --id "${APP_ID}" --federated-credential-id "${EXISTING_ID}" >/dev/null
  fi

  az ad app federated-credential create --id "${APP_ID}" --parameters "${FC_JSON}" >/dev/null
fi

# -----------------------------
# Set GitHub Secrets
# -----------------------------
echo "==> Setting GitHub secrets in ${REPO}"
gh secret set AZURE_CLIENT_ID -R "${REPO}" --body "${APP_ID}"
gh secret set AZURE_TENANT_ID -R "${REPO}" --body "${TENANT_ID}"
gh secret set AZURE_SUBSCRIPTION_ID -R "${REPO}" --body "${SUBSCRIPTION_ID}"

# New secrets for your workflow
gh secret set AZURE_RESOURCE_GROUP -R "${REPO}" --body "${RESOURCE_GROUP}"
gh secret set AZURE_FUNCTIONAPP_NAME -R "${REPO}" --body "${FUNCTIONAPP_NAME}"
gh secret set AZURE_STORAGE_ACCOUNT -R "${REPO}" --body "${STORAGE_ACCOUNT}"
gh secret set AZURE_STORAGE_CONTAINER -R "${REPO}" --body "${STORAGE_CONTAINER}"

echo
echo "✅ Done!"
echo "AZURE_CLIENT_ID=${APP_ID}"
echo "AZURE_TENANT_ID=${TENANT_ID}"
echo "AZURE_SUBSCRIPTION_ID=${SUBSCRIPTION_ID}"
echo "AZURE_RESOURCE_GROUP=${RESOURCE_GROUP}"
echo "AZURE_FUNCTIONAPP_NAME=${FUNCTIONAPP_NAME}"
echo "AZURE_STORAGE_ACCOUNT=${STORAGE_ACCOUNT}"
echo "AZURE_STORAGE_CONTAINER=${STORAGE_CONTAINER}"
echo
echo "Next: In your workflow, use secrets like:"
echo "  STORAGE_ACCOUNT: \${{ secrets.AZURE_STORAGE_ACCOUNT }}"
echo "  CONTAINER:       \${{ secrets.AZURE_STORAGE_CONTAINER }}"
echo "  RESOURCE_GROUP:  \${{ secrets.AZURE_RESOURCE_GROUP }}"
echo "  FUNCTIONAPP:     \${{ secrets.AZURE_FUNCTIONAPP_NAME }}"
