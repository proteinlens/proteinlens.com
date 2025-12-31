/**
 * Save Profile Button Component (Feature 015)
 * 
 * Button to save protein profile to database (authenticated users only)
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface SaveProfileButtonProps {
  onClick: () => void;
  isSaving: boolean;
  hasSaved: boolean;
  isAuthenticated: boolean;
  disabled?: boolean;
  className?: string;
}

export function SaveProfileButton({
  onClick,
  isSaving,
  hasSaved,
  isAuthenticated,
  disabled = false,
  className,
}: SaveProfileButtonProps) {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isSaving || hasSaved}
      variant={hasSaved ? 'outline' : 'primary'}
      size="md"
      className={cn('w-full', className)}
    >
      {isSaving ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          Saving...
        </span>
      ) : hasSaved ? (
        <span className="flex items-center gap-2">
          <span>✓</span>
          Saved to Profile
        </span>
      ) : (
        'Save to My Profile'
      )}
    </Button>
  );
}
