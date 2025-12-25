// FunLoading Component
// Engaging loading states with rotating messages

import React, { useState, useEffect } from 'react'
import { loadingMessages, getRandomMessage } from '@/utils/friendlyErrors'

interface FunLoadingProps {
  type: 'uploading' | 'analyzing'
  progress?: number
  className?: string
}

const funFacts = [
  "Did you know? Eggs have about 6g of protein each! 🥚",
  "Fun fact: Greek yogurt has twice the protein of regular yogurt! 🥛",
  "Chicken breast is 31% protein - nature's protein bar! 🍗",
  "Tip: Eating protein at breakfast helps reduce cravings! 🌅",
  "Pro tip: Almonds have 6g protein per ounce! 🥜",
]

export function FunLoading({ type, progress = 0, className = "" }: FunLoadingProps) {
  const messages = loadingMessages[type]
  const [currentMessage, setCurrentMessage] = useState(() => getRandomMessage(messages))
  const [funFact, setFunFact] = useState(() => funFacts[Math.floor(Math.random() * funFacts.length)])
  const [dots, setDots] = useState('')

  // Rotate messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(getRandomMessage(messages))
    }, 3000)
    return () => clearInterval(interval)
  }, [messages])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Change fun fact every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
      <div className="text-center p-8 max-w-md">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-5xl animate-bounce">{currentMessage.emoji}</span>
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-primary/20 animate-ping" />
        </div>

        {/* Main message */}
        <h2 className="text-xl font-bold text-foreground mb-2 transition-all duration-300">
          {currentMessage.text}{dots}
        </h2>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="w-64 mx-auto mb-4">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground mt-2 block">
              {progress}% complete
            </span>
          </div>
        )}

        {/* Fun fact card */}
        <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 text-sm text-muted-foreground transition-all duration-500">
          <p className="italic">{funFact}</p>
        </div>

        {/* Skeleton shimmer */}
        <div className="mt-6 space-y-2 opacity-50">
          <div className="h-2 bg-secondary rounded animate-pulse w-3/4 mx-auto" />
          <div className="h-2 bg-secondary rounded animate-pulse w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  )
}

export default FunLoading
