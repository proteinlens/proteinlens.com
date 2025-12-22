import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Settings Page - Account and Billing Management
// Feature: 002-saas-billing, User Story 5
// T071: Settings page with billing section
import { useState } from 'react';
import { useUsage } from '../hooks/useUsage';
import { redirectToPortal } from '../services/billingApi';
import { ProBadge } from '../components/ProBadge';
import './SettingsPage.css';
export const SettingsPage = () => {
    // TODO: Replace with actual userId from auth context
    const userId = 'demo-user';
    const { usage, loading: usageLoading, refresh: refreshUsage } = useUsage(userId);
    const [portalLoading, setPortalLoading] = useState(false);
    const [error, setError] = useState(null);
    const isPro = usage?.plan === 'PRO';
    const isLapsed = usage?.plan === 'FREE' && false; // TODO: Track if user was previously Pro
    // T072: Handle Manage Billing click
    const handleManageBilling = async () => {
        setError(null);
        setPortalLoading(true);
        try {
            await redirectToPortal();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to open billing portal');
            setPortalLoading(false);
        }
    };
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    // Calculate days until renewal
    const daysUntilRenewal = (dateString) => {
        if (!dateString)
            return null;
        const endDate = new Date(dateString);
        const now = new Date();
        const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };
    return (_jsx("div", { className: "settings-page", children: _jsxs("div", { className: "settings-page__container", children: [_jsx("h1", { className: "settings-page__title", children: "Settings" }), _jsxs("section", { className: "settings-section", children: [_jsxs("h2", { className: "settings-section__title", children: [_jsx("span", { className: "settings-section__icon", children: "\uD83D\uDCB3" }), "Subscription & Billing"] }), usageLoading ? (_jsx("div", { className: "settings-section__loading", children: "Loading subscription info..." })) : (_jsxs("div", { className: "settings-billing", children: [_jsxs("div", { className: "settings-billing__plan", children: [_jsxs("div", { className: "settings-billing__plan-header", children: [_jsx("span", { className: "settings-billing__plan-label", children: "Current Plan" }), isPro ? (_jsx(ProBadge, { size: "large" })) : (_jsx("span", { className: "settings-billing__plan-free", children: "Free" }))] }), isPro && usage && (_jsxs("div", { className: "settings-billing__details", children: [_jsxs("div", { className: "settings-billing__detail", children: [_jsx("span", { className: "settings-billing__detail-label", children: "Status" }), _jsx("span", { className: "settings-billing__detail-value settings-billing__status--active", children: "Active" })] }), _jsxs("div", { className: "settings-billing__detail", children: [_jsx("span", { className: "settings-billing__detail-label", children: "Renewal Date" }), _jsxs("span", { className: "settings-billing__detail-value", children: [formatDate(usage.periodEnd), daysUntilRenewal(usage.periodEnd) !== null && (_jsxs("span", { className: "settings-billing__days-left", children: ["(", daysUntilRenewal(usage.periodEnd), " days)"] }))] })] }), _jsxs("div", { className: "settings-billing__detail", children: [_jsx("span", { className: "settings-billing__detail-label", children: "Scans" }), _jsx("span", { className: "settings-billing__detail-value", children: "Unlimited" })] })] })), !isPro && usage && (_jsxs("div", { className: "settings-billing__details", children: [_jsxs("div", { className: "settings-billing__detail", children: [_jsx("span", { className: "settings-billing__detail-label", children: "Scans This Week" }), _jsxs("span", { className: "settings-billing__detail-value", children: [usage.scansUsed, " / ", usage.scansLimit] })] }), _jsxs("div", { className: "settings-billing__detail", children: [_jsx("span", { className: "settings-billing__detail-label", children: "History Access" }), _jsx("span", { className: "settings-billing__detail-value", children: "Last 7 days" })] })] }))] }), _jsxs("div", { className: "settings-billing__actions", children: [isPro ? (
                                        // T072: Manage Billing button for Pro users
                                        _jsx("button", { className: "settings-billing__button settings-billing__button--manage", onClick: handleManageBilling, disabled: portalLoading, children: portalLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "settings-billing__spinner", children: "\u23F3" }), "Opening Portal..."] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "settings-billing__button-icon", children: "\u2699\uFE0F" }), "Manage Billing"] })) })) : (
                                        // Upgrade button for Free users
                                        _jsxs("a", { href: "/pricing", className: "settings-billing__button settings-billing__button--upgrade", children: [_jsx("span", { className: "settings-billing__button-icon", children: "\u2B50" }), "Upgrade to Pro"] })), isLapsed && (_jsxs("div", { className: "settings-billing__lapsed", children: [_jsx("p", { className: "settings-billing__lapsed-message", children: "Your Pro subscription has ended. Reactivate to restore unlimited access." }), _jsxs("a", { href: "/pricing", className: "settings-billing__button settings-billing__button--reactivate", children: [_jsx("span", { className: "settings-billing__button-icon", children: "\uD83D\uDD04" }), "Reactivate Pro"] })] }))] }), error && (_jsx("div", { className: "settings-billing__error", children: error }))] }))] }), _jsxs("section", { className: "settings-section", children: [_jsxs("h2", { className: "settings-section__title", children: [_jsx("span", { className: "settings-section__icon", children: "\u2728" }), "Your Features"] }), _jsxs("div", { className: "settings-features", children: [_jsxs("div", { className: `settings-feature ${isPro ? 'settings-feature--available' : ''}`, children: [_jsx("span", { className: "settings-feature__icon", children: isPro ? '✅' : '❌' }), _jsx("span", { className: "settings-feature__name", children: "Unlimited Scans" }), !isPro && _jsx("span", { className: "settings-feature__limit", children: "(5/week on Free)" })] }), _jsxs("div", { className: `settings-feature ${isPro ? 'settings-feature--available' : ''}`, children: [_jsx("span", { className: "settings-feature__icon", children: isPro ? '✅' : '❌' }), _jsx("span", { className: "settings-feature__name", children: "Full History Access" }), !isPro && _jsx("span", { className: "settings-feature__limit", children: "(7 days on Free)" })] }), _jsxs("div", { className: `settings-feature ${isPro ? 'settings-feature--available' : ''}`, children: [_jsx("span", { className: "settings-feature__icon", children: isPro ? '✅' : '❌' }), _jsx("span", { className: "settings-feature__name", children: "Export Data" }), !isPro && _jsx("span", { className: "settings-feature__limit", children: "(Pro only)" })] }), _jsxs("div", { className: "settings-feature settings-feature--available", children: [_jsx("span", { className: "settings-feature__icon", children: "\u2705" }), _jsx("span", { className: "settings-feature__name", children: "AI-Powered Analysis" })] })] })] }), _jsxs("section", { className: "settings-section", children: [_jsxs("h2", { className: "settings-section__title", children: [_jsx("span", { className: "settings-section__icon", children: "\uD83D\uDC64" }), "Account"] }), _jsx("p", { className: "settings-section__placeholder", children: "Account settings will be available when authentication is implemented." })] })] }) }));
};
export default SettingsPage;
