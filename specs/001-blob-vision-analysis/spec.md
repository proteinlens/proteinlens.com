# Feature Specification: Blob Upload + GPT-5.1 Vision Analysis

**Feature Branch**: `001-blob-vision-analysis`  
**Created**: 2025-12-22  
**Status**: Draft  
**Input**: User description: "Blob upload + GPT-5.1 vision analysis via Foundry"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload Meal Photo and Get Analysis (Priority: P1)

A user captures or selects a meal photo on their device. The frontend requests upload credentials from the backend, receives a short-lived SAS URL, and uploads the image directly to Azure Blob Storage. Once uploaded, the frontend triggers AI analysis by sending the blob identifier to the backend. The backend calls GPT-5.1 Vision via Azure AI Foundry with the image URL, receives structured JSON identifying foods and protein content, and returns this to the user. The user sees the analysis results displayed in the app.

**Why this priority**: This is the core value proposition - enabling users to get nutritional analysis from photos. Without this, the feature has no purpose. It represents the minimal viable product.

**Independent Test**: Can be fully tested by uploading a single meal photo and verifying that analysis results appear in the UI. Delivers immediate value even without edit/correction capability.

**Acceptance Scenarios**:

1. **Given** a user has a meal photo on their device, **When** they tap "Upload Photo" and select the image, **Then** the photo is uploaded to blob storage and analysis results appear within 10 seconds showing identified foods and protein totals
2. **Given** a user takes a new photo using the camera, **When** they capture the image and confirm, **Then** the image is uploaded and analyzed with results displayed
3. **Given** the backend has analyzed an image, **When** the response is received, **Then** the UI displays all identified foods with individual protein amounts, total protein, and confidence level

---

### User Story 2 - Edit and Correct Analysis Results (Priority: P2)

After viewing AI-generated analysis results, a user can manually edit food names, portions, and protein values to correct any mistakes. The user confirms their corrections, and the system persists both the original AI response and the user's corrected values. When viewing past meals, the user sees their corrected version.

**Why this priority**: AI analysis won't be 100% accurate. Users need the ability to refine results to maintain data quality and trust in the system. This is critical for long-term usage but not required for initial value delivery.

**Independent Test**: Can be tested independently by providing pre-populated analysis data, allowing edits, and verifying persistence. Works even if upload/analysis features aren't implemented yet.

**Acceptance Scenarios**:

1. **Given** analysis results are displayed, **When** the user taps "Edit" on a food item and changes the protein value from 12g to 15g, **Then** the updated value is saved and displayed in place of the original
2. **Given** the user has made corrections to a meal analysis, **When** they navigate away and return to view that meal, **Then** their corrected values are shown, not the original AI response
3. **Given** the user has edited results, **When** they save changes, **Then** both original AI data and user corrections are stored for traceability

---

### User Story 3 - Delete Meal Data for Privacy (Priority: P3)

A user can delete a previously uploaded meal from their history. When deleted, both the blob storage file and all associated database records (original analysis, corrections, metadata) are permanently removed.

**Why this priority**: Required for GDPR compliance and user data rights, but not critical for initial feature adoption. Users need to trust they can control their data, making this important but lower priority than core functionality.

**Independent Test**: Can be tested by creating test meal records, deleting them, and verifying removal from both storage and database. Works independently of upload/analysis flow.

**Acceptance Scenarios**:

1. **Given** a user has uploaded meal photos, **When** they select "Delete" on a meal and confirm, **Then** the meal disappears from their history and cannot be recovered
2. **Given** a meal is deleted, **When** querying the database for that meal record, **Then** no record exists (cascade delete completed)
3. **Given** a meal is deleted, **When** attempting to access the blob URL, **Then** the blob no longer exists in storage

---

### Edge Cases

- What happens when the user uploads an image larger than 8 MB?
- What happens when the blob upload succeeds but AI analysis fails?
- What happens when the user uploads a non-food image (e.g., landscape photo)?
- What happens when the SAS token expires before upload completes?
- What happens when AI returns low-confidence results or cannot identify any foods?
- What happens when network connectivity is lost during upload?
- What happens when a user attempts to upload an unsupported file format?

## Requirements *(mandatory)*

### Functional Requirements

#### Upload Flow
- **FR-001**: Frontend MUST request an upload URL from the backend API before initiating file upload
- **FR-002**: Backend MUST generate a time-limited SAS URL for blob storage with write-only permissions
- **FR-003**: Backend MUST return both the SAS URL and a unique blob name/identifier to the frontend
- **FR-004**: Frontend MUST upload the image file directly to Azure Blob Storage using the provided SAS URL via HTTP PUT
- **FR-005**: System MUST enforce maximum file size limit of 8 MB for uploaded images
- **FR-006**: System MUST accept only JPEG, PNG, and HEIC image formats
- **FR-007**: SAS tokens MUST expire after 10 minutes from generation

#### AI Analysis Flow
- **FR-008**: Frontend MUST call POST /api/meals/analyze with the blob identifier after successful upload
- **FR-009**: Backend MUST retrieve the blob using the blob identifier
- **FR-010**: Backend MUST generate a read-enabled SAS URL for the blob to pass to GPT-5.1 Vision
- **FR-011**: Backend MUST call GPT-5.1 Vision via Azure AI Foundry with the image URL
- **FR-012**: Backend MUST receive and validate schema-compliant JSON response from AI containing: foods array (name, portion, protein), totalProtein, confidence level, and optional notes
- **FR-013**: System MUST reject malformed or schema-invalid AI responses and return actionable error to user

