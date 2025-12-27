# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at ProteinLens. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Email**: Send details to security@proteinlens.com
2. **Subject**: Include "SECURITY" in the subject line
3. **Details**: Provide a clear description of the vulnerability, steps to reproduce, and potential impact

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Depends on severity (Critical: 24-48h, High: 7 days, Medium: 30 days)

### Guidelines

- Do not publicly disclose the vulnerability until we've addressed it
- Do not access or modify other users' data
- Do not perform actions that could harm the service or its users

## Security Measures

- All data encrypted in transit (TLS 1.3)
- Secrets stored in Azure Key Vault
- Dependabot enabled for dependency updates
- Gitleaks scanning for secret detection
- npm audit for vulnerability scanning

## Scope

This policy applies to:
- https://proteinlens.com
- https://api.proteinlens.com
- This GitHub repository

Thank you for helping keep ProteinLens secure.
