/**
 * Frontend Telemetry with Application Insights SDK
 * Feature 011: Observability
 * 
 * T014: Initialize Application Insights SDK with React plugin
 * T015: Add ReactPlugin for router tracking
 * T016: Export helper functions for event, exception, pageview tracking
 */

import { ApplicationInsights, SeverityLevel } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

// Browser history for React router integration
const browserHistory = createBrowserHistory();

// React Plugin for automatic component tracking
export const reactPlugin = new ReactPlugin();

// Application Insights instance
let appInsights: ApplicationInsights | null = null;

/**
 * Get environment from hostname
 */
function getEnvironment(): 'development' | 'staging' | 'production' {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  }
  return 'production';
}

/**
 * Initialize Application Insights SDK
 * Must be called once before React renders (in main.tsx)
 */
export function initializeTelemetry(): ApplicationInsights | null {
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn('[Telemetry] Connection string not configured. Telemetry disabled in this environment.');
    return null;
  }

  try {
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: { history: browserHistory }
        },
        // Automatic tracking
        enableAutoRouteTracking: true,
        disableFetchTracking: false,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        // Performance
        disableAjaxTracking: false,
        maxAjaxCallsPerView: 500,
        // Correlation
        correlationHeaderExcludedDomains: [],
        distributedTracingMode: 2, // W3C TraceContext
        // Session & User
        sessionRenewalMs: 30 * 60 * 1000, // 30 minutes
        sessionExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
        // Sampling (100% in dev, can reduce in production)
        samplingPercentage: getEnvironment() === 'development' ? 100 : 100,
        // Exception handling
        disableExceptionTracking: false,
        autoTrackPageVisitTime: true,
      }
    });

    appInsights.loadAppInsights();

    // Set cloud role and environment tags
    appInsights.addTelemetryInitializer((envelope) => {
      if (envelope.tags) {
        envelope.tags['ai.cloud.role'] = 'proteinlens-frontend';
        envelope.tags['ai.cloud.roleInstance'] = window.location.hostname;
      }
      
      // Add environment to all telemetry
      if (envelope.data) {
        const baseData = (envelope.data as any).baseData;
        if (baseData && baseData.properties) {
          baseData.properties.environment = getEnvironment();
          baseData.properties.appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
        }
      }
      
      return true;
    });

    console.log('[Telemetry] Application Insights initialized');
    return appInsights;
  } catch (error) {
    console.error('[Telemetry] Failed to initialize Application Insights:', error);
    return null;
  }
}

/**
 * Get the Application Insights instance
 */
export function getAppInsights(): ApplicationInsights | null {
  return appInsights;
}

/**
 * Track a custom event
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>,
  measurements?: Record<string, number>
): void {
  if (appInsights) {
    // Convert boolean values to strings for App Insights
    const stringProps = properties
      ? Object.fromEntries(
          Object.entries(properties).map(([k, v]) => [k, String(v)])
        )
      : undefined;
    
    appInsights.trackEvent({ name, properties: stringProps }, measurements);
  } else {
    // Fallback for development without connection string
    if (import.meta.env.DEV) {
      console.log('[Telemetry] Event:', name, properties, measurements);
    }
  }
}

/**
 * Track a page view
 */
export function trackPageView(
  name: string,
  uri?: string,
  properties?: Record<string, string>
): void {
  if (appInsights) {
    appInsights.trackPageView({ name, uri, properties });
  } else if (import.meta.env.DEV) {
    console.log('[Telemetry] PageView:', name, uri, properties);
  }
}

/**
 * Track an exception
 */
export function trackException(
  error: Error,
  properties?: Record<string, string>,
  severityLevel: SeverityLevel = SeverityLevel.Error
): void {
  if (appInsights) {
    appInsights.trackException({
      exception: error,
      severityLevel,
      properties,
    });
  } else {
    console.error('[Telemetry] Exception:', error, properties);
  }
}

/**
 * Track a custom metric
 */
export function trackMetric(
  name: string,
  average: number,
  properties?: Record<string, string>
): void {
  if (appInsights) {
    appInsights.trackMetric({
      name,
      average,
      sampleCount: 1,
      properties,
    });
  } else if (import.meta.env.DEV) {
    console.log('[Telemetry] Metric:', name, average, properties);
  }
}

/**
 * Track a trace message
 */
export function trackTrace(
  message: string,
  severityLevel: SeverityLevel = SeverityLevel.Information,
  properties?: Record<string, string>
): void {
  if (appInsights) {
    appInsights.trackTrace({ message, severityLevel, properties });
  } else if (import.meta.env.DEV) {
    console.log('[Telemetry] Trace:', message, properties);
  }
}

/**
 * Set authenticated user context
 * Call after login with a non-PII user identifier
 */
export function setAuthenticatedUserContext(
  userId: string,
  accountId?: string
): void {
  if (appInsights) {
    appInsights.setAuthenticatedUserContext(userId, accountId, true);
  }
}

/**
 * Clear authenticated user context
 * Call on logout
 */
export function clearAuthenticatedUserContext(): void {
  if (appInsights) {
    appInsights.clearAuthenticatedUserContext();
  }
}

/**
 * Flush telemetry immediately
 * Useful before page unload
 */
export function flushTelemetry(): void {
  if (appInsights) {
    appInsights.flush();
  }
}

// ============================================
// Auth Event Helpers (T025 compatibility)
// ============================================

/**
 * Track auth events (legacy API for backward compatibility)
 */
export function trackAuthEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  trackEvent(eventName, properties);
}

/**
 * Track session expiration
 */
export function trackSessionExpired(reason: 'inactivity' | 'absolute'): void {
  trackEvent('proteinlens.auth.session_expired', { reason });
}

/**
 * Track protected route redirect
 */
export function trackProtectedRouteRedirect(path: string): void {
  trackEvent('proteinlens.auth.protected_redirect', { path });
}

/**
 * Track login attempt
 */
export function trackLoginAttempt(): void {
  trackEvent('proteinlens.auth.login_attempt');
}

/**
 * Track login success
 */
export function trackLoginSuccess(): void {
  trackEvent('proteinlens.auth.login_success');
}

/**
 * Track logout
 */
export function trackLogout(): void {
  clearAuthenticatedUserContext();
  trackEvent('proteinlens.auth.logout');
}

/**
 * Track token refresh
 */
export function trackTokenRefresh(success: boolean): void {
  trackEvent('proteinlens.auth.token_refresh', { success });
}
