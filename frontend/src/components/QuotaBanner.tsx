// Quota Banner Component - Shows engaging messages about scan limits
// Appears as a banner to encourage conversion

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './QuotaBanner.css';

interface QuotaBannerProps {
  scansRemaining: number;
  scansLimit: number;
  plan: string;
  onDismiss?: () => void;
}

export const QuotaBanner: React.FC<QuotaBannerProps> = ({
  scansRemaining,
  scansLimit,
  plan,
  onDismiss,
}) => {
  const { user } = useAuth();
  const isAnonymous = plan === 'ANONYMOUS' || (!user && scansLimit === 3);
  const isEmpty = scansRemaining === 0;
  const isLow = scansRemaining <= 1 && scansRemaining > 0;

  // Don't show for Pro users
  if (plan === 'PRO' || scansRemaining > 2) {
    return null;
  }

  const getIcon = () => {
    if (isEmpty) return '🚀';
    if (isLow) return '⚡';
    return '👋';
  };

  const getMessage = () => {
    if (isAnonymous) {
      if (isEmpty) {
        return {
          title: "You've discovered the power of ProteinLens! 💪",
          description: "Create a free account and get 20 scans per week to keep tracking your nutrition journey.",
          cta: "Create Free Account",
          ctaLink: "/signup",
        };
      }
      if (isLow) {
        return {
          title: `${scansRemaining} scan left! Loving it? 🎯`,
          description: "Sign up to unlock 20 scans per week and track your protein goals like a pro.",
          cta: "Get 20 Scans/Week",
          ctaLink: "/signup",
        };
      }
    } else {
      // Free plan
      if (isEmpty) {
        return {
          title: "You're crushing your protein goals! 🔥",
          description: "You've used all 20 free scans this week. Upgrade to Pro for unlimited scans and never miss a meal.",
          cta: "Upgrade to Pro",
          ctaLink: "/pricing",
        };
      }
      if (isLow) {
        return {
          title: `Only ${scansRemaining} scan left this week! ⚡`,
          description: "Don't let your tracking streak end. Upgrade to Pro for unlimited scans.",
          cta: "Go Unlimited",
          ctaLink: "/pricing",
        };
      }
    }

    return null;
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <div className={`quota-banner ${isEmpty ? 'quota-banner--empty' : 'quota-banner--low'} ${isAnonymous ? 'quota-banner--anonymous' : ''}`}>
      <div className="quota-banner__content">
        <div className="quota-banner__icon">{getIcon()}</div>
        <div className="quota-banner__text">
          <h3 className="quota-banner__title">{message.title}</h3>
          <p className="quota-banner__description">{message.description}</p>
        </div>
        <Link to={message.ctaLink} className="quota-banner__cta">
          {message.cta}
        </Link>
        {onDismiss && (
          <button 
            className="quota-banner__dismiss" 
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default QuotaBanner;
