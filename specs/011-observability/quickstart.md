# Quickstart: Observability

**Phase 1 Output** | **Feature**: 011-observability | **Date**: 2025-01-14

## Overview

This guide covers setting up and verifying observability for ProteinLens. After following these steps, you'll have:
- Application Insights tracking in both frontend and backend
- Distributed tracing with correlation IDs
- Core Web Vitals monitoring
- Azure Monitor alerts

---

## Prerequisites

- Azure subscription with Application Insights resource
- Node.js 20+ and npm 10+
- Access to Azure Portal for viewing telemetry

---

## 1. Backend Setup

The backend already has Application Insights configured. Verify and enhance:

### Verify Existing Setup

```bash
# Check backend dependencies
cd backend
grep "applicationinsights" package.json
# Should show: "applicationinsights": "^3.12.1"

# Verify telemetry utility exists
ls -la src/utils/telemetry.ts
```

### Environment Variables

Ensure these are set in `local.settings.json` and Azure Function App settings:

```json
{
  "Values": {
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "InstrumentationKey=xxx;IngestionEndpoint=https://northeurope-0.in.applicationinsights.azure.com/",
    "APPINSIGHTS_SAMPLING_PERCENTAGE": "100"
  }
}
```

### Test Backend Telemetry

```bash
# Start backend
cd backend
npm run dev

# In another terminal, trigger a request
curl http://localhost:7071/api/health?deep=true

# Check Application Insights Live Metrics in Azure Portal
```

---

## 2. Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install @microsoft/applicationinsights-web @microsoft/applicationinsights-react-js web-vitals
```

### Environment Variables

Add to `.env.local`:

```env
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://northeurope-0.in.applicationinsights.azure.com/
```

### Initialize Telemetry

The implementation will replace `frontend/src/utils/telemetry.ts`:

```typescript
// frontend/src/utils/telemetry.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();
let appInsights: ApplicationInsights | null = null;

export function initTelemetry(history?: any): ApplicationInsights {
  if (appInsights) return appInsights;
  
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    console.warn('[Telemetry] No connection string, using console logging');
    return null as any;
  }

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      extensions: [reactPlugin],
      extensionConfig: {
        [reactPlugin.identifier]: { history }
      },
      enableAutoRouteTracking: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      disableFetchTracking: false,
    }
  });

  appInsights.loadAppInsights();
  return appInsights;
}

export function trackEvent(name: string, properties?: Record<string, any>): void {
  appInsights?.trackEvent({ name, properties });
}

export function trackException(error: Error, properties?: Record<string, any>): void {
  appInsights?.trackException({ exception: error, properties });
}

export { reactPlugin };
```

### Test Frontend Telemetry

```bash
# Start frontend
cd frontend
npm run dev

# Open browser to http://localhost:5173
# Navigate around the app

# Check Application Insights > Transaction search in Azure Portal
```

---

## 3. Correlation Verification

### End-to-End Trace Test

1. Open browser DevTools → Network tab
2. Make an API call (e.g., health check)
3. Verify request headers include:
   - `traceparent: 00-{traceId}-{spanId}-01`
4. In Azure Portal → Application Insights → Transaction search
5. Search by trace ID - should show both frontend and backend spans

### Expected Flow

```
Frontend (SPA)
    │
    ├── traceparent: 00-abc123-def456-01
    │
    ▼
Backend (Azure Function)
    │
    ├── Reads traceparent header
    ├── Logs with same traceId: abc123
    │
    ▼
Application Insights
    │
    └── Correlated view: SPA → Function → Database
```

---

## 4. Web Vitals Verification

### Check Metrics in Console (Dev Mode)

```javascript
// Browser console should show:
[WebVitals] LCP: 1234ms (good)
[WebVitals] FCP: 567ms (good)
[WebVitals] CLS: 0.05 (good)
```

### Check in Application Insights

1. Go to Application Insights → Metrics
2. Add metric: `customMetrics/WebVitals.LCP`
3. Aggregation: Average
4. Should see data points after page loads

---

## 5. Alert Verification

### View Configured Alerts

```bash
# List alerts in Azure
az monitor metrics alert list \
  --resource-group proteinlens-prod-rg \
  --output table
```

### Test Alert (Non-Production Only!)

```bash
# Trigger 5xx errors (staging only)
for i in {1..20}; do
  curl -X POST https://api.staging.proteinlens.com/api/nonexistent
done

# Check Action Group received notification
```

---

## 6. Troubleshooting

### No Telemetry in Portal

1. Check connection string is correct
2. Verify SDK initialization runs before first API call
3. Check browser console for SDK errors
4. Wait 2-5 minutes for data to appear

### Missing Correlation

1. Verify `enableCorsCorrelation: true` in SDK config
2. Check CORS headers allow `traceparent` header
3. Backend must read and log the header

### Web Vitals Not Reporting

1. Web Vitals only fire on real navigation (not hot reload)
2. Open in incognito to get fresh metrics
3. Check for CSP blocking inline scripts

---

## 7. Key Dashboards

After setup, bookmark these Azure Portal views:

| Dashboard | URL Pattern |
|-----------|-------------|
| Live Metrics | `portal.azure.com/#@/resource/.../livemetrics` |
| Failures | `portal.azure.com/#@/resource/.../failures` |
| Performance | `portal.azure.com/#@/resource/.../performance` |
| Application Map | `portal.azure.com/#@/resource/.../applicationMap` |
| Alerts | `portal.azure.com/#@/resource/.../alertsV2` |

---

## Next Steps

After basic setup is verified:

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement PII sanitization (FR-014 to FR-016)
3. Add custom dashboards in Azure Workbooks
4. Configure Log Analytics queries for analytics
