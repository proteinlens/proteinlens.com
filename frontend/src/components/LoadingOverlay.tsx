/**
 * LoadingOverlay Component
 * Feature 010 - User Signup Process
 * 
 * Full-screen loading overlay for B2C redirect and other async operations.
 */

import { FC } from 'react';

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message to display */
  message?: string;
  /** Subtext message */
  subMessage?: string;
}

/**
 * Full-screen loading overlay with animated spinner.
 */
export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  subMessage,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Animated logo/spinner */}
        <div className="relative">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
            <span className="flex h-full w-full items-center justify-center text-3xl">
              🧬
            </span>
          </div>
          {/* Spinning ring */}
          <div className="absolute -inset-2 animate-spin rounded-full border-4 border-transparent border-t-blue-500" />
        </div>

        {/* Messages */}
        <div>
          <p className="text-lg font-semibold text-gray-900">{message}</p>
          {subMessage && (
            <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
