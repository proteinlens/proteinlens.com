import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import ProBadge from './ProBadge';
import './UsageCounter.css';
export const UsageCounter = ({ usage, loading = false, compact = false, }) => {
    if (loading) {
        return (_jsx("div", { className: `usage-counter ${compact ? 'usage-counter--compact' : ''}`, children: _jsx("span", { className: "usage-counter__loading", children: "Loading..." }) }));
    }
    if (!usage) {
        return null;
    }
    // T065: Pro users see Pro badge instead of scan counter
    if (usage.scansRemaining === -1 || usage.plan === 'PRO') {
        if (compact) {
            return _jsx(ProBadge, { size: "small", showLabel: true });
        }
        return (_jsxs("div", { className: "usage-counter usage-counter--pro", children: [_jsx(ProBadge, { size: "medium" }), _jsx("span", { className: "usage-counter__text", children: "Unlimited scans" })] }));
    }
    // Free users - show remaining scans
    const percentage = ((usage.scansLimit - usage.scansUsed) / usage.scansLimit) * 100;
    const isLow = usage.scansRemaining <= 2;
    const isEmpty = usage.scansRemaining === 0;
    // Calculate days until oldest scan expires (rolling window)
    const daysUntilReset = Math.ceil((new Date(usage.periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (_jsxs("div", { className: `usage-counter ${compact ? 'usage-counter--compact' : ''} ${isEmpty ? 'usage-counter--empty' : ''} ${isLow ? 'usage-counter--low' : ''}`, children: [_jsxs("div", { className: "usage-counter__info", children: [_jsxs("span", { className: "usage-counter__count", children: [usage.scansRemaining, "/", usage.scansLimit] }), _jsx("span", { className: "usage-counter__label", children: compact ? 'scans' : 'scans remaining' })] }), !compact && (_jsxs(_Fragment, { children: [_jsx("div", { className: "usage-counter__bar", children: _jsx("div", { className: "usage-counter__fill", style: { width: `${percentage}%` } }) }), _jsx("span", { className: "usage-counter__reset", children: isEmpty
                            ? 'Quota resets in rolling 7 days'
                            : `Resets: rolling 7-day window` })] })), isEmpty && (_jsx("a", { href: "/pricing", className: "usage-counter__upgrade", children: "Upgrade to Pro" }))] }));
};
export default UsageCounter;
