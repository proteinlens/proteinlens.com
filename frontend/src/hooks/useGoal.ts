import { useState, useEffect } from 'react';

interface DailyGoal {
  goalGrams: number;
  lastUpdated: string;
}

const GOAL_STORAGE_KEY = 'proteinlens_daily_goal';
const DEFAULT_GOAL = 120; // Default to 120g protein per day

/**
 * Hook to manage daily protein goal
 * Persists to localStorage, optionally syncs with backend
 */
export const useGoal = () => {
  const [goal, setGoalState] = useState<number>(DEFAULT_GOAL);
  const [isLoading, setIsLoading] = useState(true);

  // Load goal from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GOAL_STORAGE_KEY);
      if (stored) {
        const parsed: DailyGoal = JSON.parse(stored);
        setGoalState(parsed.goalGrams);
      }
    } catch (error) {
      console.error('Failed to load goal from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update goal and persist
  const setGoal = (newGoal: number) => {
    if (newGoal < 0 || newGoal > 500) {
      console.error('Goal must be between 0 and 500 grams');
      return;
    }

    const goalData: DailyGoal = {
      goalGrams: newGoal,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goalData));
      setGoalState(newGoal);
      
      // TODO: Optionally sync with backend
      // apiClient.updateDailyGoal({ goalGrams: newGoal });
    } catch (error) {
      console.error('Failed to save goal to localStorage:', error);
    }
  };

  return {
    goal,
    setGoal,
    isLoading,
  };
};
