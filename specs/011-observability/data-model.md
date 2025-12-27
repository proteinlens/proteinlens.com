# Data Model: Observability

**Phase 1 Output** | **Feature**: 011-observability | **Date**: 2025-01-14

## Overview

This document defines the data structures for telemetry, tracing, and monitoring in ProteinLens. These are logical entities used by Application Insights and custom telemetry code—not database tables.

---

## Core Entities

### 1. TelemetryContext

Context information attached to all telemetry items.

```typescript
interface TelemetryContext {
  /** Unique ID for the user session */
  sessionId: string;
  
  /** Anonymous user identifier (from userId.ts) */
  userId: string;
  
  /** W3C trace ID for distributed tracing */
  traceId: string;
  
  /** Current span ID */
  spanId: string;
  
  /** Parent span ID (if nested) */
  parentSpanId?: string;
  
  /** Environment (dev, staging, prod) */
  environment: 'dev' | 'staging' | 'prod';
  
  /** Application version */
  appVersion: string;
  
  /** Request source (frontend, backend, system) */
  source: 'frontend' | 'backend' | 'system';
}
```

### 2. CustomEvent

Application-specific events tracked beyond automatic telemetry.

```typescript
interface CustomEvent {
  /** Event name (namespaced, e.g., "auth.login_success") */
  name: string;
  
  /** Event properties (string, number, boolean only - no PII) */
  properties?: Record<string, string | number | boolean>;
  
  /** Numeric measurements (e.g., duration, count) */
  measurements?: Record<string, number>;
  
  /** Timestamp (ISO 8601) */
  timestamp: string;
}
```

**Event Naming Convention**:
- Format: `{domain}.{action}_{result}`
- Examples:
  - `auth.login_success`
  - `auth.session_expired`
  - `upload.image_compressed`
  - `analysis.meal_analyzed`
  - `billing.checkout_started`

### 3. HealthCheckResult

Result from health endpoint checks.

```typescript
interface HealthCheckResult {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /** ISO 8601 timestamp */
  timestamp: string;
  
  /** Application version */
  version: string;
  
  /** Uptime in milliseconds */
  uptime: number;
  
  /** Individual service checks */
  checks: {
    database: ServiceCheck;
    blobStorage: ServiceCheck;
    aiService: ServiceCheck;
  };
}

interface ServiceCheck {
  /** Pass/fail/warn status */
  status: 'pass' | 'fail' | 'warn';
  
  /** Latency in milliseconds */
  latencyMs?: number;
  
  /** Error message if failed (sanitized, no PII) */
  message?: string;
}
```

### 4. WebVitalsMetric

Core Web Vitals measurement from frontend.

```typescript
interface WebVitalsMetric {
  /** Metric name */
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  
  /** Metric value (ms for timing, score for CLS) */
  value: number;
  
  /** Rating based on thresholds */
  rating: 'good' | 'needs-improvement' | 'poor';
  
  /** Navigation type */
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
  
  /** Unique ID for deduplication */
  id: string;
  
  /** Page URL (path only, no query params) */
  page: string;
}
```

**Thresholds** (per Google):
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤2500ms | ≤4000ms | >4000ms |
| FID | ≤100ms | ≤300ms | >300ms |
| CLS | ≤0.1 | ≤0.25 | >0.25 |
| FCP | ≤1800ms | ≤3000ms | >3000ms |
| TTFB | ≤800ms | ≤1800ms | >1800ms |

### 5. AlertDefinition

Configuration for metric/log alerts.

```typescript
interface AlertDefinition {
  /** Alert name (kebab-case) */
  name: string;
  
  /** Human-readable description */
  description: string;
  
  /** Alert severity (1=critical, 4=verbose) */
  severity: 1 | 2 | 3 | 4;
  
  /** Metric or query to evaluate */
  condition: MetricCondition | LogQueryCondition;
  
  /** Evaluation frequency */
  evaluationFrequency: string; // ISO 8601 duration (PT5M)
  
  /** Time window for aggregation */
  windowSize: string; // ISO 8601 duration (PT15M)
  
  /** Action group IDs to notify */
  actionGroupIds: string[];
}

interface MetricCondition {
  type: 'metric';
  metricName: string;
  metricNamespace: string;
  operator: 'GreaterThan' | 'LessThan' | 'Equals';
  threshold: number;
  aggregation: 'Total' | 'Average' | 'Minimum' | 'Maximum' | 'Count';
}

interface LogQueryCondition {
  type: 'logQuery';
  query: string; // KQL query
  threshold: number;
  operator: 'GreaterThan' | 'LessThan' | 'Equals';
}
```

---

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Insights                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    contains    ┌──────────────────┐           │
│  │TelemetryContext├─────────────►│   CustomEvent    │           │
│  └──────────────┘                └──────────────────┘           │
│         │                                                        │
│         │ correlates                                             │
│         ▼                                                        │
│  ┌──────────────┐                ┌──────────────────┐           │
│  │   Request    │◄──────────────►│   Dependency     │           │
│  │  (Backend)   │    traces      │  (DB, Blob, AI)  │           │
│  └──────────────┘                └──────────────────┘           │
│         │                                                        │
│         │ links to                                               │
│         ▼                                                        │
│  ┌──────────────┐                ┌──────────────────┐           │
│  │  Exception   │                │ WebVitalsMetric  │           │
│  │  (Error)     │                │   (Frontend)     │           │
│  └──────────────┘                └──────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ triggers
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Monitor                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                ┌──────────────────┐           │
│  │AlertDefinition├──────────────►│   Action Group   │           │
│  └──────────────┘    notifies    │   (Email, SMS)   │           │
│                                  └──────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## PII Handling Rules

### Fields to NEVER Log
| Field | Reason |
|-------|--------|
| `email` | User identity |
| `password`, `token`, `secret` | Security credential |
| `firstName`, `lastName` | User identity |
| `phone`, `address` | Contact info |
| `creditCard`, `cvv` | Payment data |
| `ssn`, `nationalId` | Government ID |

### Sanitization Process
1. **Input**: Any object before logging
2. **Transform**: Deep scan for PII patterns
3. **Redact**: Replace with type-specific markers
4. **Output**: Safe object for telemetry

```typescript
// Example transformation
{
  email: "user@example.com",     // → "[REDACTED_EMAIL]"
  userId: "usr_123abc",          // → "usr_123abc" (allowed - anonymous)
  action: "Login for john@x.com" // → "Login for [REDACTED_EMAIL]"
}
```

---

## State Transitions

### HealthCheckResult.status

```
                    ┌─────────────────┐
                    │                 │
           ┌───────►│    healthy      │◄──────┐
           │        │                 │       │
           │        └────────┬────────┘       │
           │                 │                │
     all pass          any warn         all pass
           │                 │                │
           │                 ▼                │
           │        ┌─────────────────┐       │
           │        │                 │       │
           └────────│    degraded     │───────┘
                    │                 │
                    └────────┬────────┘
                             │
                      any critical fail
                             │
                             ▼
                    ┌─────────────────┐
                    │                 │
                    │   unhealthy     │
                    │                 │
                    └─────────────────┘
```

**Transition Rules**:
- `healthy → degraded`: AI service returns warn/fail
- `healthy → unhealthy`: Database or Blob storage fails
- `degraded → healthy`: All checks pass
- `degraded → unhealthy`: Critical service fails
- `unhealthy → healthy`: All critical services recover
