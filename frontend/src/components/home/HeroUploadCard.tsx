import React from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

interface HeroUploadCardProps {
  onUploadClick: () => void
  isLoading?: boolean
}

export function HeroUploadCard({ onUploadClick, isLoading = false }: HeroUploadCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-16">
      {/* Hero Section with Gradient Background */}
      <motion.div 
        className="text-center mb-8 md:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Logo */}
        <motion.div 
          className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <span className="text-4xl md:text-5xl">🍽️</span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Know Your Protein
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Snap a photo. Get instant protein insights powered by AI.
        </motion.p>
        
        {/* Trust Elements with Icons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
            <span className="text-xl">🤖</span>
            <span className="text-sm font-medium">AI-powered</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
            <span className="text-xl">⚡</span>
            <span className="text-sm font-medium">Instant results</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
            <span className="text-xl">🔒</span>
            <span className="text-sm font-medium">Privacy first</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Example Results Preview Card */}
      <motion.div 
        className="bg-gradient-to-br from-card to-secondary/30 border-2 border-border rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-primary/10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">✨</span>
          <h2 className="text-lg font-semibold text-foreground">
            What you'll see
          </h2>
        </div>
        
        <div className="space-y-4">
          {/* Mock Result Cards */}
          {[
            { name: 'Grilled Chicken Breast', portion: '100g portion', protein: '31g', confidence: 94, emoji: '🍗' },
            { name: 'Brown Rice', portion: '1 cup cooked', protein: '5g', confidence: 87, emoji: '🍚' },
            { name: 'Steamed Broccoli', portion: '1 cup', protein: '3g', confidence: 91, emoji: '🥦' },
          ].map((item, index) => (
            <motion.div 
              key={item.name}
              className="bg-background rounded-xl border border-border/50 p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.portion}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{item.protein}</span>
                  <p className="text-xs text-muted-foreground">{item.confidence}% confidence</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Total */}
          <motion.div 
            className="flex items-center justify-between pt-4 border-t-2 border-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">💪</span>
              <span className="text-lg font-semibold text-foreground">Total Protein</span>
            </div>
            <span className="text-3xl font-bold text-primary">39g</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Button
          onClick={onUploadClick}
          disabled={isLoading}
          variant="primary"
          size="lg"
          className="w-full min-h-[56px] text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              📸 Upload Meal Photo
            </span>
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center mt-4 flex items-center justify-center gap-2">
          <span>✓ JPG, PNG supported</span>
          <span className="text-border">•</span>
          <span>✓ Max 10MB</span>
          <span className="text-border">•</span>
          <span>✓ No login required</span>
        </p>
      </motion.div>
      
      {/* Stats Section */}
      <motion.div 
        className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-primary">10K+</p>
          <p className="text-xs md:text-sm text-muted-foreground">Meals Analyzed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-primary">95%</p>
          <p className="text-xs md:text-sm text-muted-foreground">Accuracy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-primary">&lt;5s</p>
          <p className="text-xs md:text-sm text-muted-foreground">Analysis Time</p>
        </div>
      </motion.div>
    </div>
  )
}
