// GET /api/billing/usage - Return current usage statistics
// Feature: 002-saas-billing, User Story 3

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUsageStats } from '../services/usageService';
import { extractUserId, extractClientIp, getQuotaInfo } from '../middleware/quotaMiddleware';

/**
 * GET /api/billing/usage
 * Returns current scan usage for the authenticated or anonymous user
 */
async function getUsage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('GET /api/billing/usage - Fetching user usage');

  try {
    // Extract user ID from request (may be null for anonymous)
    const userId = extractUserId(request);
    
    // Get quota info (handles both registered and anonymous users)
    const quotaInfo = await getQuotaInfo(userId, request);
    
    if (!quotaInfo) {
      // Couldn't determine quota (no userId and no IP)
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'Could not determine quota information.',
        }),
      };
    }

    // For anonymous users, return simplified stats
    if (quotaInfo.plan === 'ANONYMOUS') {
      return {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Quota-Used': quotaInfo.used.toString(),
          'X-Quota-Limit': quotaInfo.limit.toString(),
          'X-Quota-Remaining': quotaInfo.remaining.toString(),
        },
        body: JSON.stringify({
          plan: 'ANONYMOUS',
          scansUsed: quotaInfo.used,
          scansRemaining: quotaInfo.remaining,
          scansLimit: quotaInfo.limit,
          periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          periodEnd: new Date().toISOString(), // now
          daysUntilReset: null,
          isUnlimited: false,
        }),
      };
    }

    // For registered users, get full stats
    const stats = await getUsageStats(userId!);

    // Calculate days until quota reset (for Free users)
    const periodEndDate = new Date(stats.periodEnd);
    const now = new Date();
    const daysUntilReset = Math.ceil((periodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Quota-Used': stats.scansUsed.toString(),
        'X-Quota-Limit': stats.scansLimit.toString(),
        'X-Quota-Remaining': stats.scansRemaining.toString(),
      },
      body: JSON.stringify({
        plan: stats.plan,
        scansUsed: stats.scansUsed,
        scansRemaining: stats.scansRemaining, // -1 for unlimited
        scansLimit: stats.scansLimit, // -1 for unlimited
        periodStart: stats.periodStart.toISOString(),
        periodEnd: stats.periodEnd.toISOString(),
        daysUntilReset: stats.plan === 'FREE' ? daysUntilReset : null,
        isUnlimited: stats.scansLimit === -1,
      }),
    };
  } catch (error) {
    context.error('Error fetching usage:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch usage statistics' }),
    };
  }
}

// Register the function
app.http('usage', {
  methods: ['GET'],
  authLevel: 'anonymous', // TODO: Change to 'function' with auth
  route: 'billing/usage',
  handler: getUsage,
});

export default getUsage;
