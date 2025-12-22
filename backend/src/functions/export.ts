// Azure Function: GET /api/meals/export
// Export meal history data for Pro users
// Feature: 002-saas-billing, User Story 4
// T059: Export endpoint (Pro-only)

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { extractUserId, requirePro } from '../middleware/quotaMiddleware.js';

export async function exportMeals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('Meal export requested', { requestId });

  try {
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

    // T061: Check Pro subscription requirement
    const proBlock = await requirePro(userId);
    if (proBlock) {
      Logger.info('Export blocked - Pro required', { requestId, userId });
      return {
        ...proBlock,
        headers: {
          ...proBlock.headers,
          'X-Request-ID': requestId,
        },
      };
    }

    // Get format from query param (json or csv)
    const format = request.query.get('format') || 'json';

    // Export meal data
    const exportData = await mealService.exportUserMealAnalyses(userId);

    Logger.info('Meal export completed', {
      requestId,
      userId,
      mealCount: exportData.meals.length,
      format,
    });

    if (format === 'csv') {
      // Generate CSV
      const csvLines: string[] = [];
      
      // Header
      csvLines.push('Date,Meal ID,Total Protein (g),Confidence,Food Name,Portion,Protein (g)');
      
      // Data rows - one row per food item
      for (const meal of exportData.meals) {
        const dateStr = meal.createdAt.toISOString().split('T')[0];
        
        if (meal.foods.length === 0) {
          csvLines.push(`${dateStr},${meal.id},${meal.totalProtein},${meal.confidence},,,`);
        } else {
          for (const food of meal.foods) {
            csvLines.push(
              `${dateStr},${meal.id},${meal.totalProtein},${meal.confidence},"${food.name}","${food.portion}",${food.protein}`
            );
          }
        }
      }

      // Add summary section
      csvLines.push('');
      csvLines.push('Summary');
      csvLines.push(`Total Meals,${exportData.summary.totalMeals}`);
      csvLines.push(`Total Protein (g),${exportData.summary.totalProtein.toFixed(1)}`);
      csvLines.push(`Avg Protein/Meal (g),${exportData.summary.averageProteinPerMeal.toFixed(1)}`);
      
      if (exportData.summary.dateRange.start && exportData.summary.dateRange.end) {
        csvLines.push(`Date Range,${exportData.summary.dateRange.start.toISOString().split('T')[0]} to ${exportData.summary.dateRange.end.toISOString().split('T')[0]}`);
      }

      const csvContent = csvLines.join('\n');

      return {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="proteinlens-export-${new Date().toISOString().split('T')[0]}.csv"`,
          'X-Request-ID': requestId,
        },
        body: csvContent,
      };
    }

    // Default: JSON format
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="proteinlens-export-${new Date().toISOString().split('T')[0]}.json"`,
        'X-Request-ID': requestId,
      },
      jsonBody: {
        exportedAt: new Date().toISOString(),
        ...exportData,
      },
    };

  } catch (error) {
    Logger.error('Export failed', error as Error, { requestId });
    
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'Export failed',
        message: 'An unexpected error occurred during export',
      },
    };
  }
}

// Register HTTP trigger
app.http('exportMeals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'meals/export',
  handler: exportMeals,
});
