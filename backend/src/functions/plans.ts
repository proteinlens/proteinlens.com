// GET /api/billing/plans - Return available pricing plans
// Feature: 002-saas-billing, User Story 1

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Plan, PLANS, BILLING_CONSTANTS } from '../models/subscription';

/**
 * GET /api/billing/plans
 * Returns static pricing data for Free and Pro plans
 * No authentication required - public endpoint
 */
async function getPlans(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('GET /api/billing/plans - Fetching pricing plans');

  try {
    // Return static plan data with current pricing
    const plans = PLANS.map(plan => ({
      id: plan.id,
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceAnnual: plan.priceAnnual,
      features: plan.features,
      // Include formatted prices for display
      priceMonthlyFormatted: plan.priceMonthly ? `€${plan.priceMonthly.toFixed(2)}/mo` : 'Free',
      priceAnnualFormatted: plan.priceAnnual ? `€${plan.priceAnnual.toFixed(2)}/yr` : null,
      // Annual savings calculation
      annualSavings: plan.priceMonthly && plan.priceAnnual 
        ? Math.round(((plan.priceMonthly * 12 - plan.priceAnnual) / (plan.priceMonthly * 12)) * 100)
        : null,
    }));

    // Add feature comparison data
    const featureComparison = [
      {
        name: 'Scans per week',
        free: `${BILLING_CONSTANTS.FREE_SCANS_PER_WEEK} scans`,
        pro: 'Unlimited',
      },
      {
        name: 'History retention',
        free: `${BILLING_CONSTANTS.FREE_HISTORY_DAYS} days`,
        pro: 'Forever',
      },
      {
        name: 'Export data',
        free: false,
        pro: true,
      },
      {
        name: 'AI-powered analysis',
        free: true,
        pro: true,
      },
      {
        name: 'Real-time results',
        free: true,
        pro: true,
      },
    ];

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plans,
        featureComparison,
        currency: 'EUR',
        currencySymbol: '€',
      }),
    };
  } catch (error) {
    context.error('Error fetching plans:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch pricing plans' }),
    };
  }
}

// Register the function
app.http('plans', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'billing/plans',
  handler: getPlans,
});

export default getPlans;
