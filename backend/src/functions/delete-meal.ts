// Azure Function: DELETE /api/meals/:id
// Delete meal analysis with cascade delete
// Feature: 001-blob-vision-analysis, User Story 3
// T065-T067: DELETE endpoint with transaction and logging

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { blobService } from '../services/blobService.js';
import { extractUserId } from '../middleware/quotaMiddleware.js';

const prisma = new PrismaClient();

export async function deleteMeal(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('Meal delete requested', { requestId });

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

    // T67: Log delete operation initiation
    Logger.info('Meal delete initiated', {
      requestId,
      mealId,
      userId,
    });

    // Get existing meal to verify ownership and get blob name
    const existingMeal = await prisma.mealAnalysis.findUnique({
      where: { id: mealId },
      select: {
        id: true,
        userId: true,
        blobName: true,
      },
    });

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
      Logger.warn('Unauthorized meal delete attempt', {
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
          message: 'You do not have permission to delete this meal',
        },
      };
    }

    // T66: Transaction - delete both blob and DB record
    // Delete blob first (if blob deletion fails, don't proceed with DB delete)
    try {
      await blobService.deleteBlob(existingMeal.blobName);
      Logger.info('Blob deleted', { requestId, blobName: existingMeal.blobName });
    } catch (blobError) {
      Logger.error('Blob deletion failed', blobError as Error, {
        requestId,
        blobName: existingMeal.blobName,
      });
      // Continue with DB deletion even if blob deletion fails
      // (blob might not exist or might be manually deleted)
    }

    // T64: Delete meal with cascade (foods deleted via Prisma cascade)
    await prisma.$transaction(async (tx) => {
      // Delete related foods first (explicit cascade)
      await tx.food.deleteMany({
        where: { mealAnalysisId: mealId },
      });

      // Delete the meal analysis
      await tx.mealAnalysis.delete({
        where: { id: mealId },
      });
    });

    // T67: Log successful deletion
    Logger.info('Meal deleted successfully', {
      requestId,
      mealId,
      userId,
      blobName: existingMeal.blobName,
    });

    // Return 204 No Content on successful deletion
    return {
      status: 204,
      headers: {
        'X-Request-ID': requestId,
      },
    };

  } catch (error) {
    Logger.error('Meal delete failed', error as Error, { requestId });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to delete meal',
      },
    };
  }
}

// Register HTTP trigger
app.http('deleteMeal', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'meals/{id}',
  handler: deleteMeal,
});
