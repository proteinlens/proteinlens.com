/**
 * Protein Calculator Service (Feature 015)
 * 
 * Core business logic for protein target calculations
 */

import { PrismaClient, Prisma } from '@prisma/client';
import {
  CalculateProteinRequest,
  SaveProteinProfileRequest,
  ProteinTargetResponse,
  ProteinProfileResponse,
  ProteinConfigResponse,
  AdminPresetsResponse,
  AdminConfigResponse,
  ProteinPresetDetail,
  TrainingLevel,
  ProteinGoal,
  WeightUnit,
  toPrismaTrainingLevel,
  toPrismaGoal,
  toPrismaWeightUnit,
  fromPrismaTrainingLevel,
  fromPrismaGoal,
  fromPrismaWeightUnit,
} from '../models/proteinTypes.js';
import {
  roundTo5,
  clamp,
  distributeMeals,
  hasLowMealWarning,
  getMealSplits,
  DEFAULT_MEAL_SPLITS,
} from '../utils/proteinUtils.js';

// ===========================================
// Types
// ===========================================

interface PresetsMap {
  [trainingLevel: string]: {
    [goal: string]: number;
  };
}

interface ConfigData {
  minGDay: number;
  maxGDay: number;
  defaultMealsPerDay: number;
  mealSplits: Record<string, number[]>;
}

// ===========================================
// Fallback Constants (used when DB unavailable)
// ===========================================

const FALLBACK_MULTIPLIERS: PresetsMap = {
  none: { maintain: 1.0, lose: 1.2, gain: 1.2 },
  regular: { maintain: 1.6, lose: 1.8, gain: 1.8 },
};

const FALLBACK_CONFIG: ConfigData = {
  minGDay: 60,
  maxGDay: 220,
  defaultMealsPerDay: 3,
  mealSplits: DEFAULT_MEAL_SPLITS,
};

// ===========================================
// Database Queries
// ===========================================

/**
 * Get all active presets as a nested map
 * Gracefully falls back to hardcoded defaults if DB unavailable
 */
export async function getPresets(prisma: PrismaClient): Promise<PresetsMap> {
  try {
    const presets = await prisma.proteinPreset.findMany({
      where: { active: true },
    });

    if (presets.length > 0) {
      const result: PresetsMap = {};

      for (const preset of presets) {
        const training = fromPrismaTrainingLevel(preset.trainingLevel);
        const goal = fromPrismaGoal(preset.goal);

        if (!result[training]) {
          result[training] = {};
        }

        result[training][goal] = Number(preset.multiplierGPerKg);
      }

      return result;
    }
  } catch {
    // Database unavailable or table doesn't exist - use fallback
    console.warn(`[ProteinCalculator] DB unavailable, using fallback presets`);
  }

  // Return fallback presets
  return FALLBACK_MULTIPLIERS;
}

/**
 * Get configuration (singleton, with defaults)
 * Gracefully falls back to hardcoded defaults if DB unavailable
 */
export async function getConfig(prisma: PrismaClient): Promise<ConfigData> {
  try {
    const config = await prisma.proteinConfig.findFirst();

    if (config) {
      return {
        minGDay: config.minGDay,
        maxGDay: config.maxGDay,
        defaultMealsPerDay: config.defaultMealsPerDay,
        mealSplits: config.mealSplits as Record<string, number[]>,
      };
    }
  } catch {
    // Database unavailable or table doesn't exist - use fallback
    console.warn(`[ProteinCalculator] DB unavailable, using fallback config`);
  }

  // Fallback to hardcoded defaults
  return FALLBACK_CONFIG;
}

/**
 * Get multiplier for training level + goal combination
 * Gracefully falls back to hardcoded defaults if DB unavailable
 */
async function getMultiplier(
  prisma: PrismaClient,
  trainingLevel: TrainingLevel,
  goal: ProteinGoal
): Promise<number> {
  try {
    const preset = await prisma.proteinPreset.findUnique({
      where: {
        trainingLevel_goal: {
          trainingLevel: toPrismaTrainingLevel(trainingLevel),
          goal: toPrismaGoal(goal),
        },
      },
    });

    if (preset) {
      return Number(preset.multiplierGPerKg);
    }
  } catch {
    // Database unavailable or table doesn't exist - use fallback
    console.warn(`[ProteinCalculator] DB unavailable, using fallback multipliers`);
  }

  // Return fallback default
  return FALLBACK_MULTIPLIERS[trainingLevel]?.[goal] ?? 1.0;
}

