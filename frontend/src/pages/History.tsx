import React, { useState } from 'react'
import { useMeals } from '@/hooks/useMeal'
import { useWeeklyTrend } from '@/hooks/useWeeklyTrend'
import { WeeklyTrendChart } from '@/components/history/WeeklyTrendChart'
import { MealHistoryList } from '@/components/history/MealHistoryList'

export function History() {
  // TODO: Replace with actual userId from auth context
  const userId = 'demo-user'
  const { data: meals = [], isLoading, error, refetch } = useMeals(userId)
  const { days, averageProtein } = useWeeklyTrend(meals)
  const [key, setKey] = useState(0)

  const handleMealClick = (meal: any) => {
    // TODO: Navigate to /meal/:id or open modal
    console.log('Clicked meal:', meal)
  }

  const handleMealDelete = () => {
    // Refetch meals after delete to update the list
    refetch()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {/* Skeleton Chart */}
          <div className="bg-card border border-border rounded-lg p-6 h-80 animate-pulse">
            <div className="h-5 bg-muted rounded w-32 mb-4" />
            <div className="h-full bg-muted rounded" />
          </div>

          {/* Skeleton List */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-48" />
                </div>
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Failed to Load History
          </h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Meal History</h1>

      {/* Weekly Trend Chart */}
      {meals.length > 0 && (
        <div className="mb-8">
          <WeeklyTrendChart days={days} averageProtein={averageProtein} />
        </div>
      )}

      {/* Meal List */}
      <MealHistoryList 
        meals={meals} 
        onMealClick={handleMealClick}
        onMealDelete={handleMealDelete}
      />
    </div>
  )
}
