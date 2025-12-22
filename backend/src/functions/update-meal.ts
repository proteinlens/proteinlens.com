// Azure Function: PATCH /api/meals/:id
// Update meal with user corrections
// Feature: 001-blob-vision-analysis, User Story 2
// T052: PATCH endpoint for updating corrections

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { extractUserId } from '../middleware/quotaMiddleware.js';

// T053: Validation schema for correction data
const FoodCorrectionSchema = z.object({
  name: z.string().min(1, 'Food name is required').max(200),
  portion: z.string().max(100).optional(),
  protein: z.number().min(0, 'Protein must be non-negative').max(500),
});

const CorrectionsSchema = z.object({
  corrections: z.object({
    foods: z.array(FoodCorrectionSchema).optional(),
    totalProtein: z.number().min(0).max(1000).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export async function updateMeal(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('Meal update requested', { requestId });

  try {
    // Get meal ID from route params
    const mealId = request.params.id;

    if (!mealId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Bad Request',
          message: 'Meal ID is required',
        },
      };
    }

    // Extract user ID
    const userId = extractUserId(request);

    if (!userId) {
      return {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Unauthorized',
          message: 'User authentication required',
        },
      };
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CorrectionsSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Validation Error',
          message: errors,
        },
      };
    }

    // Get existing meal
    const existingMeal = await mealService.getMealAnalysisById(mealId);

    if (!existingMeal) {
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Not Found',
          message: 'Meal not found',
        },
      };
    }

    // Check ownership
    if (existingMeal.userId !== userId) {
      Logger.warn('Unauthorized meal update attempt', {
        requestId,
        mealId,
        requestingUser: userId,
        owningUser: existingMeal.userId,
      });

      return {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Forbidden',
          message: 'You do not have permission to update this meal',
        },
      };
    }

    // T51, T54: Update meal with corrections (preserves original AI response)
    const updatedMeal = await mealService.updateMealAnalysisWithCorrections(
      mealId,
      validation.data.corrections
    );

    Logger.info('Meal updated with corrections', {
      requestId,
      mealId,
      userId,
      hasCorrections: true,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        id: updatedMeal.id,
        totalProtein: updatedMeal.totalProtein,
        confidence: updatedMeal.confidence,
        userCorrections: updatedMeal.userCorrections,
        originalAiResponse: updatedMeal.aiResponseRaw,
        updatedAt: updatedMeal.updatedAt,
      },
    };

  } catch (error) {
    Logger.error('Meal update failed', error as Error, { requestId });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to update meal',
      },
    };
  }
}

// Register HTTP trigger
app.http('updateMeal', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'meals/{id}',
  handler: updateMeal,
});
