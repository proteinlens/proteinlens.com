// MealUpload Component
// User Story 1: Upload meal photo and get protein analysis
// T040-T043: File picker, upload UI, progress states, error handling
// T039: Handle 429 response to show UpgradePrompt (Feature 002)

import React, { useRef, useState } from 'react';
import { useMealUpload } from '../hooks/useMealUpload';
import { AnalysisResults } from './AnalysisResults';
import { UpgradePrompt } from './UpgradePrompt';
import './MealUpload.css';

export const MealUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const {
    uploadMeal,
    isUploading,
    isAnalyzing,
    analysisResult,
    error,
    progress,
    isQuotaExceeded,
    quotaInfo,
    reset,
  } = useMealUpload();

  // T040: File picker with validation
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a JPEG, PNG, or HEIC image');
      return;
    }

    // Validate file size (8MB max)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 8MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // T041: Upload button handler (T039: Handle 429 quota exceeded)
  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    await uploadMeal(selectedFile);
  };

  // Auto-show upgrade prompt when quota is exceeded (immediate)
  React.useEffect(() => {
    if (isQuotaExceeded) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowUpgradePrompt(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isQuotaExceeded]);

  // Reset to upload new photo
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowUpgradePrompt(false);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // T042: Progress states UI
  const renderProgressState = () => {
    if (isUploading) {
      return (
        <div className="progress-state">
          <div className="spinner"></div>
          <p>Uploading photo...</p>
        </div>
      );
    }

    if (isAnalyzing) {
      return (
        <div className="progress-state">
          <div className="spinner"></div>
          <p>Analyzing protein content with AI...</p>
          <p className="progress-subtext">This may take a few seconds</p>
        </div>
      );
    }

    return null;
  };

  // T043: Error handling UI (T039: Quota errors show UpgradePrompt modal)
  const renderError = () => {
    // Don't show inline error for quota exceeded - UpgradePrompt modal handles it
    if (!error || isQuotaExceeded) {
      return null;
    }

    // Determine if error is retryable
    const isRetryable = error.includes('network') || 
                        error.includes('timeout') || 
                        error.includes('temporarily') ||
                        error.includes('500') ||
                        error.includes('503');

    return (
      <div className="error-message">
        <h3>⚠️ Something went wrong</h3>
        <p>{error}</p>
        <div className="error-actions">
          {isRetryable && selectedFile && (
            <button onClick={handleUpload} className="btn-primary">
              🔄 Try Again
            </button>
          )}
          <button onClick={handleReset} className="btn-secondary">
            Start Over
          </button>
        </div>
      </div>
    );
  };

  // Show results if analysis is complete
  if (analysisResult) {
    return (
      <div className="meal-upload">
        <AnalysisResults result={analysisResult} imageUrl={previewUrl} />
        <button onClick={handleReset} className="btn-primary">
          Analyze Another Meal
        </button>
      </div>
    );
  }

  return (
    <div className="meal-upload">
      <h1>📸 ProteinLens</h1>
      <p className="subtitle">Upload a meal photo to analyze protein content</p>

      {/* File picker */}
      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic"
          onChange={handleFileSelect}
          disabled={isUploading || isAnalyzing}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {selectedFile ? '✓ Photo Selected' : '📁 Choose Photo'}
        </label>
      </div>

      {/* Image preview */}
      {previewUrl && (
        <div className="preview-section">
          <img src={previewUrl} alt="Meal preview" className="preview-image" />
          <p className="file-info">
            {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(0)} KB)
          </p>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !isUploading && !isAnalyzing && (
        <button
          onClick={handleUpload}
          className="btn-primary"
          disabled={!selectedFile}
        >
          🔍 Analyze Protein
        </button>
      )}

      {/* Progress states */}
      {renderProgressState()}

      {/* Error display */}
      {renderError()}

      {/* Usage tips */}
      {!selectedFile && !error && (
        <div className="tips">
          <h3>Tips for best results:</h3>
          <ul>
            <li>Take photos in good lighting</li>
            <li>Ensure all food items are visible</li>
            <li>Use JPEG, PNG, or HEIC format</li>
            <li>Maximum file size: 8MB</li>
          </ul>
        </div>
      )}

      {/* T039: Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        scansUsed={quotaInfo?.used}
        scansLimit={quotaInfo?.limit}
      />
    </div>
  );
};
