// Unit tests for AI response JSON schema validation
// T023: Test Zod schema validation for AI responses

import { describe, it, expect } from '@jest/globals';
import { AIAnalysisResponseSchema, FoodItemSchema } from '../../src/models/schemas';
import type { AIAnalysisResponse } from '../../src/models/schemas';

describe('AI Response Schema Validation', () => {
  describe('FoodItemSchema', () => {
    it('should validate correct food item', () => {
      const validFood = {
        name: 'Grilled Chicken Breast',
        portion: '200g',
        protein: 46.0,
      };
      
      const result = FoodItemSchema.safeParse(validFood);
      expect(result.success).toBe(true);
    });

    it('should reject food with missing fields', () => {
      const invalidFood = {
        name: 'Chicken',
        // missing portion and protein
      };
      
      const result = FoodItemSchema.safeParse(invalidFood);
      expect(result.success).toBe(false);
    });

    it('should reject negative protein values', () => {
      const invalidFood = {
        name: 'Test Food',
        portion: '100g',
        protein: -5,
      };
      
      const result = FoodItemSchema.safeParse(invalidFood);
      expect(result.success).toBe(false);
    });

    it('should reject excessively long names', () => {
      const invalidFood = {
        name: 'A'.repeat(201), // Max is 200
        portion: '100g',
        protein: 10,
      };
      
      const result = FoodItemSchema.safeParse(invalidFood);
      expect(result.success).toBe(false);
    });
  });

  describe('AIAnalysisResponseSchema', () => {
    it('should validate complete valid response', () => {
      const validResponse: AIAnalysisResponse = {
        foods: [
          {
            name: 'Grilled Chicken',
            portion: '200g',
            protein: 46.0,
          },
          {
            name: 'Brown Rice',
            portion: '1 cup',
            protein: 5.0,
          },
        ],
        totalProtein: 51.0,
        confidence: 'high',
        notes: 'Clear image with good lighting',
      };
      
      const result = AIAnalysisResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.foods).toHaveLength(2);
        expect(result.data.totalProtein).toBe(51.0);
      }
    });

    it('should validate response without optional notes', () => {
      const validResponse = {
        foods: [{ name: 'Egg', portion: '1 large', protein: 6.0 }],
        totalProtein: 6.0,
        confidence: 'medium',
      };
      
      const result = AIAnalysisResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate empty foods array', () => {
      const validResponse = {
        foods: [],
        totalProtein: 0,
        confidence: 'low',
        notes: 'No recognizable food items',
      };
      
      const result = AIAnalysisResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid confidence levels', () => {
      const invalidResponse = {
        foods: [],
        totalProtein: 0,
        confidence: 'very-high', // Only high/medium/low allowed
      };
      
      const result = AIAnalysisResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject negative total protein', () => {
      const invalidResponse = {
        foods: [],
        totalProtein: -10,
        confidence: 'low',
      };
      
      const result = AIAnalysisResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject excessive total protein', () => {
      const invalidResponse = {
        foods: [],
        totalProtein: 10000, // Over 9999.99 max
        confidence: 'high',
      };
      
      const result = AIAnalysisResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject too many food items', () => {
      const manyFoods = Array(51).fill({
        name: 'Food',
        portion: '100g',
        protein: 10,
      });
      
      const invalidResponse = {
        foods: manyFoods,
        totalProtein: 510,
        confidence: 'high',
      };
      
      const result = AIAnalysisResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });
});
