// Zod schemas for AI response validation
// Constitution Principle V: Deterministic JSON Output

import { z } from 'zod';

// Food item schema
export const FoodItemSchema = z.object({
  name: z.string().min(1).max(200),
  portion: z.string().min(1).max(100),
  protein: z.number().nonnegative().max(999.99),
});

export type FoodItem = z.infer<typeof FoodItemSchema>;

// AI Vision analysis response schema
export const AIAnalysisResponseSchema = z.object({
  foods: z.array(FoodItemSchema).min(0).max(50),
  totalProtein: z.number().nonnegative().max(9999.99),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});

export type AIAnalysisResponse = z.infer<typeof AIAnalysisResponseSchema>;

// Upload URL request schema
export const UploadUrlRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(8 * 1024 * 1024), // 8MB max
  contentType: z.enum(['image/jpeg', 'image/png', 'image/heic']),
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
    })
  ),
  notes: z.string().optional(),
});

export type UpdateMealRequest = z.infer<typeof UpdateMealRequestSchema>;
