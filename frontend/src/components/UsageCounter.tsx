// Usage Counter Component - Shows remaining scans for Free users
// Feature: 002-saas-billing, User Story 3
// T065: Hide UsageCounter for Pro users, show Pro badge instead

import React from 'react';
import { UsageStats } from '../services/billingApi';
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
  if (loading) {
    return (
      <div className={`usage-counter ${compact ? 'usage-counter--compact' : ''}`}>
        <span className="usage-counter__loading">Loading...</span>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  // T065: Pro users see Pro badge instead of scan counter
  if (usage.scansRemaining === -1 || usage.plan === 'PRO') {
    if (compact) {
      return <ProBadge size="small" showLabel={true} />;
    }
    return (
      <div className="usage-counter usage-counter--pro">
        <ProBadge size="medium" />
        <span className="usage-counter__text">Unlimited scans</span>
      </div>
    );
  }

  // Free users - show remaining scans
  const percentage = ((usage.scansLimit - usage.scansUsed) / usage.scansLimit) * 100;
  const isLow = usage.scansRemaining <= 2;
  const isEmpty = usage.scansRemaining === 0;

  // Calculate days until oldest scan expires (rolling window)
  const daysUntilReset = Math.ceil(
    (new Date(usage.periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`usage-counter ${compact ? 'usage-counter--compact' : ''} ${isEmpty ? 'usage-counter--empty' : ''} ${isLow ? 'usage-counter--low' : ''}`}>
      <div className="usage-counter__info">
        <span className="usage-counter__count">
          {usage.scansRemaining}/{usage.scansLimit}
        </span>
        <span className="usage-counter__label">
          {compact ? 'scans' : 'scans remaining'}
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
            {isEmpty 
              ? 'Quota resets in rolling 7 days' 
              : `Resets: rolling 7-day window`}
          </span>
        </>
      )}

      {isEmpty && (
        <a href="/pricing" className="usage-counter__upgrade">
          Upgrade to Pro
        </a>
      )}
    </div>
  );
};

export default UsageCounter;
