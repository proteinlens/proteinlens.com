import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealUpload } from './components/MealUpload';
import { PricingPage } from './pages/PricingPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsageCounter } from './components/UsageCounter';
import { useUsage } from './hooks/useUsage';
import { ThemeProvider } from './contexts/ThemeContext';
import { BottomNav } from './components/layout/BottomNav';
import { PageContainer } from './components/layout/PageContainer';
import './App.css';
import './index.css';
// Navigation component with usage counter
const Navigation = () => {
    const location = useLocation();
    // TODO: Replace with actual userId from auth context
    const userId = 'demo-user';
    const { usage, loading } = useUsage(userId);
    return (_jsxs("nav", { className: "app-nav", children: [_jsx("div", { className: "app-nav__logo", children: _jsx(Link, { to: "/", children: "\uD83C\uDF7D\uFE0F ProteinLens" }) }), _jsxs("div", { className: "app-nav__center", children: [_jsx(Link, { to: "/", className: location.pathname === '/' ? 'active' : '', children: "Scan Meal" }), _jsx(Link, { to: "/pricing", className: location.pathname === '/pricing' ? 'active' : '', children: "Pricing" }), _jsx(Link, { to: "/settings", className: location.pathname === '/settings' ? 'active' : '', children: "Settings" })] }), _jsx("div", { className: "app-nav__usage", children: _jsx(UsageCounter, { usage: usage, loading: loading, compact: true }) })] }));
};
function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60,
                gcTime: 1000 * 60 * 5,
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    });
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(ThemeProvider, { children: _jsx(BrowserRouter, { children: _jsxs("div", { className: "app flex flex-col min-h-screen bg-background text-foreground", children: [_jsx(Navigation, {}), _jsx(PageContainer, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(MealUpload, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/billing/success", element: _jsx(CheckoutSuccessPage, {}) })] }) }), _jsx(BottomNav, {})] }) }) }) }));
}
export default App;
