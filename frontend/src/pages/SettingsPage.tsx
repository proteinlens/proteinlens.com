// Settings Page - Account and Billing Management
// Feature: 002-saas-billing, User Story 5
// T071: Settings page with billing section

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsage } from '../hooks/useUsage';
import { useAuth } from '../contexts/AuthProvider';
import { redirectToPortal, getUsage, UsageStats } from '../services/billingApi';
import { ProBadge } from '../components/ProBadge';
import { trackLogout } from '../utils/telemetry';
import './SettingsPage.css';

interface SubscriptionInfo {
  plan: 'FREE' | 'PRO';
  status?: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd?: string;
  stripeCustomerId?: string;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  // TODO: Replace with actual userId from auth context
  const userId = user?.id || 'demo-user';
  const { usage, loading: usageLoading, refresh: refreshUsage } = useUsage(userId);
  const [portalLoading, setPortalLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = usage?.plan === 'PRO';
  const isLapsed = usage?.plan === 'FREE' && false; // TODO: Track if user was previously Pro

  // T072: Handle Manage Billing click
  const handleManageBilling = async () => {
    setError(null);
    setPortalLoading(true);
    
    try {
      await redirectToPortal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  // T042: Handle Sign Out click (Feature 013-self-managed-auth, US6)
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      trackLogout();
      await logout();
      navigate('/signin');
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      setLogoutLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate days until renewal
  const daysUntilRenewal = (dateString?: string) => {
    if (!dateString) return null;
    const endDate = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="settings-page">
      <div className="settings-page__container">
        <h1 className="settings-page__title">Settings</h1>

        {/* Billing Section */}
        <section className="settings-section">
          <h2 className="settings-section__title">
            <span className="settings-section__icon">💳</span>
            Subscription & Billing
          </h2>

          {usageLoading ? (
            <div className="settings-section__loading">Loading subscription info...</div>
          ) : (
            <div className="settings-billing">
              {/* T073: Current Plan Display */}
              <div className="settings-billing__plan">
                <div className="settings-billing__plan-header">
                  <span className="settings-billing__plan-label">Current Plan</span>
                  {isPro ? (
                    <ProBadge size="large" />
                  ) : (
                    <span className="settings-billing__plan-free">Free</span>
                  )}
                </div>

                {isPro && usage && (
                  <div className="settings-billing__details">
                    <div className="settings-billing__detail">
                      <span className="settings-billing__detail-label">Status</span>
                      <span className="settings-billing__detail-value settings-billing__status--active">
                        Active
                      </span>
                    </div>
                    <div className="settings-billing__detail">
                      <span className="settings-billing__detail-label">Renewal Date</span>
                      <span className="settings-billing__detail-value">
                        {formatDate(usage.periodEnd)}
                        {daysUntilRenewal(usage.periodEnd) !== null && (
                          <span className="settings-billing__days-left">
                            ({daysUntilRenewal(usage.periodEnd)} days)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="settings-billing__detail">
                      <span className="settings-billing__detail-label">Scans</span>
                      <span className="settings-billing__detail-value">Unlimited</span>
                    </div>
                  </div>
                )}

                {!isPro && usage && (
                  <div className="settings-billing__details">
                    <div className="settings-billing__detail">
                      <span className="settings-billing__detail-label">Scans This Week</span>
                      <span className="settings-billing__detail-value">
                        {usage.scansUsed} / {usage.scansLimit}
                      </span>
                    </div>
                    <div className="settings-billing__detail">
                      <span className="settings-billing__detail-label">History Access</span>
                      <span className="settings-billing__detail-value">Last 7 days</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="settings-billing__actions">
                {isPro ? (
                  // T072: Manage Billing button for Pro users
                  <button
                    className="settings-billing__button settings-billing__button--manage"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <>
                        <span className="settings-billing__spinner">⏳</span>
                        Opening Portal...
                      </>
                    ) : (
                      <>
                        <span className="settings-billing__button-icon">⚙️</span>
                        Manage Billing
                      </>
                    )}
                  </button>
                ) : (
                  // Upgrade button for Free users
                  <a href="/pricing" className="settings-billing__button settings-billing__button--upgrade">
                    <span className="settings-billing__button-icon">⭐</span>
                    Upgrade to Pro
                  </a>
                )}

                {/* T074: Reactivate CTA for lapsed Pro users */}
                {isLapsed && (
                  <div className="settings-billing__lapsed">
                    <p className="settings-billing__lapsed-message">
                      Your Pro subscription has ended. Reactivate to restore unlimited access.
                    </p>
                    <a href="/pricing" className="settings-billing__button settings-billing__button--reactivate">
                      <span className="settings-billing__button-icon">🔄</span>
                      Reactivate Pro
                    </a>
                  </div>
                )}
              </div>

              {error && (
                <div className="settings-billing__error">
                  {error}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Plan Features Section */}
        <section className="settings-section">
          <h2 className="settings-section__title">
            <span className="settings-section__icon">✨</span>
            Your Features
          </h2>

          <div className="settings-features">
            <div className={`settings-feature ${isPro ? 'settings-feature--available' : ''}`}>
              <span className="settings-feature__icon">{isPro ? '✅' : '❌'}</span>
              <span className="settings-feature__name">Unlimited Scans</span>
              {!isPro && <span className="settings-feature__limit">(5/week on Free)</span>}
            </div>
            <div className={`settings-feature ${isPro ? 'settings-feature--available' : ''}`}>
              <span className="settings-feature__icon">{isPro ? '✅' : '❌'}</span>
              <span className="settings-feature__name">Full History Access</span>
              {!isPro && <span className="settings-feature__limit">(7 days on Free)</span>}
            </div>
            <div className={`settings-feature ${isPro ? 'settings-feature--available' : ''}`}>
              <span className="settings-feature__icon">{isPro ? '✅' : '❌'}</span>
              <span className="settings-feature__name">Export Data</span>
              {!isPro && <span className="settings-feature__limit">(Pro only)</span>}
            </div>
            <div className="settings-feature settings-feature--available">
              <span className="settings-feature__icon">✅</span>
              <span className="settings-feature__name">AI-Powered Analysis</span>
            </div>
          </div>
        </section>

        {/* Account Section (T042: Sign Out button) */}
        <section className="settings-section">
          <h2 className="settings-section__title">
            <span className="settings-section__icon">👤</span>
            Account
          </h2>
          
          {isAuthenticated && user ? (
            <div className="settings-account">
              <div className="settings-account__info">
                <div className="settings-account__detail">
                  <span className="settings-account__label">Email</span>
                  <span className="settings-account__value">{user.email}</span>
                </div>
                {(user.firstName || user.lastName) && (
                  <div className="settings-account__detail">
                    <span className="settings-account__label">Name</span>
                    <span className="settings-account__value">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}
                <div className="settings-account__detail">
                  <span className="settings-account__label">Email Verified</span>
                  <span className="settings-account__value">
                    {user.emailVerified ? '✅ Verified' : '⚠️ Not verified'}
                  </span>
                </div>
              </div>
              
              <div className="settings-account__actions">
                <button
                  className="settings-account__button settings-account__button--sessions"
                  onClick={() => navigate('/settings/sessions')}
                >
                  <span className="settings-account__button-icon">📱</span>
                  Manage Sessions
                </button>
                <button
                  className="settings-account__button settings-account__button--logout"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <>
                      <span className="settings-account__spinner">⏳</span>
                      Signing out...
                    </>
                  ) : (
                    <>
                      <span className="settings-account__button-icon">🚪</span>
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="settings-account">
              <p className="settings-section__placeholder">
                You are not signed in.
              </p>
              <div className="settings-account__actions">
                <a href="/signin" className="settings-account__button settings-account__button--signin">
                  <span className="settings-account__button-icon">🔑</span>
                  Sign In
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
