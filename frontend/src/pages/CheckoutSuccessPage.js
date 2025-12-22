import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Checkout Success Page
// Feature: 002-saas-billing, User Story 2
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CheckoutSuccessPage.css';
export const CheckoutSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    const sessionId = searchParams.get('session_id');
    useEffect(() => {
        // Auto-redirect to home after countdown
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);
    return (_jsx("div", { className: "checkout-success", children: _jsxs("div", { className: "checkout-success__card", children: [_jsx("div", { className: "checkout-success__icon", children: "\uD83C\uDF89" }), _jsx("h1", { className: "checkout-success__title", children: "Welcome to Pro!" }), _jsx("p", { className: "checkout-success__message", children: "Your subscription is now active. You have unlimited access to all ProteinLens features." }), _jsxs("div", { className: "checkout-success__features", children: [_jsxs("div", { className: "feature-item", children: [_jsx("span", { className: "feature-icon", children: "\u2728" }), _jsx("span", { children: "Unlimited meal scans" })] }), _jsxs("div", { className: "feature-item", children: [_jsx("span", { className: "feature-icon", children: "\uD83D\uDCCA" }), _jsx("span", { children: "Full history forever" })] }), _jsxs("div", { className: "feature-item", children: [_jsx("span", { className: "feature-icon", children: "\uD83D\uDCE5" }), _jsx("span", { children: "Export your data" })] })] }), _jsxs("div", { className: "checkout-success__actions", children: [_jsx("button", { className: "btn-primary", onClick: () => navigate('/'), children: "Start Scanning" }), _jsxs("p", { className: "checkout-success__redirect", children: ["Redirecting in ", countdown, " seconds..."] })] }), sessionId && (_jsxs("p", { className: "checkout-success__session", children: ["Session: ", sessionId.substring(0, 20), "..."] }))] }) }));
};
export default CheckoutSuccessPage;
