// Contract test for DELETE /api/meals/:id
// Feature: 001-blob-vision-analysis, User Story 3
// T061: Contract test for meal deletion

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpRequest, InvocationContext } from '@azure/functions';

// Use vi.hoisted to create mocks available during vi.mock hoisting
const { 
  mockMealAnalysisFindUnique, 
  mockMealAnalysisDelete, 
  mockFoodDeleteMany,
  mockBlobServiceDeleteBlob,
  mockTransaction,
  mockPrismaInstance
} = vi.hoisted(() => {
  const mocks = {
    mockMealAnalysisFindUnique: vi.fn(),
    mockMealAnalysisDelete: vi.fn(),
    mockFoodDeleteMany: vi.fn(),
    mockBlobServiceDeleteBlob: vi.fn(),
    mockTransaction: vi.fn(),
    mockPrismaInstance: null as any,
  };
  
  mocks.mockPrismaInstance = {
    mealAnalysis: {
      findUnique: mocks.mockMealAnalysisFindUnique,
      delete: mocks.mockMealAnalysisDelete,
    },
    food: {
      deleteMany: mocks.mockFoodDeleteMany,
    },
    $transaction: mocks.mockTransaction,
  };
  
  return mocks;
});

// Mock the prisma utility module that functions actually use
vi.mock('../../src/utils/prisma.js', () => ({
  getPrismaClient: () => mockPrismaInstance,
  Plan: { FREE: 'FREE', PRO: 'PRO' },
}));

vi.mock('../../src/services/blobService', () => ({
  blobService: {
    deleteBlob: mockBlobServiceDeleteBlob,
  },
}));

describe('DELETE /api/meals/:id', () => {
  let mockContext: InvocationContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as unknown as InvocationContext;
    
    // Default mock behaviors
    mockBlobServiceDeleteBlob.mockResolvedValue(undefined);
    // Transaction mock - execute the callback passed to it
    mockTransaction.mockImplementation(async (callback: any) => {
      return callback(mockPrismaInstance);
    });
  });

  it('should return 204 No Content on successful deletion', async () => {
    const { deleteMeal } = await import('../../src/functions/delete-meal');

    const mockMeal = {
      id: 'meal-123',
      userId: 'user-123',
      blobName: 'meals/user-123/photo.jpg',
    };

    mockMealAnalysisFindUnique.mockResolvedValue(mockMeal);
    mockMealAnalysisDelete.mockResolvedValue(mockMeal);
    mockFoodDeleteMany.mockResolvedValue({ count: 2 });

    const request = {
      params: { id: 'meal-123' },
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await deleteMeal(request, mockContext);

    expect(response.status).toBe(204);
  });

  it('should return 404 when meal not found', async () => {
    const { deleteMeal } = await import('../../src/functions/delete-meal');

    mockMealAnalysisFindUnique.mockResolvedValue(null);

    const request = {
      params: { id: 'nonexistent-meal' },
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await deleteMeal(request, mockContext);

    expect(response.status).toBe(404);
    expect(response.jsonBody).toHaveProperty('error', 'Not Found');
  });

  it('should return 403 when user does not own the meal', async () => {
    const { deleteMeal } = await import('../../src/functions/delete-meal');

    mockMealAnalysisFindUnique.mockResolvedValue({
      id: 'meal-123',
      userId: 'other-user', // Different user
      blobName: 'meals/other-user/photo.jpg',
    });

    const request = {
      params: { id: 'meal-123' },
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await deleteMeal(request, mockContext);

    expect(response.status).toBe(403);
  });

  it('should return 401 when no user ID provided', async () => {
    const { deleteMeal } = await import('../../src/functions/delete-meal');

    const request = {
      params: { id: 'meal-123' },
      headers: new Map(),
    } as unknown as HttpRequest;

    const response = await deleteMeal(request, mockContext);

    expect(response.status).toBe(401);
  });
});
