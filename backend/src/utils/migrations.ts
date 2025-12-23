/**
 * Database Migration Utility
 * Runs Prisma migrations on Function App cold start (application startup)
 * 
 * This ensures database schema is always up-to-date before handling requests
 * Reference: Task T025 in spec/004-azure-deploy-pipeline/tasks.md
 */

import { execSync } from 'child_process';
import { Logger } from './logger.js';

interface MigrationResult {
  success: boolean;
  appliedCount: number;
  errors: string[];
  startTime: number;
  endTime: number;
  durationMs: number;
}

/**
 * Run pending Prisma migrations
 * - Non-blocking: logs failures but doesn't throw (Function App will report unhealthy via health check)
 * - Idempotent: safe to run multiple times (Prisma tracks applied migrations)
 * - Timeout: 30 seconds maximum per migration cycle
 */
export async function runMigrations(): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: false,
    appliedCount: 0,
    errors: [],
    startTime,
    endTime: 0,
    durationMs: 0,
  };

  try {
    Logger.info('[MIGRATION] Starting Prisma migrations...');

    // Step 1: Verify database connectivity first
    Logger.info('[MIGRATION] Verifying database connectivity...');
    execSync('npx prisma migrate status --skip-generate', {
      timeout: 10000,
      stdio: 'pipe',
      env: {
        ...process.env,
        // DATABASE_URL should be available from app settings
      },
    });
    Logger.info('[MIGRATION] Database connectivity verified');

    // Step 2: Run pending migrations
    Logger.info('[MIGRATION] Deploying pending migrations...');
    const output = execSync('npx prisma migrate deploy --skip-generate', {
      timeout: 30000,
      stdio: 'pipe',
      encoding: 'utf-8',
      env: {
        ...process.env,
        // DATABASE_URL should be available from app settings
      },
    });

    // Parse output to determine if migrations were applied
    if (output.includes('No pending migrations')) {
      result.appliedCount = 0;
      result.success = true;
      Logger.info('[MIGRATION] No pending migrations (database is current)');
    } else {
      // Extract migration count from output (Prisma format varies)
      const match = output.match(/(\d+) migrations? applied/i);
      result.appliedCount = match ? parseInt(match[1], 10) : 1;
      result.success = true;
      Logger.info(`[MIGRATION] Applied ${result.appliedCount} migration(s)`, {
        output: output.substring(0, 500), // First 500 chars
      });
    }
  } catch (err) {
    result.success = false;
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorObj = err instanceof Error ? err : new Error(String(err));
    result.errors.push(errorMessage);

    Logger.error('[MIGRATION] Migration failed', errorObj, {
      message: errorMessage,
    });

    // Don't throw - let the application start but health checks will fail
    // This allows diagnosis via health endpoint instead of complete Function App failure
  }

  result.endTime = Date.now();
  result.durationMs = result.endTime - startTime;

  Logger.info('[MIGRATION] Migration cycle completed', {
    success: result.success,
    appliedCount: result.appliedCount,
    durationMs: result.durationMs,
    errors: result.errors,
  });

  return result;
}

/**
 * Alternative: Manual migration verification (for status checks)
 * Use this in the health endpoint to verify migrations are current
 */
export async function checkMigrationStatus(): Promise<{
  pending: number;
  applied: number;
  status: 'current' | 'behind' | 'unknown';
}> {
  try {
    const output = execSync('npx prisma migrate status --skip-generate', {
      timeout: 5000,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    // Determine if there are pending migrations
    const hasPending = output.includes('unpaired migrations');
    
    return {
      pending: hasPending ? 1 : 0,
      applied: 1, // We don't have exact count, assume at least one has been applied
      status: hasPending ? 'behind' : 'current',
    };
  } catch (error) {
    Logger.warn('[MIGRATION] Unable to check migration status', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      pending: 0,
      applied: 0,
      status: 'unknown',
    };
  }
}
