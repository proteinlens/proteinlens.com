// Contract test for DELETE /api/meals/:id
// Feature: 001-blob-vision-analysis, User Story 3
// T061: Contract test for meal deletion

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpRequest, InvocationContext } from '@azure/functions';

// Mock services
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    mealAnalysis: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    food: {
      deleteMany: vi.fn(),
    },
  })),
}));

vi.mock('../../src/services/blobService', () => ({
  blobService: {
    deleteBlob: vi.fn().mockResolvedValue(undefined),
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
  });

  it('should return 204 No Content on successful deletion', async () => {
    const { deleteMeal } = await import('../../src/functions/delete-meal');
    const { PrismaClient } = await import('@prisma/client');

    const mockMeal = {
      id: 'meal-123',
      userId: 'user-123',
      blobName: 'meals/user-123/photo.jpg',
    };

    const prisma = new PrismaClient();
    (prisma.mealAnalysis.findUnique as any).mockResolvedValue(mockMeal);
    (prisma.mealAnalysis.delete as any).mockResolvedValue(mockMeal);
    (prisma.food.deleteMany as any).mockResolvedValue({ count: 2 });

    const request = {
      params: { id: 'meal-123' },
      headers: new Map([['x-user-id', 'user-123']]),
    } as unknown as HttpRequest;

    const response = await deleteMeal(request, mockContext);

    expect(response.status).toBe(204);
  });

  it('should return 404 when meal not found', async () => {
    const { deleteMeal } = await import('../../src/functions/delete-meal');
    const { PrismaClient } = await import('@prisma/client');

    const prisma = new PrismaClient();
    (prisma.mealAnalysis.findUnique as any).mockResolvedValue(null);

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
    const { PrismaClient } = await import('@prisma/client');

    const prisma = new PrismaClient();
    (prisma.mealAnalysis.findUnique as any).mockResolvedValue({
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
