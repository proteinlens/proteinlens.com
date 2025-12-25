import React, { useState } from 'react'
import { useMeals } from '@/hooks/useMeal'
import { useWeeklyTrend } from '@/hooks/useWeeklyTrend'
import { WeeklyTrendChart } from '@/components/history/WeeklyTrendChart'
import { MealHistoryList } from '@/components/history/MealHistoryList'
import { getUserId } from '@/utils/userId'

export function History() {
  // Use persistent user ID from storage
  const userId = getUserId()
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
    const isServerError = errorMessage.includes('500') || errorMessage.includes('Server') || errorMessage.includes('server')
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Network')
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`
          border rounded-2xl p-8 text-center space-y-4
          ${isNetworkError 
            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
            : isServerError 
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
              : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
          }
        `}>
          {/* Icon */}
          <div className={`
            w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl
            ${isNetworkError 
              ? 'bg-blue-100' 
              : isServerError 
                ? 'bg-amber-100'
                : 'bg-red-100'
            }
          `}>
            {isNetworkError ? '📡' : isServerError ? '⚙️' : '⚠️'}
          </div>
          
          {/* Title */}
          <h3 className={`
            text-xl font-bold
            ${isNetworkError 
              ? 'text-blue-800' 
              : isServerError 
                ? 'text-amber-800'
                : 'text-red-800'
            }
          `}>
            {isNetworkError 
              ? 'Connection Issue' 
              : isServerError 
                ? 'Server Temporarily Busy'
                : 'Failed to Load History'
            }
          </h3>
          
          {/* Subtitle */}
          <p className="text-muted-foreground max-w-md mx-auto">
            {isNetworkError 
              ? "We couldn't reach our servers. Please check your internet connection."
              : isServerError 
                ? "Our servers are experiencing high load. Please wait a moment and try again."
                : errorMessage
            }
          </p>
          
          {/* Tips */}
          <div className={`
            rounded-xl p-4 text-sm text-left max-w-sm mx-auto
            ${isNetworkError 
              ? 'bg-blue-100/50' 
              : isServerError 
                ? 'bg-amber-100/50'
                : 'bg-red-100/50'
            }
          `}>
            <p className="font-medium mb-2">💡 Quick tips:</p>
            <ul className="space-y-1 text-muted-foreground">
              {isNetworkError ? (
                <>
                  <li>• Check your WiFi or mobile data</li>
                  <li>• Try refreshing the page</li>
                  <li>• Disable VPN if enabled</li>
                </>
              ) : isServerError ? (
                <>
                  <li>• Wait 30 seconds and retry</li>
                  <li>• Check our status page</li>
                  <li>• Your data is safe</li>
                </>
              ) : (
                <>
                  <li>• Try refreshing the page</li>
                  <li>• Clear browser cache</li>
                  <li>• Contact support if issue persists</li>
                </>
              )}
            </ul>
          </div>
          
          {/* Retry Button */}
          <button 
            onClick={() => refetch()} 
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
              transition-all duration-200 hover:scale-105 active:scale-95
              ${isNetworkError 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : isServerError 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            `}
          >
            <span>🔄</span>
            <span>Try Again</span>
          </button>
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
