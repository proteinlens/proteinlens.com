// Admin Suspend/Reactivate endpoints
// Feature: 012-admin-dashboard, User Story 7
// T061, T062: POST /admin/users/{userId}/suspend and /reactivate endpoints

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { suspendUser, reactivateUser } from '../services/adminService.js';
import { SuspendUserRequestSchema } from '../models/adminSchemas.js';

export async function adminSuspendUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = request.params.userId;
  context.log(`Admin suspend user endpoint called for user: ${userId}`);

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
    const parseResult = SuspendUserRequestSchema.safeParse(body);
    
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
    const result = await suspendUser(userId, parseResult.data, adminContext);

    if ('error' in result) {
      return {
        status: result.code,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: result.code === 404 ? 'Not Found' : 'Bad Request',
          message: result.error,
        },
      };
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error suspending user:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to suspend user',
      },
    };
  }
}

export async function adminReactivateUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = request.params.userId;
  context.log(`Admin reactivate user endpoint called for user: ${userId}`);

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
    const adminContext = getAdminContext(request);
    const result = await reactivateUser(userId, adminContext);

    if ('error' in result) {
      return {
        status: result.code,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: result.code === 404 ? 'Not Found' : 'Bad Request',
          message: result.error,
        },
      };
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error reactivating user:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to reactivate user',
      },
    };
  }
}

app.http('admin-suspend-user', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/users/{userId}/suspend',
  handler: adminSuspendUser,
});

app.http('admin-reactivate-user', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/users/{userId}/reactivate',
  handler: adminReactivateUser,
});
