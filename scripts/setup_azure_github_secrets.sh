#!/usr/bin/env bash
set -euo pipefail

# -----------------------------
# Config (edit if you want)
# -----------------------------
REPO_DEFAULT="lucab85/proteinlens.com"
APP_NAME_DEFAULT="github-proteinlens-deploy"
BRANCH_DEFAULT="main"
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
SETUP_OIDC="true"   # default: true
REUSE_EXISTING="true" # default: true

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
  --scope <scope>              RBAC scope (default: /subscriptions/<SUB_ID>)
  --role <role>                RBAC role (default: Contributor)
  --no-oidc                    Do NOT create federated credential (still sets secrets)
  --no-reuse                   Do NOT reuse existing app (always create new)
  -h, --help                   Show help

Examples:
  ./setup_azure_github_secrets.sh
  ./setup_azure_github_secrets.sh --repo lucab85/proteinlens.com --branch main
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
echo "==> Using scope: ${SCOPE}"
echo "==> OIDC setup: ${SETUP_OIDC}"

# -----------------------------
# Create or reuse App Registration
# -----------------------------
APP_ID=""
if [[ "${REUSE_EXISTING}" == "true" ]]; then
  # Try find existing app by display name
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

# App object id (for some operations)
APP_OBJECT_ID="$(az ad app show --id "${APP_ID}" --query id -o tsv)"

# -----------------------------
# RBAC role assignment
# -----------------------------
echo "==> Assigning RBAC role (${ROLE}) on ${SCOPE}"
# May error if already exists; ignore that case
set +e
az role assignment create \
  --assignee-object-id "${SP_OBJECT_ID}" \
  --assignee-principal-type ServicePrincipal \
  --role "${ROLE}" \
  --scope "${SCOPE}" >/dev/null 2>&1
set -e

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

  # If a credential with same name exists, delete it then recreate (simpler + idempotent)
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

echo
echo "✅ Done!"
echo "AZURE_CLIENT_ID=${APP_ID}"
echo "AZURE_TENANT_ID=${TENANT_ID}"
echo "AZURE_SUBSCRIPTION_ID=${SUBSCRIPTION_ID}"
echo
echo "Next: Ensure your workflow uses azure/login with OIDC, e.g.:"
echo "  - uses: azure/login@v2"
echo "    with:"
echo "      client-id: \${{ secrets.AZURE_CLIENT_ID }}"
echo "      tenant-id: \${{ secrets.AZURE_TENANT_ID }}"
echo "      subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}"