// ===========================================
// Core Calculation Logic
// ===========================================

/**
 * Calculate daily protein target
 * Formula: weightKg × multiplier, rounded to nearest 5, clamped to [min, max]
 */
export function computeProteinTarget(
  weightKg: number,
  multiplier: number,
  minGDay: number,
  maxGDay: number
): number {
  const raw = weightKg * multiplier;
  const rounded = roundTo5(raw);
  return clamp(rounded, minGDay, maxGDay);
}

/**
 * Full protein calculation with per-meal distribution
 */
export async function calculateProtein(
  prisma: PrismaClient,
  request: CalculateProteinRequest
): Promise<ProteinTargetResponse> {
  const { weightKg, trainingLevel, goal, mealsPerDay } = request;

  // Get multiplier from database
  const multiplier = await getMultiplier(prisma, trainingLevel, goal);

  // Get config for clamps and splits
  const config = await getConfig(prisma);

  // Calculate daily target
  const proteinTargetG = computeProteinTarget(
    weightKg,
    multiplier,
    config.minGDay,
    config.maxGDay
  );

  // Get meal splits for the number of meals
  const splits = getMealSplits(mealsPerDay, config.mealSplits);

  // Distribute across meals
  const perMealTargetsG = distributeMeals(proteinTargetG, splits);

  // Check for low meal warning
  const lowMealWarning = hasLowMealWarning(perMealTargetsG);

  return {
    proteinTargetG,
    perMealTargetsG,
    multiplierUsed: multiplier,
    ...(lowMealWarning && { lowMealWarning }),
  };
}

// ===========================================
// Profile Management
// ===========================================

/**
 * Get user's protein profile and calculated target
 */
export async function getProfile(
  prisma: PrismaClient,
  userId: string
): Promise<ProteinProfileResponse | null> {
  const profile = await prisma.userProteinProfile.findUnique({
    where: { userId },
    include: { target: true },
  });

  if (!profile) {
    return null;
  }

  // Get config for meal splits
  const config = await getConfig(prisma);

  // If target exists, use stored values; otherwise recalculate
  let targetResponse: ProteinTargetResponse;

  if (profile.target) {
    const perMealTargetsG = profile.target.perMealTargetsG as number[];
    targetResponse = {
      proteinTargetG: profile.target.proteinTargetG,
      perMealTargetsG,
      multiplierUsed: Number(profile.target.multiplierUsed),
      ...(hasLowMealWarning(perMealTargetsG) && { lowMealWarning: true }),
    };
  } else {
    // Recalculate (shouldn't happen normally)
    targetResponse = await calculateProtein(prisma, {
      weightKg: Number(profile.weightKg),
      trainingLevel: fromPrismaTrainingLevel(profile.trainingLevel),
      goal: fromPrismaGoal(profile.goal),
      mealsPerDay: profile.mealsPerDay,
    });
  }

  return {
    profile: {
      id: profile.id,
      weightKg: Number(profile.weightKg),
      weightUnit: fromPrismaWeightUnit(profile.weightUnit),
      trainingLevel: fromPrismaTrainingLevel(profile.trainingLevel),
      goal: fromPrismaGoal(profile.goal),
      mealsPerDay: profile.mealsPerDay,
      updatedAt: profile.updatedAt.toISOString(),
    },
    target: targetResponse,
  };
}

/**
 * Save (create or update) user's protein profile
 */
