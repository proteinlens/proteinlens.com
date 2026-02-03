// Main App Component
// T048: Root component integration
// T028: Added /pricing route for billing feature
// T038: Added UsageCounter to navigation (Feature 002)
// T071: Added /settings route for billing management
// Feature 003: React Query + Theme Provider setup
// Feature 009: Auth routes + AuthProvider
// T049: Added /settings/sessions route for session management
// Feature 011: Error boundary with telemetry
// Feature 017: Shareable meals + HelmetProvider for SEO
// SEO: Build-time prerendering support via AppContent

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AppContent } from './AppContent';

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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent isPrerender={false} />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
