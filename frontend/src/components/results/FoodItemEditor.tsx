import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEditFoodItem } from '@/hooks/useEditFoodItem';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { getPageTransition } from '@/utils/animations';
import type { FoodItem } from '@/types/meal';

interface FoodItemEditorProps {
  mealId: string;
  foodItem: FoodItem;
  onSave: () => void;
  onCancel: () => void;
}

export const FoodItemEditor = ({ mealId, foodItem, onSave, onCancel }: FoodItemEditorProps) => {
  const [name, setName] = useState(foodItem.name);
  const [portion, setPortion] = useState(foodItem.portion);
  const [protein, setProtein] = useState(foodItem.proteinGrams.toString());
  
  const editMutation = useEditFoodItem();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input when editor opens
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    const proteinValue = parseFloat(protein);
    
    if (isNaN(proteinValue) || proteinValue < 0) {
      return; // Invalid protein value
    }

    try {
      await editMutation.mutateAsync({
        mealId,
        foodItemId: foodItem.id,
        updates: {
          name: name.trim(),
          portion: portion.trim(),
          proteinGrams: proteinValue,
        },
      });
      
      onSave();
    } catch (error) {
      // Error is handled by mutation's onError
      console.error('Edit failed:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const hasChanges = 
    name !== foodItem.name ||
    portion !== foodItem.portion ||
    parseFloat(protein) !== foodItem.proteinGrams;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={getPageTransition()}
      className="border-l-4 border-primary pl-4 py-3 space-y-3"
    >
      <div className="space-y-2">
        <label htmlFor={`name-${foodItem.id}`} className="block text-sm font-medium text-foreground">
          Food Name
        </label>
        <input
          ref={nameInputRef}
          id={`name-${foodItem.id}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-3 py-2 rounded-md border border-input",
            "bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "text-base" // Prevent zoom on iOS
          )}
          placeholder="e.g., Grilled Chicken"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`portion-${foodItem.id}`} className="block text-sm font-medium text-foreground">
          Portion Size
        </label>
        <input
          id={`portion-${foodItem.id}`}
          type="text"
          value={portion}
          onChange={(e) => setPortion(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-3 py-2 rounded-md border border-input",
            "bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "text-base"
          )}
          placeholder="e.g., 150g"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`protein-${foodItem.id}`} className="block text-sm font-medium text-foreground">
          Protein (grams)
        </label>
        <input
          id={`protein-${foodItem.id}`}
          type="number"
          step="0.1"
          min="0"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-3 py-2 rounded-md border border-input",
            "bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "text-base"
          )}
          placeholder="e.g., 25.5"
        />
      </div>

      {foodItem.aiDetected && !foodItem.isEdited && (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
          AI detected: <span className="font-medium">{foodItem.proteinGrams}g protein</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || editMutation.isPending}
          className="flex-1"
        >
          {editMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={editMutation.isPending}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>

      {editMutation.isError && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
          Failed to save changes. Please try again.
        </div>
      )}
    </motion.div>
  );
};
