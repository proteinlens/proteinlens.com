// MacroBreakdown Component - Displays protein, carbs, and fat breakdown
// NEW - macro ingredients analysis feature
// Displays macronutrient values and percentages in a responsive grid

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MacroBreakdownProps {
  protein: number;
  carbs?: number;
  fat?: number;
  totalCalories?: number;
  macroPercentages?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  isLegacy?: boolean; // For meals without macro data
}

export const MacroBreakdown: React.FC<MacroBreakdownProps> = ({
  protein,
  carbs,
  fat,
  totalCalories,
  macroPercentages,
  isLegacy = false,
}) => {
  if (isLegacy || carbs === undefined || fat === undefined) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Macronutrient Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Protein</span>
              <span className="text-sm">{protein.toFixed(1)}g</span>
            </div>
            <p className="text-xs text-gray-500">Macro data unavailable for this meal</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Macronutrient Breakdown</CardTitle>
        {totalCalories && (
          <p className="text-sm text-gray-600">Total: {totalCalories} calories</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Protein */}
          <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{protein.toFixed(1)}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Protein</div>
            <div className="text-xs text-gray-500">g</div>
            {macroPercentages && (
              <div className="text-xs font-semibold text-orange-600 mt-2">
                {macroPercentages.protein}%
              </div>
            )}
          </div>

          {/* Carbs */}
          <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{carbs.toFixed(1)}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Carbs</div>
            <div className="text-xs text-gray-500">g</div>
            {macroPercentages && (
              <div className="text-xs font-semibold text-blue-600 mt-2">
                {macroPercentages.carbs}%
              </div>
            )}
          </div>

          {/* Fat */}
          <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{fat.toFixed(1)}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Fat</div>
            <div className="text-xs text-gray-500">g</div>
            {macroPercentages && (
              <div className="text-xs font-semibold text-yellow-600 mt-2">
                {macroPercentages.fat}%
              </div>
            )}
          </div>
        </div>

        {/* Macro percentage legend */}
        {macroPercentages && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Based on 4 cal/g protein & carbs, 9 cal/g fat
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MacroBreakdown;
