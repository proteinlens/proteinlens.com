// FriendlyError Component
// Beautiful, engaging error states that don't scare users

import React, { useState } from 'react'
import { getFriendlyError, errorColors, categorizeError, type FriendlyError as FriendlyErrorType } from '@/utils/friendlyErrors'

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
  const errorCategory = categorizeError(error)

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

  // SPECIAL: Quota exceeded - show prominent upsell
  if (errorCategory === 'quota') {
    return (
      <div className={`rounded-2xl p-8 text-center space-y-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white ${className}`}
           style={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)' }}>
        {/* Animated Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-5xl bg-white/20 animate-bounce">
          🚀
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-white">
          You're a Scanning Machine!
        </h3>
        
        {/* Subtitle */}
        <p className="text-white/90 max-w-md mx-auto">
          You've maxed out your 3 free scans this week
        </p>
        
        {/* Upsell Box */}
        <div className="rounded-xl p-5 text-left max-w-sm mx-auto bg-white/15 border-2 border-white/30">
          <p className="font-semibold mb-3 text-white text-center text-lg">💡 Keep tracking your nutrition:</p>
          <div className="space-y-2 text-white/95">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span><strong>FREE Account</strong> → 20 scans/week</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span><strong>Pro Plan</strong> → Unlimited scans</span>
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 justify-center pt-2 max-w-sm mx-auto">
          <button 
            onClick={() => window.location.href = '/signup'}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold
              transition-all duration-200 hover:scale-105 active:scale-95
              bg-white text-purple-600 shadow-lg text-lg"
          >
            ✨ Create FREE Account
          </button>
          
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
              bg-white/20 text-white border-2 border-white
              transition-all duration-200 hover:scale-105 active:scale-95"
          >
            ⭐ Upgrade to Pro (Unlimited)
          </button>
        </div>
        
        {/* Info footer */}
        <p className="text-white/70 text-sm pt-2">
          ⏰ Guest quota resets in ~7 days
        </p>
      </div>
    )
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
