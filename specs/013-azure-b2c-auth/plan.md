# Implementation Plan: Microsoft Entra External ID Authentication

**Branch**: `013-azure-b2c-auth` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-azure-b2c-auth/spec.md`

> **Migration Note**: Azure AD B2C is discontinued for new customers as of May 1, 2025. This plan uses Microsoft Entra External ID, the successor CIAM platform.

## Summary

Configure Microsoft Entra External ID as the identity provider for ProteinLens, enabling user signup, sign-in, password reset, and social login (Google + Microsoft). The frontend MSAL integration already exists and is compatible with External ID. Primary work involves Azure infrastructure setup (External tenant, user flows, app registration) and connecting the Static Web App to External ID via environment variables.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Node.js 20 (backend)
**Primary Dependencies**: @azure/msal-browser, @azure/msal-react (already installed - compatible with External ID)
**Storage**: Microsoft Entra External ID (identity), PostgreSQL (user sync via Prisma)
**Testing**: Vitest (frontend), Manual E2E via browser
**Target Platform**: Web (Azure Static Web Apps + Azure Functions)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Login/signup < 3 minutes, sign-in < 30 seconds (SC-001, SC-002)
**Constraints**: Session timeout: 30m inactivity, 7d absolute (already implemented in AuthProvider)
**Scale/Scope**: 50,000 MAU (External ID free tier), existing User model sync

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client/Repo | ✅ PASS | External ID Client ID is not a secret (public client). Authority URL is public. |
| II. Least Privilege Access | ✅ PASS | Frontend uses delegated permissions only (openid, profile, email). |
| X. Key Vault Supremacy | ✅ PASS | No secrets needed for public MSAL client. Backend validates JWT signature. |
| XII. IaC Idempotency | ⚠️ N/A | External tenant created manually via Entra admin center (not IaC). |
| XIII. Mobile-First Design | ✅ PASS | External ID pages are mobile-responsive. Custom branding out of scope. |
| XVI. Accessibility Baseline | ✅ PASS | External ID handles accessibility for auth pages. App pages already compliant. |

**Gate Result**: PASS - No blocking violations. External ID manual setup is acceptable for initial launch (IaC for identity not supported by Bicep/Terraform).

## Project Structure

### Documentation (this feature)

```text
specs/013-azure-b2c-auth/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output - External ID research
├── data-model.md        # Phase 1 output - Claim mapping (no new entities)
├── quickstart.md        # Phase 1 output - Step-by-step setup guide
├── contracts/           # Phase 1 output - N/A (External ID handles auth API)
├── checklists/          # Requirements tracking
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── auth/
│   │   └── msalConfig.ts       # MSAL configuration (EXISTS - needs env vars)
│   ├── contexts/
│   │   └── AuthProvider.tsx    # Auth context (EXISTS - ready, MSAL compatible)
│   ├── pages/
│   │   ├── SignupPage.tsx      # Signup page (EXISTS - ready)
│   │   └── SignIn.tsx          # Sign-in page (EXISTS - ready)
│   └── config.ts               # Auth config (EXISTS - reads env vars)
├── .env.local.template         # Local dev template (CREATED)
└── .env.example                # Example env file (UPDATED)

infra/
├── bicep/
│   └── main.bicep              # May need env vars for deployment
└── azure-pipelines.yml         # Add External ID env vars to deployment

# Microsoft Entra Admin Center (manual configuration)
Microsoft Entra External ID/
├── External Tenant: proteinlenscustomers.onmicrosoft.com (TO CREATE)
├── App Registration: ProteinLens Web (TO CREATE)
├── User Flows:
│   └── SignUpSignIn             # Combined signup/signin flow (TO CREATE)
└── Identity Providers:
    ├── Google (TO CONFIGURE)
    └── Microsoft (BUILT-IN)
