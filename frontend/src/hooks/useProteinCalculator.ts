/**
 * useProteinCalculator Hook (Feature 015)
 * 
 * State management for the protein calculator with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import {
  calculateProtein,
  getProteinConfig,
  getProteinProfile,
  saveProteinProfile,
  isUserAuthenticated,
  type TrainingLevel,
  type ProteinGoal,
  type WeightUnit,
  type ProteinTargetResponse,
  type ProteinConfigResponse,
} from '../services/proteinApi';
import {
  loadLocalProteinProfile,
  saveLocalProteinProfile,
  createLocalProteinProfile,
  clearLocalProteinProfile,
  type LocalProteinProfile,
} from '../utils/proteinStorage';

// ===========================================
// Types
// ===========================================

export interface ProteinCalculatorState {
  // Input values
  weightKg: number;
  weightUnit: WeightUnit;
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  mealsPerDay: number;
  
  // Calculation results
  result: ProteinTargetResponse | null;
  
  // UI state
  isLoading: boolean;
  isCalculating: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Auth state
  isAuthenticated: boolean;
  hasServerProfile: boolean;
}

export interface ProteinCalculatorActions {
  setWeightKg: (weight: number) => void;
  setWeightUnit: (unit: WeightUnit) => void;
  setTrainingLevel: (level: TrainingLevel) => void;
  setGoal: (goal: ProteinGoal) => void;
  setMealsPerDay: (meals: number) => void;
  calculate: () => Promise<void>;
  save: () => Promise<void>;
  reset: () => void;
}

// ===========================================
// Default values
// ===========================================

const DEFAULT_STATE: ProteinCalculatorState = {
  weightKg: 70,
  weightUnit: 'kg',
  trainingLevel: 'none',
  goal: 'maintain',
  mealsPerDay: 3,
  result: null,
  isLoading: true,
  isCalculating: false,
  isSaving: false,
  error: null,
  isAuthenticated: false,
  hasServerProfile: false,
};

// ===========================================
// Hook
// ===========================================

export function useProteinCalculator(): [ProteinCalculatorState, ProteinCalculatorActions] {
  const [state, setState] = useState<ProteinCalculatorState>(DEFAULT_STATE);

  // Initialize from localStorage or server
  useEffect(() => {
    async function initialize() {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const authenticated = isUserAuthenticated();
        
        if (authenticated) {
          // Try to load from server first
          const serverProfile = await getProteinProfile();
          
          if (serverProfile) {
            setState((s) => ({
              ...s,
              weightKg: serverProfile.profile.weightKg,
              weightUnit: serverProfile.profile.weightUnit,
              trainingLevel: serverProfile.profile.trainingLevel,
              goal: serverProfile.profile.goal,
              mealsPerDay: serverProfile.profile.mealsPerDay,
              result: serverProfile.target,
              isAuthenticated: true,
              hasServerProfile: true,
              isLoading: false,
            }));
            return;
          }
        }

        // Fall back to localStorage
        const localProfile = loadLocalProteinProfile();
        
        if (localProfile) {
          setState((s) => ({
            ...s,
            weightKg: localProfile.weightKg,
            weightUnit: localProfile.weightUnit,
            trainingLevel: localProfile.trainingLevel,
            goal: localProfile.goal,
            mealsPerDay: localProfile.mealsPerDay,
            result: {
              proteinTargetG: localProfile.proteinTargetG,
              perMealTargetsG: localProfile.perMealTargetsG,
              multiplierUsed: localProfile.multiplierUsed,
              lowMealWarning: localProfile.perMealTargetsG.some((t) => t < 20),
            },
            isAuthenticated: authenticated,
            hasServerProfile: false,
            isLoading: false,
          }));
          return;
        }

        // No stored profile, use defaults
        setState((s) => ({
          ...s,
          isAuthenticated: authenticated,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to initialize protein calculator:', error);
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Failed to load your protein profile',
        }));
      }
    }

    initialize();
  }, []);

  // Actions
  const setWeightKg = useCallback((weight: number) => {
    setState((s) => ({ ...s, weightKg: weight, result: null }));
  }, []);

  const setWeightUnit = useCallback((unit: WeightUnit) => {
    setState((s) => ({ ...s, weightUnit: unit }));
  }, []);

  const setTrainingLevel = useCallback((level: TrainingLevel) => {
    setState((s) => ({ ...s, trainingLevel: level, result: null }));
  }, []);

  const setGoal = useCallback((goal: ProteinGoal) => {
    setState((s) => ({ ...s, goal: goal, result: null }));
  }, []);

  const setMealsPerDay = useCallback((meals: number) => {
    setState((s) => ({ ...s, mealsPerDay: meals, result: null }));
  }, []);

  const calculate = useCallback(async () => {
    setState((s) => ({ ...s, isCalculating: true, error: null }));

    try {
      const result = await calculateProtein({
        weightKg: state.weightKg,
        trainingLevel: state.trainingLevel,
        goal: state.goal,
        mealsPerDay: state.mealsPerDay,
      });

      // Save to localStorage for anonymous users
      if (!state.isAuthenticated) {
        const localProfile = createLocalProteinProfile({
          weightKg: state.weightKg,
          weightUnit: state.weightUnit,
          trainingLevel: state.trainingLevel,
          goal: state.goal,
          mealsPerDay: state.mealsPerDay,
          proteinTargetG: result.proteinTargetG,
          perMealTargetsG: result.perMealTargetsG,
          multiplierUsed: result.multiplierUsed,
        });
        saveLocalProteinProfile(localProfile);
      }

      setState((s) => ({
        ...s,
        result,
        isCalculating: false,
      }));
    } catch (error) {
      console.error('Failed to calculate protein:', error);
      setState((s) => ({
        ...s,
        isCalculating: false,
        error: 'Failed to calculate protein target',
      }));
    }
  }, [state.weightKg, state.trainingLevel, state.goal, state.mealsPerDay, state.weightUnit, state.isAuthenticated]);

  const save = useCallback(async () => {
    if (!state.isAuthenticated) {
      // Not authenticated - localStorage already saved in calculate()
      return;
    }

    setState((s) => ({ ...s, isSaving: true, error: null }));

    try {
      const response = await saveProteinProfile({
        weightKg: state.weightKg,
        weightUnit: state.weightUnit,
        trainingLevel: state.trainingLevel,
        goal: state.goal,
        mealsPerDay: state.mealsPerDay,
      });

      // Clear localStorage after successful save
      clearLocalProteinProfile();

      setState((s) => ({
        ...s,
        result: response.target,
        hasServerProfile: true,
        isSaving: false,
      }));
    } catch (error) {
      console.error('Failed to save protein profile:', error);
      setState((s) => ({
        ...s,
        isSaving: false,
        error: 'Failed to save protein profile',
      }));
    }
  }, [state.weightKg, state.weightUnit, state.trainingLevel, state.goal, state.mealsPerDay, state.isAuthenticated]);

  const reset = useCallback(() => {
    clearLocalProteinProfile();
    setState({
      ...DEFAULT_STATE,
      isLoading: false,
      isAuthenticated: state.isAuthenticated,
    });
  }, [state.isAuthenticated]);

  const actions: ProteinCalculatorActions = {
    setWeightKg,
    setWeightUnit,
    setTrainingLevel,
    setGoal,
    setMealsPerDay,
    calculate,
    save,
    reset,
  };

  return [state, actions];
}
