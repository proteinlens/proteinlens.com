// Meal Service for database operations via Prisma
// Constitution Principle IV: Traceability & Auditability
// T033: Prisma integration for meal analysis persistence
// Feature 017: Shareable meal URLs with shareId generation

import { getPrismaClient } from '../utils/prisma.js';
import type { MealAnalysis } from '../utils/prisma.js';
import { Logger } from '../utils/logger.js';
import { AIAnalysisResponse } from '../models/schemas.js';
import { config } from '../utils/config.js';
import crypto from 'crypto';
import { generateShareId, getShareUrl } from '../utils/nanoid.js';

const prisma = getPrismaClient();

class MealService {
  /**
   * T033: Create meal analysis record with normalized foods
   * Constitution Principle IV: Stores requestId for traceability
   * T077: Updated to accept blobHash parameter for caching
   * Feature 017: Generates shareId for shareable URLs and captures diet style snapshot
   */
  async createMealAnalysis(
    userId: string,
    blobName: string,
    blobUrl: string,
    requestId: string,
    aiResponse: AIAnalysisResponse,
    modelName: string,
    blobHash?: string,
    dietStyleAtScanId?: string | null
  ): Promise<{ id: string; shareId: string; shareUrl: string }> {
    Logger.info('Creating meal analysis', { userId, blobName, requestId, foodCount: aiResponse.foods.length });

    // Use provided hash or generate one
    const hash = blobHash || this.generateBlobHash(blobName);
    
    // Generate unique shareId for this meal
    const shareId = generateShareId();
    const shareUrl = getShareUrl(shareId);

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
        notes: aiResponse.notes, // Pro Tips from AI response
        shareId, // Feature 017: Shareable URL ID
        isPublic: true, // Default to public (Constitution Principle VII: user controls privacy)
        dietStyleAtScanId: dietStyleAtScanId ?? null, // Feature 017: Diet style snapshot
        foods: {
          create: aiResponse.foods.map((food, index) => ({
            name: food.name,
            portion: food.portion,
            protein: food.protein,
            carbs: food.carbs,      // NEW - macro ingredients analysis
            fat: food.fat,          // NEW - macro ingredients analysis
            displayOrder: index,
          })),
        },
      },
      include: {
        foods: true,
      },
    });

    // Verify meal was created with correct fields
    if (!mealAnalysis.shareId) {
      Logger.error('CRITICAL: Meal created without shareId', new Error('Meal created without shareId'), {
        requestId,
        mealAnalysisId: mealAnalysis.id,
        expectedShareId: shareId,
        actualShareId: mealAnalysis.shareId,
      });
    }
    
    if (!mealAnalysis.isPublic) {
      Logger.error('CRITICAL: Meal created with isPublic=false', new Error('Meal created with isPublic=false'), {
        requestId,
        mealAnalysisId: mealAnalysis.id,
        isPublic: mealAnalysis.isPublic,
      });
    }

    Logger.info('Meal analysis created successfully', {
      requestId,
      mealAnalysisId: mealAnalysis.id,
      shareId: mealAnalysis.shareId,
      isPublic: mealAnalysis.isPublic,
      foodCount: aiResponse.foods.length,
    });

    return { 
      id: mealAnalysis.id, 
      shareId: mealAnalysis.shareId || shareId, // Use database value if available, fallback to local
      shareUrl: mealAnalysis.shareId ? getShareUrl(mealAnalysis.shareId) : shareUrl 
    };
  }

  /**
   * T077: Create meal analysis from cached result
   * Creates a new record for the user but references cached AI response
   * Feature 017: Generates new shareId for shareable URLs
   */
  async createMealAnalysisFromCache(
    userId: string,
    blobName: string,
    blobUrl: string,
    requestId: string,
    blobHash: string,
    cachedMealId: string,
    dietStyleAtScanId?: string | null
  ): Promise<{ id: string; shareId: string; shareUrl: string }> {
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

    // Generate unique shareId for this meal (each meal gets its own share URL)
    const shareId = generateShareId();
    const shareUrl = getShareUrl(shareId);

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
        notes: cachedAnalysis.notes ?? `Cached from meal ${cachedMealId}`, // Preserve Pro Tips from cache
        shareId, // Feature 017: Shareable URL ID
        isPublic: true, // Default to public
        dietStyleAtScanId: dietStyleAtScanId ?? null, // Feature 017: Diet style snapshot
        foods: {
          create: cachedAnalysis.foods.map((food, index) => ({
            name: food.name,
            portion: food.portion,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            displayOrder: index,
          })),
        },
      },
      include: {
        foods: true,
      },
    });

    // Verify meal was created with correct fields
    if (!mealAnalysis.shareId) {
      Logger.error('CRITICAL: Cached meal created without shareId', new Error('Cached meal created without shareId'), {
        requestId,
        mealAnalysisId: mealAnalysis.id,
        expectedShareId: shareId,
        actualShareId: mealAnalysis.shareId,
      });
    }
    
    if (!mealAnalysis.isPublic) {
      Logger.error('CRITICAL: Cached meal created with isPublic=false', new Error('Cached meal created with isPublic=false'), {
        requestId,
        mealAnalysisId: mealAnalysis.id,
        isPublic: mealAnalysis.isPublic,
      });
    }

    Logger.info('Meal analysis created from cache', {
      requestId,
      mealAnalysisId: mealAnalysis.id,
      shareId: mealAnalysis.shareId,
      isPublic: mealAnalysis.isPublic,
      cachedFromId: cachedMealId,
    });

    return { 
      id: mealAnalysis.id, 
      shareId: mealAnalysis.shareId || shareId, // Use database value if available, fallback to local
      shareUrl: mealAnalysis.shareId ? getShareUrl(mealAnalysis.shareId) : shareUrl 
    };
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
      include: { 
        foods: true,
        // Feature 017: Include diet style snapshot
        dietStyleAtScan: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
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

  // ===========================================
  // Feature 017: Shareable Meal URL Methods
  // ===========================================

  /**
   * Get public meal by shareId for shared view
   * Returns null if meal doesn't exist or is private
   */
  async getPublicMealByShareId(shareId: string): Promise<MealAnalysis | null> {
    Logger.info('Querying public meal by shareId', { shareId });
    
    // First, check if the meal exists at all (regardless of isPublic status)
    const allMeals = await prisma.mealAnalysis.findFirst({
      where: { shareId },
      select: { id: true, isPublic: true, userId: true, createdAt: true }
    });

    if (allMeals) {
      Logger.info('Meal found with shareId', {
        shareId,
        mealId: allMeals.id,
        isPublic: allMeals.isPublic,
        createdAt: allMeals.createdAt.toISOString(),
      });
      
      if (!allMeals.isPublic) {
        Logger.info('Meal is private and cannot be shared', { shareId, mealId: allMeals.id });
      }
    } else {
      Logger.warn('No meal found with shareId', { shareId });
    }
    
    const meal = await prisma.mealAnalysis.findFirst({
      where: { 
        shareId, 
        isPublic: true 
      },
      include: { 
        foods: true,
        dietStyleAtScan: {
          select: {
            id: true,
            slug: true,
            name: true,
            netCarbCapG: true,
            fatTargetPercent: true,
          },
        },
      },
    });
    
    if (meal && !meal.shareId) {
      // CRITICAL: Meal exists but shareId is NULL
      // This shouldn't happen but if it does, generate one now
      Logger.error('CRITICAL: Public meal found but has NULL shareId', new Error('Meal has NULL shareId'), {
        mealId: meal.id,
      });
      
      // Generate a shareId for this meal to prevent future lookups from failing
      const newShareId = generateShareId();
      try {
        await prisma.mealAnalysis.update({
          where: { id: meal.id },
          data: { shareId: newShareId }
        });
        
        Logger.info('Assigned shareId to meal that was missing one', {
          mealId: meal.id,
          assignedShareId: newShareId,
        });
        
        // Update the meal object to reflect the new shareId
        meal.shareId = newShareId;
      } catch (error) {
        Logger.error('Failed to assign shareId to meal', error instanceof Error ? error : new Error(String(error)), { mealId: meal.id });
      }
    }
    
    Logger.info('Public meal query result', { 
      shareId, 
      found: !!meal,
      mealId: meal?.id,
      isPublic: meal?.isPublic,
    });
    
    return meal;
  }

  /**
   * Get meal by shareId (for owner, ignores privacy)
   */
  async getMealByShareId(shareId: string, userId: string): Promise<MealAnalysis | null> {
    return prisma.mealAnalysis.findFirst({
      where: { shareId, userId },
      include: { 
        foods: true,
        dietStyleAtScan: {
          select: {
            id: true,
            slug: true,
            name: true,
            netCarbCapG: true,
            fatTargetPercent: true,
          },
        },
      },
    });
  }

  /**
   * Update meal privacy toggle
   * Returns updated meal with shareUrl if public, null shareUrl if private
   */
  async updateMealPrivacy(
    mealId: string, 
    userId: string, 
    isPublic: boolean
  ): Promise<{ shareId: string; shareUrl: string | null; isPublic: boolean } | null> {
    // Verify ownership
    const meal = await prisma.mealAnalysis.findFirst({
      where: { id: mealId, userId },
      select: { id: true, shareId: true },
    });

    if (!meal) {
      return null;
    }

    await prisma.mealAnalysis.update({
      where: { id: mealId },
      data: { isPublic },
    });

    Logger.info('Meal privacy updated', { mealId, userId, isPublic });

    return {
      shareId: meal.shareId || '',  // shareId should always exist, fallback to empty string
      shareUrl: isPublic && meal.shareId ? getShareUrl(meal.shareId) : null,
      isPublic,
    };
  }

  /**
   * Get user meals with shareable fields included
   * Extended for Feature 017
   */
  async getUserMealAnalysesWithSharing(
    userId: string,
    options: { limit?: number; daysBack?: number } = {}
  ): Promise<(MealAnalysis & { shareUrl: string | null })[]> {
    const meals = await this.getUserMealAnalyses(userId, options);
    
    return meals.map(meal => ({
      ...meal,
      shareUrl: (meal as any).isPublic ? getShareUrl((meal as any).shareId) : null,
    }));
  }

  /**
   * T047: Calculate daily macro totals from all meals
   * Feature 017, US5: Macro split display for diet users
   * Uses heuristic estimation for carbs and fat based on food names
   */
  async getDailySummary(
    userId: string,
    date: Date = new Date()
  ): Promise<{
    date: string;
    meals: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
    percentages: {
      protein: number;
      carbs: number;
      fat: number;
    };
    totalCalories: number;
    carbWarning: boolean;
    carbLimit: number | null;
  }> {
    // Get start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get user with diet style for carb limit
    const user = await prisma.user.findUnique({
      where: { externalId: userId },
      include: { dietStyle: true },
    });

    const carbLimit = user?.dietStyle?.netCarbCapG ?? null;

    // Get all meals for this day
    const meals = await prisma.mealAnalysis.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        foods: true,
      },
    });

    // Calculate totals
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const meal of meals) {
      totalProtein += Number(meal.totalProtein) || 0;
      
      // Sum up actual carbs and fat from food items (if available)
      for (const food of meal.foods) {
        const carbsValue = food.carbs ? (typeof food.carbs === 'object' && 'toNumber' in food.carbs ? food.carbs.toNumber() : Number(food.carbs)) : 0;
        const fatValue = food.fat ? (typeof food.fat === 'object' && 'toNumber' in food.fat ? food.fat.toNumber() : Number(food.fat)) : 0;
        totalCarbs += carbsValue;
        totalFat += fatValue;
      }
    }

    // Calculate calories (protein: 4cal/g, carbs: 4cal/g, fat: 9cal/g)
    const totalCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9);

    // Calculate percentages
    const percentages = totalCalories > 0 ? {
      protein: Math.round((totalProtein * 4 / totalCalories) * 100),
      carbs: Math.round((totalCarbs * 4 / totalCalories) * 100),
      fat: Math.round((totalFat * 9 / totalCalories) * 100),
    } : {
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    return {
      date: date.toISOString().split('T')[0],
      meals: meals.length,
      macros: {
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
      },
      percentages,
      totalCalories: Math.round(totalCalories),
      carbWarning: carbLimit !== null && totalCarbs > carbLimit,
      carbLimit,
    };
  }

  /**
   * Estimate carbs from food name (heuristic)
   * Part of T047 for macro split calculation
   */
  private estimateCarbsFromFood(name: string, portion: string): number {
    const lowName = name.toLowerCase();
    
    // High-carb foods
    if (lowName.includes('rice')) return 30;
    if (lowName.includes('bread')) return 20;
    if (lowName.includes('pasta') || lowName.includes('noodle')) return 35;
    if (lowName.includes('potato')) return 25;
    if (lowName.includes('beans') || lowName.includes('legume')) return 20;
    if (lowName.includes('corn')) return 20;
    if (lowName.includes('cereal') || lowName.includes('oat')) return 25;
    if (lowName.includes('fruit') || lowName.includes('apple') || lowName.includes('banana')) return 15;
    if (lowName.includes('sugar') || lowName.includes('honey')) return 25;
    if (lowName.includes('juice') || lowName.includes('soda')) return 30;
    
    // Medium-carb foods
    if (lowName.includes('milk') || lowName.includes('yogurt')) return 8;
    if (lowName.includes('vegetable') || lowName.includes('salad')) return 5;
    
    // Low-carb foods (proteins, fats)
    if (lowName.includes('chicken') || lowName.includes('beef') || lowName.includes('pork')) return 0;
    if (lowName.includes('fish') || lowName.includes('salmon') || lowName.includes('tuna')) return 0;
    if (lowName.includes('egg')) return 1;
    if (lowName.includes('cheese')) return 1;
    if (lowName.includes('oil') || lowName.includes('butter')) return 0;
    
    // Default: assume some carbs in unknown foods
    return 10;
  }

  /**
   * Estimate fat from food name (heuristic)
   * Part of T047 for macro split calculation
   */
  private estimateFatFromFood(name: string, portion: string): number {
    const lowName = name.toLowerCase();
    
    // High-fat foods
    if (lowName.includes('oil') || lowName.includes('butter')) return 15;
    if (lowName.includes('cheese')) return 10;
    if (lowName.includes('avocado')) return 15;
    if (lowName.includes('nuts') || lowName.includes('almond') || lowName.includes('walnut')) return 15;
    if (lowName.includes('bacon') || lowName.includes('sausage')) return 12;
    if (lowName.includes('mayo') || lowName.includes('mayonnaise')) return 10;
    
    // Medium-fat foods
    if (lowName.includes('salmon') || lowName.includes('fish')) return 8;
    if (lowName.includes('beef') || lowName.includes('steak')) return 10;
    if (lowName.includes('pork')) return 8;
    if (lowName.includes('egg')) return 5;
    if (lowName.includes('milk') || lowName.includes('yogurt')) return 3;
    
    // Low-fat foods
    if (lowName.includes('chicken') && lowName.includes('breast')) return 3;
    if (lowName.includes('chicken')) return 6;
    if (lowName.includes('turkey')) return 4;
    if (lowName.includes('rice') || lowName.includes('pasta') || lowName.includes('bread')) return 1;
    if (lowName.includes('vegetable') || lowName.includes('salad')) return 1;
    if (lowName.includes('fruit')) return 0;
    
    // Default
    return 5;
  }

  /**
   * Regenerate missing shareIds for meals created before Feature 017
   * This is a maintenance function to fix meals that don't have shareIds
   */
  async regenerateMissingShareIds(): Promise<{ fixed: number; failed: number }> {
    Logger.info('Starting shareId regeneration for meals without shareIds');
    
    const mealsWithoutShareId = await prisma.mealAnalysis.findMany({
      where: {
        shareId: null
      },
      select: {
        id: true,
        userId: true,
        createdAt: true
      },
      take: 100, // Process in batches to avoid overwhelming the database
    });

    let fixed = 0;
    let failed = 0;

    for (const meal of mealsWithoutShareId) {
      try {
        const shareId = generateShareId();
        
        // Check if this shareId is already in use (extremely unlikely but possible)
        const existing = await prisma.mealAnalysis.findFirst({
          where: { shareId }
        });
        
        if (existing) {
          Logger.warn('Generated shareId already exists, retrying', { mealId: meal.id, shareId });
          failed++;
          continue;
        }

        await prisma.mealAnalysis.update({
          where: { id: meal.id },
          data: {
            shareId,
            isPublic: true, // Ensure public flag is set
          }
        });

        Logger.info('Regenerated shareId for meal', {
          mealId: meal.id,
          userId: meal.userId,
          newShareId: shareId,
        });

        fixed++;
      } catch (error) {
        Logger.error('Failed to regenerate shareId for meal', error as Error, {
          mealId: meal.id,
        });
        failed++;
      }
    }

    Logger.info('ShareId regeneration complete', { fixed, failed, totalProcessed: mealsWithoutShareId.length });
    
    return { fixed, failed };
  }
}

export const mealService = new MealService();
export { prisma };
