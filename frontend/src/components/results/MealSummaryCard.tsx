import React from 'react'
import type { Meal } from '@/types/meal'
import { formatMacro } from '@/utils/formatMacro'

interface MealSummaryCardProps {
  meal: Meal
}

export function MealSummaryCard({ meal }: MealSummaryCardProps) {
  const totalProtein = meal.analysis.totalProtein || 0
  const totalCalories = meal.analysis.totalCalories || 0

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sticky top-0 z-10 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm md:sticky-none">
      {/* Main Summary Card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md">
        {/* Image Section */}
        {meal.imageUrl && (
          <div className="relative w-full aspect-video md:aspect-square bg-muted overflow-hidden">
            <img
              src={meal.imageUrl}
              alt="Meal"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Total Protein - Prominent */}
          <div className="border-b border-border pb-4 md:pb-6">
            <p className="text-sm text-muted-foreground mb-1">Total Protein</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                {totalProtein}
              </span>
              <span className="text-lg md:text-xl text-muted-foreground">
                grams
              </span>
            </div>
          </div>

          {/* Macros if Available */}
          {meal.analysis.macros && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                <p className="text-lg md:text-xl font-semibold">
                  {formatMacro(meal.analysis.macros.carbs)}g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fat</p>
                <p className="text-lg md:text-xl font-semibold">
                  {formatMacro(meal.analysis.macros.fat)}g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Protein</p>
                <p className="text-lg md:text-xl font-semibold">
                  {formatMacro(meal.analysis.macros.protein)}g
                </p>
              </div>
            </div>
          )}

          {/* Calories if Available */}
          {totalCalories > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">Estimated Calories</p>
              <p className="text-2xl font-bold">~{totalCalories} cal</p>
            </div>
          )}

          {/* Notes if Available */}
          {meal.notes && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{meal.notes}</p>
            </div>
          )}

          {/* Timestamp */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              {new Date(meal.uploadedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
