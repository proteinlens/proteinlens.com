import React from 'react'
import { cn } from '@/utils/cn'

interface AnalyzeProgressProps {
  progress: number // 0-100
  message?: string
}

export function AnalyzeProgress({ progress = 0, message = 'Analyzing your meal...' }: AnalyzeProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Progress Message */}
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">
            {message}
          </h2>
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {progress < 30 && 'Uploading photo...'}
            {progress >= 30 && progress < 70 && 'Analyzing with AI...'}
            {progress >= 70 && 'Finalizing results...'}
          </p>
        </div>

        {/* Skeleton Loading Cards */}
        <div className="space-y-4">
          {/* Skeleton Card 1 */}
          <div className="bg-card border border-border rounded-lg p-4 md:p-6 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
              <div className="h-8 bg-muted rounded w-16 ml-2" />
            </div>
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>

          {/* Skeleton Card 2 */}
          <div className="bg-card border border-border rounded-lg p-4 md:p-6 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-2/5" />
              </div>
              <div className="h-8 bg-muted rounded w-16 ml-2" />
            </div>
            <div className="h-3 bg-muted rounded w-3/5" />
          </div>

          {/* Skeleton Total */}
          <div className="bg-card border border-border rounded-lg p-4 md:p-6 animate-pulse">
            <div className="flex items-center gap-3 pt-2">
              <div className="h-5 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-20" />
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}
