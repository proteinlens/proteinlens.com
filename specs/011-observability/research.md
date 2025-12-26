# Research: Observability

**Phase 0 Output** | **Feature**: 011-observability | **Date**: 2025-01-14

## Overview

This document captures research findings to resolve technical unknowns before Phase 1 design.

---

## Research Task 1: Frontend Application Insights SDK

### Question
Which Application Insights SDK should be used for the React frontend?

### Decision
**Use `@microsoft/applicationinsights-web`** (v3.x)

### Rationale
- Official Microsoft SDK with active maintenance
- Tree-shakeable for smaller bundle size
- Native React integration via `@microsoft/applicationinsights-react-js` plugin
- Automatic page view, dependency, and exception tracking
- Supports correlation with backend via W3C Trace Context headers

### Alternatives Considered
1. **Manual fetch wrapper** - Rejected: No automatic exception tracking, manual correlation
2. **OpenTelemetry JS** - Rejected: More complex setup, overkill for SPA
3. **Custom telemetry** - Rejected: Already have stub in `frontend/src/utils/telemetry.ts`, lacks SDK features

### Implementation Notes
```typescript
// Installation
npm install @microsoft/applicationinsights-web @microsoft/applicationinsights-react-js

// Initialization (frontend/src/utils/telemetry.ts)
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
    extensions: [reactPlugin],
    enableAutoRouteTracking: true,
    disableFetchTracking: false,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
  }
});
```

---

## Research Task 2: Correlation ID Strategy

### Question
How should correlation IDs be propagated between frontend and backend?

### Decision
**Use W3C Trace Context standard** with `traceparent` header, fallback to `X-Correlation-Id`

### Rationale
- W3C Trace Context is the industry standard (RFC-compliant)
- Application Insights SDK automatically generates and propagates `traceparent`
- Azure Functions can read `traceparent` for distributed tracing
- Fallback `X-Correlation-Id` for manual correlation in logs

### Implementation Notes

**Frontend (automatic with SDK)**:
- SDK adds `traceparent: 00-{trace-id}-{span-id}-{flags}` to all fetch requests
- SDK adds `Request-Id` header for legacy systems

**Backend middleware**:
```typescript
// backend/src/middleware/correlationMiddleware.ts
export function extractCorrelationId(request: HttpRequest): string {
  // W3C Trace Context (preferred)
  const traceparent = request.headers.get('traceparent');
  if (traceparent) {
    const parts = traceparent.split('-');
    if (parts.length >= 2) return parts[1]; // trace-id
  }
  
  // Legacy fallback
  return request.headers.get('x-correlation-id') 
    || request.headers.get('request-id')
    || crypto.randomUUID();
}
```

---

## Research Task 3: PII Sanitization Approach

### Question
How should PII be redacted from telemetry data?

### Decision
**Blocklist-based sanitization** with regex patterns

### Rationale
- Simpler than allowlist for known sensitive fields
- Can apply globally to all telemetry
- Catches email patterns even in unexpected fields
- Application Insights telemetry initializer pattern

### Fields to Sanitize
| Field Pattern | Redaction |
|--------------|-----------|
| `email`, `mail`, `e-mail` | `[REDACTED_EMAIL]` |
| `password`, `pwd`, `passwd` | `[REDACTED]` |
| `firstName`, `lastName`, `name` | `[REDACTED_NAME]` |
| `phone`, `mobile`, `tel` | `[REDACTED_PHONE]` |
| `address`, `street`, `city` | `[REDACTED_ADDRESS]` |
| `ssn`, `socialSecurity` | `[REDACTED_SSN]` |
| `creditCard`, `cardNumber` | `[REDACTED_CC]` |
| Email regex: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b` | `[REDACTED_EMAIL]` |

### Implementation Notes
```typescript
// backend/src/utils/piiSanitizer.ts
const PII_PATTERNS = [
  { key: /email|mail/i, replacement: '[REDACTED_EMAIL]' },
  { key: /password|pwd|passwd|secret|token/i, replacement: '[REDACTED]' },
  { key: /firstName|lastName|fullName|name/i, replacement: '[REDACTED_NAME]' },
  // ... more patterns
];

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;

