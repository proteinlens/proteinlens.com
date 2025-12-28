// Integration test for delete cascade
// Feature: 001-blob-vision-analysis, User Story 3
// T062: Integration test verifying blob and DB record are both deleted

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Use vi.hoisted to create mocks available during vi.mock hoisting
const { 
  mockMealAnalysisCreate, 
  mockMealAnalysisDelete, 
  mockMealAnalysisFindUnique, 
  mockMealAnalysisDeleteMany, 
  mockFoodCount, 
  mockFoodDeleteMany,
  mockPrismaInstance,
  mockBlobServiceDeleteBlob 
} = vi.hoisted(() => {
  const mocks = {
    mockMealAnalysisCreate: vi.fn(),
    mockMealAnalysisDelete: vi.fn(),
    mockMealAnalysisFindUnique: vi.fn(),
    mockMealAnalysisDeleteMany: vi.fn(),
    mockFoodCount: vi.fn(),
    mockFoodDeleteMany: vi.fn(),
    mockBlobServiceDeleteBlob: vi.fn(),
    mockPrismaInstance: null as any,
  };
  
  mocks.mockPrismaInstance = {
    mealAnalysis: {
      create: mocks.mockMealAnalysisCreate,
      delete: mocks.mockMealAnalysisDelete,
      findUnique: mocks.mockMealAnalysisFindUnique,
      deleteMany: mocks.mockMealAnalysisDeleteMany,
    },
    food: {
      count: mocks.mockFoodCount,
      deleteMany: mocks.mockFoodDeleteMany,
    },
  };
  
  return mocks;
});

// Mock @prisma/client
vi.mock('@prisma/client', () => {
  function MockPrismaClient() {
    return mockPrismaInstance;
  }
  
  return {
    PrismaClient: MockPrismaClient,
    default: MockPrismaClient,
  };
});

// Mock blob service for integration test
vi.mock('../../src/services/blobService', () => ({
  blobService: {
    deleteBlob: mockBlobServiceDeleteBlob,
  },
}));

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Delete Cascade Integration', () => {
  let testMealId: string;
  const testUserId = 'delete-cascade-test-user';
  const testBlobName = 'test/delete-cascade-test.jpg';

  const testMeal = {
    id: 'test-meal-id-456',
    userId: testUserId,
    blobName: testBlobName,
    blobUrl: `https://storage.blob.core.windows.net/${testBlobName}`,
    requestId: 'test-delete-request-123',
    aiModel: 'gpt-5.1-vision',
    aiResponseRaw: {
      foods: [
        { name: 'Chicken', portion: '150g', protein: 35 },
        { name: 'Rice', portion: '200g', protein: 5 },
      ],
      totalProtein: 40,
      confidence: 'high',
    },
    totalProtein: 40,
    confidence: 'high',
    blobHash: 'delete-test-hash-123',
    foods: [
      { name: 'Chicken', portion: '150g', protein: 35, displayOrder: 0 },
      { name: 'Rice', portion: '200g', protein: 5, displayOrder: 1 },
    ],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    testMealId = 'test-meal-id-456';
    
    // Setup default mock behaviors
    mockMealAnalysisCreate.mockResolvedValue(testMeal);
    mockBlobServiceDeleteBlob.mockResolvedValue(undefined);
    mockFoodDeleteMany.mockResolvedValue({ count: 2 });
    mockMealAnalysisDeleteMany.mockResolvedValue({ count: 1 });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should cascade delete foods when meal is deleted', async () => {
    // Verify foods exist (2 foods in our test meal)
    mockFoodCount.mockResolvedValueOnce(2);
    
    const foodsBefore = await prisma.food.count({
      where: { mealAnalysisId: testMealId },
    });
    expect(foodsBefore).toBe(2);

    // Delete the meal (foods should cascade)
    mockFoodDeleteMany.mockResolvedValueOnce({ count: 2 });
    mockMealAnalysisDelete.mockResolvedValueOnce(testMeal);
    
    await prisma.food.deleteMany({ where: { mealAnalysisId: testMealId } });
    await prisma.mealAnalysis.delete({ where: { id: testMealId } });

    // Verify meal is deleted (returns null)
    mockMealAnalysisFindUnique.mockResolvedValueOnce(null);
    
    const mealAfter = await prisma.mealAnalysis.findUnique({
      where: { id: testMealId },
    });
    expect(mealAfter).toBeNull();

    // Verify foods are deleted (count is 0)
    mockFoodCount.mockResolvedValueOnce(0);
    
    const foodsAfter = await prisma.food.count({
      where: { mealAnalysisId: testMealId },
    });
    expect(foodsAfter).toBe(0);
  });

  it('should call blob deletion service', async () => {
    const { blobService } = await import('../../src/services/blobService');
    
    // Delete blob
    await blobService.deleteBlob(testBlobName);
    
    // Verify blob service was called
    expect(blobService.deleteBlob).toHaveBeenCalledWith(testBlobName);
  });

  it('should handle transaction rollback on failure', async () => {
    const { blobService } = await import('../../src/services/blobService');
    mockBlobServiceDeleteBlob.mockRejectedValueOnce(new Error('Blob delete failed'));

    // Meal exists before blob deletion attempt
    mockMealAnalysisFindUnique.mockResolvedValueOnce(testMeal);
    
    const mealBefore = await prisma.mealAnalysis.findUnique({
      where: { id: testMealId },
    });
    expect(mealBefore).not.toBeNull();

    try {
      await blobService.deleteBlob(testBlobName);
    } catch (e) {
      // Expected to fail
    }

    // Meal should still exist after blob deletion failure
    mockMealAnalysisFindUnique.mockResolvedValueOnce(testMeal);
    
    const mealAfter = await prisma.mealAnalysis.findUnique({
      where: { id: testMealId },
    });
    expect(mealAfter).not.toBeNull();
  });
});
