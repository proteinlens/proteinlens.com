// Admin Metrics endpoint - platform analytics
// Feature: 012-admin-dashboard, User Story 3
// T037: GET /admin/metrics endpoint

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { getMetrics } from '../services/adminService.js';

export async function adminMetrics(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin metrics endpoint called');

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const adminContext = getAdminContext(request);
    const metrics = await getMetrics(adminContext);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: metrics,
    };
  } catch (error) {
    context.error('Error fetching metrics:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to fetch metrics',
      },
    };
  }
}

app.http('admin-metrics', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/metrics',
  handler: adminMetrics,
});
