// Checkout Success Page
// Feature: 002-saas-billing, User Story 2

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CheckoutSuccessPage.css';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Auto-redirect to home after countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="checkout-success">
      <div className="checkout-success__card">
        <div className="checkout-success__icon">🎉</div>
        
        <h1 className="checkout-success__title">Welcome to Pro!</h1>
        
        <p className="checkout-success__message">
          Your subscription is now active. You have unlimited access to all 
          ProteinLens features.
        </p>

        <div className="checkout-success__features">
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span>Unlimited meal scans</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Full history forever</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📥</span>
            <span>Export your data</span>
          </div>
        </div>

        <div className="checkout-success__actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Start Scanning
          </button>
          <p className="checkout-success__redirect">
            Redirecting in {countdown} seconds...
          </p>
        </div>

        {sessionId && (
          <p className="checkout-success__session">
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
