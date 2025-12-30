/**
 * Protein Calculator API Endpoints (Feature 015)
 * 
 * Public: POST /api/protein/calculate, GET /api/protein/config
 * Authenticated: GET/POST/DELETE /api/protein/profile
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, isAuthFailure } from '../middleware/authGuard.js';
import { getPrismaClient } from '../utils/prisma.js';
import {
  CalculateProteinRequestSchema,
  SaveProteinProfileRequestSchema,
} from '../models/proteinTypes.js';
import {
  calculateProtein,
  getPublicConfig,
  getProfile,
  saveProfile,
  deleteProfile,
} from '../services/proteinCalculatorService.js';

// ===========================================
// POST /api/protein/calculate
// ===========================================

/**
 * Calculate protein targets (no auth required)
 * Does NOT persist results - use for preview/anonymous calculations
 */
async function calculateProteinHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('POST /api/protein/calculate - Calculating protein target');

  try {
    const body = await request.json();
    const parseResult = CalculateProteinRequestSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'validation_error',
          message: 'Invalid request data',
          details: { errors },
        },
      };
    }

    const prisma = getPrismaClient();
    const result = await calculateProtein(prisma, parseResult.data);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error calculating protein:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to calculate protein target',
      },
    };
  }
}

app.http('protein-calculate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'protein/calculate',
  handler: calculateProteinHandler,
});

// ===========================================
// GET /api/protein/config
// ===========================================

/**
 * Get public protein configuration (presets, meal splits)
 * No authentication required
 */
async function getProteinConfigHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('GET /api/protein/config - Fetching protein config');

  try {
    const prisma = getPrismaClient();
    const config = await getPublicConfig(prisma);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: config,
    };
  } catch (error) {
    context.error('Error fetching protein config:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to fetch protein configuration',
      },
    };
  }
}

app.http('protein-config', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'protein/config',
  handler: getProteinConfigHandler,
});

// ===========================================
// GET /api/protein/profile
// ===========================================

/**
 * Get authenticated user's protein profile and calculated target
 */
async function getProteinProfileHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  context.log(`GET /api/protein/profile - User: ${auth.ctx.user.id}`);

  try {
    const prisma = getPrismaClient();
    const profile = await getProfile(prisma, auth.ctx.user.id);

    if (!profile) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'not_found',
          message: 'No protein profile exists for this user',
        },
      };
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: profile,
    };
  } catch (error) {
    context.error('Error fetching protein profile:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to fetch protein profile',
      },
    };
  }
}

app.http('protein-profile-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'protein/profile',
  handler: getProteinProfileHandler,
});

// ===========================================
// POST /api/protein/profile
// ===========================================

/**
 * Save (create or update) protein profile
 * Automatically calculates and stores the protein target
 */
async function saveProteinProfileHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  context.log(`POST /api/protein/profile - User: ${auth.ctx.user.id}`);

  try {
    const body = await request.json();
    const parseResult = SaveProteinProfileRequestSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'validation_error',
          message: 'Invalid request data',
          details: { errors },
        },
      };
    }

    const prisma = getPrismaClient();
    const profile = await saveProfile(prisma, auth.ctx.user.id, parseResult.data);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: profile,
    };
  } catch (error) {
    context.error('Error saving protein profile:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to save protein profile',
      },
    };
  }
}

app.http('protein-profile-save', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'protein/profile',
  handler: saveProteinProfileHandler,
});

// ===========================================
// DELETE /api/protein/profile
// ===========================================

/**
 * Delete protein profile
 */
async function deleteProteinProfileHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  context.log(`DELETE /api/protein/profile - User: ${auth.ctx.user.id}`);

  try {
    const prisma = getPrismaClient();
    const deleted = await deleteProfile(prisma, auth.ctx.user.id);

    if (!deleted) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'not_found',
          message: 'No protein profile exists for this user',
        },
      };
    }

    return {
      status: 204,
    };
  } catch (error) {
    context.error('Error deleting protein profile:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to delete protein profile',
      },
    };
  }
}

app.http('protein-profile-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'protein/profile',
  handler: deleteProteinProfileHandler,
});
