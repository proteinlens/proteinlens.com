/**
 * Meals Per Day Selector Component (Feature 015)
 * 
 * Choose 2-5 meals per day
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface MealsPerDaySelectorProps {
  value: number;
  onChange: (meals: number) => void;
  disabled?: boolean;
  className?: string;
}

const MEAL_OPTIONS = [2, 3, 4, 5];

export function MealsPerDaySelector({
  value,
  onChange,
  disabled = false,
  className,
}: MealsPerDaySelectorProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium text-foreground">
        Meals Per Day
      </label>
      <div className="flex gap-2">
        {MEAL_OPTIONS.map((meals) => {
          const isSelected = value === meals;
          
          return (
            <button
              key={meals}
              type="button"
              onClick={() => onChange(meals)}
              disabled={disabled}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg',
                'border-2 transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'min-h-[48px] min-w-[48px] touch-manipulation',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-foreground hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-pressed={isSelected}
            >
              <span className="font-semibold text-lg">{meals}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
