// Meal Service for database operations via Prisma
// Constitution Principle IV: Traceability & Auditability
// T033: Prisma integration for meal analysis persistence

import { PrismaClient, MealAnalysis } from '@prisma/client';
import { Logger } from '../utils/logger.js';
import { AIAnalysisResponse } from '../models/schemas.js';
import { config } from '../utils/config.js';
import crypto from 'crypto';

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma warnings/errors
prisma.$on('warn', (e) => Logger.warn('Prisma warning', { message: e.message }));
prisma.$on('error', (e) => Logger.error('Prisma error', new Error(e.message), {}));

class MealService {
  /**
   * T033: Create meal analysis record with normalized foods
   * Constitution Principle IV: Stores requestId for traceability
   * T077: Updated to accept blobHash parameter for caching
   */
  async createMealAnalysis(
    userId: string,
    blobName: string,
    blobUrl: string,
    requestId: string,
    aiResponse: AIAnalysisResponse,
    modelName: string,
    blobHash?: string
  ): Promise<string> {
    Logger.info('Creating meal analysis', { userId, blobName, requestId, foodCount: aiResponse.foods.length });

    // Use provided hash or generate one
    const hash = blobHash || this.generateBlobHash(blobName);

    const mealAnalysis = await prisma.mealAnalysis.create({
      data: {
        userId,
        blobName,
        blobUrl, // Without SAS token per Constitution Principle I
        requestId,
        aiModel: modelName || config.aiModelDeployment,
        aiResponseRaw: aiResponse as any,
        totalProtein: aiResponse.totalProtein,
        confidence: aiResponse.confidence,
        blobHash: hash,
        foods: {
          create: aiResponse.foods.map((food, index) => ({
            name: food.name,
            portion: food.portion,
            protein: food.protein,
            displayOrder: index,
          })),
        },
      },
      include: {
        foods: true,
      },
    });

    Logger.info('Meal analysis created successfully', {
      requestId,
      mealAnalysisId: mealAnalysis.id,
      foodCount: aiResponse.foods.length,
    });

    return mealAnalysis.id;
  }

  /**
   * T077: Create meal analysis from cached result
   * Creates a new record for the user but references cached AI response
   */
  async createMealAnalysisFromCache(
    userId: string,
    blobName: string,
    blobUrl: string,
    requestId: string,
    blobHash: string,
    cachedMealId: string
  ): Promise<string> {
    // Get the cached analysis to copy the data
    const cachedAnalysis = await prisma.mealAnalysis.findUnique({
      where: { id: cachedMealId },
      include: { foods: true },
    });

    if (!cachedAnalysis) {
      throw new Error(`Cached meal analysis not found: ${cachedMealId}`);
    }

    Logger.info('Creating meal analysis from cache', { 
      userId, 
      blobName, 
      requestId, 
      cachedMealId,
      blobHash: blobHash.substring(0, 16) + '...',
    });

    const mealAnalysis = await prisma.mealAnalysis.create({
      data: {
        userId,
        blobName,
        blobUrl,
        requestId,
        aiModel: cachedAnalysis.aiModel,
        aiResponseRaw: cachedAnalysis.aiResponseRaw as any,
        totalProtein: cachedAnalysis.totalProtein,
        confidence: cachedAnalysis.confidence,
        blobHash,
        notes: `Cached from meal ${cachedMealId}`, // Track that this was a cache hit
        foods: {
          create: cachedAnalysis.foods.map((food, index) => ({
            name: food.name,
            portion: food.portion,
            protein: food.protein,
            displayOrder: index,
          })),
        },
      },
      include: {
        foods: true,
      },
    });

    Logger.info('Meal analysis created from cache', {
      requestId,
      mealAnalysisId: mealAnalysis.id,
      cachedFromId: cachedMealId,
    });

    return mealAnalysis.id;
  }

