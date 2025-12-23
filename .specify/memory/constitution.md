<!--
SYNC IMPACT REPORT
==================
Version Change: 2.0.0 → 3.0.0
Change Type: MINOR (New principles added for infrastructure/DevOps governance)
Principles Modified:
  - Principle VII renamed from "Privacy & User Data Rights" to "Intelligent Analysis Infrastructure" (expanded scope, new AI Foundry focus)
Principles Added:
  - IX. On-Demand Resource Lifecycle (NEW - addresses resource disposability)
  - X. Secrets Management & Key Vault Supremacy (NEW - addresses secrets handling)
  - XI. Zero-Downtime Key Rotation (NEW - addresses key rotation strategy)
  - XII. Infrastructure-as-Code Idempotency (NEW - addresses infrastructure idempotency)
  - VIII. Privacy & User Data Rights (MOVED - now comes after new infrastructure principles)
Added Sections:
  - 4 new infrastructure/DevOps governance principles (IX-XII)
  - Relabeled UX principles XIII-XIX (was VIII-XIV)
Modified Sections:
  - Principle VII expanded to include AI Foundry/GPT-5.1 specific requirements
Principles Affected by Constitutional Changes:
  - I. Zero Secrets in Client or Repository (reinforced by new Principle X)
  - II. Least Privilege Access (works with new Principle X for secret access audit trails)
  - IV. Traceability & Auditability (works with new Principle X for secret access logging)
Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section must include resource lifecycle and infrastructure idempotency validation
  ✅ spec-template.md - Infrastructure specs must document Key Vault references and rotation strategy
  ✅ tasks-template.md - Infrastructure tasks must include idempotency testing and secret rotation procedures
  ✅ commands/*.md - Infrastructure commands must verify "up" and "down" idempotency
Follow-up TODOs:
  - Add automated idempotency testing in CI/CD pipeline (deploy → verify → redeploy → diff should be empty)
  - Implement Key Vault secret rotation automation (dual-key strategy)
  - Add resource cleanup Lambda/runbook for ephemeral resource auto-deletion
  - Implement Key Vault access audit logging in Application Insights
-->

# ProteinLens Constitution

## Core Principles (Backend & Infrastructure)

### I. Zero Secrets in Client or Repository (NON-NEGOTIABLE)

**Rules**:
- Client applications (web, mobile, CLI) MUST NOT contain secrets, API keys, or connection strings
- Source repositories MUST NOT contain credentials of any kind
- All secrets MUST be stored in Azure Key Vault or Azure App Service application settings
- Connection strings and service credentials MUST be injected at runtime via environment configuration

**Rationale**: Prevents credential leaks, supports secure CI/CD, enables secret rotation without code changes, and ensures compliance with security best practices.

### II. Least Privilege Access (NON-NEGOTIABLE)

**Rules**:
- Storage account access MUST use Azure Managed Identity; account keys are FORBIDDEN
- Service-to-service authentication MUST use Managed Identity where supported
- Database connections MUST use Managed Identity or Entra ID authentication; SQL username/password connections are FORBIDDEN except for local development
- Each component MUST request only the minimum permissions required for its function
- Role-based access control (RBAC) MUST be applied at the resource and operation level

**Rationale**: Reduces attack surface, eliminates credential management overhead, enables audit trails, and aligns with Zero Trust security model.

### III. Blob-First Ingestion (NON-NEGOTIABLE)

**Rules**:
- Every uploaded image MUST be persisted to Azure Blob Storage BEFORE AI inference is invoked
- AI services MUST NOT process transient/in-memory-only images
- Blob upload confirmation MUST be received before proceeding to analysis
- Blob URIs MUST be used as the canonical reference for all subsequent operations

**Rationale**: Ensures data durability, enables reprocessing without re-upload, supports audit trails, and decouples storage from compute.

### IV. Traceability & Auditability

**Rules**:
- Every AI analysis result MUST link to the source blob path (container + blob name)
- Every analysis record MUST include a unique request ID (correlation ID)
- All API operations MUST log request ID, user identity, timestamp, and resource identifiers
- Analysis results stored in the database MUST reference blob path and request ID as mandatory fields

**Rationale**: Enables debugging, supports compliance audits, facilitates troubleshooting, and provides end-to-end observability.

### V. Deterministic JSON Output

**Rules**:
- AI inference responses MUST return schema-valid JSON
- JSON schemas MUST be documented and versioned
- Invalid or malformed AI responses MUST be rejected with clear error codes
- Response parsing MUST validate against schema before persisting
- Schema validation errors MUST be logged with request ID for investigation

**Rationale**: Ensures predictable downstream processing, prevents silent data corruption, enables automated testing, and simplifies client-side integration.

### VI. Cost Controls & Resource Limits

**Rules**:
- Image uploads MUST enforce maximum file size limits (e.g., 10 MB default, configurable via app settings)
- AI inference requests MUST cap token limits to prevent runaway costs
- Analysis results MUST be cached; identical blob SHA-256 hash MUST return cached result if available
- Cache expiration policies MUST be configurable (e.g., 24 hours default)
- Cost anomaly alerts MUST be configured for storage and AI service consumption

**Rationale**: Prevents unexpected billing, optimizes performance, reduces redundant processing, and ensures sustainable operation.

### VII. Intelligent Analysis Infrastructure

**Rules**:
- AI analysis (meal nutrition, macros, confidence scoring) MUST use Azure AI Foundry with GPT-5.1 model capability
- AI analysis results MUST include confidence scores (0-100%) alongside all predictions
- Cache hit rates for analysis requests SHOULD be tracked and optimized
- Model versioning MUST be tracked: every analysis result MUST store the model version/date used

**Rationale**: Ensures consistent intelligent analysis capability, provides quantifiable confidence for trust UI, enables model upgrade tracking for auditability, and supports multi-model strategy as AI evolves.

### VIII. Privacy & User Data Rights

**Rules**:
- Blob storage containers MUST have retention policies configured
- Users MUST be able to delete their data; delete operation MUST remove both blob and database records
- Cascade delete MUST be implemented: deleting a blob triggers deletion of associated analysis records
- Delete operations MUST be logged with user ID, request ID, and timestamp
- Retention policies MUST comply with applicable data protection regulations (GDPR, CCPA, etc.)

**Rationale**: Respects user privacy rights, ensures regulatory compliance, prevents indefinite data accumulation, and builds user trust.

### IX. On-Demand Resource Lifecycle (NON-NEGOTIABLE)

**Rules**:
- All infrastructure resources MUST support create and delete operations with zero leftovers
- Ephemeral resources (e.g., temporary VMs, test deployments) MUST auto-delete after usage completes or TTL expires
- Resource naming MUST include environment prefix (dev-, test-, prod-) to enable safe bulk deletion by lifecycle
- Dependent resources (child resources, RBAC assignments, locks) MUST be recursively cleaned when parent is deleted
- Deletion MUST be idempotent: deleting already-deleted resources MUST NOT fail or raise errors
- Azure cleanup scripts MUST validate complete removal: no orphaned disks, NICs, NSGs, or role assignments

**Rationale**: Prevents cloud cost accumulation from residual resources, reduces security attack surface, simplifies ephemeral testing environments, and ensures clean teardown for disaster recovery drills.

### X. Secrets Management & Key Vault Supremacy (NON-NEGOTIABLE)

**Rules**:
- All secrets (API keys, connection strings, passwords, tokens) MUST be stored in Azure Key Vault or Azure App Service application settings
- GitHub Secrets MUST NOT contain sensitive credentials; only non-sensitive identifiers (subscription IDs, tenant IDs, service principal client IDs)
- OpenAI API key MUST have a single source of truth: Key Vault secret only; MUST NOT be stored in GitHub Secrets or .env files
- Third-party service credentials (Stripe, PostgreSQL, etc.) MUST use managed identity or Key Vault reference where supported
- Secrets retrieved at runtime MUST be cached in application memory; repeated Key Vault calls are FORBIDDEN (cache duration: 5 minutes minimum)
- Secret access MUST be logged via Application Insights with user identity and reason (audit trail required)

**Rationale**: Key Vault provides cryptographic protection, audit trails, and enables rotation without code changes. Centralizing secrets in one location prevents accidental exposure across multiple systems. Runtime caching reduces latency and API throttling risk.

### XI. Zero-Downtime Key Rotation (NON-NEGOTIABLE)

**Rules**:
- Cryptographic keys and secrets MUST support dual-key strategy: active and staged keys coexist
- Key rotation workflow MUST follow: (1) create new key, (2) stage both old and new as valid, (3) test acceptance with new key, (4) promote new key to active, (5) archive old key
- Service clients MUST accept either old or new key during rotation window (typically 24 hours)
- Rotation MUST NOT require service restart or downtime; all services MUST reload keys from Key Vault on each request or within 5-minute cache window
- Rotation completion MUST be verified: monitor logs to confirm 100% of new requests use new key before archiving old key
- Emergency revocation (e.g., leaked key) MUST retire old key immediately while gracefully rejecting old-key requests with clear error

**Rationale**: Cryptographic keys must be rotated periodically for security. Dual-key strategy allows staged migration without service disruption. Client-side key refresh ensures no downtime during rotation.

### XII. Infrastructure-as-Code Idempotency (NON-NEGOTIABLE)

**Rules**:
- "Up" operation (terraform apply / bicep deploy) MUST be safe to re-run multiple times without errors or resource duplication
- "Down" operation (terraform destroy / bicep deletion) MUST succeed even if partial failure occurred on prior attempt
- All Bicep modules MUST use conditional deployments with feature flags; disabled resources MUST be cleanly removed without orphans
- State files (Terraform) or deployment outputs MUST accurately reflect actual resource state; drift detection MUST be run weekly
- Idempotency tests MUST be automated: deploy → verify → redeploy → verify identical state (no changes detected)
- Manual infrastructure changes (via Azure Portal) are FORBIDDEN; all changes MUST go through IaC (Bicep/Terraform)

**Rationale**: Idempotent infrastructure enables safe re-deployment for disaster recovery, reduces human error in manual deployment, supports fully automated CI/CD without operational overhead, and makes troubleshooting deterministic.

## User Experience & Interface Standards

### XIII. Mobile-First Design (NON-NEGOTIABLE)

## User Experience & Interface Standards

### XIII. Mobile-First Design (NON-NEGOTIABLE)

**Rules**:
- All UI components MUST be designed for one-handed thumb-reachable operation on phones (primary target: 375px viewport width, iPhone SE/13/14/15)
- Desktop layouts MUST be progressive enhancements of mobile layouts, not separate designs
- Touch targets MUST be minimum 44×44px for all interactive elements
- Navigation patterns MUST prioritize vertical scrolling over horizontal or multi-step flows
- Critical actions MUST be positioned in the bottom third of mobile screens for thumb accessibility
- Responsive breakpoints MUST follow mobile-first approach: design for 375px, then enhance for 768px (tablet), then 1024px+ (desktop)

**Rationale**: Majority of users access meal tracking apps on mobile during meal times. One-handed operation enables use while eating, cooking, or at restaurants. Mobile-first ensures core experience works for all users, then progressively enhances for larger screens.

### XIV. Fast Perceived Performance (NON-NEGOTIABLE)

**Rules**:
- Initial meaningful content MUST render within 300ms of page load (First Contentful Paint)
- Skeleton screens or placeholder UI MUST be shown immediately for loading states
- Progressive rendering MUST display content as it becomes available (don't wait for all data)
- Images MUST use lazy loading with low-quality placeholders (LQIP) or dominant color backgrounds
- Route transitions MUST be instant (no full-page reloads for SPA navigation)
- Time-to-Interactive (TTI) MUST be under 3 seconds on 3G connections

**Rationale**: Users perceive systems as faster when they see immediate visual feedback. 300ms is the threshold where delays become perceptible. Skeleton screens reduce perceived wait time by 20-30% compared to spinners.

### XV. Delight Without Friction (NON-NEGOTIABLE)

**Rules**:
- Micro-animations MUST enhance understanding (e.g., button press feedback, list item removal)
- Animations MUST be fast (100-200ms for micro-interactions, 300-400ms for transitions)
- Blocking spinners are FORBIDDEN; use inline progress indicators or optimistic UI instead
- Loading states MUST allow interaction with already-loaded content (no full-screen overlays)
- Success feedback MUST be subtle and non-intrusive (toast notifications auto-dismiss in 3 seconds)
- Animations MUST respect `prefers-reduced-motion` media query (disable all non-essential animations)

**Rationale**: Micro-animations provide visual feedback that operations succeeded without requiring explicit confirmation dialogs. Blocking spinners break flow and frustrate users. Optimistic UI makes apps feel instant.

### XVI. Accessibility Baseline (NON-NEGOTIABLE)

**Rules**:
- All interactive elements MUST be keyboard-navigable (Tab, Enter, Escape, Arrow keys)
- Focus states MUST be visible with 3:1 contrast ratio against background
- Color contrast MUST meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text/UI elements)
- Typography MUST be readable: minimum 16px for body text, 1.5 line height, max 65 characters per line
- Form inputs MUST have visible labels (not placeholder-only)
- ARIA labels MUST be provided for icon-only buttons and custom controls
- Skip-to-main-content links MUST be available on all pages

**Rationale**: 15% of global population has some form of disability. Keyboard navigation is essential for motor impairment users. High contrast benefits users in bright sunlight (common for meal photos). Accessibility improvements benefit all users.

### XVII. Design System Consistency (NON-NEGOTIABLE)

**Rules**:
- All UI components MUST use shadcn/ui component library (no custom alternatives without justification)
- Styling MUST use Tailwind utility classes with design tokens from tailwind.config.js
- Colors, spacing, typography MUST reference design tokens (e.g., `text-gray-900`, `px-4`, `font-semibold`)
- Custom CSS is FORBIDDEN except for unique animations or complex layouts not supported by Tailwind
- Component variants MUST be defined in shadcn/ui component files (e.g., Button variants: primary, secondary, ghost)
- New components MUST extend shadcn/ui primitives rather than creating from scratch

**Rationale**: Design system ensures visual consistency across the app. Tailwind tokens make global redesigns trivial (change token, entire app updates). shadcn/ui provides accessible primitives that work out of the box.

### XVIII. Trust UI (NON-NEGOTIABLE)

**Rules**:
- AI analysis results MUST always display confidence level (e.g., "85% confident")
- Analysis screens MUST show "what the AI saw" via the original uploaded image
- Users MUST be able to edit AI-detected values (protein, calories) without re-uploading
- Edit flows MUST preserve original AI response for reference (show "AI detected: 25g protein" while editing)
- Error states MUST explain what went wrong and suggest next steps (not generic "Error occurred")
- Data sources MUST be cited when providing nutritional information ("Based on USDA database")

**Rationale**: AI nutrition analysis is probabilistic and may be inaccurate. Showing confidence builds trust by acknowledging uncertainty. Edit capability gives users control. Showing original image lets users verify AI interpretation.

### XIX. Action-First Screens (NON-NEGOTIABLE)

**Rules**:
- Every screen MUST have a single, obvious primary action (e.g., "Upload Meal Photo" button)
- Primary action buttons MUST be visually prominent (larger size, high contrast, positioned in thumb zone)
- Secondary actions MUST be visually de-emphasized (ghost buttons, smaller text links)
- Empty states MUST include a call-to-action ("No meals yet. Upload your first meal →")
- Confirmation dialogs MUST have action-oriented button labels (not "Yes/No", use "Delete Meal/Cancel")
- Navigation MUST prioritize task completion over exploration (minimize chrome, maximize content)

**Rationale**: Mobile users are task-focused (log a meal, check protein intake). Every screen should guide users to the most common next action. Clear visual hierarchy reduces cognitive load.

## Security & Privacy Standards

**Authentication & Authorization**:
- User authentication MUST use Azure Entra ID (formerly Azure Active Directory) or equivalent identity provider
- API endpoints MUST enforce authentication and authorization checks before processing requests
- Anonymous access is FORBIDDEN except for explicitly public endpoints (e.g., health checks)

**Data Protection**:
- Data at rest MUST be encrypted using Azure-managed encryption keys
- Data in transit MUST use TLS 1.2 or higher
- Blob storage MUST use private endpoints or service endpoints where feasible
- Sensitive data in logs MUST be redacted (e.g., user identifiers, blob content)

**Compliance**:
- All data handling MUST comply with applicable privacy regulations
- Privacy impact assessments MUST be conducted before introducing new data collection
- Data processing agreements MUST be established with third-party AI service providers

## Operational Constraints

**Observability**:
- Structured logging MUST be used (JSON format preferred)
- Log levels MUST be configurable per environment (dev: DEBUG, prod: INFO/WARN)
- Application Insights or equivalent telemetry MUST be enabled for all services
- Critical errors MUST trigger alerts to on-call personnel

**Performance**:
- API endpoints MUST respond within 5 seconds (P95) under normal load
- Blob upload operations MUST support resumable uploads for files > 1 MB
- AI inference timeouts MUST be configured (e.g., 30 seconds max)

**Availability**:
- Services MUST handle transient failures gracefully (implement retry policies with exponential backoff)
- Critical operations MUST be idempotent to support safe retries
- Health check endpoints MUST be implemented for all services

## Governance

**Supremacy**: This constitution supersedes all other development practices and guidelines. In case of conflict, constitutional principles take precedence.

**Amendment Process**:
1. Proposed amendment MUST be documented with rationale and impact analysis
2. Amendment MUST receive approval from project stakeholders
3. Amendment MUST include migration plan for existing implementations
4. Version number MUST be updated following semantic versioning:
   - **MAJOR**: Backward-incompatible principle changes or removals
   - **MINOR**: New principles added or material expansions
   - **PATCH**: Clarifications, wording improvements, non-semantic fixes

**Compliance Verification**:
- All pull requests MUST verify compliance with constitutional principles during code review
- Constitution violations MUST be documented and justified before approval
- Automated checks SHOULD be implemented where feasible (e.g., linting rules, policy enforcement)

**Version Control**: This document is maintained under version control. All changes MUST be committed with descriptive messages referencing the specific principles amended.

**Version**: 3.0.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-23
