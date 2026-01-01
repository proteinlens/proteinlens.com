// Admin Diet Styles CRUD endpoints - Feature 017
// T038-T042: Admin endpoints for managing diet style configurations
// US4: Admin-Editable Diet Configuration

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAdmin, getAdminContext } from '../middleware/adminMiddleware.js';
import { getPrismaClient } from '../utils/prisma.js';
import { z } from 'zod';
import type { DietStyle } from '@prisma/client';

// Validation schemas
const DietStyleCreateSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  netCarbCapG: z.number().int().min(0).nullable().optional(),
  fatTargetPercent: z.number().int().min(0).max(100).nullable().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const DietStyleUpdateSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(10).optional(),
  netCarbCapG: z.number().int().min(0).nullable().optional(),
  fatTargetPercent: z.number().int().min(0).max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// T038: GET /api/admin/diet-styles - List all diet styles (including inactive)
export async function adminGetDietStyles(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin GET diet-styles endpoint called');

  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const prisma = getPrismaClient();
    const adminContext = getAdminContext(request);

    const dietStyles = await prisma.dietStyle.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: {
            users: true,
            mealSnapshots: true,
          },
        },
      },
    });

    context.log(`Admin ${adminContext?.adminId || adminContext?.adminEmail} retrieved ${dietStyles.length} diet styles`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        dietStyles: dietStyles.map((ds: DietStyle & { _count: { users: number; mealSnapshots: number } }) => ({
          id: ds.id,
          slug: ds.slug,
          name: ds.name,
          description: ds.description,
          netCarbCapG: ds.netCarbCapG,
          fatTargetPercent: ds.fatTargetPercent,
          isActive: ds.isActive,
          sortOrder: ds.sortOrder,
          createdAt: ds.createdAt.toISOString(),
          updatedAt: ds.updatedAt.toISOString(),
          usersCount: ds._count.users,
          mealsCount: ds._count.mealSnapshots,
        })),
      },
    };
  } catch (error) {
    context.error('Error listing diet styles:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to list diet styles',
      },
    };
  }
}

// T039: POST /api/admin/diet-styles - Create new diet style
export async function adminCreateDietStyle(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin POST diet-styles endpoint called');

  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const prisma = getPrismaClient();
    const adminContext = getAdminContext(request);
    const body = await request.json();

    // Validate request body
    const parseResult = DietStyleCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Invalid diet style data',
          details: parseResult.error.errors,
        },
      };
    }

    const data = parseResult.data;

    // T042: Check unique slug
    const existing = await prisma.dietStyle.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Conflict',
          message: `Diet style with slug '${data.slug}' already exists`,
        },
      };
    }

    // Create diet style
    const dietStyle = await prisma.dietStyle.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        netCarbCapG: data.netCarbCapG ?? null,
        fatTargetPercent: data.fatTargetPercent ?? null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    context.log(`Admin ${adminContext?.adminId || adminContext?.adminEmail} created diet style: ${dietStyle.slug}`);

    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        dietStyle: {
          id: dietStyle.id,
          slug: dietStyle.slug,
          name: dietStyle.name,
          description: dietStyle.description,
          netCarbCapG: dietStyle.netCarbCapG,
          fatTargetPercent: dietStyle.fatTargetPercent,
          isActive: dietStyle.isActive,
          sortOrder: dietStyle.sortOrder,
          createdAt: dietStyle.createdAt.toISOString(),
          updatedAt: dietStyle.updatedAt.toISOString(),
        },
      },
    };
  } catch (error) {
    context.error('Error creating diet style:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to create diet style',
      },
    };
  }
}

// T040: PATCH /api/admin/diet-styles/:id - Update diet style
export async function adminUpdateDietStyle(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin PATCH diet-styles endpoint called');

  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const prisma = getPrismaClient();
    const adminContext = getAdminContext(request);
    const id = request.params.id;
    const body = await request.json();

    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Diet style ID is required',
        },
      };
    }

    // Validate request body
    const parseResult = DietStyleUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Invalid diet style data',
          details: parseResult.error.errors,
        },
      };
    }

    const data = parseResult.data;

    // Check diet style exists
    const existing = await prisma.dietStyle.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Not Found',
          message: 'Diet style not found',
        },
      };
    }

    // T042: Check unique slug if being changed
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.dietStyle.findUnique({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        return {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
          jsonBody: {
            error: 'Conflict',
            message: `Diet style with slug '${data.slug}' already exists`,
          },
        };
      }
    }

    // Update diet style
    const dietStyle = await prisma.dietStyle.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.netCarbCapG !== undefined && { netCarbCapG: data.netCarbCapG }),
        ...(data.fatTargetPercent !== undefined && { fatTargetPercent: data.fatTargetPercent }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    context.log(`Admin ${adminContext?.adminId || adminContext?.adminEmail} updated diet style: ${dietStyle.slug}`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        dietStyle: {
          id: dietStyle.id,
          slug: dietStyle.slug,
          name: dietStyle.name,
          description: dietStyle.description,
          netCarbCapG: dietStyle.netCarbCapG,
          fatTargetPercent: dietStyle.fatTargetPercent,
          isActive: dietStyle.isActive,
          sortOrder: dietStyle.sortOrder,
          createdAt: dietStyle.createdAt.toISOString(),
          updatedAt: dietStyle.updatedAt.toISOString(),
        },
      },
    };
  } catch (error) {
    context.error('Error updating diet style:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to update diet style',
      },
    };
  }
}

// T041: DELETE /api/admin/diet-styles/:id - Soft delete (deactivate) diet style
export async function adminDeleteDietStyle(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Admin DELETE diet-styles endpoint called');

  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const prisma = getPrismaClient();
    const adminContext = getAdminContext(request);
    const id = request.params.id;

    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Bad Request',
          message: 'Diet style ID is required',
        },
      };
    }

    // Check diet style exists
    const existing = await prisma.dietStyle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existing) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          error: 'Not Found',
          message: 'Diet style not found',
        },
      };
    }

    // Soft delete: deactivate instead of hard delete
    // This preserves historical data for meals scanned with this diet style
    await prisma.dietStyle.update({
      where: { id },
      data: { isActive: false },
    });

    context.log(`Admin ${adminContext?.adminId || adminContext?.adminEmail} deactivated diet style: ${existing.slug} (had ${existing._count.users} users)`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        message: 'Diet style deactivated successfully',
        deactivated: {
          id: existing.id,
          slug: existing.slug,
          usersAffected: existing._count.users,
        },
      },
    };
  } catch (error) {
    context.error('Error deleting diet style:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: 'Internal Server Error',
        message: 'Failed to delete diet style',
      },
    };
  }
}

// Register endpoints
app.http('admin-diet-styles-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/diet-styles',
  handler: adminGetDietStyles,
});

app.http('admin-diet-styles-create', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'dashboard/diet-styles',
  handler: adminCreateDietStyle,
});

app.http('admin-diet-styles-update', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'dashboard/diet-styles/{id}',
  handler: adminUpdateDietStyle,
});

app.http('admin-diet-styles-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'dashboard/diet-styles/{id}',
  handler: adminDeleteDietStyle,
});
