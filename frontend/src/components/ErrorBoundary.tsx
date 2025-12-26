/**
 * Global Error Boundary with Telemetry
 * Feature 011: Observability
 * 
 * T018: Catch React errors and track to Application Insights
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackException, trackEvent } from '../utils/telemetry';
import { SeverityLevel } from '@microsoft/applicationinsights-web';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState({ errorInfo });

    // Track exception to Application Insights
    trackException(error, {
      componentStack: errorInfo.componentStack || 'unknown',
      errorBoundary: 'GlobalErrorBoundary',
    }, SeverityLevel.Error);

    // Track error event for analytics
    trackEvent('proteinlens.error.react_boundary', {
      errorName: error.name,
      errorMessage: error.message.substring(0, 200), // Truncate for safety
      hasComponentStack: String(!!errorInfo.componentStack),
    });

    // Also log to console for development
    console.error('Uncaught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  private handleRetry = (): void => {
    // Track retry attempt
    trackEvent('proteinlens.error.retry_attempt', {
      errorName: this.state.error?.name || 'unknown',
    });

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>
            
            <p className="text-muted-foreground mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Go Home
              </button>
            </div>
            
            {/* Error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left p-4 bg-secondary rounded-lg">
                <summary className="cursor-pointer font-medium text-foreground mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap">
                  <strong>{this.state.error.name}:</strong> {this.state.error.message}
                  {'\n\n'}
                  <strong>Stack:</strong>
                  {'\n'}{this.state.error.stack}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong>
                      {'\n'}{this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
