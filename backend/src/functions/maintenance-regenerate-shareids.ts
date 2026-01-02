/**
 * Azure Function: POST /api/admin/maintenance/regenerate-shareids
 * 
 * Maintenance endpoint to regenerate missing shareIds for meals created before Feature 017
 * This is a one-time operation to fix existing data.
 * 
 * Requires: Admin authentication
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { verifyAccessToken } from '../utils/jwt.js';

export async function regenerateShareIds(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = uuidv4();

  Logger.info('Maintenance: Regenerate missing shareIds request', { requestId });

  try {
    // Verify admin auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      Logger.warn('Unauthorized shareId regeneration attempt', { requestId });
      return {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'unauthorized',
          message: 'Authorization header required',
        },
      };
    }

    let payload;
    try {
      payload = await verifyAccessToken(authHeader);
    } catch (err) {
      Logger.warn('Invalid or expired token for shareId regeneration', { requestId });
      return {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'unauthorized',
          message: 'Invalid or expired token',
        },
      };
    }

    // Check if user is admin (you may need to adjust this based on your auth structure)
    // For now, we'll require a specific role or userId
    if (!payload.admin && !payload.role || payload.role !== 'admin') {
      Logger.warn('Non-admin user attempted shareId regeneration', { 
        requestId,
        userId: payload.sub 
      });
      return {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        jsonBody: {
          error: 'forbidden',
          message: 'Admin role required',
        },
      };
    }

    // Run the regeneration
    const result = await mealService.regenerateMissingShareIds();

    Logger.info('ShareId regeneration completed', {
      requestId,
      fixed: result.fixed,
      failed: result.failed,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        success: true,
        message: 'ShareId regeneration completed',
        fixed: result.fixed,
        failed: result.failed,
        requestId,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('ShareId regeneration failed', error instanceof Error ? error : new Error(errorMessage), {
      requestId,
    });

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to regenerate shareIds',
        requestId,
      },
    };
  }
}

// Register Azure Function
app.http('regenerateShareIds', {
  methods: ['POST'],
  authLevel: 'anonymous', // Auth check is in the handler
  route: 'admin/maintenance/regenerate-shareids',
  handler: regenerateShareIds,
});
