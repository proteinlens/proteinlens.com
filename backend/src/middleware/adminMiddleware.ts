// Admin middleware for role-based access control
// Feature: 002-saas-billing, User Story 6
// T076: Admin role check middleware

import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPrismaClient } from '../utils/prisma.js';

const prisma = getPrismaClient();

// Admin email allowlist (in production, this would be in database or Azure AD)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

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
