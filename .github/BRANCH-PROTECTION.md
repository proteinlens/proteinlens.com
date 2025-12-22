# GitHub Branch Protection Configuration

This document describes the recommended branch protection rules for the `main` branch to ensure code quality and deployment safety.

## Recommended Configuration

### Required Status Checks

Configure GitHub to require these workflows to pass before merging:

```bash
# Run these commands from the repository

# 1. Require "Deploy Infrastructure" to succeed
gh api repos/{owner}/{repo}/branches/main/protection \
  --required-status-checks '[{"app": "GitHub Actions", "contexts": ["infra-validation"]}]'

# 2. Require "Deploy Backend" to succeed  
gh api repos/{owner}/{repo}/branches/main/protection \
  --required-status-checks '[{"app": "GitHub Actions", "contexts": ["backend-build"]}]'

# 3. Require "Deploy Frontend" to succeed
gh api repos/{owner}/{repo}/branches/main/protection \
  --required-status-checks '[{"app": "GitHub Actions", "contexts": ["frontend-build"]}]'
```

### Code Review Requirements

Via GitHub UI:
1. Go to **Settings → Branches → main**
2. Under "Require a pull request before merging":
   - ✅ **Require pull request reviews before merging**: ON
   - ✅ **Required number of reviews**: 1
   - ✅ **Require code owner reviews**: ON
   - ✅ **Dismiss stale pull request approvals**: ON
   - ✅ **Require status checks to pass**: ON
   - ✅ **Require branches to be up to date**: ON

### Dismiss Workflow Runs

- ✅ **Require conversation resolution**: ON (require all comments resolved)
- ✅ **Allow auto-merge**: OFF (manual merges only)
- ✅ **Require signed commits**: OFF (unless using enterprise)

## CODEOWNERS Configuration

Create `.github/CODEOWNERS` file:

```
# Default reviewers for all files
* @owner-handle

# Infrastructure changes require DevOps team
/.github/workflows/ @devops-team
/infra/ @devops-team

# Backend changes require backend team
/backend/ @backend-team

# Frontend changes require frontend team
/frontend/ @frontend-team

# Documentation changes
/docs/ @tech-lead
*.md @tech-lead
```

## Branch Protection Enforcement

The branch protection rules ensure:

✅ **Code Quality**
- All tests must pass (linting, unit tests, type checks)
- Build must succeed

✅ **Security**
- Code review required (minimum 1 reviewer)
- Code owners must approve changes
- No bypassing of protection rules (even admins)

✅ **Deployment Safety**
- Infrastructure changes validated before deployment
- Backend deployment validated before merge
- Frontend deployment validated before merge

## Implementation Via Terraform/Bicep

For IaC management, you can define branch protection as code:

```hcl
# Using Terraform GitHub provider
resource "github_branch_protection" "main" {
  repository_id = github_repository.proteinlens.id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = [
      "infra-validation",
      "backend-build",
      "frontend-build"
    ]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews  = true
    require_code_owner_reviews = true
    required_approving_review_count = 1
  }

  push_restrictions = [] # Allow all pushes except to protected branches
  allows_deletions  = false
  allows_force_pushes = false
  requires_commit_signoff = false
}
```

## Testing Branch Protection

To verify branch protection is working:

```bash
# Try to commit directly to main (should fail)
git push origin main

# Should see error: "Protect branch: Pushing to a protected branch"
```

## Exemptions

Only repository administrators can bypass these rules for emergencies. Log any bypasses in #deployments Slack channel.

## References

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
