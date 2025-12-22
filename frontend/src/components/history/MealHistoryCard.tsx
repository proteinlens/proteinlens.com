import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { getCardVariants, getInteractionScale } from '@/utils/animations'

interface MealHistoryCardProps {
  meal: any
  onClick?: () => void
}

export function MealHistoryCard({ meal, onClick }: MealHistoryCardProps) {
  const totalProtein = meal.analysis?.totalProtein || 0
  const foodCount = meal.analysis?.foods?.length || 0
  const timestamp = new Date(meal.uploadedAt)
  
  const cardVariants = getCardVariants()
  const { hover, tap } = getInteractionScale()

  return (
    <motion.div
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3 }}
      whileHover={{ scale: hover }}
      whileTap={{ scale: tap }}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        {meal.imageUrl && (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={meal.imageUrl}
              alt="Meal"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {format(timestamp, 'h:mm a')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {foodCount} {foodCount === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Protein Badge */}
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {totalProtein}
              </p>
              <p className="text-xs text-muted-foreground">
                grams
              </p>
            </div>
          </div>

          {/* Food items preview */}
          {meal.analysis?.foods && meal.analysis.foods.length > 0 && (
            <div className="text-sm text-muted-foreground truncate">
              {meal.analysis.foods.slice(0, 2).map((f: any) => f.name).join(', ')}
              {meal.analysis.foods.length > 2 && ` +${meal.analysis.foods.length - 2} more`}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
