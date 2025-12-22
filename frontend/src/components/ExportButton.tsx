// Export Button Component - Download meal data (Pro-only)
// Feature: 002-saas-billing, User Story 4
// T063: Export button for Pro users

import React, { useState } from 'react';
import { exportMeals } from '../services/billingApi';
import './ExportButton.css';

interface ExportButtonProps {
  isPro: boolean;
  onUpgradeClick?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  isPro,
  onUpgradeClick,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    setShowFormatMenu(false);
    setError(null);
    setLoading(true);

    try {
      await exportMeals(format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <button 
        className="export-button export-button--locked"
        onClick={onUpgradeClick}
        title="Upgrade to Pro to export your data"
      >
        <span className="export-button__icon">📥</span>
        <span className="export-button__text">Export</span>
        <span className="export-button__lock">🔒</span>
      </button>
    );
  }

  return (
    <div className="export-button-wrapper">
      <button
        className={`export-button ${loading ? 'export-button--loading' : ''}`}
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        disabled={loading}
      >
        <span className="export-button__icon">
          {loading ? '⏳' : '📥'}
        </span>
        <span className="export-button__text">
          {loading ? 'Exporting...' : 'Export'}
        </span>
      </button>

      {showFormatMenu && (
        <div className="export-button__menu">
          <button
            className="export-button__menu-item"
            onClick={() => handleExport('csv')}
          >
            <span className="export-button__format-icon">📊</span>
            CSV (Spreadsheet)
          </button>
          <button
            className="export-button__menu-item"
            onClick={() => handleExport('json')}
          >
            <span className="export-button__format-icon">📄</span>
            JSON (Data)
          </button>
        </div>
      )}

      {error && (
        <div className="export-button__error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
