// Zod schemas for AI response validation
// Constitution Principle V: Deterministic JSON Output

import { z } from 'zod';

// Food item schema
export const FoodItemSchema = z.object({
  name: z.string().min(1).max(200),
  portion: z.string().min(1).max(100),
  protein: z.number().nonnegative().max(999.99),
  carbs: z.number().nonnegative().max(999.99).optional(),    // NEW - macro ingredients analysis
  fat: z.number().nonnegative().max(999.99).optional(),      // NEW - macro ingredients analysis
});

export type FoodItem = z.infer<typeof FoodItemSchema>;

// AI Vision analysis response schema
export const AIAnalysisResponseSchema = z.object({
  foods: z.array(FoodItemSchema).min(0).max(50),
  totalProtein: z.number().nonnegative().max(9999.99),
  totalCarbs: z.number().nonnegative().max(9999.99).optional(),      // NEW - macro ingredients analysis
  totalFat: z.number().nonnegative().max(9999.99).optional(),        // NEW - macro ingredients analysis
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});

export type AIAnalysisResponse = z.infer<typeof AIAnalysisResponseSchema>;

// Upload URL request schema
export const UploadUrlRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(8 * 1024 * 1024), // 8MB max
  contentType: z.enum(['image/jpeg', 'image/png', 'image/heic', 'image/webp']),
});

export type UploadUrlRequest = z.infer<typeof UploadUrlRequestSchema>;

// Analyze request schema
export const AnalyzeRequestSchema = z.object({
  blobName: z.string().min(1).max(500),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// Update meal request schema (for corrections)
export const UpdateMealRequestSchema = z.object({
  foods: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(200),
      portion: z.string().min(1).max(100),
      protein: z.number().nonnegative().max(999.99),
      carbs: z.number().nonnegative().max(999.99).optional(),        // NEW - macro ingredients analysis
      fat: z.number().nonnegative().max(999.99).optional(),          // NEW - macro ingredients analysis
    })
  ),
  notes: z.string().optional(),
});

export type UpdateMealRequest = z.infer<typeof UpdateMealRequestSchema>;

// ============================================================================
// Feature 017: Shareable Meal Scans & Diet Style Profiles
// ============================================================================

// Diet style slug validation (lowercase alphanumeric with hyphens)
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// DietStyle schemas
export const DietStyleSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(50).regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens only'),
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  netCarbCapG: z.number().int().nonnegative().max(500).nullable(),
  fatTargetPercent: z.number().int().min(0).max(100).nullable(),
});

export type DietStyle = z.infer<typeof DietStyleSchema>;

// Public diet style response (excludes admin fields)
export const DietStylePublicSchema = DietStyleSchema.pick({
  id: true,
  slug: true,
  name: true,
  description: true,
  netCarbCapG: true,
  fatTargetPercent: true,
});

export type DietStylePublic = z.infer<typeof DietStylePublicSchema>;

// Admin diet style response (includes admin fields)
export const DietStyleAdminSchema = DietStyleSchema.extend({
  isActive: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  userCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DietStyleAdmin = z.infer<typeof DietStyleAdminSchema>;

// Create diet style request (admin)
export const CreateDietStyleRequestSchema = z.object({
  slug: z.string().min(1).max(50).regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens only'),
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  netCarbCapG: z.number().int().nonnegative().max(500).nullable().optional(),
  fatTargetPercent: z.number().int().min(0).max(100).nullable().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().nonnegative().optional().default(0),
});

export type CreateDietStyleRequest = z.infer<typeof CreateDietStyleRequestSchema>;

// Update diet style request (admin) - partial updates
export const UpdateDietStyleRequestSchema = z.object({
  slug: z.string().min(1).max(50).regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens only').optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  netCarbCapG: z.number().int().nonnegative().max(500).nullable().optional(),
  fatTargetPercent: z.number().int().min(0).max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type UpdateDietStyleRequest = z.infer<typeof UpdateDietStyleRequestSchema>;

// User diet style preference update
export const UpdateUserDietStyleRequestSchema = z.object({
  dietStyleId: z.string().uuid().nullable(),
});

export type UpdateUserDietStyleRequest = z.infer<typeof UpdateUserDietStyleRequestSchema>;

// Diet feedback in meal analysis response
export const DietFeedbackSchema = z.object({
  dietStyleName: z.string(),
  warnings: z.array(z.string()),
  tips: z.array(z.string()),
}).nullable();

export type DietFeedback = z.infer<typeof DietFeedbackSchema>;

// Share ID validation (10-char alphanumeric)
export const ShareIdSchema = z.string().length(10).regex(/^[A-Za-z0-9]+$/, 'Invalid share ID format');

// Meal analysis extended response (with shareable fields)
export const MealAnalysisExtendedSchema = z.object({
  mealAnalysisId: z.string().uuid(),
  shareId: ShareIdSchema,
  shareUrl: z.string().url(),
  isPublic: z.boolean(),
  foods: z.array(FoodItemSchema),
  totalProtein: z.number().nonnegative(),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
  dietFeedback: DietFeedbackSchema,
});

export type MealAnalysisExtended = z.infer<typeof MealAnalysisExtendedSchema>;

// Meal history item (extended with shareable fields)
export const MealHistoryItemSchema = z.object({
  id: z.string().uuid(),
  shareId: ShareIdSchema,
  shareUrl: z.string().url().nullable(),
  isPublic: z.boolean(),
  uploadedAt: z.string().datetime(),
  imageUrl: z.string().url(),
  totalProtein: z.number().nonnegative(),
  confidence: z.enum(['high', 'medium', 'low']),
  proTip: z.string().nullable(),
  foods: z.array(FoodItemSchema),
  dietStyleAtScan: z.object({
    slug: z.string(),
    name: z.string(),
  }).nullable(),
});

export type MealHistoryItem = z.infer<typeof MealHistoryItemSchema>;

// Public meal response (for shared view)
export const PublicMealResponseSchema = z.object({
  meal: z.object({
    shareId: ShareIdSchema,
    uploadedAt: z.string().datetime(),
    imageUrl: z.string().url(),
    totalProtein: z.number().nonnegative(),
    confidence: z.enum(['high', 'medium', 'low']),
    proTip: z.string().nullable(),
    foods: z.array(FoodItemSchema),
    dietStyleAtScan: z.object({
      slug: z.string(),
      name: z.string(),
    }).nullable(),
  }),
});

export type PublicMealResponse = z.infer<typeof PublicMealResponseSchema>;

// Meal privacy toggle request
export const UpdateMealPrivacyRequestSchema = z.object({
  isPublic: z.boolean(),
});

export type UpdateMealPrivacyRequest = z.infer<typeof UpdateMealPrivacyRequestSchema>;

// User diet style update request (Feature 017 T029)
export const UserDietStyleUpdateSchema = z.object({
  dietStyleId: z.string().uuid().nullable(), // null to clear diet style
});

export type UserDietStyleUpdate = z.infer<typeof UserDietStyleUpdateSchema>;
