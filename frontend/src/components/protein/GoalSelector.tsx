/**
 * Goal Selector Component (Feature 015)
 * 
 * Choose between maintain, lose, or gain weight goals
 */

import React from 'react';
import { cn } from '@/utils/cn';

export type ProteinGoal = 'maintain' | 'lose' | 'gain';

interface GoalSelectorProps {
  value: ProteinGoal;
  onChange: (goal: ProteinGoal) => void;
  disabled?: boolean;
  className?: string;
}

const GOALS: { value: ProteinGoal; label: string; emoji: string; description: string }[] = [
  { 
    value: 'maintain', 
    label: 'Maintain',
    emoji: '⚖️',
    description: 'Keep current weight'
  },
  { 
    value: 'lose', 
    label: 'Lose',
    emoji: '📉',
    description: 'Cut body fat'
  },
  { 
    value: 'gain', 
    label: 'Gain',
    emoji: '📈',
    description: 'Build muscle'
  },
];

export function GoalSelector({
  value,
  onChange,
  disabled = false,
  className,
}: GoalSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium text-foreground">
        Your Goal
      </label>
      <div className="flex gap-2">
        {GOALS.map((goal) => {
          const isSelected = value === goal.value;
          
          return (
            <button
              key={goal.value}
              type="button"
              onClick={() => onChange(goal.value)}
              disabled={disabled}
              className={cn(
                'flex-1 py-3 px-2 rounded-lg',
                'border-2 transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'min-h-[80px] touch-manipulation',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-foreground hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-pressed={isSelected}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{goal.emoji}</span>
                <span className="font-semibold text-sm">{goal.label}</span>
                <span className="text-xs text-muted-foreground">
                  {goal.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
