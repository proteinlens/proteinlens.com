// Pro Badge Component - Shows Pro status
// Feature: 002-saas-billing, User Story 4
// T064: Pro badge for Pro users

import React from 'react';
import './ProBadge.css';

interface ProBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ProBadge: React.FC<ProBadgeProps> = ({
  size = 'medium',
  showLabel = true,
}) => {
  return (
    <span className={`pro-badge pro-badge--${size}`} title="Pro Subscriber">
      <span className="pro-badge__icon">⭐</span>
      {showLabel && <span className="pro-badge__text">Pro</span>}
    </span>
  );
};

export default ProBadge;