#### Data Persistence
- **FR-014**: Backend MUST persist meal analysis records containing: userId, blobName, blobUrl (without SAS token), AI model identifier, raw AI response JSON, and calculated totals
- **FR-015**: System MUST store both original AI analysis and user corrections when edits are made
- **FR-016**: System MUST link every analysis record to the source blob path for traceability
- **FR-017**: System MUST generate and store a unique request ID (correlation ID) for every analysis operation

#### Edit and Correction
- **FR-018**: Users MUST be able to edit food names, portion descriptions, and protein values in analysis results
- **FR-019**: System MUST persist user corrections separately from original AI data
- **FR-020**: System MUST display user-corrected values in the UI while maintaining original AI response for audit purposes

#### Error Handling
- **FR-021**: If blob upload fails, user MUST receive clear error message indicating upload failure
- **FR-022**: If AI analysis fails, user MUST receive clear error message indicating analysis failure with option to retry
- **FR-023**: If SAS token expires before upload, user MUST receive error and option to request new token
- **FR-024**: If image exceeds size limit, user MUST receive error before upload attempt

#### Security and Privacy
- **FR-025**: Frontend MUST NOT contain any storage account keys, API keys, or permanent credentials
- **FR-026**: SAS tokens MUST be short-lived and generated on-demand by backend only
- **FR-027**: System MUST support user-initiated deletion of meals via DELETE endpoint
- **FR-028**: Meal deletion MUST cascade: remove blob from storage AND all associated database records
- **FR-029**: All blob URLs stored in database MUST be without SAS tokens (permanent blob path only)

#### Observability
- **FR-030**: System MUST log request ID, blob name, and AI model deployment name for every analysis operation
- **FR-031**: System MUST log all upload failures with error details and request correlation
- **FR-032**: System MUST log all AI analysis failures with error details and request correlation

### Key Entities

- **MealAnalysis**: Represents a single meal photo analysis. Contains user identifier, blob storage path, blob URL (without SAS), AI model version used, timestamp, original AI response (JSON), user corrections (JSON if edited), total protein calculated, confidence level, request correlation ID, and any additional metadata (notes, tags).

- **Food**: Part of AI response JSON. Represents a single identified food item. Contains food name, portion description (e.g., "1 cup", "100g"), and protein content in grams. Multiple Food items comprise a single meal analysis.

- **BlobReference**: Metadata linking meal analysis to storage. Contains blob name (unique identifier), container name, full blob URL (without SAS), upload timestamp, file size, content type, and SHA-256 hash for caching.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can upload a meal photo and receive AI analysis results within 10 seconds under normal conditions
- **SC-002**: System successfully processes at least 95% of valid uploads (JPEG/PNG/HEIC under 8MB) through to analysis
- **SC-003**: AI analysis returns parseable, schema-valid JSON for at least 90% of food-containing images
- **SC-004**: Users can edit and save corrections to analysis results, with corrected values persisting across sessions
- **SC-005**: Meal deletion removes both blob and database records in 100% of cases (cascade delete works reliably)
- **SC-006**: No secrets or permanent credentials are exposed in frontend code or network traffic (verified via code review and network inspection)
- **SC-007**: SAS tokens expire correctly after 10 minutes, preventing unauthorized access to expired tokens
- **SC-008**: System logs include request correlation IDs for 100% of analysis operations, enabling end-to-end tracing

### User Experience Outcomes

- **SC-009**: Users receive clear, actionable error messages for all failure scenarios (upload failure, analysis failure, size limit exceeded, format not supported)
- **SC-010**: Upload progress is visible to users during file transfer
- **SC-011**: Users can distinguish between original AI analysis and their own corrections when viewing meal history

## Assumptions

- Azure Blob Storage account is provisioned and accessible via Managed Identity
- Azure AI Foundry is configured with GPT-5.1 Vision deployment
- Backend has appropriate Azure RBAC permissions to generate SAS tokens
- Users are authenticated via Azure Entra ID or equivalent (userId is available)
- Frontend is a Single Page Application (SPA) - web or mobile
- HEIC format conversion (if needed) is handled by client or storage tier
- Image analysis does not require real-time processing (10-second latency is acceptable)
- Multiple users may upload concurrently; blob names are globally unique
- Database supports JSON storage for flexible AI response schemas
- Retry logic for transient failures is implemented at infrastructure level (not specified in this feature)

## Scope Boundaries

**In Scope**:
- Single meal photo upload and analysis
- User corrections to AI results
- Basic delete functionality for privacy compliance
- Error handling for common failure scenarios
- Request tracing and observability logging

**Out of Scope**:
- Batch upload of multiple photos
- Historical nutritional tracking or trends
- Sharing meals with other users
- Export of meal data to external formats
- Nutritional goals or recommendations
- Integration with fitness trackers
- Image quality enhancement or preprocessing
- Manual addition of meals without photos
- Recipe database or meal planning features
- Multi-language support for food names (English only assumed)
- Advanced analytics on eating patterns

## Dependencies

- Azure Blob Storage account with containers configured
- Azure AI Foundry with GPT-5.1 Vision deployment active
- Backend API infrastructure (language/framework determined in planning phase)
- Frontend application (web/mobile determined in planning phase)
- Azure Entra ID or authentication provider for user identity
- Database for meal analysis persistence (type determined in planning phase)
- Azure Key Vault for secret management (per constitution)
- Application Insights or logging infrastructure for observability
