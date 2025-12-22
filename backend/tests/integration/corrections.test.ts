// Integration test for edit → save → reload flow
// Feature: 001-blob-vision-analysis, User Story 2
// T050: Integration test for corrections persistence

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Use a test database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

describe('Meal Corrections Integration', () => {
  let testMealId: string;
  const testUserId = 'integration-test-user';

  beforeEach(async () => {
    // Create a test meal
    const meal = await prisma.mealAnalysis.create({
      data: {
        userId: testUserId,
        blobName: 'test/integration-test.jpg',
        blobUrl: 'https://storage.blob.core.windows.net/test/integration-test.jpg',
        requestId: 'test-request-123',
        aiModel: 'gpt-5.1-vision',
        aiResponseRaw: {
          foods: [{ name: 'Chicken Breast', portion: '150g', protein: 35 }],
          totalProtein: 35,
          confidence: 'high',
        },
        totalProtein: 35,
        confidence: 'high',
        blobHash: 'test-hash-' + Date.now(),
        foods: {
          create: [
            { name: 'Chicken Breast', portion: '150g', protein: 35, displayOrder: 0 },
          ],
        },
      },
    });
    testMealId = meal.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await prisma.food.deleteMany({ where: { mealAnalysis: { userId: testUserId } } });
    await prisma.mealAnalysis.deleteMany({ where: { userId: testUserId } });
  });

  it('should persist corrections and preserve original AI response', async () => {
    // Apply corrections
    const corrections = {
      foods: [
        { name: 'Grilled Chicken', portion: '175g', protein: 42 },
      ],
      totalProtein: 42,
    };

    const updatedMeal = await prisma.mealAnalysis.update({
      where: { id: testMealId },
      data: {
        userCorrections: corrections,
        totalProtein: corrections.totalProtein,
      },
      include: { foods: true },
    });

    // Verify corrections are stored
    expect(updatedMeal.userCorrections).toEqual(corrections);
    expect(updatedMeal.totalProtein).toBe(42);

    // Verify original AI response is preserved
    expect(updatedMeal.aiResponseRaw).toEqual({
      foods: [{ name: 'Chicken Breast', portion: '150g', protein: 35 }],
      totalProtein: 35,
      confidence: 'high',
    });
  });

  it('should reload meal with corrections applied', async () => {
    // Apply corrections
    const corrections = {
      foods: [
        { name: 'Grilled Chicken', portion: '175g', protein: 42 },
      ],
    };

    await prisma.mealAnalysis.update({
      where: { id: testMealId },
      data: { userCorrections: corrections },
    });

    // Reload the meal
    const reloadedMeal = await prisma.mealAnalysis.findUnique({
      where: { id: testMealId },
      include: { foods: true },
    });

    // Verify corrections persist
    expect(reloadedMeal?.userCorrections).toEqual(corrections);
  });

  it('should handle multiple corrections overwrites', async () => {
    // First correction
    await prisma.mealAnalysis.update({
      where: { id: testMealId },
      data: {
        userCorrections: { foods: [{ name: 'Edit 1', protein: 30 }] },
      },
    });

    // Second correction (overwrite)
    await prisma.mealAnalysis.update({
      where: { id: testMealId },
      data: {
        userCorrections: { foods: [{ name: 'Edit 2', protein: 40 }] },
      },
    });

    // Verify latest correction is stored
    const meal = await prisma.mealAnalysis.findUnique({
      where: { id: testMealId },
    });

    expect((meal?.userCorrections as any)?.foods[0].name).toBe('Edit 2');
    expect((meal?.userCorrections as any)?.foods[0].protein).toBe(40);
  });
});
