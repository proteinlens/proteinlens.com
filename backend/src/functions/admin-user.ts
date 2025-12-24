// Admin User Endpoint - View user subscription details
// Feature: 002-saas-billing, User Story 6
// T075: GET /api/admin/users/:userId endpoint

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { requireAdmin, getAdminIdentity } from '../middleware/adminMiddleware.js';
import { getPrismaClient } from '../utils/prisma.js';
import { getUserPlan } from '../services/subscriptionService.js';
import { getUsageCount } from '../services/usageService.js';

const prisma = getPrismaClient();

/**
 * GET /api/admin/users/:userId
 * T077: Return user plan, status, usage stats, recent subscription events
 */
async function getAdminUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('Admin user lookup requested', { requestId });

  try {
    // T076: Check admin authorization
    const adminBlock = await requireAdmin(request);
    if (adminBlock) {
      Logger.warn('Admin access denied', { requestId });
      return {
        ...adminBlock,
        headers: {
          ...adminBlock.headers,
          'X-Request-ID': requestId,
        },
      };
    }

    const adminIdentity = getAdminIdentity(request);
    
    // Get userId from route params
    const userId = request.params.userId;
    
    if (!userId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Bad Request',
          message: 'User ID is required',
        },
      };
    }

    Logger.info('Admin looking up user', { requestId, userId, adminIdentity });

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { externalId: userId },
      include: {
        usage: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Recent usage
        },
      },
    });

    if (!user) {
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Not Found',
          message: 'User not found',
        },
      };
    }

    // T077: Get subscription details
    const planInfo = await getUserPlan(userId);
    const usageCount = await getUsageCount(userId);

    // Get recent subscription events
    const subscriptionEvents = await prisma.subscriptionEvent.findMany({
      where: { userId: user.id },
      orderBy: { processedAt: 'desc' },
      take: 20,
    });

    // Get usage statistics
    const usageStats = {
      totalScansThisWeek: usageCount,
      totalScansAllTime: await prisma.usage.count({
        where: { userId: user.id },
      }),
    };

    Logger.info('Admin user lookup completed', {
      requestId,
      userId,
      plan: planInfo.plan,
      adminIdentity,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        user: {
          id: user.id,
          externalId: user.externalId,
          email: user.email,
          createdAt: user.createdAt,
        },
        subscription: {
          plan: planInfo.plan,
          status: planInfo.subscriptionStatus,
          stripeCustomerId: planInfo.stripeCustomerId,
          stripeSubscriptionId: planInfo.stripeSubscriptionId,
          currentPeriodEnd: planInfo.currentPeriodEnd,
        },
        usage: {
          scansThisWeek: usageStats.totalScansThisWeek,
          scansAllTime: usageStats.totalScansAllTime,
          recentScans: user.usage.map((u) => ({
            id: u.id,
            type: u.type,
            mealId: u.mealId,
            createdAt: u.createdAt,
          })),
        },
        events: subscriptionEvents.map((e) => ({
          id: e.id,
          eventType: e.eventType,
          stripeEventId: e.stripeEventId,
          processedAt: e.processedAt,
          eventData: e.eventData,
        })),
      },
    };
  } catch (error) {
    Logger.error('Admin user lookup failed', error as Error, { requestId });
    
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to fetch user details',
      },
    };
  }
}

// Register HTTP trigger
app.http('adminUser', {
  methods: ['GET'],
  authLevel: 'anonymous', // Protected by requireAdmin middleware
  route: 'billing/admin/users/{userId}',
  handler: getAdminUser,
});
