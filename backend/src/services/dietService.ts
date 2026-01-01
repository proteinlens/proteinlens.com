/**
 * Diet Style Service (Feature 017)
 * 
 * Business logic for diet style management with caching.
 * Follows Constitution Principle IV (traceability) and Principle XIII (cache coherence).
 */

import { PrismaClient, DietStyle } from '@prisma/client';

// Re-export DietStyle type for use in other modules
export type { DietStyle };

// ===========================================
// Types
// ===========================================

export interface DietStylePublic {
  id: string;
  slug: string;
  name: string;
  description: string;
  netCarbCapG: number | null;
  fatTargetPercent: number | null;
}

export interface DietStyleAdmin extends DietStylePublic {
  isActive: boolean;
  sortOrder: number;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDietStyleInput {
  slug: string;
  name: string;
  description: string;
  netCarbCapG?: number | null;
  fatTargetPercent?: number | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateDietStyleInput {
  slug?: string;
  name?: string;
  description?: string;
  netCarbCapG?: number | null;
  fatTargetPercent?: number | null;
  isActive?: boolean;
  sortOrder?: number;
}

// ===========================================
// In-Memory Cache (5-minute TTL)
// ===========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let activeDietStylesCache: CacheEntry<DietStylePublic[]> | null = null;
let allDietStylesCache: CacheEntry<DietStyle[]> | null = null;

function isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL_MS;
}

/**
 * Invalidate all diet style caches
 * Call this after any write operation
 */
export function invalidateDietStyleCache(): void {
  activeDietStylesCache = null;
  allDietStylesCache = null;
}

// ===========================================
// Fallback Data (used when DB unavailable)
// ===========================================

const FALLBACK_DIET_STYLES: DietStylePublic[] = [
  {
    id: 'fallback-balanced',
    slug: 'balanced',
    name: 'Balanced',
    description: 'Standard nutrition with no specific restrictions.',
    netCarbCapG: null,
    fatTargetPercent: null,
  },
  {
    id: 'fallback-mediterranean',
    slug: 'mediterranean',
    name: 'Mediterranean',
    description: 'Heart-healthy eating emphasizing olive oil, fish, whole grains, and vegetables.',
    netCarbCapG: null,
    fatTargetPercent: 35,
  },
  {
    id: 'fallback-low-carb',
    slug: 'low-carb',
    name: 'Low-Carb',
    description: 'Reduced carbohydrate intake while maintaining moderate protein.',
    netCarbCapG: 100,
    fatTargetPercent: null,
  },
  {
    id: 'fallback-ketogenic',
    slug: 'ketogenic',
    name: 'Ketogenic',
    description: 'Very low carb, high fat diet to achieve ketosis.',
    netCarbCapG: 30,
    fatTargetPercent: 70,
  },
  {
    id: 'fallback-plant-based',
    slug: 'plant-based',
    name: 'Plant-Based',
    description: 'Nutrition from plant sources only.',
    netCarbCapG: null,
    fatTargetPercent: null,
  },
];

// ===========================================
// Public Diet Style Queries
// ===========================================

/**
 * Get all active diet styles for user selection
 * Returns cached data if available, falls back to hardcoded defaults on error
 */
export async function getActiveDietStyles(prisma: PrismaClient): Promise<DietStylePublic[]> {
  // Check cache first
  if (isCacheValid(activeDietStylesCache)) {
    return activeDietStylesCache!.data;
  }

  try {
    const dietStyles = await prisma.dietStyle.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        netCarbCapG: true,
        fatTargetPercent: true,
      },
    });

    // Update cache
    activeDietStylesCache = {
      data: dietStyles,
      timestamp: Date.now(),
    };

    return dietStyles;
  } catch (error) {
    console.error('Failed to fetch diet styles from DB, using fallback:', error);
    return FALLBACK_DIET_STYLES;
  }
}

/**
 * Get a single diet style by ID
 */
