import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import './UpgradePrompt.css';
export const UpgradePrompt = ({ isOpen, onClose, scansUsed = 5, scansLimit = 5, }) => {
    const navigate = useNavigate();
    if (!isOpen) {
        return null;
    }
    const handleUpgrade = () => {
        navigate('/pricing');
        onClose();
    };
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    return (_jsx("div", { className: "upgrade-prompt__backdrop", onClick: handleBackdropClick, children: _jsxs("div", { className: "upgrade-prompt", children: [_jsx("button", { className: "upgrade-prompt__close", onClick: onClose, children: "\u2715" }), _jsx("div", { className: "upgrade-prompt__icon", children: "\uD83D\uDEAB" }), _jsx("h2", { className: "upgrade-prompt__title", children: "Weekly Scan Limit Reached" }), _jsxs("p", { className: "upgrade-prompt__message", children: ["You've used all ", _jsxs("strong", { children: [scansLimit, " free scans"] }), " this week. Your scan quota resets on a rolling 7-day basis."] }), _jsxs("div", { className: "upgrade-prompt__stats", children: [_jsxs("div", { className: "upgrade-prompt__stat", children: [_jsx("span", { className: "upgrade-prompt__stat-value", children: scansUsed }), _jsx("span", { className: "upgrade-prompt__stat-label", children: "Scans used" })] }), _jsxs("div", { className: "upgrade-prompt__stat", children: [_jsx("span", { className: "upgrade-prompt__stat-value", children: "0" }), _jsx("span", { className: "upgrade-prompt__stat-label", children: "Remaining" })] })] }), _jsxs("div", { className: "upgrade-prompt__cta", children: [_jsx("h3", { children: "Upgrade to Pro for unlimited scans" }), _jsxs("ul", { className: "upgrade-prompt__benefits", children: [_jsx("li", { children: "\u2728 Unlimited meal scans" }), _jsx("li", { children: "\u2728 Full history forever" }), _jsx("li", { children: "\u2728 Export your data" })] }), _jsxs("p", { className: "upgrade-prompt__price", children: ["Starting at ", _jsx("strong", { children: "\u20AC9.99/month" })] })] }), _jsxs("div", { className: "upgrade-prompt__actions", children: [_jsx("button", { className: "upgrade-prompt__button upgrade-prompt__button--primary", onClick: handleUpgrade, children: "View Pro Plans" }), _jsx("button", { className: "upgrade-prompt__button upgrade-prompt__button--secondary", onClick: onClose, children: "Maybe Later" })] })] }) }));
};
export default UpgradePrompt;
