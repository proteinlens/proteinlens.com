/**
 * Azure Function: PATCH /api/meals/:id/privacy
 * 
 * Feature 017: Shareable Meal Scans & Diet Style Profiles
 * Task: T016 - Privacy toggle endpoint
 * 
 * Allows users to toggle their meal's public/private status.
 * Constitution Principle VII: Privacy by design - user controls their data
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { extractUserId } from '../middleware/quotaMiddleware.js';
import { UpdateMealPrivacyRequestSchema } from '../models/schemas.js';
import { ZodError } from 'zod';

export async function updateMealPrivacy(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  const mealId = request.params.id;

  Logger.info('PATCH /api/meals/:id/privacy - Updating meal privacy', { requestId, mealId });

  try {
    // Extract user ID from authentication
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
          error: 'unauthorized',
          message: 'Authentication required',
        },
      };
    }

    // Validate meal ID
    if (!mealId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'bad_request',
          message: 'Meal ID is required',
        },
      };
    }

    // Parse and validate request body
    let body: { isPublic: boolean };
    try {
      const rawBody = await request.json();
      body = UpdateMealPrivacyRequestSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof ZodError) {
        Logger.warn('Invalid request body', { requestId, errors: error.errors });
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
          jsonBody: {
            error: 'validation_error',
            message: 'Invalid request body',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        };
      }
      throw error;
    }

    // Update meal privacy
    const result = await mealService.updateMealPrivacy(mealId, userId, body.isPublic);

    if (!result) {
      Logger.info('Meal not found or not owned by user', { requestId, mealId, userId });
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'not_found',
          message: 'Meal not found',
        },
      };
    }

    Logger.info('Meal privacy updated successfully', {
      requestId,
      mealId,
      userId,
      isPublic: result.isPublic,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        shareId: result.shareId,
        shareUrl: result.shareUrl,
        isPublic: result.isPublic,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to update meal privacy', error instanceof Error ? error : new Error(errorMessage), {
      requestId,
      mealId,
    });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to update meal privacy',
        requestId,
      },
    };
  }
}

// Register Azure Function
app.http('updateMealPrivacy', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'meals/{id}/privacy',
  handler: updateMealPrivacy,
});
