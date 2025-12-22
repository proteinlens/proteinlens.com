import React from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { MealHistoryCard } from './MealHistoryCard'

interface MealHistoryListProps {
  meals: any[]
  onMealClick?: (meal: any) => void
}

export function MealHistoryList({ meals, onMealClick }: MealHistoryListProps) {
  // Group meals by date
  const groupedMeals = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {}

    meals.forEach(meal => {
      const date = format(new Date(meal.uploadedAt), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(meal)
    })

    // Sort each group by time (most recent first)
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
    })

    return groups
  }, [meals])

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEEE, MMM d')
  }

  const sortedDates = Object.keys(groupedMeals).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (meals.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 md:p-12 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No meals yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Upload your first meal photo to start tracking your protein intake
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="primary"
            size="md"
          >
            Upload Meal Photo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(date => (
        <div key={date}>
          {/* Date Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-2 mb-3 z-10">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {getDateLabel(date)}
            </h3>
            {groupedMeals[date].length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {groupedMeals[date].reduce((sum, m) => sum + (m.analysis?.totalProtein || 0), 0)}g total protein
              </p>
            )}
          </div>

          {/* Meals for this date */}
          <div className="space-y-3">
            {groupedMeals[date].map((meal) => (
              <MealHistoryCard
                key={meal.mealAnalysisId || meal.id}
                meal={meal}
                onClick={() => onMealClick?.(meal)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
