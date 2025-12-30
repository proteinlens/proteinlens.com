// Error Boundary Component
// Feature: 012-admin-dashboard
// T083: Catch and display runtime errors gracefully

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the entire admin dashboard.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log to console in development
    console.error('Admin Dashboard Error:', error);
    console.error('Error Info:', errorInfo);
    
    // In production, you might want to send this to an error tracking service
    // Example: reportErrorToService(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md w-full px-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/10">
                <svg
                  className="h-10 w-10 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="mt-2 text-gray-600">
                An unexpected error occurred in the admin dashboard.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-xl shadow-gray-900/5 rounded-2xl border border-gray-100">
              {this.state.error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                  <p className="text-sm font-medium text-red-800">
                    <span className="font-semibold">Error:</span> {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-admin-500 to-admin-600 hover:from-admin-600 hover:to-admin-700 shadow-lg shadow-admin-500/30 hover:shadow-xl hover:shadow-admin-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reload Page
                </button>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <details>
                  <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                    🔍 Stack trace (development only)
                  </summary>
                  <pre className="mt-3 p-3 text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
