// Daily Summary endpoint - Feature 017
// T048: GET /api/meals/daily-summary with macro breakdown
// US5: Macro Split Display for diet users

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, isAuthFailure } from '../middleware/authGuard.js';
import { mealService } from '../services/mealService.js';
import { Logger } from '../utils/logger.js';

export async function dailySummary(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  Logger.info('Daily summary request received', { requestId });

  // Require authentication
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  const userId = auth.ctx.user.externalId || auth.ctx.user.id;

  try {
    // Parse date from query params (default to today)
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();

    // Validate date
    if (isNaN(date.getTime())) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Invalid date format. Use YYYY-MM-DD.',
        },
      };
    }

    // Get daily summary
    const summary = await mealService.getDailySummary(userId, date);

    Logger.info('Daily summary retrieved', {
      requestId,
      userId,
      date: summary.date,
      meals: summary.meals,
    });

    return {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      },
      jsonBody: summary,
    };
  } catch (error) {
    Logger.error('Error getting daily summary', error instanceof Error ? error : undefined);

    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to get daily summary',
      },
    };
  }
}

app.http('daily-summary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'meals/daily-summary',
  handler: dailySummary,
});
