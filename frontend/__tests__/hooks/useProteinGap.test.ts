import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMeals } from '@/hooks/useMeal';
import { useProteinGap } from '@/hooks/useProteinGap';
import React from 'react';

// Mock useMeals
vi.mock('@/hooks/useMeal', () => ({
  useMeals: vi.fn(),
  useDeleteMeal: vi.fn(),
}));

describe('useProteinGap', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('should calculate gap correctly', () => {
    const mockMeals = [
      {
        id: '1',
        userId: 'user-1',
        uploadedAt: new Date().toISOString(),
        imageUrl: 'url',
        analysis: { foods: [], totalProtein: 50 },
        corrections: [],
      },
      {
        id: '2',
        userId: 'user-1',
        uploadedAt: new Date().toISOString(),
        imageUrl: 'url',
        analysis: { foods: [], totalProtein: 40 },
        corrections: [],
      },
    ];

    vi.mocked(useMeals).mockReturnValue({
      data: mockMeals,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useProteinGap({ userId: 'user-1', dailyGoalGrams: 150 }),
      { wrapper }
    );

    expect(result.current.goalGrams).toBe(150);
    expect(result.current.consumedGrams).toBe(90);
    expect(result.current.gapGrams).toBe(60);
    expect(result.current.percentComplete).toBe(60);
    expect(result.current.isMet).toBe(false);
  });

  it('should indicate goal met when consumed >= goal', () => {
    const mockMeals = [
      {
        id: '1',
        userId: 'user-1',
        uploadedAt: new Date().toISOString(),
        imageUrl: 'url',
        analysis: { foods: [], totalProtein: 150 },
        corrections: [],
      },
    ];

    vi.mocked(useMeals).mockReturnValue({
      data: mockMeals,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useProteinGap({ userId: 'user-1', dailyGoalGrams: 120 }),
      { wrapper }
    );

    expect(result.current.isMet).toBe(true);
    expect(result.current.gapGrams).toBe(0);
  });

  it('should return default values while loading', () => {
    vi.mocked(useMeals).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useProteinGap({ userId: 'user-1', dailyGoalGrams: 150 }),
      { wrapper }
    );

    expect(result.current.goalGrams).toBe(150);
    expect(result.current.consumedGrams).toBe(0);
    expect(result.current.percentComplete).toBe(0);
    expect(result.current.isMet).toBe(false);
  });

  it('should only count today meals', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mockMeals = [
      {
        id: '1',
        userId: 'user-1',
        uploadedAt: today.toISOString(),
        imageUrl: 'url',
        analysis: { foods: [], totalProtein: 80 },
        corrections: [],
      },
      {
        id: '2',
        userId: 'user-1',
        uploadedAt: yesterday.toISOString(),
        imageUrl: 'url',
        analysis: { foods: [], totalProtein: 100 },
        corrections: [],
      },
    ];

    vi.mocked(useMeals).mockReturnValue({
      data: mockMeals,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useProteinGap({ userId: 'user-1', dailyGoalGrams: 150 }),
      { wrapper }
    );

    expect(result.current.consumedGrams).toBe(80); // Only today's meal
    expect(result.current.gapGrams).toBe(70);
  });

  it('should calculate percentage correctly', () => {
    const mockMeals = [
      {
        id: '1',
        userId: 'user-1',
        uploadedAt: new Date().toISOString(),
        imageUrl: 'url',
        analysis: { foods: [], totalProtein: 75 },
        corrections: [],
      },
    ];

    vi.mocked(useMeals).mockReturnValue({
      data: mockMeals,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useProteinGap({ userId: 'user-1', dailyGoalGrams: 150 }),
      { wrapper }
    );

    expect(result.current.percentComplete).toBe(50);
  });

  it('should cap percentage at 100', () => {
    const mockMeals = [
      {
        id: '1',
        userId: 'user-1',
        uploadedAt: new Date().toISOString(),
        imageUrl: 'url',
        analysis: { foods: [], totalProtein: 200 },
        corrections: [],
      },
    ];

    vi.mocked(useMeals).mockReturnValue({
      data: mockMeals,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useProteinGap({ userId: 'user-1', dailyGoalGrams: 120 }),
      { wrapper }
    );

    expect(result.current.percentComplete).toBe(100);
  });
});
