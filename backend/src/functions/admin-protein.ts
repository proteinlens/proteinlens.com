/**
 * Admin Protein API Endpoints (Feature 015)
 * 
 * Admin-only endpoints for managing protein presets and configuration
 * Routes: /api/dashboard/protein/*
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminIdentity } from '../middleware/adminMiddleware.js';
import { getPrismaClient } from '../utils/prisma.js';
import {
  UpdatePresetRequestSchema,
  UpdateConfigRequestSchema,
} from '../models/proteinTypes.js';
import {
  listPresets,
  updatePreset,
  getAdminConfig,
  updateAdminConfig,
} from '../services/proteinCalculatorService.js';

// ===========================================
// GET /api/dashboard/protein/presets
// ===========================================

/**
 * List all protein presets (admin only)
 */
async function listPresetsHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminId = getAdminIdentity(request);
  context.log(`GET /api/dashboard/protein/presets - Admin: ${adminId}`);

  try {
    const prisma = getPrismaClient();
    const presets = await listPresets(prisma);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: presets,
    };
  } catch (error) {
    context.error('Error listing protein presets:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to list protein presets',
      },
    };
  }
}

app.http('admin-protein-presets-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/protein/presets',
  handler: listPresetsHandler,
});

// ===========================================
// PUT /api/dashboard/protein/presets
// ===========================================

/**
 * Update a protein preset (admin only)
 */
async function updatePresetHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminId = getAdminIdentity(request);
  context.log(`PUT /api/dashboard/protein/presets - Admin: ${adminId}`);

  try {
    const body = await request.json();
    const parseResult = UpdatePresetRequestSchema.safeParse(body);

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

    const { trainingLevel, goal, multiplierGPerKg } = parseResult.data;
    const prisma = getPrismaClient();
    const preset = await updatePreset(prisma, trainingLevel, goal, multiplierGPerKg);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: preset,
    };
  } catch (error) {
    context.error('Error updating protein preset:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to update protein preset',
      },
    };
  }
}

app.http('admin-protein-presets-update', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'dashboard/protein/presets',
  handler: updatePresetHandler,
});

// ===========================================
// GET /api/dashboard/protein/config
// ===========================================

/**
 * Get protein config (admin only)
 */
async function getConfigHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminId = getAdminIdentity(request);
  context.log(`GET /api/dashboard/protein/config - Admin: ${adminId}`);

  try {
    const prisma = getPrismaClient();
    const config = await getAdminConfig(prisma);

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
        message: 'Failed to fetch protein config',
      },
    };
  }
}

app.http('admin-protein-config-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/protein/config',
  handler: getConfigHandler,
});

// ===========================================
// PUT /api/dashboard/protein/config
// ===========================================

/**
 * Update protein config (admin only)
 */
async function updateConfigHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminId = getAdminIdentity(request);
  context.log(`PUT /api/dashboard/protein/config - Admin: ${adminId}`);

  try {
    const body = await request.json();
    const parseResult = UpdateConfigRequestSchema.safeParse(body);

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
    const config = await updateAdminConfig(prisma, parseResult.data);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: config,
    };
  } catch (error) {
    context.error('Error updating protein config:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'internal_error',
        message: 'Failed to update protein config',
      },
    };
  }
}

app.http('admin-protein-config-update', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'dashboard/protein/config',
  handler: updateConfigHandler,
});
