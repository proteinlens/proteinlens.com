/**
 * App Content Component
 * 
 * Shared app content used by both client-side rendering (App.tsx)
 * and server-side prerendering (prerender.tsx).
 * 
 * This separation allows the BrowserRouter to be at the App level
 * while StaticRouter can be used for prerendering.
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { MealUpload } from './components/MealUpload';
import { PricingPage } from './pages/PricingPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import HomePage from './pages/HomePage';
import { UsageCounter } from './components/UsageCounter';
import { useGoal } from './hooks/useGoal';
import { useProteinGap } from './hooks/useProteinGap';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { UsageProvider, useSharedUsage } from './contexts/UsageContext';
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
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ProteinCalculatorPage = lazy(() => import('./pages/ProteinCalculatorPage'));
// Feature 017: Shareable meal pages
const SharedMealPage = lazy(() => import('./pages/SharedMealPage'));
// SEO: Public marketing pages
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
// SEO: Calculator pages (Phase 2)
const MacroCalculatorPage = lazy(() => import('./pages/MacroCalculatorPage'));
const TDEECalculatorPage = lazy(() => import('./pages/TDEECalculatorPage'));
const CalorieCalculatorPage = lazy(() => import('./pages/CalorieCalculatorPage'));
// SEO: Guides pages (Phase 3)
const GuidesIndexPage = lazy(() => import('./pages/GuidesIndexPage'));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
// SEO: Blog pages (Phase 4)
const BlogIndexPage = lazy(() => import('./pages/BlogIndexPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

// Navigation component with usage counter
const Navigation: React.FC<{ isPrerender?: boolean }> = ({ isPrerender }) => {
  const location = useLocation();
  
  // Get shared usage state from context (single instance used across app)
  const { usage, loading } = useSharedUsage();
  const { goal } = useGoal();
  
  // Skip client-side only hooks during prerender
  const userId = isPrerender ? '' : getUserId();
  const proteinGap = useProteinGap({ userId, dailyGoalGrams: goal });
  
  const navItems = [
    { path: '/', label: 'Scan', icon: '📸' },
    { path: '/protein-calculator', label: 'Calculator', icon: '🎯' },
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
            {/* Protein Tracker - Shows daily progress */}
            {!isPrerender && (
              <Link 
                to="/history"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/80 rounded-lg border border-primary/20 hover:bg-secondary hover:border-primary/40 transition-all"
              >
                <span className="text-sm">🥩</span>
                <span className={`text-xs sm:text-sm font-semibold ${proteinGap.isMet ? 'text-green-500' : 'text-foreground'}`}>
                  {Math.round(proteinGap.consumedGrams)}g/{goal}g
                </span>
              </Link>
            )}
            
            {/* Usage Counter - Compact & Modern */}
            {!isPrerender && (
              <div className="hidden sm:block">
                <UsageCounter usage={usage} loading={loading} compact />
              </div>
            )}
            
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

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Prerender-safe loading (returns null for SSR)
const PrerenderSafeLoading: React.FC<{ isPrerender?: boolean }> = ({ isPrerender }) => {
  if (isPrerender) {
    return <div className="min-h-screen" />;
  }
  return <LoadingFallback />;
};

interface AppContentProps {
  isPrerender?: boolean;
}

/**
 * Main App Content - routes and layout
 */
export const AppContent: React.FC<AppContentProps> = ({ isPrerender = false }) => {
  // Wrap with providers that work in both client and SSR
  const content = (
    <ThemeProvider>
      <AuthProvider>
        <UsageProvider>
          <div className="app flex flex-col min-h-screen bg-background text-foreground">
            <Navigation isPrerender={isPrerender} />
            <PageContainer>
              <Suspense fallback={<PrerenderSafeLoading isPrerender={isPrerender} />}>
                <Routes>
                  {/* Public routes - SEO indexed */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/protein-calculator" element={<ProteinCalculatorPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  
                  {/* SEO: Public marketing pages */}
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  
                  {/* SEO: Calculator pages */}
                  <Route path="/macro-calculator" element={<MacroCalculatorPage />} />
                  <Route path="/tdee-calculator" element={<TDEECalculatorPage />} />
                  <Route path="/calorie-calculator" element={<CalorieCalculatorPage />} />
                  
                  {/* SEO: Guides pages */}
                  <Route path="/guides" element={<GuidesIndexPage />} />
                  <Route path="/methodology" element={<MethodologyPage />} />
                  
                  {/* SEO: Blog pages */}
                  <Route path="/blog" element={<BlogIndexPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  
                  {/* Auth routes - noindex */}
                  <Route path="/login" element={<SignIn />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/signup-legacy" element={<SignUp />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/resend-verification" element={<ResendVerificationPage />} />
                  <Route path="/invite/:token" element={<InviteSignupPage />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Feature 017: Public shared meal page */}
                  <Route path="/meal/:shareId" element={<SharedMealPage />} />

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
            {!isPrerender && <Footer />}
            {!isPrerender && <BottomNav />}
          </div>
        </UsageProvider>
      </AuthProvider>
    </ThemeProvider>
  );

  // For prerendering, skip ErrorBoundary (it uses client-side features)
  if (isPrerender) {
    return content;
  }

  return <ErrorBoundary>{content}</ErrorBoundary>;
};

export default AppContent;
