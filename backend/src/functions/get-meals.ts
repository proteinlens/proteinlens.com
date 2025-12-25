// Azure Function: GET /api/meals
// Get meal history for a user
// Feature: 001-blob-vision-analysis, User Story 2
// Task: T067 - Meal history retrieval

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { extractUserId } from '../middleware/quotaMiddleware.js';

interface Food {
  name: string;
  portion: string;
  protein: number | { toNumber: () => number };
}

interface MealWithFoods {
  id: string;
  requestId: string;
  userId: string;
  blobName: string;
  blobUrl: string;
  blobHash: string | null;
  totalProtein: { toNumber: () => number } | number;
  confidence: string;
  notes: string | null;
  aiModel: string;
  aiResponseRaw: unknown;
  userCorrections: unknown;
  createdAt: Date;
  updatedAt: Date;
  foods: Food[];
}

export async function getMeals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('GET /api/meals - Fetching meal history', { requestId });

  try {
    // Extract user ID from header or query param
    const userId = extractUserId(request) || request.query.get('userId');

    if (!userId) {
      Logger.warn('GET /api/meals - No userId provided', { requestId });
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

    // Parse limit from query (default 50)
    const limitParam = request.query.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 500) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Bad Request',
          message: 'Limit must be a number between 1 and 500',
        },
      };
    }

    Logger.info('Fetching meals for user', { requestId, userId, limit });

    // Get meals from database
    const meals = await mealService.getUserMealAnalyses(userId, { limit }) as unknown as MealWithFoods[];

    Logger.info('Meals retrieved successfully', {
      requestId,
      userId,
      mealCount: meals.length,
    });

    // Transform to API response format
    const response = meals.map((meal) => ({
      id: meal.id,
      timestamp: meal.createdAt.toISOString(),
      imageUrl: meal.blobUrl,
      totalProtein: Number(meal.totalProtein),
      confidence: meal.confidence,
      notes: meal.notes,
      foods: (meal.foods as Food[]).map((food) => ({
        name: food.name,
        portion: food.portion,
        protein: typeof food.protein === 'number' ? food.protein : Number(food.protein),
      })),
      aiModel: meal.aiModel,
      requestId: meal.requestId,
      userCorrections: meal.userCorrections,
    }));

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Cache-Control': 'no-cache',
      },
      jsonBody: response,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to fetch meal history', error instanceof Error ? error : new Error(errorMessage), {
      requestId,
    });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to fetch meal history',
        requestId,
      },
    };
  }
}

// Register Azure Function
app.http('getMeals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'meals',
  handler: getMeals,
});
