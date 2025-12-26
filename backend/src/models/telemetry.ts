/**
 * Telemetry Type Definitions
 * Feature 011: Observability
 * 
 * Type definitions for telemetry events, metrics, and contexts
 * Based on data-model.md specifications
 */

/**
 * TelemetryContext - Context data attached to all telemetry events
 * Enables correlation and filtering in Application Insights
 */
export interface TelemetryContext {
  /** Browser session ID - tracks user journey */
  sessionId: string;
  
  /** User identifier (hash, not PII) - for user-scoped analysis */
  userId?: string;
  
  /** W3C Trace ID - correlates frontend to backend */
  traceId: string;
  
  /** Current span ID within the trace */
  spanId: string;
  
  /** Deployment environment */
  environment: 'development' | 'staging' | 'production';
  
  /** Application version from package.json */
  appVersion: string;
  
  /** Origin of the telemetry event */
  source: 'frontend' | 'backend';
}

/**
 * CustomEvent - User-defined telemetry events
 */
export interface CustomEvent {
  /** Event name - follows naming convention: proteinlens.{domain}.{action} */
  name: string;
  
  /** String properties for the event */
  properties?: Record<string, string>;
  
  /** Numeric measurements for the event */
  measurements?: Record<string, number>;
  
  /** ISO timestamp when the event occurred */
  timestamp: string;
}

/**
 * HealthCheckResult - API health status telemetry
 */
export interface HealthCheckResult {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /** Health check timestamp */
  timestamp: string;
  
  /** Response time in milliseconds */
  responseTimeMs: number;
  
  /** Individual service statuses */
  services: {
    /** Database connectivity status */
    database: ServiceHealth;
    
    /** Azure AI Foundry status */
    aiFoundry: ServiceHealth;
    
    /** Blob storage status */
    storage: ServiceHealth;
  };
  
  /** Correlation ID for this health check */
  correlationId: string;
}

/**
 * ServiceHealth - Individual service health status
 */
export interface ServiceHealth {
  /** Service health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /** Response time in milliseconds */
  responseTimeMs?: number;
  
  /** Error message if unhealthy */
  error?: string;
  
  /** Last successful check timestamp */
  lastChecked?: string;
}

/**
 * WebVitalsMetric - Core Web Vitals metrics
 * Based on web-vitals library metric types
 */
export interface WebVitalsMetric {
  /** Metric name */
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  
  /** Metric value */
  value: number;
  
  /** Rating: good, needs-improvement, or poor */
  rating: 'good' | 'needs-improvement' | 'poor';
  
  /** Unique metric ID */
  id: string;
  
  /** Navigation type */
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender';
  
  /** Delta from previous value (for CLS) */
  delta?: number;
  
  /** Entries that contributed to the metric */
  entries?: unknown[];
}

/**
 * Custom metric definitions for ProteinLens
 * Naming convention: proteinlens.{domain}.{metric_name}
 */
export interface ProteinLensMetrics {
  /** Image analysis metrics */
  'proteinlens.analysis.duration_ms': number;
  'proteinlens.analysis.image_size_bytes': number;
  'proteinlens.analysis.success_count': number;
  'proteinlens.analysis.failure_count': number;
  
  /** API metrics */
  'proteinlens.api.response_time_ms': number;
  'proteinlens.api.request_count': number;
  'proteinlens.api.error_count': number;
  
  /** Storage metrics */
  'proteinlens.storage.upload_duration_ms': number;
  'proteinlens.storage.download_duration_ms': number;
  'proteinlens.storage.blob_size_bytes': number;
  
  /** Authentication metrics */
  'proteinlens.auth.login_count': number;
  'proteinlens.auth.logout_count': number;
  'proteinlens.auth.session_duration_ms': number;
}

/**
 * Alert threshold configuration
 */
export interface AlertThresholds {
  /** Error rate threshold (percentage) */
  errorRatePercent: number;
  
  /** Response time threshold (milliseconds) */
  responseTimeMs: number;
  
  /** Availability threshold (percentage) */
  availabilityPercent: number;
  
  /** Web Vitals thresholds */
  webVitals: {
    LCP: number;  // milliseconds
    FID: number;  // milliseconds
    CLS: number;  // unitless
    FCP: number;  // milliseconds
    TTFB: number; // milliseconds
    INP: number;  // milliseconds
  };
}

/**
 * Default alert thresholds per environment
 */
export const DEFAULT_ALERT_THRESHOLDS: Record<TelemetryContext['environment'], AlertThresholds> = {
  production: {
    errorRatePercent: 1,
    responseTimeMs: 3000,
    availabilityPercent: 99.9,
    webVitals: {
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      FCP: 1800,
      TTFB: 800,
      INP: 200,
    },
  },
  staging: {
    errorRatePercent: 5,
    responseTimeMs: 5000,
    availabilityPercent: 99,
    webVitals: {
      LCP: 4000,
      FID: 300,
      CLS: 0.25,
      FCP: 3000,
      TTFB: 1500,
      INP: 500,
    },
  },
  development: {
    errorRatePercent: 10,
    responseTimeMs: 10000,
    availabilityPercent: 95,
    webVitals: {
      LCP: 5000,
      FID: 500,
      CLS: 0.5,
      FCP: 5000,
      TTFB: 2000,
      INP: 1000,
    },
  },
};

