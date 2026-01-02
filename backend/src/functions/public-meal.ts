/**
 * Azure Function: GET /api/meals/:shareId/public
 * 
 * Feature 017: Shareable Meal Scans & Diet Style Profiles
 * Task: T013 - Public meal endpoint for shared view
 * 
 * Returns public meal data for shareable URL preview.
 * No authentication required - this is intentionally public.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { blobService } from '../services/blobService.js';
import { isValidShareId } from '../utils/nanoid.js';

interface Food {
  name: string;
  portion: string;
  protein: number | { toNumber: () => number };
}

interface DietStyleSnapshot {
  id: string;
  slug: string;
  name: string;
  netCarbCapG: number | null;
  fatTargetPercent: number | null;
}

interface PublicMealWithFoods {
  id: string;
  shareId: string;
  blobName: string;
  blobUrl: string;
  totalProtein: { toNumber: () => number } | number;
  confidence: string;
  notes: string | null;
  createdAt: Date;
  foods: Food[];
  dietStyleAtScan: DietStyleSnapshot | null;
}

export async function getPublicMeal(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  const shareId = request.params.shareId;

  Logger.info('GET /api/meals/:shareId/public - Fetching public meal', { requestId, shareId });

  try {
    // Validate shareId format
    if (!shareId || !isValidShareId(shareId)) {
      Logger.warn('Invalid shareId format', { requestId, shareId });
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'bad_request',
          message: 'Invalid share ID format',
        },
      };
    }

    // Get public meal by shareId
    const meal = await mealService.getPublicMealByShareId(shareId) as unknown as PublicMealWithFoods | null;

    if (!meal) {
      Logger.info('Public meal not found or is private', { requestId, shareId });
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'not_found',
          message: 'Meal not found or is private',
        },
      };
    }

    // Generate SAS URL for the meal image (longer expiry for sharing - 24 hours)
    let imageUrl = meal.blobUrl;
    try {
      if (meal.blobName) {
        imageUrl = await blobService.generateReadSasUrl(meal.blobName, 60 * 24); // 24 hours
      }
    } catch (error) {
      Logger.warn('Failed to generate SAS URL for public meal image', {
        requestId,
        shareId,
        blobName: meal.blobName,
      });
      // Keep original URL as fallback
    }

    Logger.info('Public meal retrieved successfully', {
      requestId,
      shareId,
      mealId: meal.id,
    });

    // Transform to API response format
    const response = {
      meal: {
        shareId: meal.shareId,
        uploadedAt: meal.createdAt.toISOString(),
        imageUrl,
        totalProtein: typeof meal.totalProtein === 'number' 
          ? meal.totalProtein 
          : Number(meal.totalProtein),
        confidence: meal.confidence,
        proTip: meal.notes, // Pro Tip (notes field renamed for API clarity)
        foods: (meal.foods as Food[]).map((food) => ({
          name: food.name,
          portion: food.portion,
          protein: typeof food.protein === 'number' ? food.protein : Number(food.protein),
        })),
        dietStyleAtScan: meal.dietStyleAtScan
          ? {
              slug: meal.dietStyleAtScan.slug,
              name: meal.dietStyleAtScan.name,
            }
          : null,
      },
    };

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Request-ID': requestId,
        // Aggressive caching since meals never change
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year - meals are immutable
        'ETag': `"${shareId}"`, // Use shareId as ETag for client-side caching
        'Vary': 'Accept-Encoding',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      },
      jsonBody: response,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to fetch public meal', error instanceof Error ? error : new Error(errorMessage), {
      requestId,
      shareId,
    });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to fetch meal',
        requestId,
      },
    };
  }
}

// Register Azure Function
app.http('getPublicMeal', {
  methods: ['GET'],
  authLevel: 'anonymous', // Public endpoint - no auth required
  route: 'meals/{shareId}/public',
  handler: getPublicMeal,
});
