/**
 * T074: Application Insights integration for backend telemetry
 * Provides structured telemetry for monitoring, debugging, and performance analysis
 * 
 * Feature 011: Enhanced with PII sanitization and correlation support
 */

import * as appInsights from 'applicationinsights';
import { sanitize, sanitizeError } from './piiSanitizer.js';
import type { TraceContext } from '../middleware/correlationMiddleware.js';

// Singleton telemetry client
let telemetryClient: appInsights.TelemetryClient | null = null;

// Current correlation context (thread-local in async context)
let currentTraceContext: TraceContext | null = null;

export interface TelemetryConfig {
  connectionString?: string;
  cloudRole?: string;
  cloudRoleInstance?: string;
}

export interface CustomMetric {
  name: string;
  value: number;
  properties?: Record<string, string>;
}

export interface DependencyTelemetry {
  dependencyTypeName: string;
  name: string;
  data: string;
  duration: number;
  success: boolean;
  resultCode?: string;
  properties?: Record<string, string>;
}

/**
 * Initialize Application Insights telemetry
 * Should be called once at application startup
 */
export function initializeTelemetry(config: TelemetryConfig = {}): appInsights.TelemetryClient | null {
  const connectionString = config.connectionString || process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn('Application Insights connection string not configured. Telemetry disabled.');
    return null;
  }

  try {
    // Setup applicationinsights (already imported at top)
    appInsights.setup(connectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();

    telemetryClient = appInsights.defaultClient;

    // Set cloud role for service identification
    if (telemetryClient) {
      telemetryClient.context.tags[telemetryClient.context.keys.cloudRole] = 
        config.cloudRole || 'proteinlens-api';
      
      if (config.cloudRoleInstance) {
        telemetryClient.context.tags[telemetryClient.context.keys.cloudRoleInstance] = 
          config.cloudRoleInstance;
      }

      // Add PII sanitization telemetry processor
      addSanitizationProcessor(telemetryClient);
    }

    console.log('Application Insights telemetry initialized');
    return telemetryClient;
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
    return null;
  }
}

/**
 * Add PII sanitization processor to telemetry client
 * All telemetry data passes through this before being sent to Application Insights
 */
function addSanitizationProcessor(client: appInsights.TelemetryClient): void {
  client.addTelemetryProcessor((envelope, context) => {
    // Sanitize custom properties
    if (envelope.data && typeof envelope.data === 'object') {
      const data = envelope.data as Record<string, unknown>;
      
      // Sanitize baseData properties
      if (data.baseData && typeof data.baseData === 'object') {
        const baseData = data.baseData as Record<string, unknown>;
        
        if (baseData.properties && typeof baseData.properties === 'object') {
          baseData.properties = sanitize(baseData.properties as Record<string, unknown>);
        }
        
        // Sanitize exception messages
        if (baseData.exceptions && Array.isArray(baseData.exceptions)) {
          baseData.exceptions = baseData.exceptions.map((ex: unknown) => {
            if (ex && typeof ex === 'object') {
              const exception = ex as Record<string, unknown>;
              if (exception.message && typeof exception.message === 'string') {
                const sanitized = sanitizeError(new Error(exception.message));
                exception.message = sanitized.message;
              }
              if (exception.stack && typeof exception.stack === 'string') {
                const sanitized = sanitizeError({ 
                  message: '', 
                  stack: exception.stack,
                  name: 'Error'
                });
                exception.stack = sanitized.stack;
              }
            }
            return ex;
          });
        }
        
        // Sanitize trace messages
        if (baseData.message && typeof baseData.message === 'string') {
          const sanitized = sanitizeError(new Error(baseData.message));
          baseData.message = sanitized.message;
        }
        
        // Sanitize request/dependency data (URLs might contain PII in query params)
        if (baseData.url && typeof baseData.url === 'string') {
          try {
            const url = new URL(baseData.url);
            // Clear potentially sensitive query params
            const sensitiveParams = ['email', 'token', 'key', 'password', 'apikey', 'secret'];
            sensitiveParams.forEach(param => {
              if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[REDACTED]');
              }
            });
            baseData.url = url.toString();
          } catch {
            // URL parsing failed, leave as-is
          }
        }
      }
    }
    
    // Continue processing (return true to send, false to drop)
    return true;
  });
}

