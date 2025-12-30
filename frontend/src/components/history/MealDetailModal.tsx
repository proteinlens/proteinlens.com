import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { useDeleteMeal } from '@/hooks/useMeal';

interface Food {
  name: string;
  portion: string;
  protein: number;
}

// Pro tips based on meal protein content
const proTips = {
  low: [
    "Add Greek yogurt, eggs, or cottage cheese to boost protein in this meal! 🥚",
    "Consider pairing this with a protein shake to hit your daily goals. 💪",
    "Nuts, seeds, or nut butter make great protein-rich additions! 🥜",
    "Try adding chicken, fish, or tofu next time for more protein. 🍗",
  ],
  medium: [
    "Great protein content! Spread meals like this throughout the day. ⏰",
    "You're on track! Aim for 25-35g protein per meal for optimal absorption. ✨",
    "Nice balance! Adding a handful of nuts can push this even higher. 🥜",
    "Solid protein meal! Your muscles will thank you. 💪",
  ],
  high: [
    "Excellent protein intake! Your body can absorb ~30-40g per meal optimally. 🎯",
    "Power meal! Perfect for post-workout recovery. 🏋️",
    "High protein champion! Great for muscle maintenance and satiety. 🏆",
    "Protein-packed! This meal will keep you full for hours. 😋",
  ],
};

function getProTip(totalProtein: number, foods: Food[]): string {
  // Determine protein level
  let level: 'low' | 'medium' | 'high';
  if (totalProtein < 15) {
    level = 'low';
  } else if (totalProtein < 30) {
    level = 'medium';
  } else {
    level = 'high';
  }
  
  // Get a consistent tip based on the meal (use foods length as a simple hash)
  const tips = proTips[level];
  const index = foods.length % tips.length;
  return tips[index];
}

interface MealDetailModalProps {
  meal: {
    id: string;
    mealAnalysisId: string;
    uploadedAt: string;
    imageUrl: string;
    analysis: {
      totalProtein: number;
      confidence: 'high' | 'medium' | 'low';
      foods: Food[];
      notes?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export function MealDetailModal({ meal, isOpen, onClose, onDelete }: MealDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteHook = useDeleteMeal();

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return '✓ High Confidence';
      case 'medium':
        return '~ Medium Confidence';
      case 'low':
        return '! Low Confidence';
      default:
        return 'Unknown';
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHook.mutateAsync(meal.id || meal.mealAnalysisId);
      setShowDeleteConfirm(false);
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  };

  const timestamp = new Date(meal.uploadedAt);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full max-h-[90vh] overflow-auto bg-card border border-border rounded-2xl shadow-2xl z-50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
            >
              ✕
            </button>

            {/* Image */}
            {meal.imageUrl && (
              <div className="relative w-full aspect-video bg-muted">
                <img
                  src={meal.imageUrl}
                  alt="Meal"
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for better text visibility */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Header with date/time */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {format(timestamp, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(timestamp, 'h:mm a')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(meal.analysis.confidence)}`}>
                  {getConfidenceLabel(meal.analysis.confidence)}
                </span>
              </div>

              {/* Total Protein - Hero Display */}
              <div className="text-center py-4">
                <div className="text-6xl md:text-7xl font-bold text-primary">
                  {meal.analysis.totalProtein}
                  <span className="text-2xl text-muted-foreground ml-1">g</span>
                </div>
                <p className="text-muted-foreground mt-1">Total Protein</p>
              </div>

              {/* Food Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  🍽️ Food Breakdown
                </h3>
                {meal.analysis.foods.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No food items detected
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {meal.analysis.foods.map((food, index) => (
                      <li 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {food.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {food.portion}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-lg font-semibold text-primary">
                            {food.protein}g
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Pro Tip - helpful nutrition advice */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  💡 Pro Tip
                </h3>
                <p className="text-sm text-muted-foreground bg-primary/10 border border-primary/20 rounded-lg p-3">
                  {getProTip(meal.analysis.totalProtein, meal.analysis.foods)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  🗑️ Delete
                </Button>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3"
                >
                  <p className="text-sm font-medium text-destructive">
                    Are you sure you want to delete this meal? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={handleDelete}
                      disabled={deleteHook.isPending}
                    >
                      {deleteHook.isPending ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
