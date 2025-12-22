import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGoal } from '@/hooks/useGoal';
import React from 'react';

describe('useGoal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    // Clear localStorage
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('should initialize with default goal', () => {
    const { result } = renderHook(() => useGoal(), { wrapper });
    
    expect(result.current.goal).toBe(120);
    expect(result.current.isLoading).toBe(false);
  });

  it('should load goal from localStorage', () => {
    // Set a goal in localStorage
    localStorage.setItem('proteinlens_daily_goal', JSON.stringify({
      goalGrams: 150,
      lastUpdated: new Date().toISOString(),
    }));

    const { result } = renderHook(() => useGoal(), { wrapper });
    
    expect(result.current.goal).toBe(150);
  });

  it('should persist goal to localStorage when set', () => {
    const { result } = renderHook(() => useGoal(), { wrapper });

    act(() => {
      result.current.setGoal(180);
    });

    expect(result.current.goal).toBe(180);
    
    const stored = localStorage.getItem('proteinlens_daily_goal');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.goalGrams).toBe(180);
  });

  it('should validate goal range (0-500)', () => {
    const { result } = renderHook(() => useGoal(), { wrapper });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.setGoal(-10);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(result.current.goal).toBe(120); // Should not change
    
    consoleSpy.mockRestore();
  });

  it('should reject goals over 500g', () => {
    const { result } = renderHook(() => useGoal(), { wrapper });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.setGoal(600);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(result.current.goal).toBe(120); // Should not change
    
    consoleSpy.mockRestore();
  });

  it('should accept valid goals (0-500)', () => {
    const { result } = renderHook(() => useGoal(), { wrapper });

    const validGoals = [0, 50, 100, 150, 250, 500];
    validGoals.forEach((goal) => {
      act(() => {
        result.current.setGoal(goal);
      });
      expect(result.current.goal).toBe(goal);
    });
  });

  it('should update lastUpdated timestamp', () => {
    const { result } = renderHook(() => useGoal(), { wrapper });
    const before = new Date().getTime();

    act(() => {
      result.current.setGoal(200);
    });

    const stored = localStorage.getItem('proteinlens_daily_goal');
    const parsed = JSON.parse(stored!);
    const timestamp = new Date(parsed.lastUpdated).getTime();

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(new Date().getTime());
  });
});
