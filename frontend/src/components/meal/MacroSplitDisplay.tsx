// Macro Split Display component - Feature 017
// T049: Visual breakdown of daily macros (protein/carbs/fat)
// T051: Highlight carb section when over limit
// US5: Macro Split Display for diet users

import React from 'react';
import { formatMacro } from '@/utils/formatMacro';

interface MacroSplitDisplayProps {
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  percentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  totalCalories: number;
  carbWarning?: boolean;
  carbLimit?: number | null;
  className?: string;
}

export function MacroSplitDisplay({
  macros,
  percentages,
  totalCalories,
  carbWarning = false,
  carbLimit = null,
  className = '',
}: MacroSplitDisplayProps) {
  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-3">📊 Daily Macro Split</h3>
      
      {/* Macro Bar */}
      <div className="flex h-6 rounded-full overflow-hidden mb-4">
        {/* Protein (Blue) */}
        {percentages.protein > 0 && (
          <div
            className="bg-blue-500 flex items-center justify-center"
            style={{ width: `${percentages.protein}%` }}
          >
            {percentages.protein >= 15 && (
              <span className="text-xs text-white font-medium">{percentages.protein}%</span>
            )}
          </div>
        )}
        
        {/* Carbs (Orange/Red if warning) */}
        {percentages.carbs > 0 && (
          <div
            className={`flex items-center justify-center ${
              carbWarning 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-orange-400'
            }`}
            style={{ width: `${percentages.carbs}%` }}
          >
            {percentages.carbs >= 15 && (
              <span className="text-xs text-white font-medium">{percentages.carbs}%</span>
            )}
          </div>
        )}
        
        {/* Fat (Yellow) */}
        {percentages.fat > 0 && (
          <div
            className="bg-yellow-400 flex items-center justify-center"
            style={{ width: `${percentages.fat}%` }}
          >
            {percentages.fat >= 15 && (
              <span className="text-xs text-gray-800 font-medium">{percentages.fat}%</span>
            )}
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-muted-foreground">Protein</span>
          </div>
          <div className="text-lg font-bold text-foreground">{formatMacro(macros.protein)}g</div>
          <div className="text-xs text-muted-foreground">{percentages.protein}%</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1">
            <div className={`w-3 h-3 rounded-full ${carbWarning ? 'bg-red-500' : 'bg-orange-400'}`}></div>
            <span className="text-xs text-muted-foreground">Carbs</span>
          </div>
          <div className={`text-lg font-bold ${carbWarning ? 'text-red-500' : 'text-foreground'}`}>
            {formatMacro(macros.carbs)}g
          </div>
          <div className="text-xs text-muted-foreground">
            {percentages.carbs}%
            {carbLimit && (
              <span className={carbWarning ? 'text-red-500' : ''}>
                {' '}/ {carbLimit}g max
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-muted-foreground">Fat</span>
          </div>
          <div className="text-lg font-bold text-foreground">{formatMacro(macros.fat)}g</div>
          <div className="text-xs text-muted-foreground">{percentages.fat}%</div>
        </div>
      </div>
      
      {/* Total calories */}
      <div className="mt-3 pt-3 border-t border-border text-center">
        <span className="text-sm text-muted-foreground">Total: </span>
        <span className="text-sm font-semibold text-foreground">{totalCalories} kcal</span>
      </div>
      
      {/* T051: Carb warning */}
      {carbWarning && carbLimit && (
        <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-sm text-red-700 dark:text-red-300">
          ⚠️ Over your daily carb limit ({macros.carbs}g / {carbLimit}g max)
        </div>
      )}
    </div>
  );
}