/**
 * Set the current trace context for correlation
 * Call this at the start of each request
 */
export function setTraceContext(context: TraceContext | null): void {
  currentTraceContext = context;
  
  if (telemetryClient && context) {
    // Set operation context for automatic correlation
    telemetryClient.context.tags[telemetryClient.context.keys.operationId] = context.traceId;
    telemetryClient.context.tags[telemetryClient.context.keys.operationParentId] = context.spanId;
  }
}

/**
 * Get the current trace context
 */
export function getTraceContext(): TraceContext | null {
  return currentTraceContext;
}

/**
 * Get the telemetry client instance
 */
export function getTelemetryClient(): appInsights.TelemetryClient | null {
  return telemetryClient;
}

/**
 * Track a custom event
 * Properties are automatically sanitized for PII
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string>,
  measurements?: Record<string, number>
): void {
  if (!telemetryClient) return;

  // Sanitize properties before sending
  const sanitizedProps = properties ? sanitize(properties) as Record<string, string> : undefined;

  telemetryClient.trackEvent({
    name,
    properties: sanitizedProps,
    measurements,
  });
}

/**
 * Track a custom metric
 * Properties are automatically sanitized for PII
 */
export function trackMetric(metric: CustomMetric): void {
  if (!telemetryClient) return;

  // Sanitize properties before sending
  const sanitizedProps = metric.properties 
    ? sanitize(metric.properties) as Record<string, string> 
    : undefined;

  telemetryClient.trackMetric({
    name: metric.name,
    value: metric.value,
    properties: sanitizedProps,
  });
}

/**
 * Request context for exception tracking
 */
export interface ExceptionRequestContext {
  url?: string;
  method?: string;
  correlationId?: string;
  statusCode?: number;
  userAgent?: string;
}

/**
 * Track an exception
 * Error messages and properties are automatically sanitized for PII
 */
export function trackException(
  error: Error,
  properties?: Record<string, string>,
  measurements?: Record<string, number>
): void {
  if (!telemetryClient) return;

  // Sanitize error and properties
  const sanitizedError = sanitizeError(error);
  const sanitizedProps = properties ? sanitize(properties) as Record<string, string> : undefined;
  
  // Add correlation ID from current context if available
  const contextProps: Record<string, string> = { ...sanitizedProps };
  if (currentTraceContext) {
    contextProps.correlationId = contextProps.correlationId || currentTraceContext.correlationId;
    contextProps.traceId = currentTraceContext.traceId;
    contextProps.spanId = currentTraceContext.spanId;
  }
  
  // Create a sanitized error object
  const cleanError = new Error(sanitizedError.message);
  cleanError.name = error.name;
  cleanError.stack = sanitizedError.stack;

  telemetryClient.trackException({
    exception: cleanError,
    properties: contextProps,
    measurements,
  });
}

/**
 * Track an exception with full request context
 * T013: Enhanced exception tracking for observability
 */
export function trackExceptionWithContext(
  error: Error,
  requestContext: ExceptionRequestContext,
  properties?: Record<string, string>,
  measurements?: Record<string, number>
): void {
  if (!telemetryClient) return;

  // Build enhanced properties with request context
  const enhancedProps: Record<string, string> = {
    ...properties,
    ...(requestContext.url && { requestUrl: requestContext.url }),
    ...(requestContext.method && { requestMethod: requestContext.method }),
    ...(requestContext.correlationId && { correlationId: requestContext.correlationId }),
    ...(requestContext.statusCode !== undefined && { statusCode: String(requestContext.statusCode) }),
    ...(requestContext.userAgent && { userAgent: requestContext.userAgent }),
  };
  
  // Add trace context if available
  if (currentTraceContext) {
    enhancedProps.traceId = currentTraceContext.traceId;
    enhancedProps.spanId = currentTraceContext.spanId;
    enhancedProps.correlationId = enhancedProps.correlationId || currentTraceContext.correlationId;
  }
  
  trackException(error, enhancedProps, measurements);
}

/**
 * Track a dependency call (external service, database, etc.)
 */
export function trackDependency(dependency: DependencyTelemetry): void {
  if (!telemetryClient) return;

  telemetryClient.trackDependency({
    dependencyTypeName: dependency.dependencyTypeName,
    name: dependency.name,
    data: dependency.data,
    duration: dependency.duration,
    success: dependency.success,
    resultCode: dependency.resultCode ? String(dependency.resultCode) : undefined,
    properties: dependency.properties,
  });
}

