/**
 * Consent Service
 * Feature 010 - User Signup Process
 * 
 * Manages user consent records for Terms of Service, Privacy Policy,
 * and optional marketing communications. Supports compliance auditing.
 */

import getPrismaClient from '../utils/prisma.js';
import { ConsentType } from '@prisma/client';
import { Logger } from '../utils/logger.js';

// Get prisma client
const prisma = getPrismaClient();

export interface ConsentInput {
  userId: string;
  consentType: ConsentType;
  documentVersion: string;
  ipAddress: string;
  userAgent?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  documentVersion: string;
  ipAddress: string;
  userAgent: string | null;
  grantedAt: Date;
  revokedAt: Date | null;
}

/**
 * Create or update a consent record for a user.
 * If consent already exists for this type, updates the existing record.
 */
export async function createConsent(input: ConsentInput): Promise<ConsentRecord> {
  const { userId, consentType, documentVersion, ipAddress, userAgent } = input;

  Logger.info('Creating consent record', { 
    userId, 
    consentType, 
    documentVersion 
  });

  // Upsert: create new or update existing consent for this type
  const consent = await prisma.consentRecord.upsert({
    where: {
      userId_consentType: {
        userId,
        consentType,
      },
    },
    update: {
      documentVersion,
      ipAddress,
      userAgent: userAgent || null,
      grantedAt: new Date(),
      revokedAt: null, // Re-granting clears revocation
    },
    create: {
      userId,
      consentType,
      documentVersion,
      ipAddress,
      userAgent: userAgent || null,
    },
  });

  Logger.info('Consent record created/updated', { 
    consentId: consent.id,
    userId,
    consentType 
  });

  return consent;
}

/**
 * Create multiple consent records in a single transaction.
 * Used during signup to record ToS and Privacy Policy acceptance together.
 */
export async function createMultipleConsents(
  inputs: ConsentInput[]
): Promise<ConsentRecord[]> {
  Logger.info('Creating multiple consent records', { 
    count: inputs.length,
    userId: inputs[0]?.userId 
  });

  const results = await prisma.$transaction(
    inputs.map(input => 
      prisma.consentRecord.upsert({
        where: {
          userId_consentType: {
            userId: input.userId,
            consentType: input.consentType,
          },
        },
        update: {
          documentVersion: input.documentVersion,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent || null,
          grantedAt: new Date(),
          revokedAt: null,
        },
        create: {
          userId: input.userId,
          consentType: input.consentType,
          documentVersion: input.documentVersion,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent || null,
        },
      })
    )
  );

  Logger.info('Multiple consent records created', { 
    count: results.length,
    userId: inputs[0]?.userId 
  });

  return results;
}

/**
 * Get all consent records for a user.
 * Returns both active and revoked consents for audit purposes.
 */
export async function getConsents(userId: string): Promise<ConsentRecord[]> {
  Logger.debug('Fetching consents for user', { userId });

  const consents = await prisma.consentRecord.findMany({
    where: { userId },
    orderBy: { grantedAt: 'desc' },
  });

  return consents;
}

/**
 * Get active (non-revoked) consents for a user.
 */
export async function getActiveConsents(userId: string): Promise<ConsentRecord[]> {
  Logger.debug('Fetching active consents for user', { userId });

  const consents = await prisma.consentRecord.findMany({
    where: { 
      userId,
      revokedAt: null,
    },
    orderBy: { grantedAt: 'desc' },
  });

  return consents;
}

/**
 * Check if user has accepted required consents (ToS and Privacy Policy).
 */
export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const consents = await prisma.consentRecord.findMany({
    where: {
      userId,
      revokedAt: null,
      consentType: {
        in: [ConsentType.TERMS_OF_SERVICE, ConsentType.PRIVACY_POLICY],
      },
    },
  });

  const hasToS = consents.some(c => c.consentType === ConsentType.TERMS_OF_SERVICE);
  const hasPrivacy = consents.some(c => c.consentType === ConsentType.PRIVACY_POLICY);

  return hasToS && hasPrivacy;
}

/**
 * Revoke a consent record.
 * Sets revokedAt timestamp; does not delete for audit purposes.
 */
export async function revokeConsent(
  userId: string, 
  consentType: ConsentType
): Promise<ConsentRecord | null> {
  Logger.info('Revoking consent', { userId, consentType });

  try {
    const consent = await prisma.consentRecord.update({
      where: {
        userId_consentType: {
          userId,
          consentType,
        },
      },
      data: {
        revokedAt: new Date(),
      },
    });

    Logger.info('Consent revoked', { 
      consentId: consent.id,
      userId,
      consentType 
    });

    return consent;
  } catch (error) {
    // Record may not exist
    Logger.warn('Failed to revoke consent - record not found', { 
      userId, 
      consentType 
    });
    return null;
  }
}

/**
 * Check if user has consented to marketing emails.
 */
export async function hasMarketingConsent(userId: string): Promise<boolean> {
  const consent = await prisma.consentRecord.findUnique({
    where: {
      userId_consentType: {
        userId,
        consentType: ConsentType.MARKETING_EMAILS,
      },
    },
  });

  return consent !== null && consent.revokedAt === null;
}

/**
 * Get consent records for compliance export.
 * Returns all consents in a format suitable for audit reports.
 */
export async function getConsentAuditLog(
  userId: string
): Promise<{
  userId: string;
  consents: Array<{
    type: string;
    version: string;
    grantedAt: string;
    revokedAt: string | null;
    ipAddress: string;
  }>;
}> {
  const consents = await prisma.consentRecord.findMany({
    where: { userId },
    orderBy: [
      { consentType: 'asc' },
      { grantedAt: 'desc' },
    ],
  });

  return {
    userId,
    consents: consents.map(c => ({
      type: c.consentType,
      version: c.documentVersion,
      grantedAt: c.grantedAt.toISOString(),
      revokedAt: c.revokedAt?.toISOString() || null,
      ipAddress: c.ipAddress,
    })),
  };
}
