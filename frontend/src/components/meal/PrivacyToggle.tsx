/**
 * PrivacyToggle Component
 * 
 * Feature 017: Shareable Meal Scans & Diet Style Profiles
 * Task: T019 - Privacy toggle for meals
 * 
 * Allows users to toggle between public/private status for their meals.
 * Constitution Principle VII: Privacy by design - user controls their data
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PrivacyToggleProps {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function PrivacyToggle({ 
  isPublic, 
  onToggle, 
  disabled = false,
  className = '' 
}: PrivacyToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState(isPublic);

  const handleToggle = async () => {
    if (disabled || isLoading) return;

    const newValue = !optimisticValue;
    setOptimisticValue(newValue); // Optimistic update
    setIsLoading(true);

    try {
      await onToggle(newValue);
    } catch (error) {
      console.error('Failed to update privacy:', error);
      setOptimisticValue(!newValue); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  // Sync with prop changes
  React.useEffect(() => {
    setOptimisticValue(isPublic);
  }, [isPublic]);

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`
        flex items-center gap-2 text-sm transition-all
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
        ${className}
      `}
      title={optimisticValue ? 'Click to make private' : 'Click to make public'}
    >
      {/* Toggle track */}
      <div 
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-200
          ${optimisticValue 
            ? 'bg-green-500/30' 
            : 'bg-muted'
          }
        `}
      >
        {/* Toggle knob */}
        <motion.div
          animate={{ x: optimisticValue ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm
            flex items-center justify-center text-xs
            ${optimisticValue 
              ? 'bg-green-500 text-white' 
              : 'bg-muted-foreground/20 text-muted-foreground'
            }
          `}
        >
          {isLoading ? (
            <span className="animate-spin">⟳</span>
          ) : optimisticValue ? (
            '🌍'
          ) : (
            '🔒'
          )}
        </motion.div>
      </div>

      {/* Label */}
      <span className={`
        font-medium
        ${optimisticValue ? 'text-green-400' : 'text-muted-foreground'}
      `}>
        {optimisticValue ? 'Public' : 'Private'}
      </span>
    </button>
  );
}

/**
 * PrivacyBadge - Display-only privacy status
 */
interface PrivacyBadgeProps {
  isPublic: boolean;
  className?: string;
}

export function PrivacyBadge({ isPublic, className = '' }: PrivacyBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${isPublic 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-muted text-muted-foreground border border-border'
        }
        ${className}
      `}
    >
      {isPublic ? '🌍' : '🔒'}
      {isPublic ? 'Public' : 'Private'}
    </span>
  );
}
