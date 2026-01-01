/**
 * Feature 017: GET /api/diet-styles
 * T028: Returns list of active diet styles for user selection
 * 
 * Public endpoint - no auth required (diet styles are informational)
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { dietService, DietStylePublic } from '../services/dietService.js';

export async function getDietStyles(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('GET /api/diet-styles - Fetching active diet styles', { requestId });

  try {
    // Get active diet styles (cached in DietService)
    const dietStyles = await dietService.getActiveDietStyles();

    Logger.info('Diet styles retrieved', { requestId, count: dietStyles.length });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      jsonBody: {
        dietStyles: dietStyles.map((style: DietStylePublic) => ({
          id: style.id,
          slug: style.slug,
          name: style.name,
          description: style.description,
          netCarbCapG: style.netCarbCapG,
          fatTargetPercent: style.fatTargetPercent,
        })),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to fetch diet styles', error instanceof Error ? error : new Error(errorMessage), {
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
        message: 'Failed to fetch diet styles',
        requestId,
      },
    };
  }
}

// Register Azure Function
app.http('diet-styles', {
  methods: ['GET'],
  route: 'diet-styles',
  handler: getDietStyles,
});
