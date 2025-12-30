// Admin Meals endpoint - list all analyzed meals with full details
// Feature: 012-admin-dashboard
// View all analyzed meal images with nutrition data

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { listAllMeals, getMealDetail } from '../services/adminMealsService.js';
import { z } from 'zod';

// Query validation schema
const ListMealsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().optional(),
  search: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  sortBy: z.enum(['createdAt', 'totalProtein', 'confidence']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function adminMeals(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin meals endpoint called');

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawQuery = {
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '20',
      userId: url.searchParams.get('userId') || undefined,
      search: url.searchParams.get('search') || undefined,
      confidence: url.searchParams.get('confidence') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    };

    const parseResult = ListMealsQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: parseResult.error.errors,
        },
      };
    }

    const query = parseResult.data;
    const adminContext = getAdminContext(request);

    // Get meals list
    const result = await listAllMeals(query, adminContext);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error listing meals:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to list meals',
      },
    };
  }
}

export async function adminMealDetail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin meal detail endpoint called');

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const mealId = request.params.mealId;
    if (!mealId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Meal ID is required',
        },
      };
    }

    const adminContext = getAdminContext(request);
    const meal = await getMealDetail(mealId, adminContext);

    if (!meal) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Not Found',
          message: 'Meal not found',
        },
      };
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: meal,
    };
  } catch (error) {
    context.error('Error fetching meal detail:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to fetch meal detail',
      },
    };
  }
}

app.http('admin-meals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/meals',
  handler: adminMeals,
});

app.http('admin-meal-detail', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/meals/{mealId}',
  handler: adminMealDetail,
});
