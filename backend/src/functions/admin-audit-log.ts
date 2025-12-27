// Admin Audit Log endpoint
// Feature: 012-admin-dashboard, User Story 8
// T070: GET /admin/audit-log endpoint

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { getAuditLog, logExportAction } from '../services/adminService.js';
import { AuditLogQuerySchema } from '../models/adminSchemas.js';
import { z } from 'zod';

export async function adminAuditLog(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin audit log endpoint called');

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawQuery = {
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '50',
      adminEmail: url.searchParams.get('adminEmail') || undefined,
      action: url.searchParams.get('action') || undefined,
      targetUserId: url.searchParams.get('targetUserId') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    };

    const parseResult = AuditLogQuerySchema.safeParse(rawQuery);
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

    // Get audit log
    const result = await getAuditLog(query, adminContext);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error fetching audit log:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to fetch audit log',
      },
    };
  }
}

// T054: Log export action endpoint
export async function adminLogExport(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin log export endpoint called');

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json() as { exportedCount?: number };
    const exportedCount = z.number().min(0).parse(body.exportedCount ?? 0);
    
    const adminContext = getAdminContext(request);
    const auditLogId = await logExportAction(adminContext, exportedCount);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        success: true,
        auditLogId,
      },
    };
  } catch (error) {
    context.error('Error logging export:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to log export',
      },
    };
  }
}

app.http('admin-audit-log', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/audit-log',
  handler: adminAuditLog,
});

app.http('admin-log-export', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/log-export',
  handler: adminLogExport,
});
