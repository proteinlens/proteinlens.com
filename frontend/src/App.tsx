// Main App Component
// T048: Root component integration
// T028: Added /pricing route for billing feature
// T038: Added UsageCounter to navigation (Feature 002)
// T071: Added /settings route for billing management
// Feature 003: React Query + Theme Provider setup
// Feature 009: Auth routes + AuthProvider
// T049: Added /settings/sessions route for session management
// Feature 011: Error boundary with telemetry

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealUpload } from './components/MealUpload';
import { PricingPage } from './pages/PricingPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import HomePage from './pages/HomePage';
import { UsageCounter } from './components/UsageCounter';
import { useUsage } from './hooks/useUsage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { PageContainer } from './components/layout/PageContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getUserId } from './utils/userId';
import './App.css';
import './index.css';

// Lazy load pages
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResendVerificationPage = lazy(() => import('./pages/ResendVerificationPage'));
const InviteSignupPage = lazy(() => import('./pages/InviteSignupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SessionManagement = lazy(() => import('./pages/SessionManagement'));

// Navigation component with usage counter
const Navigation: React.FC = () => {
  const location = useLocation();
  // Use persistent user ID from storage
  const userId = getUserId();
  const { usage, loading } = useUsage(userId);
  
  const navItems = [
    { path: '/', label: 'Scan', icon: '📸' },
    { path: '/history', label: 'History', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];
  
  return (
    <header className="sticky top-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-b border-primary/10" />
      
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          
          {/* Logo - Modern & Bold */}
          <Link 
            to="/" 
            className="group flex items-center gap-3 hover:scale-105 transition-transform duration-300"
          >
            {/* Animated Icon Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-xl">🍽️</span>
              </div>
            </div>
            
            {/* Brand Name */}
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                ProteinLens
              </span>
              <div className="text-[10px] font-medium text-muted-foreground -mt-0.5 tracking-widest uppercase">
                AI Nutrition
              </div>
            </div>
          </Link>
          
          {/* Center Navigation - Pill Style */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 p-1.5 bg-secondary/50 rounded-2xl border border-primary/10 shadow-inner">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {/* Active Background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg shadow-primary/30" />
                    )}
                    
                    {/* Hover Background */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 rounded-xl transition-colors" />
                    )}
                    
                    {/* Content */}
                    <span className="relative flex items-center gap-1.5">
                      <span className={isActive ? 'animate-bounce-subtle' : ''}>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right Side - Usage & CTA */}
          <div className="flex items-center gap-3">
            {/* Usage Counter - Compact & Modern */}
            <div className="hidden sm:block">
              <UsageCounter usage={usage} loading={loading} compact />
            </div>
            
            {/* Upgrade CTA - Only show on non-pricing pages */}
            {location.pathname !== '/pricing' && (
              <Link 
                to="/pricing"
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
              >
                <span>✨</span>
                <span>Go Pro</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="app flex flex-col min-h-screen bg-background text-foreground">
                <Navigation />
                <PageContainer>
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      </div>
                    }
                  >
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/login" element={<SignIn />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/signup-legacy" element={<SignUp />} />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                      <Route path="/resend-verification" element={<ResendVerificationPage />} />
                      <Route path="/invite/:token" element={<InviteSignupPage />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* Protected routes */}
                      <Route element={<ProtectedRoute />}>
                        <Route path="/history" element={<History />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/settings/sessions" element={<SessionManagement />} />
                        <Route path="/billing/success" element={<CheckoutSuccessPage />} />
                      </Route>

                      {/* 404 catch-all */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </PageContainer>
                <Footer />
                <BottomNav />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
