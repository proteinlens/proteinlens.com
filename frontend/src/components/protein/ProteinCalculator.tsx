/**
 * Protein Calculator Component (Feature 015)
 * 
 * Main container component for the protein target calculator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { WeightInput } from './WeightInput';
import { TrainingLevelSelector } from './TrainingLevelSelector';
import { GoalSelector } from './GoalSelector';
import { MealsPerDaySelector } from './MealsPerDaySelector';
import { MealDistribution } from './MealDistribution';
import { useProteinCalculator } from '@/hooks/useProteinCalculator';

interface ProteinCalculatorProps {
  className?: string;
}

export function ProteinCalculator({ className }: ProteinCalculatorProps) {
  const [state, actions] = useProteinCalculator();

  const {
    weightKg,
    weightUnit,
    trainingLevel,
    goal,
    mealsPerDay,
    result,
    isLoading,
    isCalculating,
    isSaving,
    error,
    isAuthenticated,
    hasServerProfile,
  } = state;

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleCalculate = async () => {
    await actions.calculate();
  };

  const handleSave = async () => {
    if (isAuthenticated) {
      await actions.save();
    }
  };

  const isFormDisabled = isCalculating || isSaving;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Error message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-6">
        <WeightInput
          value={weightKg}
          onChange={actions.setWeightKg}
          unit={weightUnit}
          onUnitChange={actions.setWeightUnit}
          disabled={isFormDisabled}
        />

        <TrainingLevelSelector
          value={trainingLevel}
          onChange={actions.setTrainingLevel}
          disabled={isFormDisabled}
        />

        <GoalSelector
          value={goal}
          onChange={actions.setGoal}
          disabled={isFormDisabled}
        />

        <MealsPerDaySelector
          value={mealsPerDay}
          onChange={actions.setMealsPerDay}
          disabled={isFormDisabled}
        />
      </div>

      {/* Calculate Button */}
      <Button
        onClick={handleCalculate}
        disabled={isFormDisabled || weightKg <= 0}
        size="lg"
        className="w-full"
      >
        {isCalculating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Calculating...
          </span>
        ) : (
          'Calculate My Protein Target'
        )}
      </Button>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 pt-4 border-t border-border"
        >
          {/* Daily Target */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Your Daily Protein Target
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-primary">
                {result.proteinTargetG}
              </span>
              <span className="text-2xl text-muted-foreground">g</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {weightKg.toFixed(0)}kg × {result.multiplierUsed}g/kg
            </p>
          </div>

          {/* Per-meal breakdown */}
          <MealDistribution
            perMealTargetsG={result.perMealTargetsG}
            lowMealWarning={result.lowMealWarning}
          />

          {/* Save Button (for authenticated users) */}
          {isAuthenticated && (
            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={isSaving || hasServerProfile}
                variant={hasServerProfile ? 'outline' : 'primary'}
                size="md"
                className="w-full"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </span>
                ) : hasServerProfile ? (
                  '✓ Saved to your profile'
                ) : (
                  'Save to My Profile'
                )}
              </Button>
            </div>
          )}

          {/* Login prompt for anonymous users */}
          {!isAuthenticated && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>{' '}
                to save your protein target and access it anywhere.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
