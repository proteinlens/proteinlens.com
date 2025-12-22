import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DayData } from '@/hooks/useWeeklyTrend'

interface WeeklyTrendChartProps {
  days: DayData[]
  averageProtein: number
}

export function WeeklyTrendChart({ days, averageProtein }: WeeklyTrendChartProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">7-Day Protein Trend</h3>

      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="dayLabel" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Protein (g)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
              formatter={(value: number, name: string, props: any) => {
                const mealCount = props.payload.mealCount
                return [
                  `${value}g protein (${mealCount} ${mealCount === 1 ? 'meal' : 'meals'})`,
                  ''
                ]
              }}
            />
            <Bar 
              dataKey="proteinGrams" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {averageProtein > 0 && (
        <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Weekly Average</p>
            <p className="text-lg font-semibold text-primary">{averageProtein}g</p>
          </div>
        </div>
      )}
    </div>
  )
}
