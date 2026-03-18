import React from 'react'
import { Button } from '@/components/ui/Button'
import { motion, useReducedMotion } from 'framer-motion'
import { Camera, Cpu, Zap, Shield, Dumbbell } from 'lucide-react'

interface HeroUploadCardProps {
  onUploadClick: () => void
  isLoading?: boolean
}

export function HeroUploadCard({ onUploadClick, isLoading = false }: HeroUploadCardProps) {
  const shouldReduceMotion = useReducedMotion()

  // Respect prefers-reduced-motion: skip animations entirely
  const anim = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay } }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-16">
      {/* Hero Section */}
      <motion.div className="text-center mb-8 md:mb-12" {...anim(0)}>
        {/* Logo — SVG icon, not emoji */}
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 mb-6">
          <Camera className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1.8} />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Know Your Protein
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto">
          Snap a photo. Get instant protein insights powered by AI.
        </p>

        {/* Trust Elements — SVG icons, not emojis */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">AI-powered</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Instant results</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Privacy first</span>
          </div>
        </div>
      </motion.div>

      {/* Example Results Preview Card — single entrance animation */}
      <motion.div
        className="bg-gradient-to-br from-card to-secondary/30 border-2 border-border rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-primary/10"
        {...anim(0.15)}
      >
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            What you'll see
          </h2>
        </div>

        <div className="space-y-4">
          {/* Result Cards — no individual stagger animations */}
          {[
            { name: 'Grilled Chicken Breast', portion: '100g portion', protein: '31g', confidence: 94, icon: '🍗' },
            { name: 'Brown Rice', portion: '1 cup cooked', protein: '5g', confidence: 87, icon: '🍚' },
            { name: 'Steamed Broccoli', portion: '1 cup', protein: '3g', confidence: 91, icon: '🥦' },
          ].map((item) => (
            <div
              key={item.name}
              className="bg-background rounded-xl border border-border/50 p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-default"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {/* Food emojis are decorative (content), not functional icons — acceptable */}
                  <span className="text-2xl" role="img" aria-hidden="true">{item.icon}</span>
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
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-primary/20">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">Total Protein</span>
            </div>
            <span className="text-3xl font-bold text-primary">39g</span>
          </div>
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div {...anim(0.25)}>
        <Button
          onClick={onUploadClick}
          disabled={isLoading}
          variant="primary"
          size="lg"
          className="w-full min-h-[56px] text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Upload Meal Photo
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
        {...anim(0.35)}
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
