// Main App Component
// T048: Root component integration
// T028: Added /pricing route for billing feature
// T038: Added UsageCounter to navigation (Feature 002)
// T071: Added /settings route for billing management

import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MealUpload } from './components/MealUpload';
import { PricingPage } from './pages/PricingPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsageCounter } from './components/UsageCounter';
import { useUsage } from './hooks/useUsage';
import './App.css';

// Navigation component with usage counter
const Navigation: React.FC = () => {
  const location = useLocation();
  // TODO: Replace with actual userId from auth context
  const userId = 'demo-user';
  const { usage, loading } = useUsage(userId);
  
  return (
    <nav className="app-nav">
      <div className="app-nav__logo">
        <Link to="/">🍽️ ProteinLens</Link>
      </div>
      <div className="app-nav__center">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Scan Meal
        </Link>
        <Link 
          to="/pricing" 
          className={location.pathname === '/pricing' ? 'active' : ''}
        >
          Pricing
        </Link>
        <Link 
          to="/settings" 
          className={location.pathname === '/settings' ? 'active' : ''}
        >
          Settings
        </Link>
      </div>
      <div className="app-nav__usage">
        <UsageCounter usage={usage} loading={loading} compact />
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<MealUpload />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/billing/success" element={<CheckoutSuccessPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
