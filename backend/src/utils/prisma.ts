/**
 * Centralized Prisma client for ESM compatibility
 * 
 * Prisma client is a CommonJS module, but our app uses ESM.
 * This module handles the interop using createRequire.
 */

import { createRequire } from 'module';
import type { 
  PrismaClient as PrismaClientType, 
  Plan as PlanType, 
  SubscriptionStatus as SubscriptionStatusType, 
  UsageType as UsageTypeType,
  OrganizationInviteStatus as OrganizationInviteStatusType,
  User as UserType, 
  MealAnalysis as MealAnalysisType 
} from '@prisma/client';

// Use createRequire for CommonJS module interop in ESM
const require = createRequire(import.meta.url);
const prismaModule = require('@prisma/client');

// Extract PrismaClient and enums from the CJS module
const { PrismaClient, Plan, SubscriptionStatus, UsageType, OrganizationInviteStatus } = prismaModule;

// Re-export enums as values (these can be used as both types and values)
export { Plan, SubscriptionStatus, UsageType, OrganizationInviteStatus };

// Re-export types for TypeScript type annotations
export type { 
  PrismaClientType as PrismaClient, 
  PlanType as PlanEnum, 
  SubscriptionStatusType as SubscriptionStatusEnum, 
  UsageTypeType as UsageTypeEnum,
  OrganizationInviteStatusType as OrganizationInviteStatusEnum,
  UserType as User, 
  MealAnalysisType as MealAnalysis 
};

// Type aliases for enum types (for use in function signatures)
export type Plan = PlanType;
export type SubscriptionStatus = SubscriptionStatusType;
export type UsageType = UsageTypeType;
export type OrganizationInviteStatus = OrganizationInviteStatusType;

// Singleton instance
let prismaInstance: PrismaClientType | null = null;

/**
 * Get the singleton Prisma client instance
 */
export function getPrismaClient(): PrismaClientType {
  if (!prismaInstance) {
    // Validate DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance!;
}

/**
 * Create a new Prisma client instance (for testing or isolated use)
 */
export function createPrismaClient(): PrismaClientType {
  return new PrismaClient();
}

// Default export for convenience
export default getPrismaClient;
