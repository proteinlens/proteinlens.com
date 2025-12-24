/**
 * T081: Health check endpoint for monitoring and load balancing
 * Provides deep health checks for all dependent services
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { Logger } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { getPrismaClient } from '../utils/prisma.js';

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
const prisma = getPrismaClient();

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'pass',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      message: (error as Error).message,
    };
  }
}

/**
 * Check blob storage connectivity
 */
async function checkBlobStorage(): Promise<CheckResult> {
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
    
    return {
      status: 'pass',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      message: (error as Error).message,
    };
  }
}

/**
 * Check AI service connectivity (lightweight ping)
 */
async function checkAIService(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Just verify the endpoint is reachable
    const response = await fetch(config.aiFoundryEndpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    
    // Any response is acceptable for health check
    return {
      status: response.ok || response.status === 401 ? 'pass' : 'warn',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'warn', // AI being down is degraded, not critical
      latencyMs: Date.now() - start,
      message: (error as Error).message,
    };
  }
}

/**
 * Health check handler
 */
export async function health(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const deep = request.query.get('deep') === 'true';
  
  if (!deep) {
    // Shallow health check - just confirm the function is running
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
    };
  }

  // Deep health check - verify all dependencies
  Logger.info('Deep health check requested');

  const [database, blobStorage, aiService] = await Promise.all([
    checkDatabase(),
    checkBlobStorage(),
    checkAIService(),
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

  Logger.info('Deep health check completed', { 
    status: overallStatus,
    database: database.status,
    blobStorage: blobStorage.status,
    aiService: aiService.status,
  });

  return {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: healthStatus,
  };
}

/**
 * Liveness probe - lightweight check that the app is running
 */
export async function liveness(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: {
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Readiness probe - check if the app is ready to receive traffic
 */
export async function readiness(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Check database is reachable
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        message: (error as Error).message,
      },
    };
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
