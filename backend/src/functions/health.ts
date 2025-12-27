/**
 * T081: Health check endpoint for monitoring and load balancing
 * Provides deep health checks for all dependent services
 * 
 * Feature 011: Enhanced with correlation IDs and telemetry
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { Logger } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { getPrismaClient } from '../utils/prisma.js';
import { correlationMiddleware, type TraceContext } from '../middleware/correlationMiddleware.js';
import { 
  trackEvent, 
  trackDependency, 
  trackException, 
  trackMetric, 
  setTraceContext,
  type DependencyTelemetry 
} from '../utils/telemetry.js';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    blobStorage: CheckResult;
    aiService: CheckResult;
  };
}

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  latencyMs?: number;
  message?: string;
}

const startTime = Date.now();
// Lazy initialization - don't connect to DB at module load time
// This prevents the health check from hanging if DB is unavailable

/**
 * Check database connectivity with telemetry
 */
async function checkDatabase(traceContext?: TraceContext): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Get Prisma client lazily - only when actually checking database
    const prisma = getPrismaClient();
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    
    // Track successful database dependency
    trackDependency({
      dependencyTypeName: 'PostgreSQL',
      name: 'health-check',
      data: 'SELECT 1',
      duration: latencyMs,
      success: true,
      resultCode: '200',
      properties: {
        correlationId: traceContext?.correlationId ?? 'unknown',
        checkType: 'database',
      },
    });
    
    return {
      status: 'pass',
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const err = error as Error;
    
    // Track failed database dependency
    trackDependency({
      dependencyTypeName: 'PostgreSQL',
      name: 'health-check',
      data: 'SELECT 1',
      duration: latencyMs,
      success: false,
      resultCode: '500',
      properties: {
        correlationId: traceContext?.correlationId ?? 'unknown',
        checkType: 'database',
        error: err.message,
      },
    });
    
    // Track exception with structured context
    trackException(err, {
      correlationId: traceContext?.correlationId ?? 'unknown',
      checkType: 'database',
      operation: 'health-check',
    });
    
    return {
      status: 'fail',
      latencyMs,
      message: err.message,
    };
  }
}

/**
 * Check blob storage connectivity with telemetry
 */
