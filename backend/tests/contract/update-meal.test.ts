// Contract test for PATCH /api/meals/:id
// Feature: 001-blob-vision-analysis, User Story 2
// T049: Contract test for updating meal corrections

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpRequest, InvocationContext } from '@azure/functions';

// Use vi.hoisted to create mocks available during vi.mock hoisting
const { 
  mockMealAnalysisFindUnique, 
  mockMealAnalysisUpdate, 
  mockPrismaInstance
} = vi.hoisted(() => {
  const mocks = {
    mockMealAnalysisFindUnique: vi.fn(),
    mockMealAnalysisUpdate: vi.fn(),
    mockPrismaInstance: null as any,
  };
  
  mocks.mockPrismaInstance = {
    mealAnalysis: {
      findUnique: mocks.mockMealAnalysisFindUnique,
      update: mocks.mockMealAnalysisUpdate,
    },
  };
  
  return mocks;
});

// Mock the prisma utility module that functions actually use
vi.mock('../../src/utils/prisma.js', () => ({
  getPrismaClient: () => mockPrismaInstance,
  Plan: { FREE: 'FREE', PRO: 'PRO' },
}));

describe('PATCH /api/meals/:id', () => {
  let mockContext: InvocationContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as unknown as InvocationContext;
  });

  it('should return 200 with updated meal on valid correction', async () => {
    const { updateMeal } = await import('../../src/functions/update-meal');

    const mockMeal = {
      id: 'meal-123',
      userId: 'user-123',
      totalProtein: 35,
      confidence: 'high',
      foods: [
        { id: 'food-1', name: 'Chicken', portion: '150g', protein: 35 },
      ],
    };

    mockMealAnalysisFindUnique.mockResolvedValue(mockMeal);
    mockMealAnalysisUpdate.mockResolvedValue({
      ...mockMeal,
      userCorrections: { foods: [{ name: 'Grilled Chicken', protein: 40 }] },
      totalProtein: 40,
    });

    const request = {
      params: { id: 'meal-123' },
      json: vi.fn().mockResolvedValue({
        corrections: {
          foods: [{ name: 'Grilled Chicken', portion: '150g', protein: 40 }],
        },
      }),
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await updateMeal(request, mockContext);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toHaveProperty('id', 'meal-123');
  });

  it('should return 404 when meal not found', async () => {
    const { updateMeal } = await import('../../src/functions/update-meal');

    mockMealAnalysisFindUnique.mockResolvedValue(null);

    const request = {
      params: { id: 'nonexistent-meal' },
      json: vi.fn().mockResolvedValue({
        corrections: { foods: [] },
      }),
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await updateMeal(request, mockContext);

    expect(response.status).toBe(404);
    expect(response.jsonBody).toHaveProperty('error', 'Not Found');
  });

  it('should return 400 when corrections are invalid', async () => {
    const { updateMeal } = await import('../../src/functions/update-meal');

    const request = {
      params: { id: 'meal-123' },
      json: vi.fn().mockResolvedValue({
        corrections: {
          foods: [{ name: '', protein: -5 }], // Invalid: empty name, negative protein
        },
      }),
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await updateMeal(request, mockContext);

    expect(response.status).toBe(400);
    expect(response.jsonBody).toHaveProperty('error');
  });

  it('should return 403 when user does not own the meal', async () => {
    const { updateMeal } = await import('../../src/functions/update-meal');

    mockMealAnalysisFindUnique.mockResolvedValue({
      id: 'meal-123',
      userId: 'other-user', // Different user
    });

    const request = {
      params: { id: 'meal-123' },
      json: vi.fn().mockResolvedValue({
        corrections: { foods: [] },
      }),
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await updateMeal(request, mockContext);

    expect(response.status).toBe(403);
  });
});
