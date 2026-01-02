// Export Button Component
// Feature: 001-macro-ingredients-analysis, User Story 3
// Task: T036-T037 - Export UI and download handling

import React, { useState } from 'react';
import { useExportMeals, downloadExportedData } from '@/hooks/useExportMeals';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertTriangle, CheckCircle } from 'lucide-react';
import './ExportButton.css';

interface ExportButtonProps {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  startDate,
  endDate,
  variant = 'outline',
  size = 'md',
  showText = true,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate || '');
  const [localEndDate, setLocalEndDate] = useState(endDate || '');
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportMealsMutation = useExportMeals();

  const handleExport = async () => {
    try {
      setExportSuccess(false);
      const data = await exportMealsMutation.mutateAsync({
        startDate: localStartDate || undefined,
        endDate: localEndDate || undefined,
      });

      // Download the data
      downloadExportedData(
        data,
        `meals-export-${new Date().toISOString().split('T')[0]}.json`
      );

      setExportSuccess(true);
      setShowDatePicker(false);

      // Clear success message after 3 seconds
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="export-button-container">
      <Button
        onClick={() => setShowDatePicker(!showDatePicker)}
        variant={variant}
        size={size}
        disabled={exportMealsMutation.isPending}
        className="export-button"
      >
        <Download className="w-4 h-4" />
        {showText && <span>Export Data</span>}
      </Button>

      {showDatePicker && (
        <div className="export-date-picker">
          <div className="export-date-form">
            <h3 className="export-date-title">Export Meal Data</h3>

            <div className="export-date-inputs">
              <div className="export-date-field">
                <label htmlFor="start-date" className="export-date-label">
                  Start Date (optional)
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  className="export-date-input"
                />
              </div>

              <div className="export-date-field">
                <label htmlFor="end-date" className="export-date-label">
                  End Date (optional)
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  className="export-date-input"
                />
              </div>
            </div>

            {localStartDate && localEndDate && new Date(localStartDate) > new Date(localEndDate) && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Start date must be before end date
                </AlertDescription>
              </Alert>
            )}

            <div className="export-date-actions">
              <Button
                onClick={handleExport}
                disabled={
                  exportMealsMutation.isPending ||
                  (localStartDate && localEndDate && new Date(localStartDate) > new Date(localEndDate))
                }
                className="export-confirm-btn"
              >
                {exportMealsMutation.isPending ? 'Exporting...' : 'Export'}
              </Button>
              <Button
                onClick={() => {
                  setShowDatePicker(false);
                  setLocalStartDate(startDate || '');
                  setLocalEndDate(endDate || '');
                }}
                variant="outline"
                className="export-cancel-btn"
              >
                Cancel
              </Button>
            </div>

            {exportMealsMutation.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {exportMealsMutation.error instanceof Error
                    ? exportMealsMutation.error.message
                    : 'Failed to export meals'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {exportSuccess && (
        <Alert variant="default" className="export-success-alert">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Meals exported successfully! Check your downloads folder.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExportButton;
