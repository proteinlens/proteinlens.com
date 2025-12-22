// Pricing Page
// Feature: 002-saas-billing, User Story 1

import React, { useState, useEffect } from 'react';
import { getPlans, PlansResponse, redirectToCheckout } from '../services/billingApi';
import { PricingCard } from '../components/PricingCard';
import './PricingPage.css';

export const PricingPage: React.FC = () => {
  const [plansData, setPlansData] = useState<PlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getPlans();
      setPlansData(data);
    } catch (err) {
      setError('Failed to load pricing plans. Please try again.');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (priceId: string | null) => {
    if (!priceId) {
      // Free plan - just show a message or redirect to signup
      alert('You are already on the Free plan!');
      return;
    }

    try {
      setCheckoutLoading(true);
      await redirectToCheckout(priceId);
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      console.error('Checkout error:', err);
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pricing-page">
        <div className="pricing-page__loading">Loading pricing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pricing-page">
        <div className="pricing-page__error">
          {error}
          <button onClick={fetchPlans}>Retry</button>
        </div>
      </div>
    );
  }

  const freePlan = plansData?.plans.find(p => p.id === 'FREE');
  const proPlan = plansData?.plans.find(p => p.id === 'PRO');

  return (
    <div className="pricing-page">
      <header className="pricing-page__header">
        <h1>Simple, transparent pricing</h1>
        <p>Track your protein intake with AI-powered meal analysis</p>
      </header>

      <div className="pricing-page__toggle">
        <button
          className={`toggle-btn ${billingPeriod === 'monthly' ? 'toggle-btn--active' : ''}`}
          onClick={() => setBillingPeriod('monthly')}
        >
          Monthly
        </button>
        <button
          className={`toggle-btn ${billingPeriod === 'annual' ? 'toggle-btn--active' : ''}`}
          onClick={() => setBillingPeriod('annual')}
        >
          Annual
          {proPlan?.annualSavings && (
            <span className="toggle-btn__badge">Save {proPlan.annualSavings}%</span>
          )}
        </button>
      </div>

      <div className="pricing-page__cards">
        {freePlan && (
          <PricingCard
            plan={freePlan}
            billingPeriod={billingPeriod}
            onSelect={handleSelectPlan}
            loading={checkoutLoading}
          />
        )}
        {proPlan && (
          <PricingCard
            plan={proPlan}
            billingPeriod={billingPeriod}
            onSelect={handleSelectPlan}
            loading={checkoutLoading}
          />
        )}
      </div>

      {plansData?.featureComparison && (
        <div className="pricing-page__comparison">
          <h2>Feature Comparison</h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
              </tr>
            </thead>
            <tbody>
              {plansData.featureComparison.map((feature, index) => (
                <tr key={index}>
                  <td>{feature.name}</td>
                  <td>
                    {typeof feature.free === 'boolean' 
                      ? (feature.free ? '✓' : '✗') 
                      : feature.free}
                  </td>
                  <td className="comparison-table__pro">
                    {typeof feature.pro === 'boolean' 
                      ? (feature.pro ? '✓' : '✗') 
                      : feature.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pricing-page__faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How does the rolling 7-day limit work?</h3>
            <p>Free users get 5 scans within any rolling 7-day window. As older scans fall outside the window, new scan slots become available.</p>
          </div>
          <div className="faq-item">
            <h3>Can I cancel anytime?</h3>
            <p>Yes! Cancel your Pro subscription anytime. You'll keep Pro access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h3>What happens to my data if I downgrade?</h3>
            <p>Your recent 7 days of history remain accessible. Older data is preserved and becomes available again if you re-subscribe.</p>
          </div>
          <div className="faq-item">
            <h3>Is my payment secure?</h3>
            <p>All payments are processed securely by Stripe. We never store your card details.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
