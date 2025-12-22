/**
 * T074: Application Insights integration for backend telemetry
 * Provides structured telemetry for monitoring, debugging, and performance analysis
 */

import * as appInsights from 'applicationinsights';

// Singleton telemetry client
let telemetryClient: appInsights.TelemetryClient | null = null;

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
    // Import and setup applicationinsights
    const appInsights = require('applicationinsights');
    
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
    }

    console.log('Application Insights telemetry initialized');
    return telemetryClient;
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
    return null;
  }
}

/**
 * Get the telemetry client instance
 */
export function getTelemetryClient(): appInsights.TelemetryClient | null {
  return telemetryClient;
}

/**
 * Track a custom event
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string>,
  measurements?: Record<string, number>
): void {
  if (!telemetryClient) return;

  telemetryClient.trackEvent({
    name,
    properties,
    measurements,
  });
}

/**
 * Track a custom metric
 */
export function trackMetric(metric: CustomMetric): void {
  if (!telemetryClient) return;

  telemetryClient.trackMetric({
    name: metric.name,
    value: metric.value,
    properties: metric.properties,
  });
}

/**
 * Track an exception
 */
export function trackException(
  error: Error,
  properties?: Record<string, string>,
  measurements?: Record<string, number>
): void {
  if (!telemetryClient) return;

  telemetryClient.trackException({
    exception: error,
    properties,
    measurements,
  });
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

  telemetryClient.trackTrace({
    message,
    severity: severityLevel[severity] as any,
    properties,
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
