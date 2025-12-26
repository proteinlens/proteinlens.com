/**
 * Organization API Routes
 * Feature 010 - User Signup Process
 * 
 * Azure Functions endpoints for organization management and invites.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import {
  createInvite,
  validateInvite,
  markInviteUsed,
  getPendingInvites,
  cancelInvite,
} from '../services/organizationInviteService';

// Validation schemas
const createInviteSchema = z.object({
  email: z.string().email().max(320),
  organizationId: z.string().min(1).max(255),
  organizationName: z.string().min(1).max(100),
  expiryDays: z.number().int().min(1).max(30).optional(),
});

const cancelInviteSchema = z.object({
  inviteId: z.string().uuid(),
});

/**
 * Helper to get user ID from request (from auth middleware).
 */
function getUserId(request: HttpRequest): string | null {
  // This would be populated by auth middleware
  const userId = request.headers.get('x-user-id');
  return userId;
}

/**
 * Helper to get user display name from request.
 */
function getUserName(request: HttpRequest): string | null {
  const userName = request.headers.get('x-user-name');
  return userName;
}

/**
 * POST /api/org/invite - Create organization invite
 */
async function createOrgInvite(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return {
        status: 401,
        jsonBody: { error: 'Authentication required' },
      };
    }

    const body = await request.json();
    const parsed = createInviteSchema.safeParse(body);

    if (!parsed.success) {
      return {
        status: 400,
        jsonBody: {
          error: 'Validation error',
          details: parsed.error.flatten().fieldErrors,
        },
      };
    }

    const userName = getUserName(request);

    const result = await createInvite({
      ...parsed.data,
      invitedBy: userId,
      invitedByName: userName || undefined,
    });

    context.log(`Organization invite created: ${result.id} for ${result.email}`);

    return {
      status: 201,
      jsonBody: {
        id: result.id,
        email: result.email,
        organizationName: result.organizationName,
        expiresAt: result.expiresAt.toISOString(),
        inviteUrl: result.inviteUrl,
      },
    };
  } catch (error) {
    context.error('Error creating invite:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to create invite' },
    };
  }
}

/**
 * GET /api/org/invite/:token - Validate invite and get details
 */
async function getInviteDetails(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const token = request.params.token;

    if (!token) {
      return {
        status: 400,
        jsonBody: { error: 'Token is required' },
      };
    }

    const result = await validateInvite(token);

    if (!result.valid) {
      const errorMessages: Record<string, string> = {
        NOT_FOUND: 'This invite link is invalid or does not exist.',
        EXPIRED: 'This invite has expired. Please ask for a new invite.',
        ALREADY_USED: 'This invite has already been used.',
        CANCELLED: 'This invite has been cancelled.',
      };

      return {
        status: 400,
        jsonBody: {
          error: result.error,
          message: errorMessages[result.error || 'NOT_FOUND'],
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        valid: true,
        email: result.invite!.email,
        organizationId: result.invite!.organizationId,
        organizationName: result.invite!.organizationName,
        invitedByName: result.invite!.invitedByName,
        expiresAt: result.invite!.expiresAt.toISOString(),
      },
    };
  } catch (error) {
    context.error('Error validating invite:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to validate invite' },
    };
  }
}

/**
 * POST /api/org/invite/:token/accept - Mark invite as accepted
 */
async function acceptInvite(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return {
        status: 401,
        jsonBody: { error: 'Authentication required' },
      };
    }

    const token = request.params.token;

    if (!token) {
      return {
        status: 400,
        jsonBody: { error: 'Token is required' },
      };
    }

    const success = await markInviteUsed(token, userId);

    if (!success) {
      return {
        status: 400,
        jsonBody: { error: 'Invite cannot be accepted. It may be expired or already used.' },
      };
    }

    context.log(`Invite ${token} accepted by user ${userId}`);

    return {
      status: 200,
      jsonBody: { success: true },
    };
  } catch (error) {
    context.error('Error accepting invite:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to accept invite' },
    };
  }
}

/**
 * GET /api/org/:orgId/invites - Get pending invites for organization
 */
async function getOrgInvites(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return {
        status: 401,
        jsonBody: { error: 'Authentication required' },
      };
    }

    const orgId = request.params.orgId;

    if (!orgId) {
      return {
        status: 400,
        jsonBody: { error: 'Organization ID is required' },
      };
    }

    // TODO: Add authorization check - user must be admin of org

    const invites = await getPendingInvites(orgId);

    return {
      status: 200,
      jsonBody: {
        invites: invites.map(inv => ({
          id: inv.id,
          email: inv.email,
          expiresAt: inv.expiresAt.toISOString(),
          createdAt: inv.createdAt.toISOString(),
          invitedByName: inv.invitedByName,
        })),
      },
    };
  } catch (error) {
    context.error('Error getting invites:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to get invites' },
    };
  }
}

/**
 * DELETE /api/org/invite/:inviteId - Cancel invite
 */
async function deleteInvite(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return {
        status: 401,
        jsonBody: { error: 'Authentication required' },
      };
    }

    const inviteId = request.params.inviteId;

    if (!inviteId) {
      return {
        status: 400,
        jsonBody: { error: 'Invite ID is required' },
      };
    }

    // TODO: Add authorization check - user must be admin of org

    const success = await cancelInvite(inviteId, userId);

    if (!success) {
      return {
        status: 404,
        jsonBody: { error: 'Invite not found or already processed' },
      };
    }

    context.log(`Invite ${inviteId} cancelled by user ${userId}`);

    return {
      status: 200,
      jsonBody: { success: true },
    };
  } catch (error) {
    context.error('Error cancelling invite:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to cancel invite' },
    };
  }
}

// Register routes
app.http('createOrgInvite', {
  methods: ['POST'],
  route: 'org/invite',
  authLevel: 'anonymous',
  handler: createOrgInvite,
});

app.http('getInviteDetails', {
  methods: ['GET'],
  route: 'org/invite/{token}',
  authLevel: 'anonymous',
  handler: getInviteDetails,
});

app.http('acceptInvite', {
  methods: ['POST'],
  route: 'org/invite/{token}/accept',
  authLevel: 'anonymous',
  handler: acceptInvite,
});

app.http('getOrgInvites', {
  methods: ['GET'],
  route: 'org/{orgId}/invites',
  authLevel: 'anonymous',
  handler: getOrgInvites,
});

app.http('deleteInvite', {
  methods: ['DELETE'],
  route: 'org/invite/{inviteId}',
  authLevel: 'anonymous',
  handler: deleteInvite,
});