export async function getDietStyleById(
  prisma: PrismaClient,
  id: string
): Promise<DietStylePublic | null> {
  try {
    const dietStyle = await prisma.dietStyle.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        netCarbCapG: true,
        fatTargetPercent: true,
      },
    });

    return dietStyle;
  } catch (error) {
    console.error('Failed to fetch diet style by ID:', error);
    return null;
  }
}

/**
 * Get a single diet style by slug
 */
export async function getDietStyleBySlug(
  prisma: PrismaClient,
  slug: string
): Promise<DietStylePublic | null> {
  try {
    const dietStyle = await prisma.dietStyle.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        netCarbCapG: true,
        fatTargetPercent: true,
      },
    });

    return dietStyle;
  } catch (error) {
    console.error('Failed to fetch diet style by slug:', error);
    return null;
  }
}

/**
 * Validate that a diet style ID exists and is active
 */
export async function validateDietStyleId(
  prisma: PrismaClient,
  id: string
): Promise<boolean> {
  try {
    const dietStyle = await prisma.dietStyle.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });
    return dietStyle !== null;
  } catch (error) {
    console.error('Failed to validate diet style ID:', error);
    return false;
  }
}

// ===========================================
// User Diet Style Management
// ===========================================

/**
 * Update user's diet style preference
 * Returns the updated diet style or null for Balanced (default)
 */
export async function updateUserDietStyle(
  prisma: PrismaClient,
  userId: string,
  dietStyleId: string | null
): Promise<DietStylePublic | null> {
  // If setting to null, just clear the preference
  if (dietStyleId === null) {
    await prisma.user.update({
      where: { id: userId },
      data: { dietStyleId: null },
    });
    return null;
  }

  // Validate the diet style exists and is active
  const isValid = await validateDietStyleId(prisma, dietStyleId);
  if (!isValid) {
    throw new Error('Diet style not found or inactive');
  }

  // Update user's preference
  const user = await prisma.user.update({
    where: { id: userId },
    data: { dietStyleId },
    include: {
      dietStyle: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          netCarbCapG: true,
          fatTargetPercent: true,
        },
      },
    },
  });

  return user.dietStyle;
}

/**
 * Get user's current diet style
 */
export async function getUserDietStyle(
  prisma: PrismaClient,
  userId: string
): Promise<DietStylePublic | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dietStyle: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            netCarbCapG: true,
            fatTargetPercent: true,
          },
        },
      },
    });

    return user?.dietStyle ?? null;
  } catch (error) {
    console.error('Failed to get user diet style:', error);
    return null;
  }
}

// ===========================================
// Admin Diet Style Management
// ===========================================

/**
 * Get all diet styles (including inactive) for admin
 */
