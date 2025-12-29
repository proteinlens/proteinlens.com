// Pricing Card Component
// Feature: 002-saas-billing, User Story 1

import React from 'react';
import { PlanInfo } from '../services/billingApi';
import './PricingCard.css';

interface PricingCardProps {
  plan: PlanInfo;
  isCurrentPlan?: boolean;
  billingPeriod: 'monthly' | 'annual';
  onSelect: (priceId: string | null) => void;
  loading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isCurrentPlan = false,
  billingPeriod,
  onSelect,
  loading = false,
}) => {
  const isPro = plan.id === 'PRO';
  const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
  const priceFormatted = billingPeriod === 'monthly' 
    ? plan.priceMonthlyFormatted 
    : plan.priceAnnualFormatted;

  // Get price ID from plan data (returned by API)
  const priceId = isPro 
    ? (billingPeriod === 'monthly' 
        ? plan.stripePriceIdMonthly 
        : plan.stripePriceIdAnnual)
    : null;

  const handleClick = () => {
    if (!isCurrentPlan && !loading) {
      onSelect(priceId);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (isCurrentPlan) return 'Current Plan';
    if (isPro) return 'Upgrade to Pro';
    return 'Get Started';
  };

  return (
    <div className={`pricing-card ${isPro ? 'pricing-card--pro' : ''} ${isCurrentPlan ? 'pricing-card--current' : ''}`}>
      {isPro && plan.annualSavings && billingPeriod === 'annual' && (
        <div className="pricing-card__badge">Save {plan.annualSavings}%</div>
      )}
      
      <div className="pricing-card__header">
        <h3 className="pricing-card__name">{plan.name}</h3>
        <div className="pricing-card__price">
          {price !== null ? (
            <>
              <span className="pricing-card__currency">€</span>
              <span className="pricing-card__amount">
                {billingPeriod === 'annual' && price !== null 
                  ? (price / 12).toFixed(2) 
                  : price?.toFixed(2)}
              </span>
              <span className="pricing-card__period">/mo</span>
            </>
          ) : (
            <span className="pricing-card__free">Free</span>
          )}
        </div>
        {billingPeriod === 'annual' && price !== null && (
          <div className="pricing-card__billed">
            Billed €{price?.toFixed(2)} annually
          </div>
        )}
      </div>

      <ul className="pricing-card__features">
        <li className={plan.features.scansPerWeek === -1 ? 'feature--highlight' : ''}>
          {plan.features.scansPerWeek === -1 
            ? '✨ Unlimited scans' 
            : `${plan.features.scansPerWeek} scans per week`}
        </li>
        <li className={plan.features.historyDays === -1 ? 'feature--highlight' : ''}>
          {plan.features.historyDays === -1 
            ? '✨ Full history forever' 
            : `${plan.features.historyDays}-day history`}
        </li>
        <li className={plan.features.exportEnabled ? 'feature--highlight' : 'feature--disabled'}>
          {plan.features.exportEnabled 
            ? '✨ Export data' 
            : '✗ Export data'}
        </li>
        <li>✓ AI-powered analysis</li>
        <li>✓ Real-time results</li>
      </ul>

      <button
        className={`pricing-card__button ${isPro ? 'pricing-card__button--pro' : ''}`}
        onClick={handleClick}
        disabled={isCurrentPlan || loading}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default PricingCard;
