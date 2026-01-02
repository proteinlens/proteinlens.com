// Azure Function: POST /api/meals/analyze
// Analyzes meal photo using GPT-5.1 Vision and persists results
// Constitution Principles: III (Blob-First), IV (Traceability), V (Deterministic JSON)
// T034: Analyze meal image and store results
// T031, T033: Added quota enforcement and usage recording (Feature 002)
// T077: Cache lookup using SHA-256 hash before calling AI
// Feature 011: Added telemetry tracking
// Feature 017: Added diet feedback generation and dietStyleAtScan snapshot

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { blobService } from '../services/blobService.js';
import { aiService } from '../services/aiService.js';
import { mealService } from '../services/mealService.js';
import { dietService, DietStyle } from '../services/dietService.js';
import { AnalyzeRequestSchema, AIAnalysisResponse } from '../models/schemas.js';
import { ValidationError, BlobNotFoundError } from '../utils/errors.js';
import { enforceWeeklyQuota, extractUserId } from '../middleware/quotaMiddleware.js';
import { recordUsage, UsageType } from '../services/usageService.js';
import { correlationMiddleware } from '../middleware/correlationMiddleware.js';
import { trackEvent, trackMetric, trackException, setTraceContext } from '../utils/telemetry.js';
import { getPrismaClient } from '../utils/prisma.js';

/**
 * Feature 017 T031: Generate diet-specific feedback based on meal analysis
 * Returns warnings and tips based on user's diet style
 */
interface DietFeedback {
  warnings: string[];
  tips: string[];
  dietStyle?: {
    name: string;
    slug: string;
  };
}

function generateDietFeedback(aiResponse: AIAnalysisResponse, dietStyle: DietStyle | null): DietFeedback {
  const feedback: DietFeedback = {
    warnings: [],
    tips: [],
  };

  if (!dietStyle) {
    return feedback;
  }

  feedback.dietStyle = {
    name: dietStyle.name,
    slug: dietStyle.slug,
  };

  // For now, we estimate carbs from food items (future: get from AI response)
  // This is a simplified estimation - in production, AI should provide carb data
  const estimatedNetCarbs = estimateMealCarbs(aiResponse.foods);

  // Check against diet-specific thresholds
  const slug = dietStyle.slug.toLowerCase();
  const netCarbCap = dietStyle.netCarbCapG ?? 50; // Default 50g if not set

  if (slug === 'ketogenic' || slug === 'keto') {
    // Keto: strict carb limit (typically 20-50g/day)
    if (estimatedNetCarbs > netCarbCap / 3) { // Per-meal limit ~1/3 of daily
      feedback.warnings.push(`⚠️ High carbs for keto: ~${estimatedNetCarbs}g net carbs (daily limit: ${netCarbCap}g)`);
    }
    if (aiResponse.totalProtein > 50) {
      feedback.tips.push(`💡 High protein meal - spread protein intake throughout the day for keto`);
    }
  } else if (slug === 'low-carb' || slug === 'lowcarb') {
    // Low-carb: moderate limit (typically 50-100g/day)
    if (estimatedNetCarbs > 30) {
      feedback.warnings.push(`⚠️ Moderate carbs: ~${estimatedNetCarbs}g net carbs`);
    }
  } else if (slug === 'mediterranean') {
    // Mediterranean: focus on healthy fats and whole grains
    feedback.tips.push(`💡 Mediterranean tip: Pair with olive oil and vegetables`);
  } else if (slug === 'plant-based' || slug === 'vegan') {
    // Plant-based: encourage plant protein sources
    if (aiResponse.totalProtein < 20) {
      feedback.tips.push(`💡 Consider adding legumes, tofu, or tempeh for more plant protein`);
    }
  }

  // General protein feedback
  if (aiResponse.totalProtein >= 30 && aiResponse.totalProtein <= 40) {
    feedback.tips.push(`✅ Great protein amount! 30-40g is optimal per meal for muscle synthesis`);
  }

  return feedback;
}

/**
 * Rough estimation of meal carbs from food items
 * This is a simplified heuristic - in production, AI should provide carb estimates
 */
