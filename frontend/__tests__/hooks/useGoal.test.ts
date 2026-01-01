/**
 * Unit tests for useGoal hook
 * Tests goal retrieval priority ordering and localStorage sync
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGoal } from '../../src/hooks/useGoal';

// Mock the proteinApi module
vi.mock('../../src/services/proteinApi', () => ({
  isUserAuthenticated: vi.fn(),
  getProteinProfile: vi.fn(),
}));

// Mock the proteinStorage module
vi.mock('../../src/utils/proteinStorage', () => ({
  loadLocalProteinProfile: vi.fn(),
  saveLocalProteinProfile: vi.fn(),
}));

// Import mocked functions for type safety
import { isUserAuthenticated, getProteinProfile } from '../../src/services/proteinApi';
import { loadLocalProteinProfile, saveLocalProteinProfile } from '../../src/utils/proteinStorage';

const mockedIsUserAuthenticated = vi.mocked(isUserAuthenticated);
const mockedGetProteinProfile = vi.mocked(getProteinProfile);
const mockedLoadLocalProteinProfile = vi.mocked(loadLocalProteinProfile);
const mockedSaveLocalProteinProfile = vi.mocked(saveLocalProteinProfile);

describe('useGoal', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Goal Retrieval Priority', () => {
    it('should return default goal (120g) when no storage exists', async () => {
      // Arrange
      mockedIsUserAuthenticated.mockReturnValue(false);
      mockedLoadLocalProteinProfile.mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useGoal());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.goal).toBe(120);
    });

    it('should read from server API first for authenticated users', async () => {
      // Arrange
      mockedIsUserAuthenticated.mockReturnValue(true);
      mockedGetProteinProfile.mockResolvedValue({
        profile: {
          id: 'test-id',
          weightKg: 80,
          weightUnit: 'kg',
          trainingLevel: 'none',
          goal: 'maintain',
          mealsPerDay: 3,
          updatedAt: new Date().toISOString(),
        },
        target: {
          proteinTargetG: 95,
          perMealTargetsG: [24, 33, 38],
          multiplierUsed: 1.2,
        },
      });

      // Act
      const { result } = renderHook(() => useGoal());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.goal).toBe(95);
      expect(mockedGetProteinProfile).toHaveBeenCalled();
    });

    it('should fall back to protein profile localStorage when server fails', async () => {
      // Arrange
      mockedIsUserAuthenticated.mockReturnValue(true);
      mockedGetProteinProfile.mockRejectedValue(new Error('Network error'));
      mockedLoadLocalProteinProfile.mockReturnValue({
        version: 1,
        weightKg: 70,
        weightUnit: 'kg',
        trainingLevel: 'none',
        goal: 'maintain',
        mealsPerDay: 3,
        proteinTargetG: 85,
        perMealTargetsG: [28, 28, 29],
        multiplierUsed: 1.0,
        calculatedAt: new Date().toISOString(),
      });

      // Act
      const { result } = renderHook(() => useGoal());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.goal).toBe(85);
    });

    it('should fall back to legacy goal localStorage when protein profile is empty', async () => {
      // Arrange
      mockedIsUserAuthenticated.mockReturnValue(false);
      mockedLoadLocalProteinProfile.mockReturnValue(null);
      localStorage.setItem(
        'proteinlens_daily_goal',
        JSON.stringify({ goalGrams: 100, lastUpdated: new Date().toISOString() })
      );

      // Act
      const { result } = renderHook(() => useGoal());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.goal).toBe(100);
    });
  });

  describe('setGoal localStorage Sync', () => {
    it('should update legacy localStorage when setGoal is called', async () => {
      // Arrange
      mockedIsUserAuthenticated.mockReturnValue(false);
      mockedLoadLocalProteinProfile.mockReturnValue(null);

      const { result } = renderHook(() => useGoal());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      act(() => {
        result.current.setGoal(80);
      });

      // Assert
      expect(result.current.goal).toBe(80);
      const stored = localStorage.getItem('proteinlens_daily_goal');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.goalGrams).toBe(80);
    });

    it('should update protein profile localStorage if it exists', async () => {
      // Arrange
      mockedIsUserAuthenticated.mockReturnValue(false);
      const existingProfile = {
        version: 1 as const,
        weightKg: 70,
        weightUnit: 'kg' as const,
        trainingLevel: 'none' as const,
        goal: 'maintain' as const,
        mealsPerDay: 3,
        proteinTargetG: 70,
        perMealTargetsG: [23, 23, 24],
        multiplierUsed: 1.0,
        calculatedAt: new Date().toISOString(),
      };
      mockedLoadLocalProteinProfile.mockReturnValue(existingProfile);

      const { result } = renderHook(() => useGoal());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      act(() => {
        result.current.setGoal(90);
      });

      // Assert
      expect(mockedSaveLocalProteinProfile).toHaveBeenCalled();
      const savedProfile = mockedSaveLocalProteinProfile.mock.calls[0][0];
      expect(savedProfile.proteinTargetG).toBe(90);
      expect(savedProfile.perMealTargetsG).toEqual([30, 30, 30]); // 90 / 3 meals
    });

    it('should reject goals outside valid range', async () => {
      // Arrange
      mockedIsUserAuthenticated.mockReturnValue(false);
      mockedLoadLocalProteinProfile.mockReturnValue(null);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useGoal());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - try to set invalid goals
      act(() => {
        result.current.setGoal(-10);
      });
      expect(result.current.goal).toBe(120); // Should remain default

      act(() => {
        result.current.setGoal(600);
      });
      expect(result.current.goal).toBe(120); // Should remain default

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Goal must be between 0 and 500 grams');
      consoleSpy.mockRestore();
    });
  });
});
