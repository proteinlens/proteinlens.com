import React, { useState, useMemo } from 'react'
import { useMeals } from '@/hooks/useMeal'
import { useWeeklyTrend } from '@/hooks/useWeeklyTrend'
import { WeeklyTrendChart } from '@/components/history/WeeklyTrendChart'
import { MealHistoryList } from '@/components/history/MealHistoryList'
import { getUserId } from '@/utils/userId'
import { FriendlyError } from '@/components/ui/FriendlyError'
import { emptyStates } from '@/utils/friendlyErrors'

export function History() {
  // Use persistent user ID from storage - safely handle localStorage errors
  const userId = useMemo(() => {
    try {
      return getUserId()
    } catch (e) {
      console.error('Failed to get user ID:', e)
      return 'anonymous'
    }
  }, [])
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
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Meal History</h1>
        <FriendlyError 
          error={errorMessage}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">📊 Meal History</h1>

      {/* Empty State */}
      {meals.length === 0 && !isLoading && (
        <div className="text-center py-16 px-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">{emptyStates.history.icon}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{emptyStates.history.title}</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{emptyStates.history.subtitle}</p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            📸 {emptyStates.history.action}
          </a>
        </div>
      )}

      {/* Weekly Trend Chart */}
      {meals.length > 0 && (
        <div className="mb-8">
          <WeeklyTrendChart days={days} averageProtein={averageProtein} />
        </div>
      )}

      {/* Meal List */}
      {meals.length > 0 && (
        <MealHistoryList 
          meals={meals} 
          onMealClick={handleMealClick}
          onMealDelete={handleMealDelete}
        />
      )}
    </div>
  )
}
