// FriendlyError Component
// Beautiful, engaging error states that don't scare users

import React, { useState } from 'react'
import { getFriendlyError, errorColors, type FriendlyError as FriendlyErrorType } from '@/utils/friendlyErrors'

interface FriendlyErrorProps {
  error: string
  onRetry?: () => void
  onSecondaryAction?: () => void
  secondaryActionText?: string
  className?: string
  compact?: boolean
}

export function FriendlyError({ 
  error, 
  onRetry, 
  onSecondaryAction,
  secondaryActionText = "Start Over",
  className = "",
  compact = false,
}: FriendlyErrorProps) {
  const config = getFriendlyError(error)
  const colors = errorColors[config.color]
  const [isRetrying, setIsRetrying] = useState(false)

  // Manual retry handler - no auto-retry to avoid loops
  const handleRetry = async () => {
    if (!onRetry || isRetrying) return
    
    setIsRetrying(true)
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  if (compact) {
    return (
      <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border} ${className}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${colors.title}`}>{config.title}</p>
            <p className="text-sm text-muted-foreground truncate">{config.subtitle}</p>
          </div>
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${colors.button} disabled:opacity-50`}
            >
              {isRetrying ? '...' : '🔄'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-8 text-center space-y-4 ${colors.bg} border ${colors.border} ${className}`}>
      {/* Animated Icon */}
      <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl ${colors.iconBg} animate-bounce`}>
        {config.icon}
      </div>
      
      {/* Title */}
      <h3 className={`text-xl font-bold ${colors.title}`}>
        {config.title}
      </h3>
      
      {/* Subtitle */}
      <p className="text-muted-foreground max-w-md mx-auto">
        {config.subtitle}
      </p>
      
      {/* Tips */}
      <div className={`rounded-xl p-4 text-sm text-left max-w-sm mx-auto ${colors.tipBg}`}>
        <p className="font-medium mb-2 text-foreground">💡 Here's what you can do:</p>
        <ul className="space-y-1.5 text-muted-foreground">
          {config.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {onRetry && (
          <button 
            onClick={handleRetry}
            disabled={isRetrying}
            className={`
              inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
              transition-all duration-200 hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:hover:scale-100
              ${colors.button}
            `}
          >
            {isRetrying ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Trying...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>{config.retryText}</span>
              </>
            )}
          </button>
        )}
        
        {onSecondaryAction && (
          <button 
            onClick={onSecondaryAction}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
              bg-secondary text-foreground hover:bg-secondary/80
              transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  )
}

export default FriendlyError
