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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-primary hover:text-accent transition-colors"
          >
            <span className="text-2xl">🍽️</span>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ProteinLens
            </span>
          </Link>
          
          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/' 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              📸 Scan Meal
            </Link>
            <Link 
              to="/history" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/history' 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              📊 History
            </Link>
            <Link 
              to="/pricing" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/pricing' 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              💎 Pricing
            </Link>
            <Link 
              to="/settings" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/settings' 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              ⚙️ Settings
            </Link>
          </div>
          
          {/* Usage Counter */}
          <div className="flex items-center">
            <UsageCounter usage={usage} loading={loading} compact />
          </div>
        </div>
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