export function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  // Deep clone and sanitize
}
```

---

## Research Task 4: Core Web Vitals Integration

### Question
How should frontend performance metrics (Core Web Vitals) be tracked?

### Decision
**Use `web-vitals` library** with Application Insights custom metrics

### Rationale
- `web-vitals` is the official Google library for CWV
- Lightweight (~1.5KB gzipped)
- Provides LCP, FID, CLS, FCP, TTFB
- Can send to App Insights as custom metrics

### Implementation Notes
```typescript
// frontend/src/utils/webVitals.ts
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import { appInsights } from './telemetry';

function sendToAppInsights(metric: { name: string; value: number; id: string }) {
  appInsights.trackMetric({
    name: `WebVitals.${metric.name}`,
    average: metric.value,
    sampleCount: 1,
  });
}

export function initWebVitals(): void {
  onCLS(sendToAppInsights);
  onFCP(sendToAppInsights);
  onFID(sendToAppInsights);
  onLCP(sendToAppInsights);
  onTTFB(sendToAppInsights);
}
```

---

## Research Task 5: Alert Configuration Best Practices

### Question
What alerts should be configured and with what thresholds?

### Decision
**Tiered alerting** with severity levels and escalation

### Alert Definitions

| Alert | Metric | Threshold | Severity | Window |
|-------|--------|-----------|----------|--------|
| API 5xx Errors | Http5xx | > 10/5min | Sev1 (Critical) | 5 min |
| API Latency | requests/duration | p95 > 2s | Sev2 (Warning) | 15 min |
| Health Check Fail | availabilityResults/availabilityPercentage | < 99% | Sev1 (Critical) | 5 min |
| Frontend Errors | exceptions/count | > 50/hour | Sev2 (Warning) | 1 hour |
| LCP Degradation | customMetrics/WebVitals.LCP | p75 > 2.5s | Sev3 (Info) | 1 hour |
| Database Latency | dependencies/duration (SQL) | p95 > 500ms | Sev2 (Warning) | 15 min |

### Implementation Notes
Alerts defined in `infra/bicep/monitoring.bicep` using:
- `Microsoft.Insights/metricAlerts` for metric-based alerts
- `Microsoft.Insights/scheduledQueryRules` for log-based alerts
- Existing action group `proteinlens-${environment}-cost-alerts-ag` for notifications

---

## Research Task 6: Existing Telemetry Analysis

### Current State (backend/src/utils/telemetry.ts)
The backend already has Application Insights integration with:
- ✅ `initializeTelemetry()` - SDK initialization
- ✅ `trackEvent()` - Custom events
- ✅ `trackMetric()` - Custom metrics
- ✅ `trackException()` - Error tracking
- ✅ `trackDependency()` - External call tracking
- ✅ `trackAICall()` - AI service tracking
- ✅ `trackBlobOperation()` - Storage tracking
- ✅ `trackDatabaseOperation()` - DB tracking
- ✅ `flushTelemetry()` - Flush on shutdown

### Gaps to Address
1. **No correlation ID injection** - Add middleware to extract/propagate trace context
2. **No PII sanitization** - Add telemetry processor to redact sensitive data
3. **No request logging** - Add structured request/response logging
4. **Frontend is stub only** - Replace console.log with App Insights SDK

### Current State (frontend/src/utils/telemetry.ts)
- Console-based logging in dev
- Checks for `window.appInsights` but doesn't initialize it
- Has auth-related tracking functions but no SDK

---

## Summary of Decisions

| Research Area | Decision |
|--------------|----------|
| Frontend SDK | `@microsoft/applicationinsights-web` + `@microsoft/applicationinsights-react-js` |
| Correlation | W3C Trace Context (`traceparent`), fallback `X-Correlation-Id` |
| PII Handling | Blocklist sanitization with telemetry processor |
| Web Vitals | `web-vitals` library → App Insights custom metrics |
| Alerting | 6 alerts: 5xx, latency, health, frontend errors, LCP, DB |

All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.
