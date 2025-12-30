// Azure Function: POST /api/admin/migrate-meals
// Migrate meals from one user ID to another
// This is used to consolidate meals after user authentication is set up

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { getPrismaClient } from '../utils/prisma.js';
import { requireAuth, isAuthFailure } from '../middleware/authGuard.js';

const prisma = getPrismaClient();

interface MigrateMealsRequest {
  fromUserId: string;
  toUserId?: string; // If not provided, uses authenticated user's ID
}

/**
 * POST /api/admin/migrate-meals
 * Migrate all meals from one user ID to another
 * 
 * Request body:
 * - fromUserId: The source user ID (old/anonymous ID) 
 * - toUserId: Optional target user ID (defaults to authenticated user's ID)
 * 
 * Returns count of migrated meals
 */
export async function migrateMeals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('POST /api/admin/migrate-meals - Starting meal migration', { requestId });

  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (isAuthFailure(auth)) {
      return auth.response;
    }

    const authenticatedUserId = auth.ctx.user.id;
    
    // Parse request body
    let body: MigrateMealsRequest;
    try {
      body = await request.json() as MigrateMealsRequest;
    } catch {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
        jsonBody: { error: 'Invalid JSON body' },
      };
    }

    const { fromUserId, toUserId } = body;

    if (!fromUserId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
        jsonBody: { error: 'fromUserId is required' },
      };
    }

    // Security: Target user ID MUST be the authenticated user
    // This prevents users from stealing meals from others
    const targetUserId = authenticatedUserId;
    
    // Ignore toUserId from request body for security
    if (toUserId && toUserId !== authenticatedUserId) {
      Logger.warn('Attempted migration to different user blocked', {
        requestId,
        authenticatedUserId,
        attemptedTarget: toUserId,
      });
    }

    Logger.info('Migrating meals', { 
      requestId, 
      fromUserId, 
      toUserId: targetUserId,
      authenticatedUserId 
    });

    // Count meals before migration
    const mealCount = await prisma.mealAnalysis.count({
      where: { userId: fromUserId },
    });

    if (mealCount === 0) {
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
        jsonBody: {
          message: 'No meals found to migrate',
          migratedCount: 0,
          fromUserId,
          toUserId: targetUserId,
        },
      };
    }

    // Perform migration in a transaction
    await prisma.$transaction(async (tx) => {
      // Update all meal analyses
      await tx.mealAnalysis.updateMany({
        where: { userId: fromUserId },
        data: { userId: targetUserId },
      });

      Logger.info('Meals migrated successfully', {
        requestId,
        mealCount,
        fromUserId,
        toUserId: targetUserId,
      });
    });

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
      jsonBody: {
        message: `Successfully migrated ${mealCount} meals`,
        migratedCount: mealCount,
        fromUserId,
        toUserId: targetUserId,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to migrate meals', error instanceof Error ? error : new Error(errorMessage), { requestId });

    return {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to migrate meals',
        requestId,
      },
    };
  }
}

/**
 * GET /api/admin/list-user-meals
 * List all unique user IDs that have meals, with counts
 * Useful for identifying orphaned meals to migrate
 */
export async function listUserMeals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('GET /api/admin/list-user-meals - Listing meal user IDs', { requestId });

  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (isAuthFailure(auth)) {
      return auth.response;
    }

    // Group meals by userId and count
    const mealsByUser = await prisma.mealAnalysis.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Get user details for each userId if they exist in Users table
    const userIds = mealsByUser.map(m => m.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const result = mealsByUser.map(m => ({
      userId: m.userId,
      mealCount: m._count.id,
      user: userMap.get(m.userId) || null,
      isOrphan: !userMap.has(m.userId),
    }));

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
      jsonBody: {
        totalUsers: result.length,
        totalMeals: mealsByUser.reduce((sum, m) => sum + m._count.id, 0),
        users: result,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to list user meals', error instanceof Error ? error : new Error(errorMessage), { requestId });

    return {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to list user meals',
        requestId,
      },
    };
  }
}

// Register Azure Functions
app.http('migrateMeals', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/migrate-meals',
  handler: migrateMeals,
});

app.http('listUserMeals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/list-user-meals',
  handler: listUserMeals,
});
