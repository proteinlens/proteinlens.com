/**
 * PasswordRequirements Component
 * Feature 010 - User Signup Process
 * 
 * Checklist showing which password requirements are met.
 * Updates in real-time as user types.
 */

import { FC } from 'react';

interface PasswordRequirementsProps {
  /** Password strength object with requirement flags */
  strength: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notBreached?: boolean;
  };
  /** Additional class names */
  className?: string;
}

const requirements = [
  { key: 'minLength', label: 'At least 12 characters' },
  { key: 'hasUppercase', label: 'One uppercase letter' },
  { key: 'hasLowercase', label: 'One lowercase letter' },
  { key: 'hasNumber', label: 'One number' },
  { key: 'hasSpecial', label: 'One special character (!@#$%^&*)' },
] as const;

/**
 * Password requirements checklist with visual feedback.
 */
export const PasswordRequirements: FC<PasswordRequirementsProps> = ({
  strength,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <p className="text-xs font-medium text-gray-700">Password requirements:</p>
      <ul className="space-y-1" aria-label="Password requirements">
        {requirements.map(({ key, label }) => {
          const isMet = strength[key];
          return (
            <li
              key={key}
              className={`flex items-center gap-2 text-xs ${
                isMet ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {isMet ? (
                <svg
                  className="h-4 w-4 flex-shrink-0 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 flex-shrink-0 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{label}</span>
            </li>
          );
        })}
        
        {/* Breach check indicator (only shown if checked) */}
        {strength.notBreached !== undefined && (
          <li
            className={`flex items-center gap-2 text-xs ${
              strength.notBreached ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {strength.notBreached ? (
              <svg
                className="h-4 w-4 flex-shrink-0 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 flex-shrink-0 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>
              {strength.notBreached
                ? 'Not found in data breaches'
                : 'This password appears in known data breaches'}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
