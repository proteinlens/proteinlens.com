import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getCardVariants, getPageTransition } from '@/utils/animations';
import type { ProteinGap } from '@/types/goal';
import type { HighProteinSuggestion } from '@/types/goal';

interface ProteinGapWidgetProps {
  gap: ProteinGap;
  suggestions?: HighProteinSuggestion[];
  onQuickAdd?: (suggestion: HighProteinSuggestion) => void;
}

// Static high-protein food suggestions
const DEFAULT_SUGGESTIONS: HighProteinSuggestion[] = [
  {
    id: '1',
    name: 'Greek Yogurt',
    servingSize: '1 cup (200g)',
    proteinPer100g: 10,
    category: 'dairy' as const,
  },
  {
    id: '2',
    name: 'Protein Shake',
    servingSize: '1 scoop (30g)',
    proteinPer100g: 83,
    category: 'other' as const,
  },
  {
    id: '3',
    name: 'Chicken Breast',
    servingSize: '100g cooked',
    proteinPer100g: 31,
    category: 'meat' as const,
  },
];

export const ProteinGapWidget = ({ 
  gap, 
  suggestions = DEFAULT_SUGGESTIONS,
  onQuickAdd 
}: ProteinGapWidgetProps) => {
  const cardVariants = getCardVariants();
  const transition = getPageTransition();

  // Determine gradient color based on gap
  const getGradientClass = () => {
    if (gap.isMet) {
      return 'from-green-500/20 to-green-600/20 border-green-500/30';
    }
    if (gap.gapGrams > 50) {
      return 'from-red-500/20 to-red-600/20 border-red-500/30';
    }
    return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
  };

  const getMessage = () => {
    if (gap.isMet) {
      return '🎉 Goal achieved!';
    }
    if (gap.gapGrams > 50) {
      return `${gap.gapGrams}g protein remaining today`;
    }
    return `Almost there! ${gap.gapGrams}g to go`;
  };

  if (gap.isMet) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        transition={transition}
        className={cn(
          'bg-gradient-to-br p-6 rounded-lg border',
          getGradientClass()
        )}
      >
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">{getMessage()}</p>
          <p className="text-sm text-muted-foreground">
            You've consumed {gap.consumedGrams}g / {gap.goalGrams}g ({gap.percentComplete}%)
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={transition}
      className="w-full max-w-2xl mx-auto px-4 space-y-4"
    >
      {/* Gap Display */}
      <div className={cn(
        'bg-gradient-to-br p-6 rounded-lg border',
        getGradientClass()
      )}>
        <div className="mb-4">
          <p className="text-lg font-semibold mb-2">{getMessage()}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{gap.consumedGrams}g</span>
            <span className="text-muted-foreground">/ {gap.goalGrams}g</span>
            <span className="ml-auto text-sm text-muted-foreground">
              {gap.percentComplete}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${gap.percentComplete}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              gap.percentComplete >= 100 ? 'bg-green-500' :
              gap.percentComplete >= 70 ? 'bg-yellow-500' :
              'bg-primary'
            )}
          />
        </div>
      </div>

      {/* Suggestions */}
      {gap.gapGrams > 0 && suggestions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            High-Protein Suggestions
          </h4>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAdd={onQuickAdd}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface SuggestionCardProps {
  suggestion: HighProteinSuggestion;
  onAdd?: (suggestion: HighProteinSuggestion) => void;
}

const SuggestionCard = ({ suggestion, onAdd }: SuggestionCardProps) => {
  const proteinAmount = Math.round((suggestion.proteinPer100g * parseFloat(suggestion.servingSize)) / 100) || suggestion.proteinPer100g;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center justify-between p-3 rounded-md',
        'bg-muted/50 border border-border/50',
        'hover:bg-muted hover:border-primary/30',
        'transition-colors cursor-pointer'
      )}
      onClick={() => onAdd?.(suggestion)}
    >
      <div className="flex-1">
        <p className="font-medium text-sm">{suggestion.name}</p>
        <p className="text-xs text-muted-foreground">{suggestion.servingSize}</p>
      </div>
      <div className="text-right ml-4">
        <p className="text-lg font-bold text-primary">{proteinAmount}g</p>
        <p className="text-xs text-muted-foreground">protein</p>
      </div>
    </motion.div>
  );
};
