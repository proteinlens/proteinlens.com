import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useMeals } from '@/hooks/useMeal'
import { useWeeklyTrend } from '@/hooks/useWeeklyTrend'
import { WeeklyTrendChart } from '@/components/history/WeeklyTrendChart'
import { MealHistoryList } from '@/components/history/MealHistoryList'
import { MealDetailModal } from '@/components/history/MealDetailModal'
import { ProteinTargetCard } from '@/components/history/ProteinTargetCard'
import { getUserId, setUserId } from '@/utils/userId'
import { useAuth } from '@/contexts/AuthProvider'
import { FriendlyError } from '@/components/ui/FriendlyError'
import { emptyStates } from '@/utils/friendlyErrors'
import { migrateMeals } from '@/services/authService'
import { isToday, parseISO } from 'date-fns'

export function History() {
  const { user } = useAuth()
  const migrationAttemptedRef = useRef(false)
  const [isMigrating, setIsMigrating] = useState(false)
  
  // Use authenticated user ID if available, otherwise fall back to localStorage ID
  // This ensures consistency between logged-in users and anonymous users
  const userId = useMemo(() => {
    // Prefer authenticated user ID
    if (user?.id) {
      return user.id
    }
    // Fall back to localStorage-based ID for anonymous users
    try {
      return getUserId()
    } catch (e) {
      console.error('Failed to get user ID:', e)
      return 'anonymous'
    }
  }, [user?.id])
  
  const { data: meals = [], isLoading, error, refetch } = useMeals(userId)
  const { days, averageProtein } = useWeeklyTrend(meals)
  const [selectedMeal, setSelectedMeal] = useState<any>(null)

  // Calculate today's total protein intake
  const todayProtein = useMemo(() => {
    return meals
      .filter(meal => {
        try {
          const mealDate = typeof meal.uploadedAt === 'string' 
            ? parseISO(meal.uploadedAt) 
            : new Date(meal.uploadedAt);
          return isToday(mealDate);
        } catch {
          return false;
        }
      })
      .reduce((sum, meal) => sum + (meal.analysis?.totalProtein || 0), 0);
  }, [meals]);

  // Auto-migrate meals from old localStorage ID to authenticated user
  useEffect(() => {
    async function attemptMigration() {
      // Only run once, only for authenticated users, only when meals loaded
      if (migrationAttemptedRef.current || !user?.id || isLoading) return
      
      // Get the old localStorage userId (before we sync it)
      const oldUserId = localStorage.getItem('proteinlens_user_id')
      
      // Skip if no old ID or old ID is same as authenticated ID
      if (!oldUserId || oldUserId === user.id) {
        // Sync localStorage with authenticated user ID
        setUserId(user.id)
        migrationAttemptedRef.current = true
        return
      }
      
      // Skip if old ID is already a proper UUID (already migrated)
      if (oldUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        migrationAttemptedRef.current = true
        return
      }
      
      migrationAttemptedRef.current = true
      setIsMigrating(true)
      
      console.log('[History] Attempting to migrate meals from', oldUserId, 'to', user.id)
      
      try {
        const result = await migrateMeals(oldUserId)
        if (result.migratedCount > 0) {
          console.log(`[History] Migrated ${result.migratedCount} meals`)
          // Sync localStorage and refetch meals
          setUserId(user.id)
          refetch()
        } else {
          // No meals to migrate, just sync the userId
          setUserId(user.id)
        }
      } catch (err) {
        console.warn('[History] Migration failed:', err)
        // Still sync userId even if migration fails
        setUserId(user.id)
      } finally {
        setIsMigrating(false)
      }
    }
    
    attemptMigration()
  }, [user?.id, isLoading, refetch])

  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal)
  }

  const handleMealDelete = () => {
    // Refetch meals after delete to update the list
    refetch()
  }

  if (isLoading || isMigrating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isMigrating && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
            <span className="text-primary">🔄 Syncing your meals...</span>
          </div>
        )}
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

      {/* Protein Target Progress Card */}
      <div className="mb-6">
        <ProteinTargetCard todayProtein={todayProtein} />
      </div>

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

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          isOpen={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onDelete={handleMealDelete}
        />
      )}
    </div>
  )
}
