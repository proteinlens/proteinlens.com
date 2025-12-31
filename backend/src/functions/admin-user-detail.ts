// Admin User Detail endpoint - get single user by ID
// Feature: 012-admin-dashboard
// T028: GET /admin/users/{userId} endpoint

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { getUserDetail } from '../services/adminService.js';

export async function adminUserDetail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = request.params.userId;
  context.log('Admin user detail endpoint called for userId:', userId);

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
    const user = await getUserDetail(userId, adminContext);

    if (!user) {
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
      jsonBody: user,
    };
  } catch (error) {
    context.error('Error getting user detail:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to get user details',
      },
    };
  }
}

app.http('admin-user-detail', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/users/{userId}',
  handler: adminUserDetail,
});
