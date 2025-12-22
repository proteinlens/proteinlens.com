import React from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

interface HeroUploadCardProps {
  onUploadClick: () => void
  isLoading?: boolean
}

export function HeroUploadCard({ onUploadClick, isLoading = false }: HeroUploadCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-16">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Know Your Protein
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Take a photo of your meal. AI tells you the protein content.
        </p>
        
        {/* Trust Elements */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span className="text-muted-foreground">AI-powered analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span className="text-muted-foreground">Edit anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span className="text-muted-foreground">Your data, your control</span>
          </div>
        </div>
      </div>

      {/* Example Results Preview */}
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8 shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">
          Here's what you'll see:
        </h2>
        
        <div className="space-y-4">
          {/* Mock Result Card */}
          <div className="bg-background rounded border border-border/50 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">Grilled Chicken Breast</h3>
                <p className="text-sm text-muted-foreground">100g portion</p>
              </div>
              <span className="text-lg font-bold text-primary">31g</span>
            </div>
            <p className="text-xs text-muted-foreground">protein detected with 94% confidence</p>
          </div>

          <div className="bg-background rounded border border-border/50 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">Brown Rice</h3>
                <p className="text-sm text-muted-foreground">1 cup cooked</p>
              </div>
              <span className="text-lg font-bold text-primary">5g</span>
            </div>
            <p className="text-xs text-muted-foreground">protein detected with 87% confidence</p>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <span className="text-sm font-semibold">Total Protein:</span>
            <span className="text-2xl font-bold text-primary">36g</span>
          </div>
        </div>
      </div>

      {/* Primary CTA - In Bottom Third for Mobile */}
      <Button
        onClick={onUploadClick}
        disabled={isLoading}
        variant="primary"
        size="lg"
        className="w-full min-h-[44px] md:min-h-[40px]"
      >
        {isLoading ? 'Loading...' : 'Upload Meal Photo'}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Supports JPG, PNG • Max 10MB • No login required
      </p>
    </div>
  )
}
