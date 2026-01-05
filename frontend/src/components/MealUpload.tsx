// MealUpload Component
// User Story 1: Upload meal photo and get protein analysis
// T040-T043: File picker, upload UI, progress states, error handling
// T039: Handle 429 response to show UpgradePrompt (Feature 002)

import React, { useRef, useState } from 'react';
import { useMealUpload } from '../hooks/useMealUpload';
import { AnalysisResults } from './AnalysisResults';
import { UpgradePrompt } from './UpgradePrompt';
import { QuotaBanner } from './QuotaBanner';
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

  // T043: Error handling UI - Beautiful engaging error states
  const renderError = () => {
    // Handle quota exceeded separately with clear messaging
    if (isQuotaExceeded) {
      return (
        <div className="error-card error-card--quota">
          <div className="error-card__icon">🚀</div>
          <h3 className="error-card__title">You're a Scanning Machine!</h3>
          <p className="error-card__subtitle">You've hit your free scan limit for this week</p>
          
          <div className="error-card__message" style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '15px' }}>
              💡 <strong>Here's what you can do:</strong>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              📝 Create a <strong>FREE account</strong> → 20 scans/week<br/>
              ⭐ <strong>Upgrade to Pro</strong> → Unlimited scans
            </div>
          </div>

          <div className="error-card__actions" style={{ gap: '10px', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => window.location.href = '/signup'} className="error-card__btn error-card__btn--primary">
              📝 Create FREE Account → 20 Scans/Week
            </button>
            <button onClick={() => window.location.href = '/pricing'} className="error-card__btn error-card__btn--secondary">
              ⭐ Upgrade to Pro → Unlimited
            </button>
          </div>
          
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '13px', color: '#0c4a6e' }}>
            📊 <strong>Your quota:</strong> 3 scans/week as guest | Resets in ~7 days
          </div>
        </div>
      );
    }

    // Don't show other errors if there's no specific error message
    if (!error) {
      return null;
    }

    // Categorize errors for better UX
    const isNetworkError = error.includes('Network') || 
                           error.includes('fetch') || 
                           error.includes('Failed to fetch') ||
                           error.includes('connection');
    
    const isServerError = error.includes('500') || 
                          error.includes('503') || 
                          error.includes('temporarily') ||
                          error.includes('servers');

    const isImageError = error.includes('image') || 
                         error.includes('Invalid') ||
                         error.includes('file');

    // Get error config based on type
    const getErrorConfig = () => {
      if (isNetworkError) {
        return {
          icon: '📡',
          title: "Can't reach our servers",
          subtitle: 'No worries, this happens sometimes!',
          tips: [
            '🔌 Check your internet connection',
            '🔄 The backend server might not be running',
            '⏱️ Wait a moment and try again',
          ],
          retryText: 'Retry Connection',
          gradient: 'network',
        };
      }
      
      if (isServerError) {
        return {
          icon: '🔧',
          title: "Our servers are taking a break",
          subtitle: "We're working on it!",
          tips: [
            '☕ Grab a coffee, we\'ll be back shortly',
            '🛠️ Our team has been notified',
            '⏰ Usually fixed within minutes',
          ],
          retryText: 'Try Again',
          gradient: 'server',
        };
      }
      
      if (isImageError) {
        return {
          icon: '🖼️',
          title: "Hmm, that image didn't work",
          subtitle: 'Let\'s try a different approach',
          tips: [
            '📸 Use JPEG, PNG, or HEIC format',
            '📏 Keep file size under 8MB',
            '💡 Well-lit photos work best',
          ],
          retryText: 'Choose Different Photo',
          gradient: 'image',
        };
      }
      
      // Default error
      return {
        icon: '😅',
        title: "Oops! Something unexpected happened",
        subtitle: "But don't worry, you can try again",
        tips: [
          '🔄 Try uploading again',
          '📸 Use a different photo',
          '🆘 Contact support if this persists',
        ],
        retryText: 'Try Again',
        gradient: 'default',
      };
    };

    const config = getErrorConfig();

    return (
      <div className={`error-card error-card--${config.gradient}`}>
        <div className="error-card__icon">{config.icon}</div>
        <h3 className="error-card__title">{config.title}</h3>
        <p className="error-card__subtitle">{config.subtitle}</p>
        
        <div className="error-card__tips">
          {config.tips.map((tip, i) => (
            <div key={i} className="error-card__tip">{tip}</div>
          ))}
        </div>

        <div className="error-card__actions">
          {selectedFile && (
            <button onClick={handleUpload} className="error-card__btn error-card__btn--primary">
              {config.retryText}
            </button>
          )}
          <button onClick={handleReset} className="error-card__btn error-card__btn--secondary">
            Start Fresh
          </button>
        </div>

        <details className="error-card__details">
          <summary>Technical details</summary>
          <code>{error}</code>
        </details>
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

      {/* Quota Banner - Show when approaching or at quota limit */}
      {quotaInfo && quotaInfo.remaining <= 1 && !isQuotaExceeded && (
        <QuotaBanner
          scansRemaining={quotaInfo.remaining}
          scansLimit={quotaInfo.limit}
          plan={quotaInfo.plan}
          onDismiss={() => {}}
        />
      )}

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
