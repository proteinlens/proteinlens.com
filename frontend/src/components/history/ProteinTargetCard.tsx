/**
 * ProteinTargetCard Component
 * 
 * Compact card showing daily protein target and progress for history page
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProteinCalculator } from '@/hooks/useProteinCalculator';

interface ProteinTargetCardProps {
  /** Total protein consumed today (from meals) */
  todayProtein: number;
}

export function ProteinTargetCard({ todayProtein }: ProteinTargetCardProps) {
  const [state] = useProteinCalculator();
  const { result, isLoading } = state;

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (!result?.proteinTargetG) return 0;
    return Math.min((todayProtein / result.proteinTargetG) * 100, 100);
  }, [todayProtein, result?.proteinTargetG]);

  const remaining = useMemo(() => {
    if (!result?.proteinTargetG) return 0;
    return Math.max(result.proteinTargetG - todayProtein, 0);
  }, [todayProtein, result?.proteinTargetG]);

  // Determine progress color
  const progressColor = useMemo(() => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-primary';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  }, [progress]);

  const statusEmoji = useMemo(() => {
    if (progress >= 100) return '🎉';
    if (progress >= 75) return '💪';
    if (progress >= 50) return '👍';
    return '🍽️';
  }, [progress]);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-muted rounded w-32" />
          <div className="h-5 bg-muted rounded w-16" />
        </div>
        <div className="h-3 bg-muted rounded-full w-full" />
      </div>
    );
  }

  // No target set - prompt to set up
  if (!result?.proteinTargetG) {
    return (
      <Link
        to="/protein-calculator"
        className="block bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Set Your Protein Target</p>
            <p className="text-sm text-muted-foreground">Calculate your daily protein goal</p>
          </div>
          <div className="text-3xl">🎯</div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{statusEmoji}</span>
          <span className="font-semibold text-foreground">Today's Progress</span>
        </div>
        <Link
          to="/protein-calculator"
          className="text-xs text-primary hover:underline"
        >
          Edit target
        </Link>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={`absolute inset-y-0 left-0 ${progressColor} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-bold text-foreground">{Math.round(todayProtein)}g</span>
          <span className="text-muted-foreground"> / {result.proteinTargetG}g</span>
        </div>
        {remaining > 0 ? (
          <span className="text-muted-foreground">
            {Math.round(remaining)}g remaining
          </span>
        ) : (
          <span className="text-green-600 font-medium">
            Target reached! 🎉
          </span>
        )}
      </div>

      {/* Per-meal breakdown hint */}
      {remaining > 0 && result.perMealTargetsG && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Suggested per meal: ~{Math.round(remaining / Math.max(result.perMealTargetsG.length - 1, 1))}g
          </p>
        </div>
      )}
    </div>
  );
}
