// Admin middleware for role-based access control
// Feature: 002-saas-billing, User Story 6
// Feature: 012-admin-dashboard - Enhanced with audit logging
// T013: Audit log entries for all admin actions

import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPrismaClient } from '../utils/prisma.js';
import { AdminActionType } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = getPrismaClient();

// Admin email allowlist (in production, this would be in database or Azure AD)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

export interface AdminContext {
  adminEmail: string;
  adminId?: string;
  requestId: string;
  ipAddress: string;
  userAgent?: string;
}

/**
 * T076: Check if user has admin role
 * Returns 403 response if not admin, null if authorized
 */
export async function requireAdmin(request: HttpRequest): Promise<HttpResponseInit | null> {
  // Extract admin identifier from request
  const adminEmail = request.headers.get('x-admin-email');
  const adminKey = request.headers.get('x-admin-key');

  // Check admin key (simple API key auth for development)
  const expectedAdminKey = process.env.ADMIN_API_KEY;
  if (expectedAdminKey && adminKey === expectedAdminKey) {
    return null; // Authorized via API key
  }

  // Check email allowlist
  if (adminEmail && ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
    return null; // Authorized via email allowlist
  }

  // Check Azure AD admin role (when auth is implemented)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // TODO: Decode JWT and check for admin role claim
    // const token = authHeader.replace('Bearer ', '');
    // const decoded = verifyJwt(token);
    // if (decoded.roles?.includes('admin')) return null;
  }

  return {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: {
      error: 'Forbidden',
      message: 'Admin access required',
    },
  };
}

/**
 * Extract admin identity from request for audit logging
 */
export function getAdminIdentity(request: HttpRequest): string {
  return request.headers.get('x-admin-email') || 
         request.headers.get('x-admin-id') || 
         'unknown-admin';
}

/**
 * T013: Extract full admin context for audit logging
 */
export function getAdminContext(request: HttpRequest): AdminContext {
  const requestId = request.headers.get('x-request-id') || randomUUID();
  
  // Get IP address from various headers (handle proxies)
  const ipAddress = 
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '0.0.0.0';

  return {
    adminEmail: request.headers.get('x-admin-email') || 'unknown-admin',
    adminId: request.headers.get('x-admin-id') || undefined,
    requestId,
    ipAddress,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

/**
 * T013: Create audit log entry for admin action
 */
export async function logAdminAction(
  context: AdminContext,
  action: AdminActionType,
  options?: {
    targetUserId?: string;
    targetEmail?: string;
    details?: Record<string, unknown>;
    reason?: string;
  }
): Promise<string> {
  const entry = await prisma.adminAuditLog.create({
    data: {
      adminEmail: context.adminEmail,
      adminId: context.adminId,
      action,
      targetUserId: options?.targetUserId,
      targetEmail: options?.targetEmail,
      details: options?.details as object | undefined,
      reason: options?.reason,
      requestId: context.requestId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    },
  });
  return entry.id;
}

