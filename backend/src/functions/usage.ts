// GET /api/billing/usage - Return current usage statistics
// Feature: 002-saas-billing, User Story 3

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUsageStats } from '../services/usageService';
import { extractUserId } from '../middleware/quotaMiddleware';

/**
 * GET /api/billing/usage
 * Returns current scan usage for the authenticated user
 */
async function getUsage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('GET /api/billing/usage - Fetching user usage');

  try {
    // Extract user ID from request
    const userId = extractUserId(request);
    
    if (!userId) {
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Unauthorized',
          message: 'User ID required. Please include x-user-id header.',
        }),
      };
    }

    // Get usage statistics
    const stats = await getUsageStats(userId);

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
