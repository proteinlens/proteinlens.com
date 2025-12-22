<!--
SYNC IMPACT REPORT
==================
Version Change: None → 1.0.0 (Initial ratification)
Principles Defined: 7 core principles established
Added Sections:
  - Core Principles (7 principles)
  - Security & Privacy Standards
  - Operational Constraints
  - Governance
Templates Status:
  ✅ plan-template.md - Reviewed (Constitution Check section compatible)
  ✅ spec-template.md - Reviewed (Functional requirements align with principles)
  ✅ tasks-template.md - Reviewed (Phase structure supports security/cost principles)
Follow-up TODOs: None - all placeholders resolved
-->

# ProteinLens Constitution

## Core Principles

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

### VII. Privacy & User Data Rights

**Rules**:
- Blob storage containers MUST have retention policies configured
- Users MUST be able to delete their data; delete operation MUST remove both blob and database records
- Cascade delete MUST be implemented: deleting a blob triggers deletion of associated analysis records
- Delete operations MUST be logged with user ID, request ID, and timestamp
- Retention policies MUST comply with applicable data protection regulations (GDPR, CCPA, etc.)

**Rationale**: Respects user privacy rights, ensures regulatory compliance, prevents indefinite data accumulation, and builds user trust.

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

**Version**: 1.0.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-22
