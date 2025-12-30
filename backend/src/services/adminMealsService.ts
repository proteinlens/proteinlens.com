// Admin Meals Service - business logic for viewing all analyzed meals
// Feature: 012-admin-dashboard
// View and analyze all meal images across all users

import { getPrismaClient } from '../utils/prisma.js';
import { AdminContext, logAdminAction } from '../middleware/adminMiddleware.js';
import { Prisma } from '@prisma/client';
import { blobService } from './blobService.js';
import { Logger } from '../utils/logger.js';

const prisma = getPrismaClient();

// ===========================================
// Types
// ===========================================

export interface ListMealsQuery {
  page: number;
  limit: number;
  userId?: string;
  search?: string;
  confidence?: 'high' | 'medium' | 'low';
  sortBy: 'createdAt' | 'totalProtein' | 'confidence';
  sortOrder: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  protein: number;
  displayOrder: number;
}

export interface MealListItem {
  id: string;
  userId: string;
  userEmail: string | null;
  blobName: string;
  blobUrl: string;
  imageUrl: string; // SAS URL for viewing
  totalProtein: number;
  confidence: string;
  notes: string | null;
  aiModel: string;
  foodCount: number;
  foods: FoodItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MealsListResponse {
  meals: MealListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalMeals: number;
    totalProteinSum: number;
    averageProtein: number;
    confidenceBreakdown: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

export interface MealDetailResponse extends MealListItem {
  requestId: string;
  blobHash: string | null;
  aiResponseRaw: unknown;
  userCorrections: unknown;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    plan: string;
  } | null;
}

// ===========================================
// Meal Listing
// ===========================================

/**
 * List all meals with pagination, filtering, and images
 */
export async function listAllMeals(
  query: ListMealsQuery,
  adminContext: AdminContext
): Promise<MealsListResponse> {
  const { page, limit, userId, search, confidence, sortBy, sortOrder, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.MealAnalysisWhereInput = {};
  
  if (userId) {
    where.userId = userId;
  }
  
  if (search) {
    // Search in food names or notes
    where.OR = [
      { notes: { contains: search, mode: 'insensitive' } },
      { foods: { some: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }
  
  if (confidence) {
    where.confidence = confidence;
  }
  
  if (startDate) {
    where.createdAt = { ...where.createdAt as object, gte: new Date(startDate) };
  }
  
  if (endDate) {
    where.createdAt = { ...where.createdAt as object, lte: new Date(endDate) };
  }

  // Build orderBy
  const orderBy: Prisma.MealAnalysisOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  // Execute queries
  const [meals, total, summary] = await Promise.all([
    prisma.mealAnalysis.findMany({
      where,
      include: {
        foods: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.mealAnalysis.count({ where }),
    // Get summary statistics
    prisma.mealAnalysis.aggregate({
      _sum: { totalProtein: true },
      _avg: { totalProtein: true },
      _count: true,
    }),
  ]);

  // Get confidence breakdown
  const [highCount, mediumCount, lowCount] = await Promise.all([
    prisma.mealAnalysis.count({ where: { ...where, confidence: 'high' } }),
    prisma.mealAnalysis.count({ where: { ...where, confidence: 'medium' } }),
    prisma.mealAnalysis.count({ where: { ...where, confidence: 'low' } }),
  ]);

  // Get unique user IDs to fetch user info
  const userIds = [...new Set(meals.map(m => m.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  // Generate SAS URLs for images
  const mealsWithImages = await Promise.all(
    meals.map(async (meal) => {
      let imageUrl = meal.blobUrl;
      try {
        if (meal.blobName) {
          imageUrl = await blobService.generateReadSasUrl(meal.blobName, 60);
        }
      } catch (error) {
        Logger.warn('Failed to generate SAS URL for meal image', { 
          mealId: meal.id, 
          blobName: meal.blobName 
        });
      }

      const user = userMap.get(meal.userId);
      
      return {
        id: meal.id,
        userId: meal.userId,
        userEmail: user?.email || null,
        blobName: meal.blobName,
        blobUrl: meal.blobUrl,
        imageUrl,
        totalProtein: Number(meal.totalProtein),
        confidence: meal.confidence,
        notes: meal.notes,
        aiModel: meal.aiModel,
        foodCount: meal.foods.length,
        foods: meal.foods.map(f => ({
          id: f.id,
          name: f.name,
          portion: f.portion,
          protein: Number(f.protein),
          displayOrder: f.displayOrder,
        })),
        createdAt: meal.createdAt.toISOString(),
        updatedAt: meal.updatedAt.toISOString(),
      };
    })
  );

  // Log admin action
  await logAdminAction(adminContext, 'VIEW_USER_LIST', {
    details: { 
      action: 'VIEW_MEALS_LIST',
      page, 
      limit, 
      userId, 
      search, 
      confidence, 
      resultCount: meals.length 
    },
  });

  return {
    meals: mealsWithImages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      totalMeals: summary._count,
      totalProteinSum: Number(summary._sum.totalProtein) || 0,
      averageProtein: Number(summary._avg.totalProtein) || 0,
      confidenceBreakdown: {
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
    },
  };
}

/**
 * Get detailed view of a single meal
 */
export async function getMealDetail(
  mealId: string,
  adminContext: AdminContext
): Promise<MealDetailResponse | null> {
  const meal = await prisma.mealAnalysis.findUnique({
    where: { id: mealId },
    include: {
      foods: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!meal) return null;

  // Get user info
  const user = await prisma.user.findFirst({
    where: { id: meal.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      plan: true,
    },
  });

  // Generate SAS URL for image
  let imageUrl = meal.blobUrl;
  try {
    if (meal.blobName) {
      imageUrl = await blobService.generateReadSasUrl(meal.blobName, 60);
    }
  } catch (error) {
    Logger.warn('Failed to generate SAS URL for meal detail', { 
      mealId: meal.id, 
      blobName: meal.blobName 
    });
  }

  // Log admin action
  await logAdminAction(adminContext, 'VIEW_USER_DETAIL', {
    targetUserId: meal.userId,
    details: { action: 'VIEW_MEAL_DETAIL', mealId: meal.id },
  });

  return {
    id: meal.id,
    userId: meal.userId,
    userEmail: user?.email || null,
    blobName: meal.blobName,
    blobUrl: meal.blobUrl,
    imageUrl,
    totalProtein: Number(meal.totalProtein),
    confidence: meal.confidence,
    notes: meal.notes,
    aiModel: meal.aiModel,
    requestId: meal.requestId,
    blobHash: meal.blobHash,
    aiResponseRaw: meal.aiResponseRaw,
    userCorrections: meal.userCorrections,
    foodCount: meal.foods.length,
    foods: meal.foods.map(f => ({
      id: f.id,
      name: f.name,
      portion: f.portion,
      protein: Number(f.protein),
      displayOrder: f.displayOrder,
    })),
    createdAt: meal.createdAt.toISOString(),
    updatedAt: meal.updatedAt.toISOString(),
    user: user ? {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan,
    } : null,
  };
}