export async function saveProfile(
  prisma: PrismaClient,
  userId: string,
  request: SaveProteinProfileRequest
): Promise<ProteinProfileResponse> {
  const { weightKg, weightUnit, trainingLevel, goal, mealsPerDay } = request;

  // Calculate target first
  const targetData = await calculateProtein(prisma, {
    weightKg,
    trainingLevel,
    goal,
    mealsPerDay,
  });

  // Upsert profile and target in a transaction
  const profile = await prisma.$transaction(async (tx) => {
    // Upsert profile
    const upsertedProfile = await tx.userProteinProfile.upsert({
      where: { userId },
      create: {
        userId,
        weightKg: new Prisma.Decimal(weightKg),
        weightUnit: toPrismaWeightUnit(weightUnit || 'kg'),
        trainingLevel: toPrismaTrainingLevel(trainingLevel),
        goal: toPrismaGoal(goal),
        mealsPerDay,
      },
      update: {
        weightKg: new Prisma.Decimal(weightKg),
        weightUnit: toPrismaWeightUnit(weightUnit || 'kg'),
        trainingLevel: toPrismaTrainingLevel(trainingLevel),
        goal: toPrismaGoal(goal),
        mealsPerDay,
      },
    });

    // Upsert target
    await tx.proteinTarget.upsert({
      where: { profileId: upsertedProfile.id },
      create: {
        profileId: upsertedProfile.id,
        proteinTargetG: targetData.proteinTargetG,
        perMealTargetsG: targetData.perMealTargetsG,
        multiplierUsed: new Prisma.Decimal(targetData.multiplierUsed),
      },
      update: {
        proteinTargetG: targetData.proteinTargetG,
        perMealTargetsG: targetData.perMealTargetsG,
        multiplierUsed: new Prisma.Decimal(targetData.multiplierUsed),
        calculatedAt: new Date(),
      },
    });

    return upsertedProfile;
  });

  return {
    profile: {
      id: profile.id,
      weightKg: Number(profile.weightKg),
      weightUnit: fromPrismaWeightUnit(profile.weightUnit),
      trainingLevel: fromPrismaTrainingLevel(profile.trainingLevel),
      goal: fromPrismaGoal(profile.goal),
      mealsPerDay: profile.mealsPerDay,
      updatedAt: profile.updatedAt.toISOString(),
    },
    target: targetData,
  };
}

/**
 * Delete user's protein profile
 */
export async function deleteProfile(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  const existing = await prisma.userProteinProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    return false;
  }

  // Cascade delete will remove target
  await prisma.userProteinProfile.delete({
    where: { userId },
  });

  return true;
}

// ===========================================
// Public Config
// ===========================================

/**
 * Get public configuration for client
 */
export async function getPublicConfig(
  prisma: PrismaClient
): Promise<ProteinConfigResponse> {
  const presets = await getPresets(prisma);
  const config = await getConfig(prisma);

  return {
    presets,
    mealSplits: config.mealSplits,
    defaults: {
      minGDay: config.minGDay,
      maxGDay: config.maxGDay,
      mealsPerDay: config.defaultMealsPerDay,
    },
  };
}

// ===========================================
// Admin Operations
// ===========================================

/**
 * Get all presets for admin
 * Returns fallback defaults if DB unavailable
 */
export async function listPresets(
  prisma: PrismaClient
): Promise<AdminPresetsResponse> {
  try {
    const presets = await prisma.proteinPreset.findMany({
      orderBy: [{ trainingLevel: 'asc' }, { goal: 'asc' }],
    });

    if (presets.length > 0) {
      return {
        presets: presets.map((p) => ({
          id: p.id,
          trainingLevel: fromPrismaTrainingLevel(p.trainingLevel),
          goal: fromPrismaGoal(p.goal),
          multiplierGPerKg: Number(p.multiplierGPerKg),
          active: p.active,
          updatedAt: p.updatedAt.toISOString(),
        })),
      };
    }
  } catch {
    console.warn(`[ProteinCalculator] DB unavailable for listPresets, using fallback`);
  }

  // Return fallback presets as admin response
  const fallbackPresets: AdminPresetsResponse = {
    presets: [
      { id: 'fallback-1', trainingLevel: 'none', goal: 'maintain', multiplierGPerKg: 1.0, active: true, updatedAt: new Date().toISOString() },
      { id: 'fallback-2', trainingLevel: 'none', goal: 'lose', multiplierGPerKg: 1.2, active: true, updatedAt: new Date().toISOString() },
      { id: 'fallback-3', trainingLevel: 'none', goal: 'gain', multiplierGPerKg: 1.2, active: true, updatedAt: new Date().toISOString() },
      { id: 'fallback-4', trainingLevel: 'regular', goal: 'maintain', multiplierGPerKg: 1.6, active: true, updatedAt: new Date().toISOString() },
      { id: 'fallback-5', trainingLevel: 'regular', goal: 'lose', multiplierGPerKg: 1.8, active: true, updatedAt: new Date().toISOString() },
      { id: 'fallback-6', trainingLevel: 'regular', goal: 'gain', multiplierGPerKg: 1.8, active: true, updatedAt: new Date().toISOString() },
    ],
  };

  return fallbackPresets;
}

