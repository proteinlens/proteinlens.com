import { useState, useEffect, useCallback } from 'react';
import { loadLocalProteinProfile, saveLocalProteinProfile } from '../utils/proteinStorage';
import { getProteinProfile, isUserAuthenticated } from '../services/proteinApi';

interface DailyGoal {
  goalGrams: number;
  lastUpdated: string;
}

const GOAL_STORAGE_KEY = 'proteinlens_daily_goal';
const DEFAULT_GOAL = 120; // Default to 120g protein per day

// Custom event name for cross-component goal sync
const GOAL_CHANGED_EVENT = 'proteinlens:goal-changed';

/**
 * Hook to manage daily protein goal
 * Syncs with protein calculator profile (localStorage + backend API)
 * Uses custom events to sync goal across all component instances
 */
export const useGoal = () => {
  const [goal, setGoalState] = useState<number>(DEFAULT_GOAL);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load goal from storage
  const loadGoalFromStorage = useCallback(async () => {
    try {
      // First check if user is authenticated and has a server profile
      if (isUserAuthenticated()) {
        try {
          const serverProfile = await getProteinProfile();
          if (serverProfile?.target?.proteinTargetG) {
            setGoalState(serverProfile.target.proteinTargetG);
            return serverProfile.target.proteinTargetG;
          }
        } catch {
          // Fall through to local storage checks
        }
      }

      // Check protein profile from calculator (localStorage)
      const proteinProfile = loadLocalProteinProfile();
      if (proteinProfile?.proteinTargetG) {
        setGoalState(proteinProfile.proteinTargetG);
        return proteinProfile.proteinTargetG;
      }

      // Fall back to legacy goal storage
      const stored = localStorage.getItem(GOAL_STORAGE_KEY);
      if (stored) {
        const parsed: DailyGoal = JSON.parse(stored);
        setGoalState(parsed.goalGrams);
        return parsed.goalGrams;
      }
      
      return DEFAULT_GOAL;
    } catch (error) {
      console.error('Failed to load goal:', error);
      return DEFAULT_GOAL;
    }
  }, []);

  // Load goal on mount
  useEffect(() => {
    loadGoalFromStorage().finally(() => setIsLoading(false));
  }, [loadGoalFromStorage]);

  // Listen for goal changes from other components
  useEffect(() => {
    const handleGoalChanged = (event: CustomEvent<number>) => {
      setGoalState(event.detail);
    };

    window.addEventListener(GOAL_CHANGED_EVENT, handleGoalChanged as EventListener);
    return () => {
      window.removeEventListener(GOAL_CHANGED_EVENT, handleGoalChanged as EventListener);
    };
  }, []);

  // Update goal and persist to protein profile
  const setGoal = useCallback((newGoal: number) => {
    if (newGoal < 0 || newGoal > 500) {
      console.error('Goal must be between 0 and 500 grams');
      return;
    }

    // Update legacy storage for compatibility
    const goalData: DailyGoal = {
      goalGrams: newGoal,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goalData));
      
      // Also update protein profile if it exists
      const proteinProfile = loadLocalProteinProfile();
      if (proteinProfile) {
        proteinProfile.proteinTargetG = newGoal;
        // Recalculate per-meal targets
        proteinProfile.perMealTargetsG = Array(proteinProfile.mealsPerDay).fill(
          Math.round(newGoal / proteinProfile.mealsPerDay)
        );
        proteinProfile.calculatedAt = new Date().toISOString();
        saveLocalProteinProfile(proteinProfile);
      }
      
      setGoalState(newGoal);
      
      // Broadcast change to other components using this hook
      window.dispatchEvent(new CustomEvent(GOAL_CHANGED_EVENT, { detail: newGoal }));
    } catch (error) {
      console.error('Failed to save goal to localStorage:', error);
    }
  }, []);

  return {
    goal,
    setGoal,
    isLoading,
  };
};
