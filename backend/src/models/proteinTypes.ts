/**
 * Protein Calculator Types (Feature 015)
 * 
 * Zod schemas for request/response validation
 */

import { z } from 'zod';

// ===========================================
// Enums (matching Prisma enums)
// ===========================================

export const TrainingLevelSchema = z.enum(['none', 'regular']);
export type TrainingLevel = z.infer<typeof TrainingLevelSchema>;

export const ProteinGoalSchema = z.enum(['maintain', 'lose', 'gain']);
export type ProteinGoal = z.infer<typeof ProteinGoalSchema>;

export const WeightUnitSchema = z.enum(['kg', 'lbs']);
export type WeightUnit = z.infer<typeof WeightUnitSchema>;

// ===========================================
// Request Schemas
// ===========================================

/**
 * POST /api/protein/calculate
 * Calculate protein targets (anonymous or authenticated)
 */
export const CalculateProteinRequestSchema = z.object({
  weightKg: z
    .number()
    .min(1, 'Weight must be at least 1 kg')
    .max(500, 'Weight must be at most 500 kg'),
  trainingLevel: TrainingLevelSchema,
  goal: ProteinGoalSchema,
  mealsPerDay: z
    .number()
    .int()
    .min(2, 'Minimum 2 meals per day')
    .max(5, 'Maximum 5 meals per day')
    .default(3),
});

export type CalculateProteinRequest = z.infer<typeof CalculateProteinRequestSchema>;

/**
 * POST /api/protein/profile
 * Save protein profile (authenticated only)
 */
export const SaveProteinProfileRequestSchema = z.object({
  weightKg: z
    .number()
    .min(1, 'Weight must be at least 1 kg')
    .max(500, 'Weight must be at most 500 kg'),
  weightUnit: WeightUnitSchema.optional().default('kg'),
  trainingLevel: TrainingLevelSchema,
  goal: ProteinGoalSchema,
  mealsPerDay: z
    .number()
    .int()
    .min(2, 'Minimum 2 meals per day')
    .max(5, 'Maximum 5 meals per day')
    .default(3),
});

export type SaveProteinProfileRequest = z.infer<typeof SaveProteinProfileRequestSchema>;

/**
 * PUT /api/dashboard/protein/presets
 * Update protein preset (admin only)
 */
export const UpdatePresetRequestSchema = z.object({
  trainingLevel: TrainingLevelSchema,
  goal: ProteinGoalSchema,
  multiplierGPerKg: z
    .number()
    .min(0.1, 'Multiplier must be at least 0.1')
    .max(3.0, 'Multiplier must be at most 3.0'),
});

export type UpdatePresetRequest = z.infer<typeof UpdatePresetRequestSchema>;

/**
 * PUT /api/dashboard/protein/config
 * Update protein config (admin only)
 */
export const UpdateConfigRequestSchema = z.object({
  minGDay: z
    .number()
    .int()
    .min(30, 'Minimum daily must be at least 30g')
    .max(100, 'Minimum daily must be at most 100g')
    .optional(),
  maxGDay: z
    .number()
    .int()
    .min(150, 'Maximum daily must be at least 150g')
    .max(300, 'Maximum daily must be at most 300g')
    .optional(),
  defaultMealsPerDay: z
    .number()
    .int()
    .min(2, 'Default meals must be at least 2')
    .max(5, 'Default meals must be at most 5')
    .optional(),
  mealSplits: z
    .record(
      z.string(), // "2", "3", "4", "5"
      z.array(z.number().min(0).max(1))
    )
    .optional(),
});

export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>;

// ===========================================
// Response Types
// ===========================================

/**
 * Protein target calculation result
 */
export interface ProteinTargetResponse {
  proteinTargetG: number;       // Daily target in grams (rounded to 5)
  perMealTargetsG: number[];    // Per-meal targets
  multiplierUsed: number;       // The g/kg multiplier used
  lowMealWarning?: boolean;     // True if any meal < 20g
}

/**
 * User's protein profile with calculated target
 */
export interface ProteinProfileResponse {
  profile: {
    id: string;
    weightKg: number;
    weightUnit: WeightUnit;
    trainingLevel: TrainingLevel;
    goal: ProteinGoal;
    mealsPerDay: number;
    updatedAt: string;
  };
  target: ProteinTargetResponse;
}

/**
 * Public configuration (presets + meal splits)
 */
export interface ProteinConfigResponse {
  presets: {
    [trainingLevel: string]: {
      [goal: string]: number;  // multiplier
    };
  };
  mealSplits: {
    [meals: string]: number[];  // "2": [0.45, 0.55]
  };
  defaults: {
    minGDay: number;
    maxGDay: number;
    mealsPerDay: number;
  };
}

/**
 * Preset detail (admin view)
 */
export interface ProteinPresetDetail {
  id: string;
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  multiplierGPerKg: number;
  active: boolean;
  updatedAt: string;
}

/**
 * Admin presets list response
 */
export interface AdminPresetsResponse {
  presets: ProteinPresetDetail[];
}

/**
 * Admin config response
 */
export interface AdminConfigResponse {
  id: string;
  minGDay: number;
  maxGDay: number;
  defaultMealsPerDay: number;
  mealSplits: {
    [meals: string]: number[];
  };
  updatedAt: string;
}

// ===========================================
// localStorage Schema (for anonymous users)
// ===========================================

export const LocalProteinProfileSchema = z.object({
  version: z.literal(1),
  weightKg: z.number(),
  weightUnit: WeightUnitSchema,
  trainingLevel: TrainingLevelSchema,
  goal: ProteinGoalSchema,
  mealsPerDay: z.number().int().min(2).max(5),
  proteinTargetG: z.number(),
  perMealTargetsG: z.array(z.number()),
  multiplierUsed: z.number(),
  calculatedAt: z.string(),  // ISO 8601
});

export type LocalProteinProfile = z.infer<typeof LocalProteinProfileSchema>;

// ===========================================
// Error Response
// ===========================================

export interface ProteinErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// ===========================================
// Mapper helpers (Prisma enum <-> API string)
// ===========================================

export function toPrismaTrainingLevel(level: TrainingLevel): 'NONE' | 'REGULAR' {
  return level.toUpperCase() as 'NONE' | 'REGULAR';
}

export function fromPrismaTrainingLevel(level: 'NONE' | 'REGULAR'): TrainingLevel {
  return level.toLowerCase() as TrainingLevel;
}

export function toPrismaGoal(goal: ProteinGoal): 'MAINTAIN' | 'LOSE' | 'GAIN' {
  return goal.toUpperCase() as 'MAINTAIN' | 'LOSE' | 'GAIN';
}

export function fromPrismaGoal(goal: 'MAINTAIN' | 'LOSE' | 'GAIN'): ProteinGoal {
  return goal.toLowerCase() as ProteinGoal;
}

export function toPrismaWeightUnit(unit: WeightUnit): 'KG' | 'LBS' {
  return unit.toUpperCase() as 'KG' | 'LBS';
}

export function fromPrismaWeightUnit(unit: 'KG' | 'LBS'): WeightUnit {
  return unit.toLowerCase() as WeightUnit;
}