/**
 * Update a preset multiplier
 */
export async function updatePreset(
  prisma: PrismaClient,
  trainingLevel: TrainingLevel,
  goal: ProteinGoal,
  multiplierGPerKg: number
): Promise<ProteinPresetDetail> {
  const preset = await prisma.proteinPreset.upsert({
    where: {
      trainingLevel_goal: {
        trainingLevel: toPrismaTrainingLevel(trainingLevel),
        goal: toPrismaGoal(goal),
      },
    },
    create: {
      trainingLevel: toPrismaTrainingLevel(trainingLevel),
      goal: toPrismaGoal(goal),
      multiplierGPerKg: new Prisma.Decimal(multiplierGPerKg),
      active: true,
    },
    update: {
      multiplierGPerKg: new Prisma.Decimal(multiplierGPerKg),
    },
  });

  return {
    id: preset.id,
    trainingLevel: fromPrismaTrainingLevel(preset.trainingLevel),
    goal: fromPrismaGoal(preset.goal),
    multiplierGPerKg: Number(preset.multiplierGPerKg),
    active: preset.active,
    updatedAt: preset.updatedAt.toISOString(),
  };
}

/**
 * Get admin config
 * Returns fallback defaults if DB unavailable
 */
export async function getAdminConfig(
  prisma: PrismaClient
): Promise<AdminConfigResponse> {
  try {
    let config = await prisma.proteinConfig.findFirst();

    if (!config) {
      // Create default config
      config = await prisma.proteinConfig.create({
        data: {
          minGDay: 60,
          maxGDay: 220,
          defaultMealsPerDay: 3,
          mealSplits: DEFAULT_MEAL_SPLITS,
        },
      });
    }

    return {
      id: config.id,
      minGDay: config.minGDay,
      maxGDay: config.maxGDay,
      defaultMealsPerDay: config.defaultMealsPerDay,
      mealSplits: config.mealSplits as Record<string, number[]>,
      updatedAt: config.updatedAt.toISOString(),
    };
  } catch {
    console.warn(`[ProteinCalculator] DB unavailable for getAdminConfig, using fallback`);
  }

  // Return fallback config
  return {
    id: 'fallback-config',
    minGDay: FALLBACK_CONFIG.minGDay,
    maxGDay: FALLBACK_CONFIG.maxGDay,
    defaultMealsPerDay: FALLBACK_CONFIG.defaultMealsPerDay,
    mealSplits: FALLBACK_CONFIG.mealSplits,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update admin config
 */
export async function updateAdminConfig(
  prisma: PrismaClient,
  updates: {
    minGDay?: number;
    maxGDay?: number;
    defaultMealsPerDay?: number;
    mealSplits?: Record<string, number[]>;
  }
): Promise<AdminConfigResponse> {
  let config = await prisma.proteinConfig.findFirst();

  if (config) {
    config = await prisma.proteinConfig.update({
      where: { id: config.id },
      data: {
        ...(updates.minGDay !== undefined && { minGDay: updates.minGDay }),
        ...(updates.maxGDay !== undefined && { maxGDay: updates.maxGDay }),
        ...(updates.defaultMealsPerDay !== undefined && {
          defaultMealsPerDay: updates.defaultMealsPerDay,
        }),
        ...(updates.mealSplits !== undefined && {
          mealSplits: updates.mealSplits,
        }),
      },
    });
  } else {
    config = await prisma.proteinConfig.create({
      data: {
        minGDay: updates.minGDay ?? 60,
        maxGDay: updates.maxGDay ?? 220,
        defaultMealsPerDay: updates.defaultMealsPerDay ?? 3,
        mealSplits: updates.mealSplits ?? DEFAULT_MEAL_SPLITS,
      },
    });
  }

  return {
    id: config.id,
    minGDay: config.minGDay,
    maxGDay: config.maxGDay,
    defaultMealsPerDay: config.defaultMealsPerDay,
    mealSplits: config.mealSplits as Record<string, number[]>,
    updatedAt: config.updatedAt.toISOString(),
  };
}
