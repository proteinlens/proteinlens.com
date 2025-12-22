// Upgrade Prompt Modal - Shown when quota is exceeded
// Feature: 002-saas-billing, User Story 3

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UpgradePrompt.css';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  scansUsed?: number;
  scansLimit?: number;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  scansUsed = 5,
  scansLimit = 5,
}) => {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="upgrade-prompt__backdrop" onClick={handleBackdropClick}>
      <div className="upgrade-prompt">
        <button className="upgrade-prompt__close" onClick={onClose}>
          ✕
        </button>
        
        <div className="upgrade-prompt__icon">🚫</div>
        
        <h2 className="upgrade-prompt__title">Weekly Scan Limit Reached</h2>
        
        <p className="upgrade-prompt__message">
          You've used all <strong>{scansLimit} free scans</strong> this week. 
          Your scan quota resets on a rolling 7-day basis.
        </p>

        <div className="upgrade-prompt__stats">
          <div className="upgrade-prompt__stat">
            <span className="upgrade-prompt__stat-value">{scansUsed}</span>
            <span className="upgrade-prompt__stat-label">Scans used</span>
          </div>
          <div className="upgrade-prompt__stat">
            <span className="upgrade-prompt__stat-value">0</span>
            <span className="upgrade-prompt__stat-label">Remaining</span>
          </div>
        </div>

        <div className="upgrade-prompt__cta">
          <h3>Upgrade to Pro for unlimited scans</h3>
          <ul className="upgrade-prompt__benefits">
            <li>✨ Unlimited meal scans</li>
            <li>✨ Full history forever</li>
            <li>✨ Export your data</li>
          </ul>
          <p className="upgrade-prompt__price">
            Starting at <strong>€9.99/month</strong>
          </p>
        </div>

        <div className="upgrade-prompt__actions">
          <button 
            className="upgrade-prompt__button upgrade-prompt__button--primary"
            onClick={handleUpgrade}
          >
            View Pro Plans
          </button>
          <button 
            className="upgrade-prompt__button upgrade-prompt__button--secondary"
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