/**
 * Track a trace message
 * Messages and properties are automatically sanitized for PII
 */
export function trackTrace(
  message: string,
  severity: 'Verbose' | 'Information' | 'Warning' | 'Error' | 'Critical' = 'Information',
  properties?: Record<string, string>
): void {
  if (!telemetryClient) return;

  // Severity levels: 0=Verbose, 1=Information, 2=Warning, 3=Error, 4=Critical
  const severityLevel: Record<string, number> = {
    'Verbose': 0,
    'Information': 1,
    'Warning': 2,
    'Error': 3,
    'Critical': 4,
  };

  // Sanitize message and properties
  const sanitizedMessage = sanitizeError(new Error(message)).message;
  const sanitizedProps = properties ? sanitize(properties) as Record<string, string> : undefined;

  telemetryClient.trackTrace({
    message: sanitizedMessage,
    severity: severityLevel[severity] as any,
    properties: sanitizedProps,
  });
}

/**
 * T075: Track AI service call performance
 */
export function trackAICall(
  operationName: string,
  modelId: string,
  durationMs: number,
  success: boolean,
  tokenUsage?: { prompt: number; completion: number; total: number },
  error?: string
): void {
  // Track as dependency
  trackDependency({
    dependencyTypeName: 'Azure AI Foundry',
    name: operationName,
    data: modelId,
    duration: durationMs,
    success,
    resultCode: success ? '200' : '500',
    properties: {
      modelId,
      ...(error && { error }),
    },
  });

  // Track token usage as metrics
  if (tokenUsage) {
    trackMetric({
      name: 'AI.TokenUsage.Prompt',
      value: tokenUsage.prompt,
      properties: { modelId, operation: operationName },
    });

    trackMetric({
      name: 'AI.TokenUsage.Completion',
      value: tokenUsage.completion,
      properties: { modelId, operation: operationName },
    });

    trackMetric({
      name: 'AI.TokenUsage.Total',
      value: tokenUsage.total,
      properties: { modelId, operation: operationName },
    });
  }

  // Track latency as metric
  trackMetric({
    name: 'AI.Latency',
    value: durationMs,
    properties: { modelId, operation: operationName, success: String(success) },
  });

  // Track custom event for AI calls
  trackEvent('AIServiceCall', {
    operation: operationName,
    modelId,
    success: String(success),
    ...(error && { error }),
  }, {
    durationMs,
    ...(tokenUsage && { 
      promptTokens: tokenUsage.prompt,
      completionTokens: tokenUsage.completion,
    }),
  });
}

/**
 * Track blob storage operations
 */
export function trackBlobOperation(
  operation: 'upload' | 'download' | 'delete' | 'generateSas',
  blobName: string,
  durationMs: number,
  success: boolean,
  sizeBytes?: number,
  error?: string
): void {
  trackDependency({
    dependencyTypeName: 'Azure Blob Storage',
    name: operation,
    data: blobName,
    duration: durationMs,
    success,
    resultCode: success ? '200' : '500',
    properties: {
      operation,
      ...(sizeBytes !== undefined && { sizeBytes: String(sizeBytes) }),
      ...(error && { error }),
    },
  });

  if (sizeBytes !== undefined) {
    trackMetric({
      name: 'Blob.Size',
      value: sizeBytes,
      properties: { operation },
    });
  }
}

/**
 * Track database operations
 */
export function trackDatabaseOperation(
  operation: string,
  table: string,
  durationMs: number,
  success: boolean,
  rowCount?: number,
  error?: string
): void {
  trackDependency({
    dependencyTypeName: 'PostgreSQL',
    name: operation,
    data: table,
    duration: durationMs,
    success,
    properties: {
      table,
      ...(rowCount !== undefined && { rowCount: String(rowCount) }),
      ...(error && { error }),
    },
  });
}

/**
 * Flush telemetry (useful before shutdown)
 */
export function flushTelemetry(): Promise<void> {
  return new Promise((resolve) => {
    if (telemetryClient) {
      telemetryClient.flush();
      setTimeout(resolve, 1000); // Give it a second to flush
    } else {
      resolve();
    }
  });
}
