// Admin Plan Override endpoint - change user subscription plan
// Feature: 012-admin-dashboard, User Story 6
// T055: PUT /admin/users/{userId}/plan endpoint

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { overrideUserPlan } from '../services/adminService.js';
import { PlanOverrideRequestSchema } from '../models/adminSchemas.js';

export async function adminPlanOverride(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = request.params.userId;
  context.log(`Admin plan override endpoint called for user: ${userId}`);

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  if (!userId) {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Bad Request',
        message: 'User ID is required',
      },
    };
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const parseResult = PlanOverrideRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Invalid request body',
          details: parseResult.error.errors,
        },
      };
    }

    const adminContext = getAdminContext(request);
    const result = await overrideUserPlan(userId, parseResult.data, adminContext);

    if (!result) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Not Found',
          message: 'User not found',
        },
      };
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error overriding plan:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to override plan',
      },
    };
  }
}

app.http('admin-plan-override', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'admin/users/{userId}/plan',
  handler: adminPlanOverride,
});
