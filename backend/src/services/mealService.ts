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
   */
  async createMealAnalysis(
    userId: string,
    blobName: string,
    blobUrl: string,
    requestId: string,
    aiResponse: AIAnalysisResponse,
    modelName: string
  ): Promise<string> {
    Logger.info('Creating meal analysis', { userId, blobName, requestId, foodCount: aiResponse.foods.length });

    // Generate hash for caching
    const blobHash = this.generateBlobHash(blobName);

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
        blobHash,
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
   */
  async getUserMealAnalyses(userId: string, limit = 50): Promise<MealAnalysis[]> {
    return prisma.mealAnalysis.findMany({
      where: { userId },
      include: { foods: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
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
