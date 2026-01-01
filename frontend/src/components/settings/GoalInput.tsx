import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { getCardVariants, getPageTransition } from '@/utils/animations';
import { useGoal } from '@/hooks/useGoal';

interface GoalInputProps {
  onSave?: () => void;
}

export const GoalInput = ({ onSave }: GoalInputProps) => {
  const { goal, setGoal, isLoading } = useGoal();
  const [inputValue, setInputValue] = useState(goal.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Sync input value when goal loads from storage/API
  useEffect(() => {
    if (!isLoading) {
      setInputValue(goal.toString());
    }
  }, [goal, isLoading]);

  const cardVariants = getCardVariants();
  const transition = getPageTransition();

  const handleSave = async () => {
    const value = parseInt(inputValue, 10);

    // Validation
    if (isNaN(value)) {
      setError('Please enter a valid number');
      return;
    }
    if (value < 0) {
      setError('Goal must be 0 or higher');
      return;
    }
    if (value > 500) {
      setError('Goal cannot exceed 500 grams');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      setGoal(value);
      onSave?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const hasChanged = parseInt(inputValue, 10) !== goal;

  if (isLoading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        transition={transition}
        className="bg-card border border-border rounded-lg p-6 animate-pulse"
      >
        <div className="h-6 bg-muted rounded-md mb-4 w-1/3" />
        <div className="h-10 bg-muted rounded-md" />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={transition}
      className="bg-card border border-border rounded-lg p-6 space-y-4"
    >
      <div>
        <label htmlFor="goal-input" className="block text-sm font-semibold text-foreground mb-2">
          Daily Protein Goal
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Set your target protein intake for each day to track progress
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <input
            id="goal-input"
            type="number"
            min="0"
            max="500"
            step="5"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full px-4 py-3 rounded-lg border-2 text-center',
              'bg-background text-foreground text-lg font-semibold',
              'focus:outline-none focus:border-primary',
              error ? 'border-destructive' : 'border-border'
            )}
            placeholder="e.g., 120"
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            grams per day (0-500)
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanged || isSaving || isNaN(parseInt(inputValue, 10))}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </p>
      )}

      {!error && hasChanged === false && goal > 0 && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ Goal set to {goal}g
        </p>
      )}
    </motion.div>
  );
};
