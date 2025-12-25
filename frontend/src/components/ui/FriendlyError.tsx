// FriendlyError Component
// Beautiful, engaging error states that don't scare users

import React, { useState, useEffect } from 'react'
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
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Auto-retry logic with exponential backoff
  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  // Auto-retry on mount for transient errors (first 2 attempts)
  useEffect(() => {
    const isTransientError = config.color === 'amber' || config.color === 'blue'
    if (isTransientError && retryCount === 0 && onRetry) {
      const timeout = setTimeout(() => {
        handleRetry()
      }, 2000) // Auto-retry after 2 seconds
      return () => clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* Retry info */}
      {retryCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Attempt {retryCount + 1} • {retryCount < 3 ? "Let's keep trying!" : "Still working on it..."}
        </p>
      )}
      
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

      {/* Fun footer message based on retry count */}
      {retryCount >= 3 && (
        <p className="text-xs text-muted-foreground pt-2 italic">
          🦾 Persistence pays off! Or try again later - we won't judge.
        </p>
      )}
    </div>
  )
}

export default FriendlyError
