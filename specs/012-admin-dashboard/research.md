# Research: Admin Dashboard

**Feature**: 012-admin-dashboard  
**Date**: 2024-12-26  
**Status**: Complete

## Research Tasks

### 1. Admin Subdomain Deployment Strategy

**Context**: Spec requires admin dashboard on separate subdomain (admin.proteinlens.com)

**Decision**: Deploy as separate Azure Static Web App with shared backend API

**Rationale**:
- Azure Static Web Apps support custom domains with SSL certificates
- Same backend (Azure Functions) serves both main app and admin
- Separate SWA allows independent deployment and access controls
- Front Door already configured for proteinlens.com, can add admin subdomain

**Alternatives Considered**:
- Same SWA with route-based access → Rejected: harder to restrict access, no isolation
- Separate Azure App Service → Rejected: overkill for static admin UI
- Cloudflare Pages → Rejected: introduces new vendor, Azure ecosystem preferred

### 2. Admin Authentication Pattern

**Context**: Admin access via ADMIN_EMAILS environment variable

**Decision**: Extend existing adminMiddleware.ts to:
1. Check x-admin-email header against ADMIN_EMAILS env var
2. Verify JWT token from Azure AD B2C for identity
3. Cross-reference JWT email with allowlist

**Rationale**:
- Existing pattern already implemented in admin-user.ts
- Environment variable is simple and secure (no database changes needed)
- JWT verification ensures identity is authenticated before checking admin status

**Alternatives Considered**:
- Database admin flag on User model → Rejected: requires schema migration, adds complexity
- Separate Azure AD app registration for admins → Rejected: overkill for small admin team

### 3. Audit Log Storage Pattern

**Context**: All admin actions must be logged with append-only semantics

**Decision**: New AdminAuditLog table in PostgreSQL via Prisma

**Rationale**:
- Consistent with existing data model (Prisma + PostgreSQL)
- Supports filtering, pagination, search via SQL
- Append-only enforced at application layer (no UPDATE/DELETE endpoints)
- Can be extended to Azure Table Storage or Log Analytics if volume grows

**Alternatives Considered**:
- Azure Table Storage → Rejected: different query patterns, adds complexity
- Application Insights custom events → Rejected: limited retention, harder to query programmatically
- Separate audit database → Rejected: overkill for current scale

### 4. User Suspension Implementation

**Context**: Suspended users blocked from service without canceling Stripe

**Decision**: Add `suspended` boolean and `suspendedAt`/`suspendedReason` to User model

**Rationale**:
- Simple flag checked during authentication middleware
- Suspension reason stored for audit purposes
- Does not affect Stripe subscription (per spec clarification)
- Reactivation just clears the flag

**Alternatives Considered**:
- Separate SuspendedUser table → Rejected: adds JOIN complexity
- Status enum (active/suspended/deleted) → Considered but boolean simpler for now

### 5. Plan Override Without Stripe Sync

**Context**: Admin can change user plan without Stripe webhook

**Decision**: Direct database update with audit log entry, no Stripe API call

**Rationale**:
- Plan override is for special cases (courtesy upgrades, enterprise)
- Stripe billing handled separately through Stripe dashboard
- Prevents accidental subscription cancellation via admin UI
- Audit log captures who made the change and why

**Alternatives Considered**:
- Sync to Stripe subscription → Rejected: per spec, keep billing separate
- Require Stripe subscription ID → Rejected: some overrides are for non-Stripe users

### 6. Frontend Component Library

**Context**: Admin dashboard needs consistent UI with main app

**Decision**: Use same shadcn/ui + Tailwind setup as main frontend

**Rationale**:
- Constitution principle XVII requires design system consistency
- Reduces cognitive load for developers maintaining both apps
- shadcn/ui provides accessible data table, dialog, and form components

**Alternatives Considered**:
- Admin-specific UI library (Ant Design, MUI) → Rejected: breaks consistency
- Custom components → Rejected: more work, less accessible

### 7. Pagination Strategy for Large User Lists

**Context**: SC-002 requires list loads <3s for 10k users

**Decision**: Server-side pagination with cursor-based navigation

**Rationale**:
- Offset pagination is slow for large datasets
- Cursor-based (using `createdAt` or `id`) is efficient at any page
- Returns 50 users per page with total count for UI
- Filters applied server-side before pagination

**Alternatives Considered**:
- Client-side pagination → Rejected: loads all data, too slow
- Offset pagination → Rejected: performance degrades with page number

### 8. CSV Export Strategy

**Context**: Export current filtered view to CSV

**Decision**: Client-side CSV generation from loaded data (max 500 rows)

**Rationale**:
- For current scale (10k users), exporting visible/filtered data is sufficient
- Client-side generation avoids backend timeout for large exports
- If full export needed, add separate backend endpoint with streaming

**Alternatives Considered**:
- Backend streaming CSV → Future enhancement if >500 row exports needed
- Excel export → Rejected: CSV is simpler and universal

## Technology Choices Summary

| Area | Choice | Confidence |
|------|--------|------------|
| Admin Frontend | React + Vite + shadcn/ui | High |
| Admin Deployment | Separate Azure Static Web App | High |
| Admin Auth | JWT + email allowlist middleware | High |
| Audit Log Storage | PostgreSQL (Prisma) | High |
| User Suspension | Boolean flag on User model | High |
| Pagination | Cursor-based server-side | High |
| CSV Export | Client-side generation | Medium (may need backend for scale) |
