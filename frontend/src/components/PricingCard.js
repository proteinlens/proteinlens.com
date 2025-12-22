import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import './PricingCard.css';
export const PricingCard = ({ plan, isCurrentPlan = false, billingPeriod, onSelect, loading = false, }) => {
    const isPro = plan.id === 'PRO';
    const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
    const priceFormatted = billingPeriod === 'monthly'
        ? plan.priceMonthlyFormatted
        : plan.priceAnnualFormatted;
    // For Free plan, no price ID needed
    const priceId = isPro
        ? (billingPeriod === 'monthly'
            ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY
            : import.meta.env.VITE_STRIPE_PRICE_ANNUAL)
        : null;
    const handleClick = () => {
        if (!isCurrentPlan && !loading) {
            onSelect(priceId);
        }
    };
    const getButtonText = () => {
        if (loading)
            return 'Processing...';
        if (isCurrentPlan)
            return 'Current Plan';
        if (isPro)
            return 'Upgrade to Pro';
        return 'Get Started';
    };
    return (_jsxs("div", { className: `pricing-card ${isPro ? 'pricing-card--pro' : ''} ${isCurrentPlan ? 'pricing-card--current' : ''}`, children: [isPro && plan.annualSavings && billingPeriod === 'annual' && (_jsxs("div", { className: "pricing-card__badge", children: ["Save ", plan.annualSavings, "%"] })), _jsxs("div", { className: "pricing-card__header", children: [_jsx("h3", { className: "pricing-card__name", children: plan.name }), _jsx("div", { className: "pricing-card__price", children: price !== null ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "pricing-card__currency", children: "\u20AC" }), _jsx("span", { className: "pricing-card__amount", children: billingPeriod === 'annual' && price !== null
                                        ? (price / 12).toFixed(2)
                                        : price?.toFixed(2) }), _jsx("span", { className: "pricing-card__period", children: "/mo" })] })) : (_jsx("span", { className: "pricing-card__free", children: "Free" })) }), billingPeriod === 'annual' && price !== null && (_jsxs("div", { className: "pricing-card__billed", children: ["Billed \u20AC", price?.toFixed(2), " annually"] }))] }), _jsxs("ul", { className: "pricing-card__features", children: [_jsx("li", { className: plan.features.scansPerWeek === -1 ? 'feature--highlight' : '', children: plan.features.scansPerWeek === -1
                            ? '✨ Unlimited scans'
                            : `${plan.features.scansPerWeek} scans per week` }), _jsx("li", { className: plan.features.historyDays === -1 ? 'feature--highlight' : '', children: plan.features.historyDays === -1
                            ? '✨ Full history forever'
                            : `${plan.features.historyDays}-day history` }), _jsx("li", { className: plan.features.exportEnabled ? 'feature--highlight' : 'feature--disabled', children: plan.features.exportEnabled
                            ? '✨ Export data'
                            : '✗ Export data' }), _jsx("li", { children: "\u2713 AI-powered analysis" }), _jsx("li", { children: "\u2713 Real-time results" })] }), _jsx("button", { className: `pricing-card__button ${isPro ? 'pricing-card__button--pro' : ''}`, onClick: handleClick, disabled: isCurrentPlan || loading, children: getButtonText() })] }));
};
export default PricingCard;
