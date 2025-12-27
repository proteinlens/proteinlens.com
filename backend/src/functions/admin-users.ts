// Admin Users endpoint - list users with pagination and filtering
// Feature: 012-admin-dashboard, User Story 1 & 4
// T019: GET /admin/users endpoint

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { listUsers } from '../services/adminService.js';
import { ListUsersQuerySchema } from '../models/adminSchemas.js';

export async function adminUsers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin users endpoint called');

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawQuery = {
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '50',
      search: url.searchParams.get('search') || undefined,
      plan: url.searchParams.get('plan') || undefined,
      status: url.searchParams.get('status') || undefined,
      suspended: url.searchParams.get('suspended') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
    };

    const parseResult = ListUsersQuerySchema.safeParse(rawQuery);
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

    // Get users list
    const result = await listUsers(query, adminContext);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error listing users:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to list users',
      },
    };
  }
}

app.http('admin-users', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/users',
  handler: adminUsers,
});
