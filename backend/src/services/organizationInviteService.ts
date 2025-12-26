/**
 * OrganizationInviteService
 * Feature 010 - User Signup Process
 * 
 * Service for managing organization invites for team signups.
 * Handles invite creation, validation, and acceptance tracking.
 */

import { randomBytes } from 'crypto';
import getPrismaClient, { OrganizationInviteStatus } from '../utils/prisma.js';
import { Logger } from '../utils/logger.js';

const prisma = getPrismaClient();

// Constants
const INVITE_TOKEN_LENGTH = 32; // 256-bit token
const DEFAULT_INVITE_EXPIRY_DAYS = 7;

/**
 * Input for creating an organization invite.
 */
export interface CreateInviteInput {
  email: string;
  organizationId: string;
  organizationName: string;
  invitedBy: string;
  invitedByName?: string;
  expiryDays?: number;
}

/**
 * Result of invite creation.
 */
export interface CreateInviteResult {
  id: string;
  token: string;
  email: string;
  organizationName: string;
  expiresAt: Date;
  inviteUrl: string;
}

/**
 * Result of invite validation.
 */
export interface ValidateInviteResult {
  valid: boolean;
  invite?: {
    id: string;
    email: string;
    organizationId: string;
    organizationName: string;
    invitedByName: string | null;
    expiresAt: Date;
  };
  error?: 'NOT_FOUND' | 'EXPIRED' | 'ALREADY_USED' | 'CANCELLED';
}

/**
 * Generate a secure, URL-safe invite token.
 */
function generateToken(): string {
  return randomBytes(INVITE_TOKEN_LENGTH).toString('base64url');
}

/**
 * Get base URL for invite links.
 */
function getBaseUrl(): string {
  return process.env.FRONTEND_URL || 'https://proteinlens.com';
}

/**
 * Create a new organization invite.
 * 
 * @param input - Invite creation parameters
 * @returns Created invite with token and URL
 */
export async function createInvite(input: CreateInviteInput): Promise<CreateInviteResult> {
  const {
    email,
    organizationId,
    organizationName,
    invitedBy,
    invitedByName,
    expiryDays = DEFAULT_INVITE_EXPIRY_DAYS,
  } = input;

  // Generate secure token
  const token = generateToken();

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // Cancel any existing pending invites for this email/org combination
  await prisma.organizationInvite.updateMany({
    where: {
      email: email.toLowerCase(),
      organizationId,
      status: OrganizationInviteStatus.PENDING,
    },
    data: {
      status: OrganizationInviteStatus.CANCELLED,
    },
  });

  // Create new invite
  const invite = await prisma.organizationInvite.create({
    data: {
      token,
      email: email.toLowerCase(),
      organizationId,
      organizationName,
      invitedBy,
      invitedByName: invitedByName || null,
      expiresAt,
    },
  });

  // Build invite URL
  const inviteUrl = `${getBaseUrl()}/invite/${token}`;

  return {
    id: invite.id,
    token: invite.token,
    email: invite.email,
    organizationName: invite.organizationName,
    expiresAt: invite.expiresAt,
    inviteUrl,
  };
}

/**
 * Validate an invite token.
 * 
 * @param token - Invite token from URL
 * @returns Validation result with invite details if valid
 */
export async function validateInvite(token: string): Promise<ValidateInviteResult> {
  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    return { valid: false, error: 'NOT_FOUND' };
  }

  if (invite.status === OrganizationInviteStatus.CANCELLED) {
    return { valid: false, error: 'CANCELLED' };
  }

  if (invite.status === OrganizationInviteStatus.ACCEPTED) {
    return { valid: false, error: 'ALREADY_USED' };
  }

  if (new Date() > invite.expiresAt) {
    // Mark as expired in database
    await prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { status: OrganizationInviteStatus.EXPIRED },
    });
    return { valid: false, error: 'EXPIRED' };
  }

  return {
    valid: true,
    invite: {
      id: invite.id,
      email: invite.email,
      organizationId: invite.organizationId,
      organizationName: invite.organizationName,
      invitedByName: invite.invitedByName,
      expiresAt: invite.expiresAt,
    },
  };
}

/**
 * Mark an invite as used when user completes signup.
 * 
 * @param token - Invite token
 * @param userId - ID of user who accepted the invite
 * @returns Whether the operation succeeded
 */
export async function markInviteUsed(token: string, userId: string): Promise<boolean> {
  try {
    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.status !== OrganizationInviteStatus.PENDING) {
      return false;
    }

    await prisma.organizationInvite.update({
      where: { id: invite.id },
      data: {
        status: OrganizationInviteStatus.ACCEPTED,
        usedAt: new Date(),
        usedByUserId: userId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error marking invite as used:', error);
    return false;
  }
}

/**
 * Get all pending invites for an organization.
 * 
 * @param organizationId - Organization ID
 * @returns List of pending invites
 */
export async function getPendingInvites(organizationId: string) {
  return prisma.organizationInvite.findMany({
    where: {
      organizationId,
      status: OrganizationInviteStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      expiresAt: true,
      createdAt: true,
      invitedByName: true,
    },
  });
}

/**
 * Cancel a pending invite.
 * 
 * @param inviteId - Invite ID to cancel
 * @param cancelledBy - User ID who cancelled
 * @returns Whether the operation succeeded
 */
export async function cancelInvite(inviteId: string, cancelledBy: string): Promise<boolean> {
  try {
    const result = await prisma.organizationInvite.updateMany({
      where: {
        id: inviteId,
        status: OrganizationInviteStatus.PENDING,
      },
      data: {
        status: OrganizationInviteStatus.CANCELLED,
      },
    });

    return result.count > 0;
  } catch (error) {
    console.error('Error cancelling invite:', error);
    return false;
  }
}

/**
 * Clean up expired invites (can be run as scheduled job).
 * 
 * @returns Number of invites marked as expired
 */
export async function cleanupExpiredInvites(): Promise<number> {
  const result = await prisma.organizationInvite.updateMany({
    where: {
      status: OrganizationInviteStatus.PENDING,
      expiresAt: { lt: new Date() },
    },
    data: {
      status: OrganizationInviteStatus.EXPIRED,
    },
  });

  return result.count;
}

export default {
  createInvite,
  validateInvite,
  markInviteUsed,
  getPendingInvites,
  cancelInvite,
  cleanupExpiredInvites,
};