function estimateMealCarbs(foods: Array<{ name: string; portion: string; protein: number }>): number {
  let estimatedCarbs = 0;
  
  for (const food of foods) {
    const name = food.name.toLowerCase();
    
    // High-carb foods (rough estimates)
    if (name.includes('rice') || name.includes('pasta') || name.includes('noodle')) {
      estimatedCarbs += 30;
    } else if (name.includes('bread') || name.includes('toast') || name.includes('bun')) {
      estimatedCarbs += 20;
    } else if (name.includes('potato') || name.includes('fries')) {
      estimatedCarbs += 25;
    } else if (name.includes('pizza')) {
      estimatedCarbs += 35;
    } else if (name.includes('beans') || name.includes('lentils')) {
      estimatedCarbs += 20;
    } else if (name.includes('fruit') || name.includes('apple') || name.includes('banana')) {
      estimatedCarbs += 15;
    } else if (name.includes('cereal') || name.includes('oatmeal') || name.includes('granola')) {
      estimatedCarbs += 25;
    } else if (name.includes('sandwich') || name.includes('burger')) {
      estimatedCarbs += 25;
    } else if (name.includes('sauce') || name.includes('syrup')) {
      estimatedCarbs += 10;
    }
    // Low-carb foods add minimal carbs
    else if (name.includes('egg') || name.includes('chicken') || name.includes('steak') || 
             name.includes('fish') || name.includes('salmon') || name.includes('tofu')) {
      estimatedCarbs += 1;
    } else if (name.includes('salad') || name.includes('vegetable') || name.includes('broccoli')) {
      estimatedCarbs += 5;
    }
  }
  
  return Math.round(estimatedCarbs);
}

