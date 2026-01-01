/**
 * Feature 017: PATCH /api/me/diet-style
 * T029: Update user's selected diet style
 * 
 * Requires authentication via x-user-id header
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { dietService } from '../services/dietService.js';
import { extractUserId } from '../middleware/quotaMiddleware.js';
import { UserDietStyleUpdateSchema } from '../models/schemas.js';

export async function updateUserDietStyle(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('PATCH /api/me/diet-style - Updating user diet style', { requestId });

  try {
    // Extract user ID from header
    const userId = extractUserId(request);

    if (!userId) {
      Logger.warn('Unauthorized - no user ID', { requestId });
      return {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Unauthorized',
          message: 'User authentication required. Provide x-user-id header.',
        },
      };
    }

    // Parse and validate request body
    const body = await request.json() as Record<string, unknown>;
    const validation = UserDietStyleUpdateSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      Logger.warn('Invalid request body', { requestId, errors });
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Bad Request',
          message: errors,
        },
      };
    }

    const { dietStyleId } = validation.data;

    // Verify diet style exists if provided (null means "no diet style")
    if (dietStyleId) {
      const dietStyle = await dietService.getDietStyleById(dietStyleId);
      if (!dietStyle) {
        Logger.warn('Diet style not found', { requestId, dietStyleId });
        return {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
          jsonBody: {
            error: 'Not Found',
            message: 'Diet style not found',
          },
        };
      }
    }

    // Update user's diet style
    const updatedDietStyle = await dietService.updateUserDietStyle(userId, dietStyleId);

    Logger.info('User diet style updated', { 
      requestId, 
      userId, 
      dietStyleId: dietStyleId || 'none' 
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        success: true,
        dietStyle: updatedDietStyle 
          ? {
              id: updatedDietStyle.id,
              slug: updatedDietStyle.slug,
              name: updatedDietStyle.name,
            }
          : null,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to update user diet style', error instanceof Error ? error : new Error(errorMessage), {
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
        message: 'Failed to update diet style',
        requestId,
      },
    };
  }
}

// Register Azure Function
app.http('user-diet-style', {
  methods: ['PATCH'],
  route: 'me/diet-style',
  handler: updateUserDietStyle,
});
