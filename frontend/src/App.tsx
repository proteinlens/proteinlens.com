// Main App Component
// T048: Root component integration
// T028: Added /pricing route for billing feature
// T038: Added UsageCounter to navigation (Feature 002)
// T071: Added /settings route for billing management
// Feature 003: React Query + Theme Provider setup

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealUpload } from './components/MealUpload';
import { PricingPage } from './pages/PricingPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { Home } from './pages/Home';
import { UsageCounter } from './components/UsageCounter';
import { useUsage } from './hooks/useUsage';
import { ThemeProvider } from './contexts/ThemeContext';
import { BottomNav } from './components/layout/BottomNav';
import { PageContainer } from './components/layout/PageContainer';
import './App.css';
import './index.css';

// Lazy load History and Settings pages
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="app flex flex-col min-h-screen bg-background text-foreground">
            <Navigation />
            <PageContainer>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/billing/success" element={<CheckoutSuccessPage />} />
                </Routes>
              </Suspense>
            </PageContainer>
            <BottomNav />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
