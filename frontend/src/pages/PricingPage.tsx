// Pricing Page
// Feature: 002-saas-billing, User Story 1

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPlans, PlansResponse, redirectToCheckout } from '../services/billingApi';
import { PricingCard } from '../components/PricingCard';
import { FriendlyError } from '../components/ui/FriendlyError';
import { useAuth } from '../contexts/AuthProvider';
import './PricingPage.css';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [plansData, setPlansData] = useState<PlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const checkoutTriggered = useRef(false);

  // Handle checkout after returning from login
  const pendingCheckout = searchParams.get('checkout');
  
  const triggerCheckout = useCallback(async (priceId: string) => {
    try {
      setCheckoutLoading(true);
      // Clear the checkout param from URL
      navigate('/pricing', { replace: true });
      await redirectToCheckout(priceId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error during checkout';
      setError(errorMessage);
      console.error('Checkout error:', err);
      setCheckoutLoading(false);
    }
  }, [navigate]);

  // Auto-trigger checkout if user just logged in with a pending checkout
  useEffect(() => {
    if (isAuthenticated && pendingCheckout && !checkoutTriggered.current) {
      checkoutTriggered.current = true;
      triggerCheckout(decodeURIComponent(pendingCheckout));
    }
  }, [isAuthenticated, pendingCheckout, triggerCheckout]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlans();
      setPlansData(data);
    } catch (err) {
      // Pass the actual error message for better categorization
      const errorMessage = err instanceof Error ? err.message : 'Network error - could not fetch pricing';
      setError(errorMessage);
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (priceId: string | null) => {
    if (!priceId) {
      // Free plan - redirect to login if not authenticated, otherwise home
      if (!isAuthenticated) {
        navigate('/login?returnTo=/');
      } else {
        navigate('/');
      }
      return;
    }

    // Check if Stripe price ID is configured
    if (!priceId || priceId === 'null') {
      alert('⚠️ Stripe checkout is not configured yet. Coming soon!');
      return;
    }

    // Redirect to login first if not authenticated
    if (!isAuthenticated) {
      // Store the intended checkout in the return URL
      navigate(`/login?returnTo=/pricing&checkout=${encodeURIComponent(priceId)}`);
      return;
    }

    try {
      setCheckoutLoading(true);
      await redirectToCheckout(priceId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error during checkout';
      setError(errorMessage);
      console.error('Checkout error:', err);
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pricing-page">
        <div className="pricing-page__loading">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl animate-bounce">💰</span>
          </div>
          <p className="text-lg font-medium text-foreground">Finding the best deals for you...</p>
          <p className="text-sm text-muted-foreground mt-2">This won't take long! ⚡</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pricing-page">
        <div className="max-w-md mx-auto px-4 py-12">
          <FriendlyError 
            error={error}
            onRetry={() => {
              setError(null);
              fetchPlans();
            }}
          />
        </div>
      </div>
    );
  }

  const freePlan = plansData?.plans.find(p => p.id === 'FREE');
  const proPlan = plansData?.plans.find(p => p.id === 'PRO');

  return (
    <div className="pricing-page">
      <header className="pricing-page__header">
        <h1>💪 Power Up Your Protein Tracking</h1>
        <p>Simple pricing, powerful features. Pick what works for you!</p>
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
        {/* Coach Plan */}
        <div className="pricing-card pricing-card--coach">
          <div className="pricing-card__badge">Custom</div>
          
          <div className="pricing-card__header">
            <h3 className="pricing-card__name">Coach Plan</h3>
            <div className="pricing-card__price">
              <span className="pricing-card__custom">Price on Request</span>
            </div>
            <div className="pricing-card__billed">
              Personalized nutrition coaching
            </div>
          </div>

          <ul className="pricing-card__features">
            <li className="feature--highlight">✨ Everything in Pro</li>
            <li className="feature--highlight">✨ 1-on-1 coaching calls</li>
            <li className="feature--highlight">✨ Custom meal plans</li>
            <li className="feature--highlight">✨ Weekly check-ins</li>
            <li className="feature--highlight">✨ Priority support</li>
            <li>✓ Progress tracking</li>
          </ul>

          <button
            className="pricing-card__button pricing-card__button--coach"
            onClick={() => window.open('mailto:hello@proteinlens.com?subject=Coach%20Plan%20Inquiry', '_blank')}
          >
            📧 Contact Us
          </button>
        </div>
      </div>

      {/* Upgrade CTA Section */}
      <div className="pricing-page__cta">
        <div className="cta-card">
          <div className="cta-card__icon">🚀</div>
          <h2 className="cta-card__title">Ready to Upgrade?</h2>
          <p className="cta-card__description">
            Join thousands of fitness enthusiasts who use ProteinLens Pro to track their nutrition goals effortlessly.
          </p>
          <button
            className="cta-card__button"
            onClick={() => {
              // Get price ID from plan data (returned by API)
              const priceId = billingPeriod === 'monthly' 
                ? proPlan?.stripePriceIdMonthly 
                : proPlan?.stripePriceIdAnnual;
              
              // Redirect to login if not authenticated
              if (!isAuthenticated) {
                if (priceId) {
                  navigate(`/login?returnTo=/pricing&checkout=${encodeURIComponent(priceId)}`);
                } else {
                  navigate('/login?returnTo=/pricing');
                }
                return;
              }
              
              if (priceId) {
                handleSelectPlan(priceId);
              } else {
                alert('⚠️ Stripe checkout is not configured yet. Coming soon!');
              }
            }}
            disabled={checkoutLoading || !proPlan}
          >
            {checkoutLoading ? '🔄 Processing...' : '✨ Upgrade to Pro'}
          </button>
        </div>
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
