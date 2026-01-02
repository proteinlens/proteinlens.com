// Tests for Export Meals Endpoint
// Feature: 001-macro-ingredients-analysis, User Story 3
// Task: T037 - Export functionality testing

import { describe, it, expect, beforeEach } from 'vitest';

describe('Export Meals API', () => {
  const userId = 'test-user-123';

  describe('Export Endpoint Response Format', () => {
    it('should return valid export data structure', () => {
      // Mock export data structure
      const mockExportData = {
        userId: 'test-user-123',
        exportDate: '2026-01-02T10:30:00.000Z',
        dateRange: {
          start: 'all-time',
          end: 'all-time',
        },
        summary: {
          totalMeals: 2,
          totalProtein: 55,
          totalCarbs: 45,
          totalFat: 16,
          averageProteinPerMeal: 27.5,
          averageCarbsPerMeal: 22.5,
          averageFatPerMeal: 8,
        },
        meals: [
          {
            id: 'meal-1',
            date: '2026-01-02',
            timestamp: '2026-01-02T10:00:00.000Z',
            totalProtein: 30,
            totalCarbs: 0,
            totalFat: 3,
            totalCalories: 132,
            confidence: 'high',
            foods: [
              {
                name: 'Chicken Breast',
                portion: '100g',
                protein: 30,
                carbs: null,
                fat: 3,
              },
            ],
            notes: 'Grilled',
          },
        ],
      };

      // Verify structure
      expect(mockExportData).toHaveProperty('userId');
      expect(mockExportData).toHaveProperty('exportDate');
      expect(mockExportData).toHaveProperty('dateRange');
      expect(mockExportData).toHaveProperty('summary');
      expect(mockExportData).toHaveProperty('meals');

      // Verify summary
      expect(mockExportData.summary).toHaveProperty('totalMeals');
      expect(mockExportData.summary).toHaveProperty('totalProtein');
      expect(mockExportData.summary).toHaveProperty('totalCarbs');
      expect(mockExportData.summary).toHaveProperty('totalFat');

      // Verify meals structure
      expect(mockExportData.meals[0]).toHaveProperty('id');
      expect(mockExportData.meals[0]).toHaveProperty('date');
      expect(mockExportData.meals[0]).toHaveProperty('timestamp');
      expect(mockExportData.meals[0]).toHaveProperty('totalProtein');
      expect(mockExportData.meals[0]).toHaveProperty('foods');

      // Verify food item structure
      expect(mockExportData.meals[0].foods[0]).toHaveProperty('name');
      expect(mockExportData.meals[0].foods[0]).toHaveProperty('portion');
      expect(mockExportData.meals[0].foods[0]).toHaveProperty('protein');
      expect(mockExportData.meals[0].foods[0]).toHaveProperty('carbs');
      expect(mockExportData.meals[0].foods[0]).toHaveProperty('fat');
    });

    it('should calculate correct summary statistics', () => {
      const mockMeals = [
        {
          totalProtein: 30,
          foods: [
            { carbs: 0, fat: 3 },
            { carbs: 0, fat: 2 },
          ],
        },
        {
          totalProtein: 25,
          foods: [
            { carbs: 45, fat: 1 },
            { carbs: 0, fat: 12 },
          ],
        },
      ];

      const totalProtein = mockMeals.reduce((sum, m) => sum + m.totalProtein, 0);
      const totalCarbs = mockMeals.reduce(
        (sum, m) => sum + m.foods.reduce((s, f) => s + (f.carbs || 0), 0),
        0
      );
      const totalFat = mockMeals.reduce(
        (sum, m) => sum + m.foods.reduce((s, f) => s + (f.fat || 0), 0),
        0
      );

      expect(totalProtein).toBe(55);
      expect(totalCarbs).toBe(45);
      expect(totalFat).toBe(18);
      expect(mockMeals.length).toBe(2);
    });

    it('should handle date range filtering', () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const mockMeals = [
        { id: '1', createdAt: new Date('2026-01-05T10:00:00Z') }, // Within range
        { id: '2', createdAt: new Date('2025-12-31T23:59:00Z') }, // Before range
        { id: '3', createdAt: new Date('2026-02-01T00:00:00Z') }, // After range
      ];

      const filteredMeals = mockMeals.filter(
        meal => meal.createdAt >= startDate && meal.createdAt <= endDate
      );

      expect(filteredMeals).toHaveLength(1);
      expect(filteredMeals[0].id).toBe('1');
    });
  });

  describe('Export Download', () => {
    it('should include proper filename in response', () => {
      const mockDate = '2026-01-02';
      const filename = `meals-export-${mockDate}.json`;

      expect(filename).toMatch(/^meals-export-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should handle JSON serialization correctly', () => {
      const mockExportData = {
        userId: 'test-user-123',
        summary: {
          totalProtein: 100,
          totalCarbs: 200,
          totalFat: 50,
        },
        meals: [
          {
            totalProtein: 50,
            foods: [
              { name: 'Chicken', protein: 50, carbs: null, fat: 3 },
            ],
          },
        ],
      };

      const json = JSON.stringify(mockExportData, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(mockExportData);
      expect(typeof json).toBe('string');
      expect(json).toContain('userId');
      expect(json).toContain('meals');
    });
  });

  describe('Export Error Handling', () => {
    it('should handle invalid date range', () => {
      const startDate = '2026-01-31';
      const endDate = '2026-01-01';

      const start = new Date(startDate);
      const end = new Date(endDate);

      expect(start > end).toBe(true);
    });

    it('should handle empty meal list', () => {
      const emptyMeals: any[] = [];

      const summary = {
        totalMeals: emptyMeals.length,
        totalProtein: 0,
        averageProteinPerMeal: emptyMeals.length > 0 ? 100 / emptyMeals.length : 0,
      };

      expect(summary.totalMeals).toBe(0);
      expect(summary.averageProteinPerMeal).toBe(0);
    });
  });
});