/**
 * Telemetry event names for ProteinLens
 * Used for custom event tracking
 */
export const TELEMETRY_EVENTS = {
  // Analysis events
  ANALYSIS_STARTED: 'proteinlens.analysis.started',
  ANALYSIS_COMPLETED: 'proteinlens.analysis.completed',
  ANALYSIS_FAILED: 'proteinlens.analysis.failed',
  
  // Upload events
  UPLOAD_STARTED: 'proteinlens.upload.started',
  UPLOAD_COMPLETED: 'proteinlens.upload.completed',
  UPLOAD_FAILED: 'proteinlens.upload.failed',
  
  // Authentication events
  AUTH_LOGIN: 'proteinlens.auth.login',
  AUTH_LOGOUT: 'proteinlens.auth.logout',
  AUTH_FAILED: 'proteinlens.auth.failed',
  
  // Navigation events
  PAGE_VIEW: 'proteinlens.navigation.pageview',
  FEATURE_USED: 'proteinlens.navigation.feature_used',
  
  // Error events
  ERROR_CAUGHT: 'proteinlens.error.caught',
  ERROR_UNCAUGHT: 'proteinlens.error.uncaught',
  
  // Performance events
  WEB_VITAL: 'proteinlens.performance.web_vital',
  API_CALL: 'proteinlens.performance.api_call',
} as const;

export type TelemetryEventName = typeof TELEMETRY_EVENTS[keyof typeof TELEMETRY_EVENTS];

/**
 * Structured telemetry event for type-safe event tracking
 */
export interface TypedTelemetryEvent<T extends TelemetryEventName> {
  name: T;
  context: TelemetryContext;
  properties: TelemetryEventProperties[T];
  measurements?: TelemetryEventMeasurements[T];
  timestamp: string;
}

/**
 * Event-specific property types
 */
export interface TelemetryEventProperties {
  [TELEMETRY_EVENTS.ANALYSIS_STARTED]: { imageType: string; source: string };
  [TELEMETRY_EVENTS.ANALYSIS_COMPLETED]: { imageType: string; resultCount: string };
  [TELEMETRY_EVENTS.ANALYSIS_FAILED]: { imageType: string; errorType: string; errorMessage: string };
  
  [TELEMETRY_EVENTS.UPLOAD_STARTED]: { fileType: string; fileName: string };
  [TELEMETRY_EVENTS.UPLOAD_COMPLETED]: { fileType: string; blobUrl: string };
  [TELEMETRY_EVENTS.UPLOAD_FAILED]: { fileType: string; errorType: string };
  
  [TELEMETRY_EVENTS.AUTH_LOGIN]: { provider: string };
  [TELEMETRY_EVENTS.AUTH_LOGOUT]: { reason: string };
  [TELEMETRY_EVENTS.AUTH_FAILED]: { provider: string; errorType: string };
  
  [TELEMETRY_EVENTS.PAGE_VIEW]: { pageName: string; previousPage?: string };
  [TELEMETRY_EVENTS.FEATURE_USED]: { featureName: string };
  
  [TELEMETRY_EVENTS.ERROR_CAUGHT]: { errorType: string; errorMessage: string; componentStack?: string };
  [TELEMETRY_EVENTS.ERROR_UNCAUGHT]: { errorType: string; errorMessage: string; stack?: string };
  
  [TELEMETRY_EVENTS.WEB_VITAL]: { metricName: string; rating: string };
  [TELEMETRY_EVENTS.API_CALL]: { endpoint: string; method: string; statusCode: string };
}

/**
 * Event-specific measurement types
 */
export interface TelemetryEventMeasurements {
  [TELEMETRY_EVENTS.ANALYSIS_STARTED]: { imageSizeBytes: number };
  [TELEMETRY_EVENTS.ANALYSIS_COMPLETED]: { durationMs: number; imageSizeBytes: number };
  [TELEMETRY_EVENTS.ANALYSIS_FAILED]: { durationMs: number };
  
  [TELEMETRY_EVENTS.UPLOAD_STARTED]: { fileSizeBytes: number };
  [TELEMETRY_EVENTS.UPLOAD_COMPLETED]: { durationMs: number; fileSizeBytes: number };
  [TELEMETRY_EVENTS.UPLOAD_FAILED]: { durationMs: number };
  
  [TELEMETRY_EVENTS.AUTH_LOGIN]: { durationMs: number };
  [TELEMETRY_EVENTS.AUTH_LOGOUT]: { sessionDurationMs: number };
  [TELEMETRY_EVENTS.AUTH_FAILED]: Record<string, never>;
  
  [TELEMETRY_EVENTS.PAGE_VIEW]: { loadTimeMs?: number };
  [TELEMETRY_EVENTS.FEATURE_USED]: Record<string, never>;
  
  [TELEMETRY_EVENTS.ERROR_CAUGHT]: Record<string, never>;
  [TELEMETRY_EVENTS.ERROR_UNCAUGHT]: Record<string, never>;
  
  [TELEMETRY_EVENTS.WEB_VITAL]: { value: number; delta?: number };
  [TELEMETRY_EVENTS.API_CALL]: { durationMs: number; responseSize?: number };
}
