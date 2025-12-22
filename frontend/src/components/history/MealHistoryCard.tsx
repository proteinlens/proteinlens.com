import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { getCardVariants, getInteractionScale } from '@/utils/animations'
import { Button } from '@/components/ui/Button'
import { useDeleteMeal } from '@/hooks/useMeal'

interface MealHistoryCardProps {
  mealId: string
  meal: any
  onClick?: () => void
  onDelete?: () => void
}

export function MealHistoryCard({ mealId, meal, onClick, onDelete }: MealHistoryCardProps) {
  const totalProtein = meal.analysis?.totalProtein || 0
  const foodCount = meal.analysis?.foods?.length || 0
  const timestamp = new Date(meal.uploadedAt)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const deleteHook = useDeleteMeal()
  const cardVariants = getCardVariants()
  const { hover, tap } = getInteractionScale()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteHook.mutateAsync(mealId)
      onDelete?.()
    } catch (error) {
      console.error('Failed to delete meal:', error)
    }
  }

  return (
    <>
    <motion.div
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group relative"
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

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(!showDeleteConfirm)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete meal"
              >
                🗑️
              </Button>

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

    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-2 bg-destructive/10 border border-destructive/30 rounded-lg p-4"
      >
        <p className="text-sm font-medium text-destructive mb-3">
          Delete this meal?
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteHook.isPending}
            className="flex-1"
          >
            {deleteHook.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteConfirm(false)
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    )}
    </>
  )
}
