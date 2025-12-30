/**
 * Training Level Selector Component (Feature 015)
 * 
 * Toggle between "none" and "regular" training levels
 */

import React from 'react';
import { cn } from '@/utils/cn';

export type TrainingLevel = 'none' | 'regular';

interface TrainingLevelSelectorProps {
  value: TrainingLevel;
  onChange: (level: TrainingLevel) => void;
  disabled?: boolean;
  className?: string;
}

const TRAINING_LEVELS: { value: TrainingLevel; label: string; description: string }[] = [
  { 
    value: 'none', 
    label: 'No Training',
    description: 'Sedentary or light activity'
  },
  { 
    value: 'regular', 
    label: 'Regular Training',
    description: '3+ workouts per week'
  },
];

export function TrainingLevelSelector({
  value,
  onChange,
  disabled = false,
  className,
}: TrainingLevelSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium text-foreground">
        Training Level
      </label>
      <div className="flex gap-2">
        {TRAINING_LEVELS.map((level) => {
          const isSelected = value === level.value;
          
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange(level.value)}
              disabled={disabled}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg',
                'border-2 transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'min-h-[72px] touch-manipulation',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-foreground hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-pressed={isSelected}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold text-sm">{level.label}</span>
                <span className="text-xs text-muted-foreground">
                  {level.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
