# Health Check Response Contract

**Purpose**: Define the exact JSON schema and behavior for the `/api/health` endpoint used in deployment verification (FR-010, T030)

**Endpoint**: `GET /api/health`

**Trigger**: Called by backend deployment workflow (T030) to validate Function App startup and dependency health

---

## Response Schema

### Healthy Response (HTTP 200)

```json
{
  "status": "healthy",
  "timestamp": "2025-12-23T01:30:00.000Z",
  "version": "1.0.0",
  "uptime": 45000,
  "checks": {
    "database": {
      "status": "pass",
      "latencyMs": 12,
      "message": "Connected to PostgreSQL"
    },
    "blobStorage": {
      "status": "pass",
      "latencyMs": 45,
      "message": "Connected to Azure Blob Storage"
    },
    "aiService": {
      "status": "pass",
      "latencyMs": 230,
      "message": "Azure OpenAI endpoint reachable"
    }
  }
}
```

### Degraded Response (HTTP 200 - Partial Failure)

```json
{
  "status": "degraded",
  "timestamp": "2025-12-23T01:30:00.000Z",
  "version": "1.0.0",
  "uptime": 45000,
  "checks": {
    "database": {
      "status": "pass",
      "latencyMs": 12,
      "message": "Connected to PostgreSQL"
    },
    "blobStorage": {
      "status": "warn",
      "latencyMs": 5000,
      "message": "Slow response from Azure Blob Storage (5000ms)"
    },
    "aiService": {
      "status": "pass",
      "latencyMs": 230,
      "message": "Azure OpenAI endpoint reachable"
    }
  }
}
```

### Unhealthy Response (HTTP 503 - Required Service Down)

```json
{
  "status": "unhealthy",
  "timestamp": "2025-12-23T01:30:00.000Z",
  "version": "1.0.0",
  "uptime": 5000,
  "checks": {
    "database": {
      "status": "fail",
      "message": "Cannot connect to PostgreSQL: Connection refused"
    },
    "blobStorage": {
      "status": "pass",
      "latencyMs": 45
    },
    "aiService": {
      "status": "pass",
      "latencyMs": 230
    }
  }
}
```

---

## Field Definitions

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | One of: `healthy`, `degraded`, `unhealthy` |
| `timestamp` | ISO 8601 string | Yes | Current UTC time when check ran |
| `version` | string | Yes | API version (e.g., "1.0.0") |
| `uptime` | number | Yes | Milliseconds since Function App started |
| `checks` | object | Yes | Detailed status of individual dependencies |

### Check Fields (per dependency)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | One of: `pass`, `warn`, `fail` |
| `latencyMs` | number | No | Response time in milliseconds (optional for fail state) |
| `message` | string | No | Human-readable status message (required for fail/warn) |

---

## Status Determination Rules

### HTTP Status Code

- **200 OK**: Returned when `status` is `"healthy"` OR `"degraded"`
- **503 Service Unavailable**: Returned when `status` is `"unhealthy"`

### Overall Status Calculation

**`status = "healthy"`** (All checks pass):
- `database.status == "pass"` AND
- `blobStorage.status == "pass"` AND
- `aiService.status == "pass"`

**`status = "degraded"`** (One or more checks warn, but all critical checks pass):
- `database.status == "pass"` AND
- At least one check has `status == "warn"` (slow response, performance issue)

**`status = "unhealthy"`** (Any critical check fails):
- `database.status == "fail"` OR critical dependency fails
- Returns HTTP 503

---

## Dependency Check Behavior

### Database Check (Required)

**Purpose**: Verify Function App can connect to Azure PostgreSQL and execute queries

**Implementation**:
```typescript
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'pass',
      latencyMs: Date.now() - start,
      message: 'Connected to PostgreSQL'
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `Cannot connect to PostgreSQL: ${error.message}`
    };
  }
}
```

**Timeout**: 5 seconds. If check takes >5s, consider it a warn (slow).

**Required**: YES - Database failure marks entire health as `unhealthy`.

### Blob Storage Check (Required)

**Purpose**: Verify Function App can authenticate to Azure Storage via Managed Identity and list blobs

**Implementation**:
```typescript
async function checkBlobStorage(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const client = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
    await client.getAccountInfo();
    return {
      status: 'pass',
      latencyMs: Date.now() - start,
      message: 'Connected to Azure Blob Storage'
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `Cannot connect to Blob Storage: ${error.message}`
    };
  }
}
```

**Timeout**: 3 seconds. If check takes >3s, consider it a warn.

**Required**: YES - Blob Storage failure marks entire health as `unhealthy`.

### AI Service Check (Recommended)

**Purpose**: Verify Function App can reach Azure OpenAI/Cognitive Services endpoint

**Implementation**:
```typescript
async function checkAiService(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetch(
      `${process.env.AI_FOUNDRY_ENDPOINT}/cognitiveservices/v1/text/analytics/sentiment?api-version=3.1`,
      {
        method: 'GET',
        headers: { 'Ocp-Apim-Subscription-Key': process.env.OPENAI_API_KEY || '' }
      }
    );
    if (response.ok) {
      return {
        status: 'pass',
        latencyMs: Date.now() - start,
        message: 'Azure OpenAI endpoint reachable'
      };
    } else {
      return {
        status: 'warn',
        latencyMs: Date.now() - start,
        message: `AI service returned ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'fail',
      message: `Cannot reach AI service: ${error.message}`
    };
  }
}
```

**Timeout**: 10 seconds. Slow responses should be warn, not fail.

**Required**: NO - AI service failure can be warn (app can function without AI features). But if Key Vault reference for `OPENAI_API_KEY` is missing/invalid, this will fail.

---

## Performance Targets (from Constitution IX)

- **Database latency**: Target <50ms (warn if >1000ms, fail if timeout >5s)
- **Blob Storage latency**: Target <100ms (warn if >1000ms, fail if timeout >3s)
- **AI Service latency**: Target <500ms (warn if >5000ms, fail if timeout >10s)

---

## Deployment Workflow Acceptance (FR-010, T030)

### Workflow Expectations

The deployment workflow (T030) calls health endpoint with these expectations:

1. **Endpoint responds within 10 seconds** of Function App restart
2. **Response body is valid JSON** matching this schema
3. **`status` field exists** and is one of: `healthy`, `degraded`, `unhealthy`
4. **HTTP status code matches status field**:
   - If `status == "healthy"` → HTTP 200 ✅
   - If `status == "degraded"` → HTTP 200 ✅
   - If `status == "unhealthy"` → HTTP 503 ❌ (deployment fails)
5. **Workflow retries** up to 3 times with 5-second backoff if endpoint not responding
6. **Deployment FAILS** if:
   - HTTP 503 returned (unhealthy status)
   - Endpoint not responding after 3 retries
   - Response JSON doesn't match schema

---

## Implementation Notes

- Health checks MUST NOT modify any data (read-only queries)
- Health endpoint MUST be anonymous/unauthenticated (no API key required) for smoke testing
- Health endpoint response MUST NOT expose sensitive information (error details should be generic)
- Latency measurements help diagnose slow backends post-deployment
- `uptime` field helps distinguish "just started" issues from persistent issues

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-23 | Initial contract definition for Feature 004 deployment |

