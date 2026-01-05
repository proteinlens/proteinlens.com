// Usage Counter Component - Shows remaining scans for Free/Anonymous users
// Feature: 002-saas-billing, User Story 3
// T065: Hide UsageCounter for Pro users, show Pro badge instead
// Updated: Added engaging messages for anonymous users (3 scans)

import React from 'react';
import { UsageStats } from '../services/billingApi';
import { useAuth } from '../contexts/AuthProvider';
import ProBadge from './ProBadge';
import './UsageCounter.css';

interface UsageCounterProps {
  usage: UsageStats | null;
  loading?: boolean;
  compact?: boolean;
}

export const UsageCounter: React.FC<UsageCounterProps> = ({
  usage,
  loading = false,
  compact = false,
}) => {
  const { user } = useAuth();

  console.log('UsageCounter rendered:', { usage, loading, compact });

  if (loading) {
    return (
      <div className={`usage-counter ${compact ? 'usage-counter--compact' : ''}`}>
        <span className="usage-counter__loading">⏳ Loading...</span>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  // Check if this is an anonymous user (plan will be FREE but limit is 3)
  const isAnonymous = !user && usage.scansLimit === 3;

  // T065: Pro users see Pro badge instead of scan counter
  if (usage.scansRemaining === -1 || usage.plan === 'PRO') {
    if (compact) {
      return <ProBadge size="small" showLabel={true} />;
    }
    return (
      <div className="usage-counter usage-counter--pro">
        <ProBadge size="medium" />
        <span className="usage-counter__text">✨ Unlimited scans</span>
      </div>
    );
  }

  // Free/Anonymous users - show remaining scans with engaging messages
  const percentage = usage.scansLimit > 0 
    ? ((usage.scansLimit - usage.scansUsed) / usage.scansLimit) * 100 
    : 0;
  const isLow = usage.scansRemaining <= 2 && usage.scansRemaining > 0;
  const isEmpty = usage.scansRemaining === 0;

  // Engaging messages based on state
  const getMessage = () => {
    if (isAnonymous) {
      if (isEmpty) {
        return "🚀 You're a scanning machine! Ready to unlock unlimited?";
      }
      if (isLow) {
        return `⚡ ${usage.scansRemaining} scan${usage.scansRemaining === 1 ? '' : 's'} left! Make it count!`;
      }
      return `👋 ${usage.scansRemaining}/${usage.scansLimit} free scans`;
    } else {
      // Free plan
      if (isEmpty) {
        return "🎯 Maxed out this week! Go Pro for unlimited";
      }
      if (isLow) {
        return `⚡ ${usage.scansRemaining} scan${usage.scansRemaining === 1 ? '' : 's'} left this week!`;
      }
      return `🎯 ${usage.scansRemaining}/${usage.scansLimit} scans left`;
    }
  };

  const getResetMessage = () => {
    if (isAnonymous) {
      return isEmpty 
        ? '✨ Create a free account for 20 scans/week' 
        : 'Free account = 20/week';
    }
    return isEmpty 
      ? 'Resets in rolling 7 days' 
      : 'Rolling 7-day window';
  };

  return (
    <div className={`usage-counter ${compact ? 'usage-counter--compact' : ''} ${isEmpty ? 'usage-counter--empty' : ''} ${isLow ? 'usage-counter--low' : ''} ${isAnonymous ? 'usage-counter--anonymous' : ''}`}>
      <div className="usage-counter__info">
        <span className="usage-counter__message">
          {getMessage()}
        </span>
      </div>
      
      {!compact && (
        <>
          <div className="usage-counter__bar">
            <div 
              className="usage-counter__fill" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="usage-counter__reset">
            {getResetMessage()}
          </span>
        </>
      )}

      {isEmpty && (
        <a 
          href={isAnonymous ? "/signup" : "/pricing"} 
          className="usage-counter__upgrade"
        >
          {isAnonymous ? '🎯 Create Free Account' : '🚀 Upgrade to Pro'}
        </a>
      )}
    </div>
  );
};

export default UsageCounter;
