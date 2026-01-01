/**
 * ShareButton Component
 * 
 * Feature 017: Shareable Meal Scans & Diet Style Profiles
 * Task: T018 - Share button with copy-to-clipboard
 * 
 * Displays a share button that copies the meal's share URL to clipboard
 * with a nice toast notification.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  shareUrl: string;
  className?: string;
}

export function ShareButton({ shareUrl, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCopy}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${copied 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-lg"
            >
              ✓
            </motion.span>
          ) : (
            <motion.span
              key="share"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-lg"
            >
              🔗
            </motion.span>
          )}
        </AnimatePresence>
        <span>{copied ? 'Copied!' : 'Share'}</span>
      </motion.button>

      {/* Copy success toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg text-xs text-muted-foreground whitespace-nowrap"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ShareIconButton - Compact icon-only version
 */
interface ShareIconButtonProps {
  shareUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ShareIconButton({ shareUrl, className = '', size = 'md' }: ShareIconButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy share link'}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center rounded-full transition-all
        ${copied 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
        }
        ${className}
      `}
    >
      {copied ? '✓' : '🔗'}
    </motion.button>
  );
}
