import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Pricing Page
// Feature: 002-saas-billing, User Story 1
import { useState, useEffect } from 'react';
import { getPlans, redirectToCheckout } from '../services/billingApi';
import { PricingCard } from '../components/PricingCard';
import './PricingPage.css';
export const PricingPage = () => {
    const [plansData, setPlansData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    useEffect(() => {
        fetchPlans();
    }, []);
    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await getPlans();
            setPlansData(data);
        }
        catch (err) {
            setError('Failed to load pricing plans. Please try again.');
            console.error('Error fetching plans:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSelectPlan = async (priceId) => {
        if (!priceId) {
            // Free plan - just show a message or redirect to signup
            alert('You are already on the Free plan!');
            return;
        }
        try {
            setCheckoutLoading(true);
            await redirectToCheckout(priceId);
        }
        catch (err) {
            setError('Failed to start checkout. Please try again.');
            console.error('Checkout error:', err);
            setCheckoutLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "pricing-page", children: _jsx("div", { className: "pricing-page__loading", children: "Loading pricing..." }) }));
    }
    if (error) {
        return (_jsx("div", { className: "pricing-page", children: _jsxs("div", { className: "pricing-page__error", children: [error, _jsx("button", { onClick: fetchPlans, children: "Retry" })] }) }));
    }
    const freePlan = plansData?.plans.find(p => p.id === 'FREE');
    const proPlan = plansData?.plans.find(p => p.id === 'PRO');
    return (_jsxs("div", { className: "pricing-page", children: [_jsxs("header", { className: "pricing-page__header", children: [_jsx("h1", { children: "Simple, transparent pricing" }), _jsx("p", { children: "Track your protein intake with AI-powered meal analysis" })] }), _jsxs("div", { className: "pricing-page__toggle", children: [_jsx("button", { className: `toggle-btn ${billingPeriod === 'monthly' ? 'toggle-btn--active' : ''}`, onClick: () => setBillingPeriod('monthly'), children: "Monthly" }), _jsxs("button", { className: `toggle-btn ${billingPeriod === 'annual' ? 'toggle-btn--active' : ''}`, onClick: () => setBillingPeriod('annual'), children: ["Annual", proPlan?.annualSavings && (_jsxs("span", { className: "toggle-btn__badge", children: ["Save ", proPlan.annualSavings, "%"] }))] })] }), _jsxs("div", { className: "pricing-page__cards", children: [freePlan && (_jsx(PricingCard, { plan: freePlan, billingPeriod: billingPeriod, onSelect: handleSelectPlan, loading: checkoutLoading })), proPlan && (_jsx(PricingCard, { plan: proPlan, billingPeriod: billingPeriod, onSelect: handleSelectPlan, loading: checkoutLoading }))] }), plansData?.featureComparison && (_jsxs("div", { className: "pricing-page__comparison", children: [_jsx("h2", { children: "Feature Comparison" }), _jsxs("table", { className: "comparison-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Feature" }), _jsx("th", { children: "Free" }), _jsx("th", { children: "Pro" })] }) }), _jsx("tbody", { children: plansData.featureComparison.map((feature, index) => (_jsxs("tr", { children: [_jsx("td", { children: feature.name }), _jsx("td", { children: typeof feature.free === 'boolean'
                                                ? (feature.free ? '✓' : '✗')
                                                : feature.free }), _jsx("td", { className: "comparison-table__pro", children: typeof feature.pro === 'boolean'
                                                ? (feature.pro ? '✓' : '✗')
                                                : feature.pro })] }, index))) })] })] })), _jsxs("div", { className: "pricing-page__faq", children: [_jsx("h2", { children: "Frequently Asked Questions" }), _jsxs("div", { className: "faq-grid", children: [_jsxs("div", { className: "faq-item", children: [_jsx("h3", { children: "How does the rolling 7-day limit work?" }), _jsx("p", { children: "Free users get 5 scans within any rolling 7-day window. As older scans fall outside the window, new scan slots become available." })] }), _jsxs("div", { className: "faq-item", children: [_jsx("h3", { children: "Can I cancel anytime?" }), _jsx("p", { children: "Yes! Cancel your Pro subscription anytime. You'll keep Pro access until the end of your billing period." })] }), _jsxs("div", { className: "faq-item", children: [_jsx("h3", { children: "What happens to my data if I downgrade?" }), _jsx("p", { children: "Your recent 7 days of history remain accessible. Older data is preserved and becomes available again if you re-subscribe." })] }), _jsxs("div", { className: "faq-item", children: [_jsx("h3", { children: "Is my payment secure?" }), _jsx("p", { children: "All payments are processed securely by Stripe. We never store your card details." })] })] })] })] }));
};
export default PricingPage;
