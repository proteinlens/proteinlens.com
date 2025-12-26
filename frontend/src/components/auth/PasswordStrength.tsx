/**
 * PasswordStrength Component
 * Feature 010 - User Signup Process
 * 
 * Visual indicator showing password strength level (weak/medium/strong).
 * Uses color-coded bars for quick visual feedback.
 */

import { FC } from 'react';

interface PasswordStrengthProps {
  /** Strength level */
  level: 'weak' | 'medium' | 'strong';
  /** Additional class names */
  className?: string;
}

const strengthConfig = {
  weak: {
    label: 'Weak',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bars: 1,
    description: 'Password is too weak',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bars: 2,
    description: 'Password could be stronger',
  },
  strong: {
    label: 'Strong',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bars: 3,
    description: 'Password is strong',
  },
};

/**
 * Password strength indicator with visual bars.
 */
export const PasswordStrength: FC<PasswordStrengthProps> = ({
  level,
  className = '',
}) => {
  const config = strengthConfig[level];

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Strength bars */}
      <div className="flex gap-1" role="presentation">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`h-1 flex-1 rounded-full transition-colors ${
              bar <= config.bars ? config.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </p>
        <p className="text-xs text-gray-500" aria-live="polite">
          {config.description}
        </p>
      </div>
    </div>
  );
};

export default PasswordStrength;