  /**
   * Get meal analysis by blob name (for caching via blobHash)
   */
  async getMealAnalysisByBlobHash(blobHash: string): Promise<MealAnalysis | null> {
    const analysis = await prisma.mealAnalysis.findFirst({
      where: { blobHash },
      include: { foods: true },
      orderBy: { createdAt: 'desc' },
    });

    if (analysis) {
      Logger.info('Cached meal analysis found', { blobHash, mealAnalysisId: analysis.id });
    }

    return analysis;
  }

  /**
   * Get meal analysis by ID
   */
  async getMealAnalysisById(id: string): Promise<MealAnalysis | null> {
    return prisma.mealAnalysis.findUnique({
      where: { id },
      include: { foods: true },
    });
  }

  /**
   * Get all meal analyses for a user
   * T058: Filter by plan - Free users see last 7 days, Pro users see all
   */
  async getUserMealAnalyses(
    userId: string,
    options: { limit?: number; daysBack?: number } = {}
  ): Promise<MealAnalysis[]> {
    const { limit = 50, daysBack } = options;

    const whereClause: { userId: string; createdAt?: { gte: Date } } = { userId };

    // If daysBack is specified, filter by date
    if (daysBack !== undefined && daysBack > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      whereClause.createdAt = { gte: cutoffDate };
    }

    return prisma.mealAnalysis.findMany({
      where: whereClause,
      include: { foods: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * T059: Export meal analyses for Pro users
   * Returns data in CSV-ready format
   */
  async exportUserMealAnalyses(userId: string): Promise<{
    meals: Array<{
      id: string;
      createdAt: Date;
      totalProtein: number;
      confidence: number;
      foods: Array<{ name: string; portion: string; protein: number }>;
    }>;
    summary: {
      totalMeals: number;
      totalProtein: number;
      averageProteinPerMeal: number;
      dateRange: { start: Date | null; end: Date | null };
    };
  }> {
    const meals = await prisma.mealAnalysis.findMany({
      where: { userId },
      include: { foods: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalProtein = meals.reduce((sum, m) => sum + Number(m.totalProtein), 0);

    return {
      meals: meals.map((m) => ({
        id: m.id,
        createdAt: m.createdAt,
        totalProtein: Number(m.totalProtein),
        confidence: Number(m.confidence),
        foods: m.foods.map((f) => ({
          name: f.name,
          portion: f.portion,
          protein: Number(f.protein),
        })),
      })),
      summary: {
        totalMeals: meals.length,
        totalProtein,
        averageProteinPerMeal: meals.length > 0 ? totalProtein / meals.length : 0,
        dateRange: {
          start: meals.length > 0 ? meals[meals.length - 1].createdAt : null,
          end: meals.length > 0 ? meals[0].createdAt : null,
        },
      },
    };
  }

  /**
   * Update meal analysis with user corrections (User Story 2)
   */
  async updateMealAnalysisWithCorrections(
    id: string,
    userCorrections: Record<string, unknown>
  ): Promise<MealAnalysis> {
    Logger.info('Updating meal analysis with user corrections', { mealAnalysisId: id });

    return prisma.mealAnalysis.update({
      where: { id },
      data: { userCorrections: userCorrections as any },
      include: { foods: true },
    });
  }

  /**
   * Delete meal analysis (User Story 3)
   * Constitution Principle VII: Privacy by design with cascade delete
   */
  async deleteMeal(mealId: string, userId: string): Promise<void> {
    Logger.info('Deleting meal analysis', { mealAnalysisId: mealId, userId });

    await prisma.mealAnalysis.deleteMany({
      where: { id: mealId, userId }, // Ensure user owns the record
    });

    Logger.info('Meal analysis deleted', { mealAnalysisId: mealId });
  }

  /**
   * Generate deterministic hash for blob caching
   */
  private generateBlobHash(blobName: string): string {
    return crypto.createHash('sha256').update(blobName).digest('hex');
  }
}

export const mealService = new MealService();
export { prisma };
