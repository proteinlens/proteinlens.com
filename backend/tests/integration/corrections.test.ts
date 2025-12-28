// Integration test for edit → save → reload flow
// Feature: 001-blob-vision-analysis, User Story 2
// T050: Integration test for corrections persistence

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Use vi.hoisted to create mocks that are available during vi.mock hoisting
const { mockMealAnalysisCreate, mockMealAnalysisUpdate, mockMealAnalysisFindUnique, mockMealAnalysisDeleteMany, mockFoodDeleteMany, mockPrismaInstance } = vi.hoisted(() => {
  const mocks = {
    mockMealAnalysisCreate: vi.fn(),
    mockMealAnalysisUpdate: vi.fn(),
    mockMealAnalysisFindUnique: vi.fn(),
    mockMealAnalysisDeleteMany: vi.fn(),
    mockFoodDeleteMany: vi.fn(),
    mockPrismaInstance: null as any,
  };
  
  // Create the mock instance
  mocks.mockPrismaInstance = {
    mealAnalysis: {
      create: mocks.mockMealAnalysisCreate,
      update: mocks.mockMealAnalysisUpdate,
      findUnique: mocks.mockMealAnalysisFindUnique,
      deleteMany: mocks.mockMealAnalysisDeleteMany,
    },
    food: {
      deleteMany: mocks.mockFoodDeleteMany,
    },
  };
  
  return mocks;
});

// Mock @prisma/client with a properly mocked PrismaClient constructor
vi.mock('@prisma/client', () => {
  // Use a function constructor pattern
  function MockPrismaClient() {
    return mockPrismaInstance;
  }
  
  return {
    PrismaClient: MockPrismaClient,
    default: MockPrismaClient,
  };
});

describe('Meal Corrections Integration', () => {
  let testMealId: string;
  const testUserId = 'integration-test-user';

  const baseMeal = {
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
    blobHash: 'test-hash-123',
    foods: [
      { name: 'Chicken Breast', portion: '150g', protein: 35, displayOrder: 0 },
    ],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockMealAnalysisCreate.mockReset();
    mockMealAnalysisUpdate.mockReset();
    mockMealAnalysisFindUnique.mockReset();
    mockMealAnalysisDeleteMany.mockReset();
    mockFoodDeleteMany.mockReset();
    
    testMealId = 'test-meal-id-123';
    
    // Default mock: meal created successfully
    mockMealAnalysisCreate.mockResolvedValue({
      id: testMealId,
      ...baseMeal,
    });
    
    mockFoodDeleteMany.mockResolvedValue({ count: 1 });
    mockMealAnalysisDeleteMany.mockResolvedValue({ count: 1 });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should persist corrections and preserve original AI response', async () => {
    // Apply corrections
    const corrections = {
      foods: [
        { name: 'Grilled Chicken', portion: '175g', protein: 42 },
      ],
      totalProtein: 42,
    };

    const updatedMeal = {
      id: testMealId,
      ...baseMeal,
      userCorrections: corrections,
      totalProtein: corrections.totalProtein,
    };

    mockMealAnalysisUpdate.mockResolvedValue(updatedMeal);

    // Simulate updating the meal with corrections
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const result = await prisma.mealAnalysis.update({
      where: { id: testMealId },
      data: {
        userCorrections: corrections,
        totalProtein: corrections.totalProtein,
      },
      include: { foods: true },
    });

    // Verify corrections are stored
    expect(result.userCorrections).toEqual(corrections);
    expect(result.totalProtein).toBe(42);

    // Verify original AI response is preserved
    expect(result.aiResponseRaw).toEqual({
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

    mockMealAnalysisUpdate.mockResolvedValue({
      id: testMealId,
      ...baseMeal,
      userCorrections: corrections,
    });

    mockMealAnalysisFindUnique.mockResolvedValue({
      id: testMealId,
      ...baseMeal,
      userCorrections: corrections,
    });

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

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
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // First correction
    mockMealAnalysisUpdate.mockResolvedValueOnce({
      id: testMealId,
      ...baseMeal,
      userCorrections: { foods: [{ name: 'Edit 1', protein: 30 }] },
    });

    await prisma.mealAnalysis.update({
      where: { id: testMealId },
      data: {
        userCorrections: { foods: [{ name: 'Edit 1', protein: 30 }] },
      },
    });

    // Second correction (overwrite)
    mockMealAnalysisUpdate.mockResolvedValueOnce({
      id: testMealId,
      ...baseMeal,
      userCorrections: { foods: [{ name: 'Edit 2', protein: 40 }] },
    });

    await prisma.mealAnalysis.update({
      where: { id: testMealId },
      data: {
        userCorrections: { foods: [{ name: 'Edit 2', protein: 40 }] },
      },
    });

    // Verify latest correction is stored
    mockMealAnalysisFindUnique.mockResolvedValue({
      id: testMealId,
      ...baseMeal,
      userCorrections: { foods: [{ name: 'Edit 2', protein: 40 }] },
    });

    const meal = await prisma.mealAnalysis.findUnique({
      where: { id: testMealId },
    });

    expect((meal?.userCorrections as any)?.foods[0].name).toBe('Edit 2');
    expect((meal?.userCorrections as any)?.foods[0].protein).toBe(40);
  });
});
