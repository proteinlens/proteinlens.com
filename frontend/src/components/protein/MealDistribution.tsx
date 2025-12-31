/**
 * Meal Distribution Component (Feature 015)
 * 
 * Displays per-meal protein breakdown with visual bars
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface MealDistributionProps {
  perMealTargetsG: number[];
  lowMealWarning?: boolean;
  className?: string;
}

const MEAL_LABELS = ['Breakfast', 'Lunch', 'Dinner', 'Meal 4', 'Meal 5'];
const LOW_MEAL_THRESHOLD = 20;

export function MealDistribution({
  perMealTargetsG,
  lowMealWarning = false,
  className,
}: MealDistributionProps) {
  const maxTarget = Math.max(...perMealTargetsG);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <h3 className="text-sm font-medium text-foreground">
        Per-Meal Breakdown
      </h3>
      
      <div className="space-y-2">
        {perMealTargetsG.map((target, index) => {
          const isLow = target < LOW_MEAL_THRESHOLD;
          const percentage = maxTarget > 0 ? (target / maxTarget) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <span className="w-20 text-sm text-muted-foreground">
                {MEAL_LABELS[index] || `Meal ${index + 1}`}
              </span>
              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isLow ? 'bg-yellow-500' : 'bg-primary'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span
                className={cn(
                  'w-12 text-right font-semibold text-sm',
                  isLow ? 'text-yellow-600' : 'text-foreground'
                )}
              >
                {target}g
              </span>
            </div>
          );
        })}
      </div>

      {lowMealWarning && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Some meals are under {LOW_MEAL_THRESHOLD}g. Consider fewer meals for better protein distribution.
          </p>
        </div>
      )}
    </div>
  );
}