```

**Structure Decision**: Minimal code changes required. Primary work is External ID infrastructure setup in Microsoft Entra admin center and environment variable configuration in Azure Static Web App.

---

## Phase 0: Research

### Research Tasks

1. **Microsoft Entra External ID vs Azure AD B2C**
   - Confirmed: B2C discontinued May 1, 2025 for new customers
   - External ID is successor CIAM platform
   - Same MSAL library works (no code changes needed)
   - Different login domain: `ciamlogin.com` (not `b2clogin.com`)

2. **External tenant creation requirements**
   - Created via Microsoft Entra admin center (https://entra.microsoft.com)
   - Requires Tenant Creator role or Global Administrator
   - Select "External" configuration type (not workforce)
   - Tenant naming: `<name>.onmicrosoft.com`

3. **User flow configuration in External ID**
   - Self-service sign-up flow
   - Sign-in methods: email/password, one-time passcode
   - Social identity providers: Google, Microsoft (built-in)

4. **MSAL configuration patterns**
   - Authority URL format: `https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com`
   - No policy suffix needed (unlike B2C)
   - `knownAuthorities` must use `ciamlogin.com` domain

### Research Output

See [research.md](./research.md) for detailed findings.

---

## Phase 1: Design

### Data Model

**No new entities required.** The existing `User` model already supports External ID integration:
- `externalId`: Maps to External ID object ID (oid claim)
- `email`: From External ID email claim
- `emailVerified`: Set based on External ID verification
- `firstName`, `lastName`: From External ID profile claims

See [data-model.md](./data-model.md) for claim mapping details.

### API Contracts

**No new APIs required.** External ID handles all authentication endpoints:
- `/authorize` - External ID hosted
- `/token` - External ID hosted
- Backend `/api/me` already validates JWT and syncs user

External ID OpenID Configuration:
```
https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/v2.0/.well-known/openid-configuration
```

### Environment Variables

| Variable | Source | Example Value |
|----------|--------|---------------|
| `VITE_AUTH_CLIENT_ID` | External ID App Registration | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `VITE_AUTH_AUTHORITY` | External ID Tenant | `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com` |
| `VITE_AUTH_REDIRECT_URI` | Static Web App URL | `https://www.proteinlens.com` |

> **Key Difference from B2C**: External ID uses `ciamlogin.com` domain instead of `b2clogin.com`

### Quickstart

See [quickstart.md](./quickstart.md) for step-by-step setup guide.

---

## Phase 2: Task Breakdown

*Generated by `/speckit.tasks` command - see [tasks.md](./tasks.md)*

### High-Level Tasks (Preview)

| Phase | Task | Priority |
|-------|------|----------|
| Setup | T001-T007: Create External tenant, App Registration | P1 |
| Foundational | T008-T012: User flows, msalConfig update, env vars | P1 |
| US1 Signup | T013-T017: Test signup flow, verify user sync | P1 |
| US2 Sign In | T018-T022: Test sign-in flow, verify session | P1 |
| US6 Sign Out | T023-T026: Test sign-out, verify session cleanup | P1 |
| US3 Google | T027-T032: Configure Google OAuth, test federation | P2 |
| US4 Microsoft | T033-T036: Enable built-in Microsoft provider | P2 |
| US5 Password Reset | T037-T041: Test password reset flow | P2 |
| Polish | T042-T047: Documentation, validation | P2 |

---

## Complexity Tracking

> No complexity violations. This feature primarily involves Azure infrastructure configuration, not code changes.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| Code Changes | Low | MSAL already integrated, only knownAuthorities update needed |
| Infrastructure | Medium | External tenant, user flows, identity providers (manual setup) |
| Testing | Low | Browser-based E2E testing |
| Risk | Low | Standard External ID setup pattern |

---

## Key Differences: External ID vs B2C

| Aspect | Azure AD B2C (Deprecated) | Microsoft Entra External ID |
|--------|---------------------------|------------------------------|
| Admin Portal | Azure Portal | Microsoft Entra admin center (entra.microsoft.com) |
| Tenant Type | B2C Tenant | External Tenant Configuration |
| Login Domain | `*.b2clogin.com` | `*.ciamlogin.com` |
| Authority URL | `https://tenant.b2clogin.com/tenant.onmicrosoft.com/B2C_1_policy` | `https://tenant.ciamlogin.com/tenant.onmicrosoft.com` |
| User Flows | B2C User Flows | External ID User Flows |
| Microsoft Account | Required separate app registration | Built-in identity provider |
| MSAL Compatibility | ✅ Yes | ✅ Yes (same library) |
| Free Tier | 50K MAU | 50K MAU |

---

## Implementation Checklist

- [x] Phase 0: Research complete ([research.md](./research.md))
- [x] Phase 1: Data model defined ([data-model.md](./data-model.md))
- [ ] Phase 1: Contracts (N/A - External ID handles auth API)
- [x] Phase 1: Quickstart guide ([quickstart.md](./quickstart.md))
- [x] Phase 2: Tasks generated ([tasks.md](./tasks.md))
- [ ] Implementation: External tenant created
- [ ] Implementation: App registration created
- [ ] Implementation: User flows configured
- [ ] Implementation: Environment variables set
- [ ] Implementation: Social providers configured
- [ ] Validation: E2E testing complete
