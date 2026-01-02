// Azure Function: GET /api/meals/daily-summary
// Get aggregated daily macronutrient summary for a user
// Feature: 001-macro-ingredients-analysis, User Story 2
// Task: T024 - Daily macro summary endpoint

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { extractUserId } from '../middleware/quotaMiddleware.js';

export async function getDailySummary(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('GET /api/meals/daily-summary - Fetching daily macro summary', { requestId });

  try {
    // Extract user ID from header or query param
    const userId = extractUserId(request) || request.query.get('userId');

    if (!userId) {
      Logger.warn('GET /api/meals/daily-summary - No userId provided', { requestId });
      return {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Unauthorized',
          message: 'User authentication required. Provide x-user-id header or userId query parameter.',
        },
      };
    }

    // Parse optional date parameter (default: today)
    // Format: YYYY-MM-DD (e.g., "2026-01-02")
    const dateParam = request.query.get('date');
    let targetDate = new Date();
    
    if (dateParam) {
      targetDate = new Date(dateParam + 'T00:00:00Z');
      if (isNaN(targetDate.getTime())) {
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
          jsonBody: {
            error: 'Bad Request',
            message: 'Invalid date format. Use YYYY-MM-DD (e.g., "2026-01-02")',
          },
        };
      }
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    Logger.info('Fetching daily summary for user', {
      requestId,
      userId,
      date: dateStr,
    });

    // Get aggregated daily summary (mealService.getDailySummary expects a Date object)
    const dailySummary = await mealService.getDailySummary(userId, targetDate);

    Logger.info('Daily summary retrieved successfully', {
      requestId,
      userId,
      date: dateStr,
      mealCount: dailySummary.meals,
      totalProtein: dailySummary.macros.protein,
      totalCarbs: dailySummary.macros.carbs,
      totalFat: dailySummary.macros.fat,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: dailySummary,
    };
  } catch (error) {
    Logger.error('Failed to fetch daily summary', error as Error, { requestId });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to fetch daily summary',
        requestId,
      },
    };
  }

// Register function with HTTP trigger
app.http('getDailySummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getDailySummary,
  route: 'meals/daily-summary',
});