async function checkBlobStorage(traceContext?: TraceContext): Promise<CheckResult> {
  const start = Date.now();
  try {
    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${config.storageAccountName}.blob.core.windows.net`,
      credential
    );
    
    // Check if container exists
    const containerClient = blobServiceClient.getContainerClient(config.blobContainerName);
    await containerClient.exists();
    
    const latencyMs = Date.now() - start;
    
    // Track successful blob storage dependency
    trackDependency({
      dependencyTypeName: 'Azure Blob Storage',
      name: 'health-check',
      data: config.blobContainerName,
      duration: latencyMs,
      success: true,
      resultCode: '200',
      properties: {
        correlationId: traceContext?.correlationId ?? 'unknown',
        checkType: 'blobStorage',
      },
    });
    
    return {
      status: 'pass',
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const err = error as Error;
    
    // Track failed blob storage dependency
    trackDependency({
      dependencyTypeName: 'Azure Blob Storage',
      name: 'health-check',
      data: config.blobContainerName,
      duration: latencyMs,
      success: false,
      resultCode: '500',
      properties: {
        correlationId: traceContext?.correlationId ?? 'unknown',
        checkType: 'blobStorage',
        error: err.message,
      },
    });
    
    // Track exception with structured context
    trackException(err, {
      correlationId: traceContext?.correlationId ?? 'unknown',
      checkType: 'blobStorage',
      operation: 'health-check',
    });
    
    return {
      status: 'fail',
      latencyMs,
      message: err.message,
    };
  }
}

/**
 * Check AI service connectivity (lightweight ping) with telemetry
 */
async function checkAIService(traceContext?: TraceContext): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Just verify the endpoint is reachable
    const response = await fetch(config.aiFoundryEndpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    
    const latencyMs = Date.now() - start;
    const isHealthy = response.ok || response.status === 401;
    
    // Track AI service dependency
    trackDependency({
      dependencyTypeName: 'Azure AI Foundry',
      name: 'health-check',
      data: config.aiFoundryEndpoint,
      duration: latencyMs,
      success: isHealthy,
      resultCode: String(response.status),
      properties: {
        correlationId: traceContext?.correlationId ?? 'unknown',
        checkType: 'aiService',
      },
    });
    
    // Any response is acceptable for health check
    return {
      status: isHealthy ? 'pass' : 'warn',
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const err = error as Error;
    
    // Track failed AI service dependency
    trackDependency({
      dependencyTypeName: 'Azure AI Foundry',
      name: 'health-check',
      data: config.aiFoundryEndpoint,
      duration: latencyMs,
      success: false,
      resultCode: '500',
      properties: {
        correlationId: traceContext?.correlationId ?? 'unknown',
        checkType: 'aiService',
        error: err.message,
      },
    });
    
    // AI being down is degraded, not critical - warn level exception
    trackException(err, {
      correlationId: traceContext?.correlationId ?? 'unknown',
      checkType: 'aiService',
      operation: 'health-check',
      severity: 'warning',
    });
    
    return {
      status: 'warn', // AI being down is degraded, not critical
      latencyMs,
      message: err.message,
    };
  }
}

/**
 * Health check handler with correlation and telemetry
 */
export async function health(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestStart = Date.now();
  
  // Extract/generate correlation context
  const { traceContext, addResponseHeaders } = correlationMiddleware(request, context);
  setTraceContext(traceContext);
  
  const deep = request.query.get('deep') === 'true';
  
  // Track health check request
  trackEvent('proteinlens.health.check_started', {
    correlationId: traceContext.correlationId,
    deep: String(deep),
  });
  
  if (!deep) {
    // Shallow health check - just confirm the function is running
    const latencyMs = Date.now() - requestStart;
    
    // Track shallow health check metric
    trackMetric({
      name: 'proteinlens.health.latency_ms',
      value: latencyMs,
      properties: { deep: 'false' },
    });
    
    trackEvent('proteinlens.health.check_completed', {
      correlationId: traceContext.correlationId,
      deep: 'false',
      status: 'healthy',
    }, { latencyMs });
    
    return addResponseHeaders({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        correlationId: traceContext.correlationId,
      },
    });
  }

  // Deep health check - verify all dependencies
  Logger.info('Deep health check requested', { correlationId: traceContext.correlationId });

  const [database, blobStorage, aiService] = await Promise.all([
    checkDatabase(traceContext),
    checkBlobStorage(traceContext),
    checkAIService(traceContext),
  ]);

  const checks = { database, blobStorage, aiService };

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (database.status === 'fail' || blobStorage.status === 'fail') {
    overallStatus = 'unhealthy';
  } else if (aiService.status === 'fail' || aiService.status === 'warn') {
    overallStatus = 'degraded';
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  const latencyMs = Date.now() - requestStart;

  // Track health check metrics
  trackMetric({
    name: 'proteinlens.health.latency_ms',
    value: latencyMs,
    properties: { deep: 'true', status: overallStatus },
  });
  
  // Track individual check latencies
  if (database.latencyMs !== undefined) {
    trackMetric({
      name: 'proteinlens.health.database_latency_ms',
      value: database.latencyMs,
      properties: { status: database.status },
    });
  }
  if (blobStorage.latencyMs !== undefined) {
    trackMetric({
      name: 'proteinlens.health.storage_latency_ms',
      value: blobStorage.latencyMs,
      properties: { status: blobStorage.status },
    });
  }
  if (aiService.latencyMs !== undefined) {
    trackMetric({
      name: 'proteinlens.health.ai_latency_ms',
      value: aiService.latencyMs,
      properties: { status: aiService.status },
    });
  }

  // Track completion event
  trackEvent('proteinlens.health.check_completed', {
    correlationId: traceContext.correlationId,
    deep: 'true',
    status: overallStatus,
    databaseStatus: database.status,
    blobStorageStatus: blobStorage.status,
    aiServiceStatus: aiService.status,
  }, { latencyMs });

  Logger.info('Deep health check completed', { 
    correlationId: traceContext.correlationId,
    status: overallStatus,
    database: database.status,
    blobStorage: blobStorage.status,
    aiService: aiService.status,
    latencyMs,
  });

  return addResponseHeaders({
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: {
      ...healthStatus,
      correlationId: traceContext.correlationId,
    },
  });
}

/**
 * Liveness probe - lightweight check that the app is running
 */
export async function liveness(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { traceContext, addResponseHeaders } = correlationMiddleware(request, context);
  
  return addResponseHeaders({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: {
      status: 'alive',
      timestamp: new Date().toISOString(),
      correlationId: traceContext.correlationId,
    },
  });
}

/**
 * Readiness probe - check if the app is ready to receive traffic
 */
export async function readiness(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { traceContext, addResponseHeaders } = correlationMiddleware(request, context);
  setTraceContext(traceContext);
  
  try {
    // Check database is reachable - get Prisma client lazily
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    
    return addResponseHeaders({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        status: 'ready',
        timestamp: new Date().toISOString(),
        correlationId: traceContext.correlationId,
      },
    });
  } catch (error) {
    const err = error as Error;
    
    // Track readiness check failure
    trackException(err, {
      correlationId: traceContext.correlationId,
      checkType: 'readiness',
      operation: 'database-check',
    });
    
    Logger.error('Readiness check failed', err, {
      correlationId: traceContext.correlationId,
    });
    
    return addResponseHeaders({
      status: 503,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        correlationId: traceContext.correlationId,
        message: err.message,
      },
    });
  }
}

// Register health endpoints
app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: health,
});

app.http('liveness', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health/liveness',
  handler: liveness,
});

app.http('readiness', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health/readiness',
  handler: readiness,
});