export async function getAllDietStylesAdmin(prisma: PrismaClient): Promise<DietStyleAdmin[]> {
  // Check cache first
  if (isCacheValid(allDietStylesCache)) {
    const cached = allDietStylesCache!.data;
    return cached.map(ds => ({
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
    }));
  }

  try {
    const dietStyles = await prisma.dietStyle.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Get user counts for each diet style
    const userCounts = await prisma.user.groupBy({
      by: ['dietStyleId'],
      _count: { id: true },
      where: { dietStyleId: { not: null } },
    });

    const countMap = new Map(
      userCounts.map(uc => [uc.dietStyleId, uc._count.id])
    );

    // Update cache
    allDietStylesCache = {
      data: dietStyles,
      timestamp: Date.now(),
    };

    return dietStyles.map(ds => ({
      id: ds.id,
      slug: ds.slug,
      name: ds.name,
      description: ds.description,
      netCarbCapG: ds.netCarbCapG,
      fatTargetPercent: ds.fatTargetPercent,
      isActive: ds.isActive,
      sortOrder: ds.sortOrder,
      userCount: countMap.get(ds.id) ?? 0,
      createdAt: ds.createdAt.toISOString(),
      updatedAt: ds.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch admin diet styles:', error);
    throw error;
  }
}

/**
 * Create a new diet style (admin)
 */
export async function createDietStyle(
  prisma: PrismaClient,
  input: CreateDietStyleInput
): Promise<DietStyleAdmin> {
  // Check for duplicate slug
  const existing = await prisma.dietStyle.findUnique({
    where: { slug: input.slug },
  });

  if (existing) {
    throw new Error(`Diet style with slug '${input.slug}' already exists`);
  }

  const dietStyle = await prisma.dietStyle.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      netCarbCapG: input.netCarbCapG ?? 100,
      fatTargetPercent: input.fatTargetPercent ?? 30,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  // Invalidate caches
  invalidateDietStyleCache();

  return {
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
  };
}

/**
 * Update a diet style (admin)
 */
export async function updateDietStyle(
  prisma: PrismaClient,
  id: string,
  input: UpdateDietStyleInput
): Promise<DietStyleAdmin> {
  // Check if diet style exists
  const existing = await prisma.dietStyle.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Diet style not found');
  }

  // If updating slug, check for duplicates
  if (input.slug && input.slug !== existing.slug) {
    const duplicate = await prisma.dietStyle.findUnique({
      where: { slug: input.slug },
    });
    if (duplicate) {
      throw new Error(`Diet style with slug '${input.slug}' already exists`);
    }
  }

  const dietStyle = await prisma.dietStyle.update({
    where: { id },
    data: {
      ...(input.slug !== undefined && input.slug !== null && { slug: input.slug }),
      ...(input.name !== undefined && input.name !== null && { name: input.name }),
      ...(input.description !== undefined && input.description !== null && { description: input.description }),
      ...(input.netCarbCapG !== undefined && input.netCarbCapG !== null && { netCarbCapG: input.netCarbCapG }),
      ...(input.fatTargetPercent !== undefined && input.fatTargetPercent !== null && { fatTargetPercent: input.fatTargetPercent }),
      ...(input.isActive !== undefined && input.isActive !== null && { isActive: input.isActive }),
      ...(input.sortOrder !== undefined && input.sortOrder !== null && { sortOrder: input.sortOrder }),
    },
  });

  // Invalidate caches
  invalidateDietStyleCache();

  return {
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
  };
}

/**
 * Soft-delete a diet style by setting isActive to false (admin)
 */
export async function deleteDietStyle(
  prisma: PrismaClient,
  id: string
): Promise<{ id: string; isActive: boolean }> {
  // Check if diet style exists
  const existing = await prisma.dietStyle.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Diet style not found');
  }

  const dietStyle = await prisma.dietStyle.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, isActive: true },
  });

  // Invalidate caches
  invalidateDietStyleCache();

  return dietStyle;
}

// ===========================================
// Service object for convenience imports
// ===========================================

import { getPrismaClient } from '../utils/prisma.js';

/**
 * DietService singleton with pre-bound prisma client
 */
export const dietService = {
  getActiveDietStyles: () => getActiveDietStyles(getPrismaClient()),
  getDietStyleById: (id: string) => getDietStyleById(getPrismaClient(), id),
  getDietStyleBySlug: (slug: string) => getDietStyleBySlug(getPrismaClient(), slug),
  validateDietStyleId: (id: string) => validateDietStyleId(getPrismaClient(), id),
  updateUserDietStyle: (userId: string, dietStyleId: string | null) => updateUserDietStyle(getPrismaClient(), userId, dietStyleId),
  getUserDietStyle: (userId: string) => getUserDietStyle(getPrismaClient(), userId),
  getAllDietStylesAdmin: () => getAllDietStylesAdmin(getPrismaClient()),
  createDietStyle: (input: CreateDietStyleInput) => createDietStyle(getPrismaClient(), input),
  updateDietStyle: (id: string, input: UpdateDietStyleInput) => updateDietStyle(getPrismaClient(), id, input),
  deleteDietStyle: (id: string) => deleteDietStyle(getPrismaClient(), id),
};
