// Daily Macro Summary Component
// Feature: 001-macro-ingredients-analysis, User Story 2
// Task: T027 - Daily summary display component

import React, { useMemo } from 'react';
import { calculateMacroPercentages, calculateTotalCalories, formatMacroValue } from '@/utils/nutrition';
import './DailySummary.css';

interface DailySummaryData {
  date: string;
  meals: number;
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
  carbWarning: boolean;
  carbLimit: number | null;
}

interface DailySummaryProps {
  data: DailySummaryData;
  isLoading?: boolean;
  error?: string | null;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ data, isLoading = false, error = null }) => {
  // Format the date to human-readable format
  const formattedDate = useMemo(() => {
    const date = new Date(data.date + 'T00:00:00Z');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }, [data.date]);

  if (isLoading) {
    return (
      <div className="daily-summary-card">
        <div className="daily-summary-header">
          <h3 className="daily-summary-title">Loading daily summary...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-summary-error alert-destructive">
        <span className="alert-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="daily-summary-card">
      <div className="daily-summary-header">
        <h3 className="daily-summary-title">
          {formattedDate}
        </h3>
        <p className="daily-summary-meals">
          {data.meals} {data.meals === 1 ? 'meal' : 'meals'} tracked
        </p>
      </div>

      <div className="daily-summary-content">
        {/* Carb Warning Alert */}
        {data.carbWarning && data.carbLimit !== null && (
          <div className="daily-summary-warning alert-warning">
            <span className="alert-icon">⚠️</span>
            <span>
              You've exceeded your net carb limit of {data.carbLimit}g by {Math.round(data.macros.carbs - data.carbLimit)}g
            </span>
          </div>
        )}

        {/* Macro totals section */}
        <div className="daily-summary-macros" role="region" aria-label="Daily macronutrient totals">
          <div className="macros-grid">
            <div className="macro-card protein-card" role="article" aria-label="Protein total">
              <div className="macro-value" aria-label={`${formatMacroValue(data.macros.protein)} grams of protein`}>
                {formatMacroValue(data.macros.protein)}
              </div>
              <div className="macro-label">Protein</div>
              <div className="macro-percentage" aria-label={`${data.percentages.protein} percent of calories from protein`}>
                {data.percentages.protein}%
              </div>
              <div className="macro-unit">g</div>
            </div>

            <div className="macro-card carbs-card" role="article" aria-label="Carbohydrates total">
              <div className="macro-value" aria-label={`${formatMacroValue(data.macros.carbs)} grams of carbohydrates`}>
                {formatMacroValue(data.macros.carbs)}
              </div>
              <div className="macro-label">Carbs</div>
              <div className="macro-percentage" aria-label={`${data.percentages.carbs} percent of calories from carbohydrates`}>
                {data.percentages.carbs}%
              </div>
              <div className="macro-unit">g</div>
            </div>

            <div className="macro-card fat-card" role="article" aria-label="Fat total">
              <div className="macro-value" aria-label={`${formatMacroValue(data.macros.fat)} grams of fat`}>
                {formatMacroValue(data.macros.fat)}
              </div>
              <div className="macro-label">Fat</div>
              <div className="macro-percentage" aria-label={`${data.percentages.fat} percent of calories from fat`}>
                {data.percentages.fat}%
              </div>
              <div className="macro-unit">g</div>
            </div>
          </div>

          {/* Total calories */}
          <div className="daily-summary-calories" role="article" aria-label="Total calories">
            <div className="calories-label">Total Calories</div>
            <div className="calories-value" aria-label={`${formatMacroValue(data.totalCalories)} calories total`}>
              {formatMacroValue(data.totalCalories)}
            </div>
          </div>

          {/* Carb limit info */}
          {data.carbLimit !== null && !data.carbWarning && (
            <div className="daily-summary-info">
              <p className="carb-limit-info">
                {data.macros.carbs > 0 ? (
                  <>
                    Net carbs: <strong>{formatMacroValue(data.macros.carbs)}/{data.carbLimit}g</strong>
                  </>
                ) : (
                  <>No meals tracked yet</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
