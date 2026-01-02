// Azure Function: GET /api/meals/export
// Export user's meal data with macro information
// Feature: 001-macro-ingredients-analysis, User Story 3
// Task: T032-T033 - Export meal data with macros

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { extractUserId } from '../middleware/quotaMiddleware.js';

interface Food {
  name: string;
  portion: string;
  protein: number | { toNumber: () => number };
  carbs?: number | null | { toNumber: () => number };
  fat?: number | null | { toNumber: () => number };
}

interface MealWithFoods {
  id: string;
  createdAt: Date;
  totalProtein: { toNumber: () => number } | number;
  confidence: string;
  notes: string | null;
  foods: Food[];
}

interface ExportFood {
  name: string;
  portion: string;
  protein: number;
  carbs: number | null;
  fat: number | null;
}

interface ExportMeal {
  id: string;
  date: string;
  timestamp: string;
  totalProtein: number;
  totalCarbs?: number;
  totalFat?: number;
  totalCalories?: number;
  confidence: string;
  foods: ExportFood[];
  notes?: string;
}

interface ExportData {
  userId: string;
  exportDate: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalMeals: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    averageProteinPerMeal: number;
    averageCarbsPerMeal: number;
    averageFatPerMeal: number;
  };
  meals: ExportMeal[];
}

export async function exportMeals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('GET /api/meals/export - Exporting user meals', { requestId });

  try {
    // Extract user ID from header or query param
    const userId = extractUserId(request) || request.query.get('userId');

    if (!userId) {
      Logger.warn('GET /api/meals/export - No userId provided', { requestId });
      return {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'Unauthorized',
          message: 'User authentication required. Provide x-user-id header or userId query parameter.',
        },
      };
    }

    // Parse optional date range parameters
    const startDateParam = request.query.get('startDate'); // Format: YYYY-MM-DD
    const endDateParam = request.query.get('endDate');     // Format: YYYY-MM-DD

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam + 'T00:00:00Z');
      if (isNaN(startDate.getTime())) {
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
          jsonBody: {
            error: 'Bad Request',
            message: 'Invalid startDate format. Use YYYY-MM-DD (e.g., "2026-01-01")',
          },
        };
      }
    }

    if (endDateParam) {
      endDate = new Date(endDateParam + 'T23:59:59Z');
      if (isNaN(endDate.getTime())) {
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
          jsonBody: {
            error: 'Bad Request',
            message: 'Invalid endDate format. Use YYYY-MM-DD (e.g., "2026-01-31")',
          },
        };
      }
    }

    Logger.info('Exporting meals for user', {
      requestId,
      userId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });

    // Get all meals for user (optionally filtered by date range)
    const meals = await mealService.getUserMealAnalyses(userId, { limit: 500 }) as unknown as MealWithFoods[];

    // Filter by date range if provided
    let filteredMeals = meals;
    if (startDate || endDate) {
      filteredMeals = meals.filter(meal => {
        if (startDate && meal.createdAt < startDate) return false;
        if (endDate && meal.createdAt > endDate) return false;
        return true;
      });
    }

    // Transform meals to export format
    const exportMeals: ExportMeal[] = filteredMeals.map(meal => {
      const proteinValue = typeof meal.totalProtein === 'number' ? meal.totalProtein : meal.totalProtein.toNumber();
      const totalCarbs = meal.foods.reduce((sum: number, f: Food) => {
        const carbs = typeof f.carbs === 'object' && f.carbs !== null ? f.carbs.toNumber() : (f.carbs || 0);
        return sum + carbs;
      }, 0);
      const totalFat = meal.foods.reduce((sum: number, f: Food) => {
        const fat = typeof f.fat === 'object' && f.fat !== null ? f.fat.toNumber() : (f.fat || 0);
        return sum + fat;
      }, 0);
      const totalCalories = (proteinValue * 4) + (totalCarbs * 4) + (totalFat * 9);

      return {
        id: meal.id,
        date: meal.createdAt.toISOString().split('T')[0],
        timestamp: meal.createdAt.toISOString(),
        totalProtein: proteinValue,
        totalCarbs: totalCarbs || undefined,
        totalFat: totalFat || undefined,
        totalCalories,
        confidence: meal.confidence,
        foods: meal.foods.map((f: Food) => {
          const protein = typeof f.protein === 'number' ? f.protein : f.protein.toNumber();
          const carbs = f.carbs ? (typeof f.carbs === 'object' ? f.carbs.toNumber() : f.carbs) : null;
          const fat = f.fat ? (typeof f.fat === 'object' ? f.fat.toNumber() : f.fat) : null;
          return {
            name: f.name,
            portion: f.portion,
            protein,
            carbs,
            fat,
          };
        }),
        notes: meal.notes ?? undefined,
      };
    });

    // Calculate summary statistics
    const totalProtein = exportMeals.reduce((sum, m) => sum + m.totalProtein, 0);
    const totalCarbs = exportMeals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0);
    const totalFat = exportMeals.reduce((sum, m) => sum + (m.totalFat || 0), 0);

    const exportData: ExportData = {
      userId,
      exportDate: new Date().toISOString(),
      dateRange: {
        start: startDate?.toISOString().split('T')[0] || 'all-time',
        end: endDate?.toISOString().split('T')[0] || 'all-time',
      },
      summary: {
        totalMeals: exportMeals.length,
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat),
        averageProteinPerMeal: exportMeals.length > 0 ? Math.round((totalProtein / exportMeals.length) * 10) / 10 : 0,
        averageCarbsPerMeal: exportMeals.length > 0 ? Math.round((totalCarbs / exportMeals.length) * 10) / 10 : 0,
        averageFatPerMeal: exportMeals.length > 0 ? Math.round((totalFat / exportMeals.length) * 10) / 10 : 0,
      },
      meals: exportMeals,
    };

    Logger.info('Meals exported successfully', {
      requestId,
      userId,
      mealCount: exportMeals.length,
      totalProtein: exportData.summary.totalProtein,
      totalCarbs: exportData.summary.totalCarbs,
      totalFat: exportData.summary.totalFat,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="meals-${new Date().toISOString().split('T')[0]}.json"`,
        'X-Request-ID': requestId,
      },
      jsonBody: exportData,
    };
  } catch (error) {
    Logger.error('Failed to export meals', error as Error, { requestId });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to export meals',
        requestId,
      },
    };
  }
}

// Register function with HTTP trigger
app.http('exportMeals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: exportMeals,
  route: 'meals/export',
});