export async function analyzeMeal(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  // T019: Extract correlation context
  const { traceContext, addResponseHeaders } = correlationMiddleware(request, context);
  setTraceContext(traceContext);
  
  Logger.info('Meal analysis requested', { requestId, url: request.url });
  
  // T033: Track analysis started event
  trackEvent('proteinlens.analysis.started', {
    correlationId: traceContext.correlationId,
    requestId,
  });

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
    const userId = extractUserId(request, blobName) || extractUserIdFromBlobName(blobName);

    // T031: Check quota before proceeding with analysis
    const quotaBlock = await enforceWeeklyQuota(userId);
    if (quotaBlock) {
      Logger.info('Scan blocked - quota exceeded', { requestId, userId });
      return {
        ...quotaBlock,
        headers: {
          ...quotaBlock.headers,
          'X-Request-ID': requestId,
        },
      };
    }

    // T076-T077: Calculate blob hash and check cache
    const blobHash = await blobService.calculateBlobHash(blobName);
    const cachedAnalysis = await mealService.getMealAnalysisByBlobHash(blobHash);

    // Feature 017 T032: Get user's diet style for snapshot
    let userDietStyle: DietStyle | null = null;
    try {
      const prisma = getPrismaClient();
      const userWithDiet = await prisma.user.findUnique({
        where: { id: userId },
        include: { dietStyle: true },
      });
      userDietStyle = userWithDiet?.dietStyle as DietStyle | null;
    } catch (dietError) {
      Logger.warn('Failed to get user diet style for snapshot', { requestId, error: (dietError as Error).message });
    }

    let aiResponse: AIAnalysisResponse;
    let mealAnalysisId: string;
    let shareId: string;
    let shareUrl: string;
    let wasCached = false;

    if (cachedAnalysis) {
      // T077: Use cached result instead of calling AI
      Logger.info('Using cached analysis result', { 
        requestId, 
        blobName, 
        cachedMealId: cachedAnalysis.id,
        blobHash: blobHash.substring(0, 16) + '...',
      });

      aiResponse = cachedAnalysis.aiResponseRaw as unknown as AIAnalysisResponse;
      
      // Create new meal record referencing cached analysis
      // Feature 017: Now returns shareId and shareUrl, snapshots dietStyleAtScanId
      const result = await mealService.createMealAnalysisFromCache(
        userId,
        blobName,
        blobService.getBlobUrl(blobName),
        requestId,
        blobHash,
        cachedAnalysis.id,
        userDietStyle?.id || null // T032: Snapshot diet style
      );
      mealAnalysisId = result.id;
      shareId = result.shareId;
      shareUrl = result.shareUrl;
      wasCached = true;

    } else {
      // No cache hit - call AI service
      const blobUrl = await blobService.generateReadSasUrl(blobName);
      const blobUrlWithoutSas = blobUrl.split('?')[0];

      Logger.info('Blob SAS URL generated for AI analysis', { requestId, blobName });

      // Call AI service with blob URL
      aiResponse = await aiService.analyzeMealImage(blobUrl, requestId);

      Logger.info('AI analysis completed', {
        requestId,
        foodCount: aiResponse.foods.length,
        totalProtein: aiResponse.totalProtein,
        confidence: aiResponse.confidence,
      });

      // Persist meal analysis to database with hash for future cache lookups
      // Feature 017: Now returns shareId and shareUrl, snapshots dietStyleAtScanId
      const result = await mealService.createMealAnalysis(
        userId,
        blobName,
        blobUrlWithoutSas,
        requestId,
        aiResponse,
        'gpt-5.1-vision',
        blobHash,
        userDietStyle?.id || null // T032: Snapshot diet style
      );
      mealAnalysisId = result.id;
      shareId = result.shareId;
      shareUrl = result.shareUrl;
    }

    Logger.info('Meal analysis persisted successfully', {
      requestId,
      mealAnalysisId,
      blobName,
      wasCached,
      dietStyleAtScan: userDietStyle?.slug || null,
    });

    // Feature 017 T031: Generate diet-specific feedback (using already-fetched diet style)
    const dietFeedback = generateDietFeedback(aiResponse, userDietStyle);
    if (dietFeedback.warnings.length > 0 || dietFeedback.tips.length > 0) {
      Logger.info('Diet feedback generated', { 
        requestId, 
        dietStyle: userDietStyle?.slug,
        warningCount: dietFeedback.warnings.length,
        tipCount: dietFeedback.tips.length,
      });
    }

    // T033: Record usage after successful analysis
    try {
      await recordUsage(userId, UsageType.MEAL_ANALYSIS, mealAnalysisId);
      Logger.info('Usage recorded', { requestId, userId, mealAnalysisId });
    } catch (usageError) {
      // Log but don't fail the request if usage recording fails
      Logger.error('Failed to record usage', usageError as Error, { requestId, userId });
    }

    const durationMs = Date.now() - startTime;
    
    // Log comprehensive analysis summary
    Logger.info('Meal analysis request completed', {
      requestId,
      mealAnalysisId,
      userId,
      wasCached,
      durationMs,
      foodCount: aiResponse.foods.length,
      confidence: aiResponse.confidence,
      macrosAvailable: !!(aiResponse.totalCarbs !== undefined && aiResponse.totalFat !== undefined),
    });
    
    // T033: Track analysis completed event
    trackEvent('proteinlens.analysis.completed', {
      correlationId: traceContext.correlationId,
      requestId,
      mealAnalysisId,
      wasCached: String(wasCached),
      foodCount: String(aiResponse.foods.length),
      confidence: aiResponse.confidence,
    }, {
      durationMs,
      totalProtein: aiResponse.totalProtein,
      totalCarbs: aiResponse.totalCarbs || 0,
      totalFat: aiResponse.totalFat || 0,
    });
    
    // Track analysis count metric
    trackMetric({
      name: 'proteinlens.analysis.success_count',
      value: 1,
      properties: {
        wasCached: String(wasCached),
        userId,
        hasMacros: String(!!(aiResponse.totalCarbs !== undefined && aiResponse.totalFat !== undefined)),
      },
    });

    return addResponseHeaders({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...(wasCached && { 'X-Cache-Hit': 'true' }),
      },
      jsonBody: {
        mealAnalysisId,
        shareId, // Feature 017: Shareable meal URL ID
        shareUrl, // Feature 017: Full shareable URL
        isPublic: true, // Feature 017: Default to public
        ...aiResponse,
        // Feature 017 T031: Diet-specific feedback
        dietFeedback: dietFeedback.warnings.length > 0 || dietFeedback.tips.length > 0 
          ? dietFeedback 
          : null,
        blobName,
        requestId,
      },
    });

  } catch (error) {
    Logger.error('Meal analysis failed', error as Error, { requestId });
    
    const durationMs = Date.now() - startTime;
    
    // T033: Track analysis failed event
    trackEvent('proteinlens.analysis.failed', {
      correlationId: traceContext.correlationId,
      requestId,
      errorType: (error as Error).name,
      errorMessage: (error as Error).message.substring(0, 200),
    }, { durationMs });
    
    // Track failure metric
    trackMetric({
      name: 'proteinlens.analysis.failure_count',
      value: 1,
      properties: {
        errorType: (error as Error).name,
      },
    });
    
    // Track exception
    trackException(error as Error, {
      correlationId: traceContext.correlationId,
      requestId,
      operation: 'analyzeMeal',
    });

    const statusCode = (error as any).statusCode || 500;
    const message = (error as Error).message || 'Internal server error';

    return addResponseHeaders({
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: message,
        requestId,
      },
    });
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
