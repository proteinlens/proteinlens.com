// Azure Function: POST /api/meals/analyze
// Analyzes meal photo using GPT-5.1 Vision and persists results
// Constitution Principles: III (Blob-First), IV (Traceability), V (Deterministic JSON)
// T034: Analyze meal image and store results

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { blobService } from '../services/blobService.js';
import { aiService } from '../services/aiService.js';
import { mealService } from '../services/mealService.js';
import { AnalyzeRequestSchema } from '../models/schemas.js';
import { ValidationError, BlobNotFoundError } from '../utils/errors.js';

export async function analyzeMeal(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('Meal analysis requested', { requestId, url: request.url });

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = AnalyzeRequestSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ValidationError(errors);
    }

    const { blobName } = validation.data;

    // Extract userId from blob path or auth header
    const userId = request.headers.get('x-user-id') || extractUserIdFromBlobName(blobName);

    // Generate read SAS URL for AI service (Constitution Principle III: Blob-First)
    const blobUrl = await blobService.generateReadSasUrl(blobName);
    const blobUrlWithoutSas = blobUrl.split('?')[0]; // Store without SAS token

    Logger.info('Blob SAS URL generated for AI analysis', { requestId, blobName });

    // Call AI service with blob URL
    const aiResponse = await aiService.analyzeMealImage(blobUrl, requestId);

    Logger.info('AI analysis completed', {
      requestId,
      foodCount: aiResponse.foods.length,
      totalProtein: aiResponse.totalProtein,
      confidence: aiResponse.confidence,
    });

    // Persist meal analysis to database (Constitution Principle IV: Traceability)
    const mealAnalysisId = await mealService.createMealAnalysis(
      userId,
      blobName,
      blobUrlWithoutSas,
      requestId,
      aiResponse,
      'gpt-5.1-vision'
    );

    Logger.info('Meal analysis persisted successfully', {
      requestId,
      mealAnalysisId,
      blobName,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        mealAnalysisId,
        ...aiResponse,
        blobName,
        requestId,
      },
    };

  } catch (error) {
    Logger.error('Meal analysis failed', error as Error, { requestId });

    const statusCode = (error as any).statusCode || 500;
    const message = (error as Error).message || 'Internal server error';

    return {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: message,
        requestId,
      },
    };
  }
}

/**
 * Extract userId from blob name pattern: meals/{userId}/{filename}
 */
function extractUserIdFromBlobName(blobName: string): string {
  const match = blobName.match(/^meals\/([^\/]+)\//);
  if (!match) {
    throw new ValidationError('Invalid blob name format');
  }
  return match[1];
}

app.http('analyze', {
  methods: ['POST'],
  authLevel: 'anonymous', // Change to 'function' or use auth middleware in production
  route: 'meals/analyze',
  handler: analyzeMeal,
});
