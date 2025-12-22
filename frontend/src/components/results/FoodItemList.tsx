import React from 'react'
import { motion } from 'framer-motion'
import type { FoodItem as FoodItemType } from '@/types/meal'
import { cn } from '@/utils/cn'
import { getCardVariants, getInteractionScale, getStaggerSettings } from '@/utils/animations'

interface FoodItemProps {
  item: FoodItemType
  onEdit?: (item: FoodItemType) => void
  isEditing?: boolean
}

export function FoodItem({ item, onEdit, isEditing = false }: FoodItemProps) {
  const cardVariants = getCardVariants()
  const { hover, tap } = getInteractionScale()
  
  return (
    <motion.div
      className={cn(
        'bg-card border border-border rounded-lg p-4 md:p-5 transition-all',
        'hover:border-primary/50 cursor-pointer group',
        isEditing && 'ring-2 ring-primary'
      )}
      onClick={() => onEdit?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onEdit?.(item)
        }
      }}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3 }}
      whileHover={{ scale: hover }}
      whileTap={{ scale: tap }}
    >
      <div className="flex justify-between items-start">
        {/* Name and Portion */}
        <div className="flex-1">
          <h4 className="font-semibold text-base md:text-lg mb-1">
            {item.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            {item.portion}
          </p>
        </div>

        {/* Protein Value */}
        <div className="text-right ml-4">
          <p className="text-2xl md:text-3xl font-bold text-primary">
            {item.proteinGrams}
          </p>
          <p className="text-xs text-muted-foreground">
            grams
          </p>
        </div>
      </div>

      {/* Confidence Badge and Edit Indicator */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
        {item.confidence < 95 && (
          <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
            {item.confidence}% confident
          </span>
        )}

        {item.isEdited && (
          <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded">
            ✏️ edited
          </span>
        )}

        {!item.isEdited && item.aiDetected && (
          <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
            AI detected
          </span>
        )}

        {/* Edit Hint */}
        <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary transition-colors">
          Tap to edit
        </span>
      </div>
    </motion.div>
  )
}

interface FoodItemListProps {
  items: FoodItemType[]
  onEdit?: (item: FoodItemType) => void
  editingId?: string
}

export function FoodItemList({ items, onEdit, editingId }: FoodItemListProps) {
  const staggerSettings = getStaggerSettings()
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: staggerSettings
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4">
          What AI found ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h3>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No food items detected. Try uploading another photo.
          </p>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((item, index) => (
              <FoodItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                isEditing={editingId === item.id}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
