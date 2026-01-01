import { useMemo } from 'react'
import { format, startOfDay, addDays, startOfWeek } from 'date-fns'

export interface DayData {
  date: string
  dayLabel: string
  proteinGrams: number
  mealCount: number
}

export interface WeeklyTrendData {
  days: DayData[]
  averageProtein: number
  highestDay: DayData | null
  lowestDay: DayData | null
}

/**
 * Generate weekly trend data for meals
 * @param meals - Array of meal objects
 * @param weekStartDate - Optional start date for the week (defaults to current week's Monday)
 */
export function useWeeklyTrend(meals: any[] = [], weekStartDate?: Date): WeeklyTrendData {
  return useMemo(() => {
    // Use provided week start or default to current week's Monday
    const weekStart = weekStartDate 
      ? startOfDay(weekStartDate)
      : startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
    
    const days: DayData[] = []

    // Generate 7 days starting from week start (Mon-Sun)
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      const dateString = format(date, 'yyyy-MM-dd')
      const dayLabel = format(date, 'EEE') // Mon, Tue, etc.

      // Find meals for this day
      const dayMeals = meals.filter(meal => {
        const mealDate = format(new Date(meal.uploadedAt), 'yyyy-MM-dd')
        return mealDate === dateString
      })

      // Sum protein for the day
      const proteinGrams = dayMeals.reduce((sum, meal) => {
        return sum + (meal.analysis?.totalProtein || 0)
      }, 0)

      days.push({
        date: dateString,
        dayLabel,
        proteinGrams: Math.round(proteinGrams),
        mealCount: dayMeals.length,
      })
    }

    // Calculate average (excluding days with 0)
    const daysWithMeals = days.filter(d => d.proteinGrams > 0)
    const averageProtein = daysWithMeals.length > 0
      ? Math.round(daysWithMeals.reduce((sum, d) => sum + d.proteinGrams, 0) / daysWithMeals.length)
      : 0

    // Find highest and lowest days (only among days with meals)
    let highestDay: DayData | null = null
    let lowestDay: DayData | null = null

    if (daysWithMeals.length > 0) {
      highestDay = daysWithMeals.reduce((max, d) => d.proteinGrams > max.proteinGrams ? d : max)
      lowestDay = daysWithMeals.reduce((min, d) => d.proteinGrams < min.proteinGrams ? d : min)
    }

    return {
      days,
      averageProtein,
      highestDay,
      lowestDay,
    }
  }, [meals, weekStartDate?.getTime()])
}
