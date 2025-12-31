import React, { useState, useMemo } from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { DayData } from '@/hooks/useWeeklyTrend'
import { useGoal } from '@/hooks/useGoal'

interface WeeklyTrendChartProps {
  days: DayData[]
  averageProtein: number
}

export function WeeklyTrendChart({ days, averageProtein }: WeeklyTrendChartProps) {
  const [showGoalLine, setShowGoalLine] = useState(true)
  const [showAverage, setShowAverage] = useState(true)
  const { goal } = useGoal()

  // Calculate stats
  const stats = useMemo(() => {
    const daysWithData = days.filter(d => d.proteinGrams > 0)
    const totalMeals = days.reduce((sum, d) => sum + d.mealCount, 0)
    const bestDay = daysWithData.length > 0 
      ? daysWithData.reduce((max, d) => d.proteinGrams > max.proteinGrams ? d : max, daysWithData[0])
      : null
    const daysOnTarget = days.filter(d => d.proteinGrams >= goal).length
    const streakDays = calculateStreak(days, goal)
    
    return {
      totalMeals,
      bestDay,
      daysOnTarget,
      streakDays,
      daysTracked: daysWithData.length,
    }
  }, [days, goal])

  // Enhanced chart data with gradient info
  const chartData = useMemo(() => {
    return days.map((day, index) => ({
      ...day,
      goalPercent: goal > 0 ? Math.min((day.proteinGrams / goal) * 100, 150) : 0,
      fullDate: day.date,
      isToday: index === days.length - 1,
    }))
  }, [days, goal])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    
    const data = payload[0].payload
    const percentOfGoal = goal > 0 ? Math.round((data.proteinGrams / goal) * 100) : 0
    const isGoalMet = data.proteinGrams >= goal
    
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{data.isToday ? '📅' : '📊'}</span>
          <span className="font-semibold text-foreground">
            {format(parseISO(data.fullDate), 'EEEE, MMM d')}
          </span>
          {data.isToday && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              Today
            </span>
          )}
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-8">
            <span className="text-muted-foreground">Protein</span>
            <span className="font-bold text-xl text-foreground">{data.proteinGrams}g</span>
          </div>
          
          <div className="flex items-center justify-between gap-8">
            <span className="text-muted-foreground">Meals</span>
            <span className="font-medium text-foreground">{data.mealCount}</span>
          </div>
          
          {goal > 0 && (
            <div className="flex items-center justify-between gap-8 pt-1.5 border-t border-border">
              <span className="text-muted-foreground">Goal progress</span>
              <span className={`font-medium ${isGoalMet ? 'text-green-500' : 'text-orange-500'}`}>
                {percentOfGoal}% {isGoalMet ? '✓' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Custom legend
  const renderLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent" />
        <span className="text-muted-foreground">Daily Protein</span>
      </div>
      {showGoalLine && goal > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }} />
          <span className="text-muted-foreground">Goal ({goal}g)</span>
        </div>
      )}
      {showAverage && averageProtein > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-blue-500 opacity-50" />
          <span className="text-muted-foreground">Avg ({averageProtein}g)</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-4 md:p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>📈</span> Weekly Protein Trend
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your protein intake over the past 7 days
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowGoalLine(!showGoalLine)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                showGoalLine 
                  ? 'bg-green-500/20 text-green-600 border border-green-500/30' 
                  : 'bg-muted text-muted-foreground border border-transparent'
              }`}
            >
              🎯 Goal Line
            </button>
            <button
              onClick={() => setShowAverage(!showAverage)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                showAverage 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'bg-muted text-muted-foreground border border-transparent'
              }`}
            >
              📊 Average
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStat 
            emoji="🔥" 
            label="Weekly Avg" 
            value={`${averageProtein}g`}
            subtext={goal > 0 ? `${Math.round((averageProtein / goal) * 100)}% of goal` : undefined}
            highlight={averageProtein >= goal}
          />
          <QuickStat 
            emoji="🏆" 
            label="Best Day" 
            value={stats.bestDay ? `${stats.bestDay.proteinGrams}g` : '-'}
            subtext={stats.bestDay?.dayLabel}
          />
          <QuickStat 
            emoji="✅" 
            label="Days on Target" 
            value={`${stats.daysOnTarget}/7`}
            highlight={stats.daysOnTarget >= 5}
          />
          <QuickStat 
            emoji="⚡" 
            label="Current Streak" 
            value={stats.streakDays > 0 ? `${stats.streakDays} day${stats.streakDays > 1 ? 's' : ''}` : '-'}
            highlight={stats.streakDays >= 3}
          />
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 md:p-6">
        <div className="h-72 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.5}
                vertical={false}
              />
              
              <XAxis 
                dataKey="dayLabel" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                dy={10}
              />
              
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}g`}
                width={50}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Goal Reference Line */}
              {showGoalLine && goal > 0 && (
                <ReferenceLine 
                  y={goal} 
                  stroke="#22c55e" 
                  strokeDasharray="8 4"
                  strokeWidth={2}
                  label={{ 
                    value: `Goal: ${goal}g`, 
                    position: 'right',
                    fill: '#22c55e',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />
              )}
              
              {/* Average Reference Line */}
              {showAverage && averageProtein > 0 && (
                <ReferenceLine 
                  y={averageProtein} 
                  stroke="#3b82f6" 
                  strokeDasharray="4 2"
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                />
              )}
              
              <Area
                type="monotone"
                dataKey="proteinGrams"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                fill="url(#proteinGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props
                  const isGoalMet = payload.proteinGrams >= goal
                  const isToday = payload.isToday
                  
                  return (
                    <g key={`dot-${payload.date}`}>
                      {/* Glow effect for today or goal met */}
                      {(isToday || isGoalMet) && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={12}
                          fill={isGoalMet ? '#22c55e' : 'hsl(var(--primary))'}
                          opacity={0.2}
                        />
                      )}
                      {/* Main dot */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isToday ? 6 : 4}
                        fill={isGoalMet ? '#22c55e' : 'hsl(var(--primary))'}
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      />
                      {/* Today indicator */}
                      {isToday && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={9}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          strokeDasharray="4 2"
                          opacity={0.5}
                        />
                      )}
                    </g>
                  )
                }}
                activeDot={{
                  r: 8,
                  strokeWidth: 3,
                  stroke: 'hsl(var(--card))',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        {renderLegend()}
      </div>

      {/* Motivational Footer */}
      {stats.daysTracked > 0 && (
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-center">
            <p className="text-sm text-foreground">
              {getMotivationalMessage(stats.daysOnTarget, stats.streakDays, averageProtein, goal)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Quick stat component
interface QuickStatProps {
  emoji: string
  label: string
  value: string
  subtext?: string
  highlight?: boolean
}

function QuickStat({ emoji, label, value, subtext, highlight }: QuickStatProps) {
  return (
    <div className={`bg-card/50 backdrop-blur-sm rounded-xl p-3 border transition-all ${
      highlight 
        ? 'border-green-500/30 bg-green-500/5' 
        : 'border-border/50'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{emoji}</span>
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <div className={`text-lg font-bold ${highlight ? 'text-green-600' : 'text-foreground'}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>
      )}
    </div>
  )
}

// Calculate current streak of days on target
function calculateStreak(days: DayData[], goal: number): number {
  let streak = 0
  // Start from today (last element) and go backwards
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].proteinGrams >= goal && days[i].mealCount > 0) {
      streak++
    } else if (days[i].mealCount > 0) {
      break
    }
  }
  return streak
}

// Get motivational message based on performance
function getMotivationalMessage(
  daysOnTarget: number, 
  streakDays: number, 
  average: number, 
  goal: number
): string {
  if (streakDays >= 7) {
    return "🏆 Perfect week! You hit your protein goal every single day. You're unstoppable!"
  }
  if (streakDays >= 5) {
    return `🔥 Amazing ${streakDays}-day streak! You're building great habits. Keep it going!`
  }
  if (streakDays >= 3) {
    return `💪 Nice ${streakDays}-day streak! You're on a roll. Can you make it to 5?`
  }
  if (daysOnTarget >= 5) {
    return "⭐ Excellent week! You hit your goal on most days. Great consistency!"
  }
  if (daysOnTarget >= 3) {
    return "👍 Good progress! You're getting there. Try to hit your goal a bit more consistently."
  }
  if (average >= goal * 0.8) {
    return "📈 You're close to your goal! A few small additions could get you there."
  }
  if (average > 0) {
    return "🌱 Every journey starts somewhere. Keep tracking and you'll see improvement!"
  }
  return "📸 Start tracking your meals to see your protein trends!"
}

