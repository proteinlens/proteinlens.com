# Telemetry Contracts

**Phase 1 Output** | **Feature**: 011-observability | **Date**: 2025-01-14

This document defines the telemetry event contracts for consistent tracking across frontend and backend.

---

## Event Naming Convention

**Format**: `{domain}.{action}_{result}`

**Domains**:
- `auth` - Authentication and session events
- `upload` - Image upload flow
- `analysis` - Meal analysis events
- `billing` - Subscription and payment events
- `nav` - Navigation and page views
- `error` - Error tracking
- `perf` - Performance metrics

---

## Metric Naming Convention

**Format**: `proteinlens.{domain}.{metric_name}`

**Domains** (same as events):
- `api` - Backend API metrics
- `frontend` - Frontend performance metrics
- `business` - Business KPI metrics

**Examples**:
| Metric | Name | Unit |
|--------|------|------|
| API health check latency | `proteinlens.api.health_latency_ms` | milliseconds |
| Image analysis count | `proteinlens.business.analysis_count` | count |
| Frontend LCP | `proteinlens.frontend.lcp_ms` | milliseconds |
| Error rate | `proteinlens.api.error_rate` | percentage |

**Rules**:
1. All custom metrics MUST use `proteinlens.` prefix
2. Metric names MUST be snake_case
3. Include unit suffix where applicable (`_ms`, `_bytes`, `_count`)

---

## Auth Events

### `auth.login_attempt`
Tracked when user initiates login.
```typescript
{
  name: "auth.login_attempt",
  properties: {
    method: "email" | "social",
    provider?: "google" | "microsoft" | "apple"
  }
}
```

### `auth.login_success`
Tracked on successful authentication.
```typescript
{
  name: "auth.login_success",
  properties: {
    method: "email" | "social",
    provider?: string,
    isNewUser: boolean
  }
}
```

### `auth.login_failure`
Tracked on failed authentication.
```typescript
{
  name: "auth.login_failure",
  properties: {
    method: "email" | "social",
    reason: "invalid_credentials" | "account_locked" | "mfa_failed" | "network_error"
  }
}
```

### `auth.session_expired`
Tracked when session times out.
```typescript
{
  name: "auth.session_expired",
  properties: {
    reason: "inactivity" | "absolute" | "token_expired"
  }
}
```

### `auth.logout`
Tracked on user logout.
```typescript
{
  name: "auth.logout",
  properties: {
    trigger: "user" | "session_timeout" | "forced"
  }
}
```

---

## Upload Events

### `upload.started`
Tracked when upload begins.
```typescript
{
  name: "upload.started",
  properties: {
    fileType: string,      // e.g., "image/jpeg"
    originalSizeKb: number
  }
}
```

### `upload.image_compressed`
Tracked after client-side compression.
```typescript
{
  name: "upload.image_compressed",
  properties: {
    originalSizeKb: number,
    compressedSizeKb: number,
    compressionRatio: number,
    durationMs: number
  }
}
```

### `upload.completed`
Tracked on successful upload.
```typescript
{
  name: "upload.completed",
  properties: {
    finalSizeKb: number,
    uploadDurationMs: number,
    blobUrl: string  // Path only, no query params
  }
}
```

### `upload.failed`
Tracked on upload failure.
```typescript
{
  name: "upload.failed",
  properties: {
    stage: "compression" | "presign" | "upload" | "validation",
    errorCode: string,
    retryCount: number
  }
}
```

---

## Analysis Events

### `analysis.meal_submitted`
Tracked when meal is submitted for analysis.
```typescript
{
  name: "analysis.meal_submitted",
  properties: {
    mealId: string,
    hasNotes: boolean
  }
}
```

### `analysis.meal_analyzed`
Tracked on successful analysis.
```typescript
{
  name: "analysis.meal_analyzed",
  properties: {
    mealId: string,
    itemCount: number,
    totalCalories: number,
    totalProtein: number,
    analysisLatencyMs: number,
    model: string  // e.g., "gpt-5.1"
  }
}
```

### `analysis.failed`
Tracked on analysis failure.
```typescript
{
  name: "analysis.failed",
  properties: {
    mealId: string,
    errorCode: string,
    stage: "image_processing" | "ai_inference" | "parsing"
  }
}
```

---

## Billing Events

### `billing.checkout_started`
Tracked when checkout begins.
```typescript
{
  name: "billing.checkout_started",
  properties: {
    planId: string,
    planName: string,
    interval: "month" | "year"
  }
}
```

### `billing.checkout_completed`
Tracked on successful payment.
```typescript
{
  name: "billing.checkout_completed",
  properties: {
    planId: string,
    paymentMethod: "card" | "paypal",
    amount: number,
    currency: string
  }
}
```

### `billing.checkout_abandoned`
Tracked when checkout is abandoned.
```typescript
{
  name: "billing.checkout_abandoned",
  properties: {
    planId: string,
    stage: "plan_selection" | "payment_form" | "confirmation",
    durationMs: number
  }
}
```

---

## Performance Events

### `perf.web_vital`
Tracked for Core Web Vitals.
```typescript
{
  name: "perf.web_vital",
  properties: {
    metric: "LCP" | "FID" | "CLS" | "FCP" | "TTFB" | "INP",
    rating: "good" | "needs-improvement" | "poor",
    page: string
  },
  measurements: {
    value: number
  }
}
```

### `perf.api_call`
Tracked for API performance.
```typescript
{
  name: "perf.api_call",
  properties: {
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    statusCode: number,
    cached: boolean
  },
  measurements: {
    durationMs: number,
    responseSize: number
  }
}
```

---

## Error Events

### `error.unhandled_exception`
Tracked for uncaught errors.
```typescript
{
  name: "error.unhandled_exception",
  properties: {
    errorType: string,
    message: string,  // Sanitized
    stack: string,    // First 500 chars
    page: string,
    component?: string
  }
}
```

### `error.api_error`
Tracked for API errors.
```typescript
{
  name: "error.api_error",
  properties: {
    endpoint: string,
    method: string,
    statusCode: number,
    errorCode: string,
    retryable: boolean
  }
}
```

---

## Common Properties (Auto-Attached)

All events automatically include:

```typescript
{
  // From TelemetryContext
  sessionId: string,
  userId: string,      // Anonymous ID
  traceId: string,
  environment: string,
  appVersion: string,
  source: "frontend" | "backend",
  
  // Device/Browser (frontend only)
  userAgent: string,
  screenWidth: number,
  screenHeight: number,
  language: string,
  
  // Location (approximate, from IP)
  country: string,
  region: string
}
```

---

## Validation Rules

1. **Event names**: Must match pattern `^[a-z]+\.[a-z_]+$`
2. **Property keys**: Must be camelCase, alphanumeric
3. **Property values**: Strings ≤256 chars, numbers finite
4. **No PII**: Email, name, phone, address MUST NOT appear
5. **IDs only**: Use anonymous IDs (userId, sessionId, mealId)
