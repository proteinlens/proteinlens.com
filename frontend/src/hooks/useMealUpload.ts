// Custom React hook for meal upload and analysis
// T039: Manage upload state and orchestrate API calls
// T073: File size validation before upload

import { useState } from 'react';
import { apiClient, AnalysisResponse, ApiRequestError } from '../services/apiClient';
import { compressImage, shouldCompress, formatFileSize } from '../utils/imageCompression';
import { useSharedUsage } from '../contexts/UsageContext';

// T073: File validation constants
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const COMPRESSION_THRESHOLD_MB = 2;

export interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

export interface UseMealUploadResult {
  uploadMeal: (file: File) => Promise<void>;
  isUploading: boolean;
  isAnalyzing: boolean;
  isCompressing: boolean;
  analysisResult: AnalysisResponse | null;
  error: string | null;
  progress: 'idle' | 'compressing' | 'uploading' | 'analyzing' | 'complete' | 'error';
  isQuotaExceeded: boolean;
  quotaInfo: QuotaInfo | null;
  reset: () => void;
}

/**
 * T073: Validate file before upload
 */
function validateFile(file: File): string | null {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return `Invalid file type. Please upload a JPEG, PNG, or HEIC image.`;
  }

  // Check file size (before compression)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large (${formatFileSize(file.size)}). Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }

  return null;
}

export function useMealUpload(): UseMealUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<'idle' | 'compressing' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);

  // Get refresh function from shared usage context to update header after scan
  const { refresh: refreshUsage } = useSharedUsage();

  const uploadMeal = async (file: File): Promise<void> => {
    try {
      // Reset state
      setError(null);
      setAnalysisResult(null);

      // T073: Validate file before processing
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setProgress('error');
        return;
      }

      // T072: Compress image if needed
      let fileToUpload: File | Blob = file;
      let fileName = file.name;
      let contentType = file.type;

      if (shouldCompress(file, COMPRESSION_THRESHOLD_MB)) {
        setProgress('compressing');
        setIsCompressing(true);
        
        console.log(`Compressing image (${formatFileSize(file.size)})...`);
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeMB: 5,
        });
        
        fileToUpload = compressed.blob;
        contentType = compressed.blob.type;
        // Update extension if converted (e.g., HEIC → JPEG)
        if (contentType === 'image/jpeg' && !fileName.toLowerCase().endsWith('.jpg')) {
          fileName = fileName.replace(/\.[^/.]+$/, '.jpg');
        }
        
        console.log(`Compressed: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${compressed.compressionRatio.toFixed(1)}% reduction)`);
        setIsCompressing(false);
      }

      setProgress('uploading');
      setIsUploading(true);

      // Step 1: Request upload SAS URL
      console.log('Requesting upload URL for:', fileName);
      const uploadUrlResponse = await apiClient.requestUploadUrl({
        fileName: fileName,
        fileSize: fileToUpload.size,
        contentType: contentType,
      });

      console.log('Received SAS URL for blob:', uploadUrlResponse.blobName);

      // Step 2: Upload file to blob storage
      console.log('Uploading file to blob storage...');
      await apiClient.uploadToBlob(uploadUrlResponse.uploadUrl, fileToUpload as File);
      console.log('Upload complete');

      setIsUploading(false);
      setIsAnalyzing(true);
      setProgress('analyzing');

      // Step 3: Request AI analysis
      console.log('Requesting AI analysis...');
      const analysisResponse = await apiClient.analyzeMeal({
        blobName: uploadUrlResponse.blobName,
      });

      console.log('Analysis complete:', analysisResponse);

      // Extract quota info from successful response
      if (analysisResponse.quota) {
        setQuotaInfo(analysisResponse.quota);
        console.log('Quota updated:', analysisResponse.quota);
      }

      // Refresh usage in header to show updated quota count
      console.log('Calling refreshUsage()...');
      try {
        const startTime = performance.now();
        await refreshUsage();
        const duration = performance.now() - startTime;
        console.log(`✅ Usage refreshed in header (${duration.toFixed(2)}ms)`);
      } catch (err) {
        console.warn('⚠️ Failed to refresh usage (non-blocking):', err);
        // Don't re-throw - refreshing usage is not critical for the main flow
      }

      // Step 4: Update state with results
      setAnalysisResult(analysisResponse);
      setIsAnalyzing(false);
      setProgress('complete');

    } catch (err) {
      console.error('Upload/analysis failed:', err);
      console.log('Error type check:', {
        isApiRequestError: err instanceof ApiRequestError,
        status: (err as any)?.status,
        message: (err as any)?.message,
      });
      
      // Check for quota exceeded (429)
      if (err instanceof ApiRequestError && err.status === 429) {
        console.log('🚫 Quota exceeded detected! Setting isQuotaExceeded=true');
        setIsQuotaExceeded(true);
        if (err.quota) {
          setQuotaInfo(err.quota);
          console.log('📊 Quota info:', err.quota);
        }
        setError('Quota exceeded');
      } else if (err instanceof ApiRequestError) {
        // Map API error codes to user-friendly messages
        const message = err.message;
        console.log('📍 ApiRequestError with status:', err.status);
        if (err.status >= 500) {
          setError('Our servers are temporarily busy. Please try again in a moment.');
        } else if (err.status === 400) {
          setError(message || 'Invalid image. Please try a different photo.');
        } else if (message.includes('timeout') || message.includes('network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(message || 'Analysis failed. Please try again.');
        }
      } else {
        const message = (err as Error).message || '';
        if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(message || 'An unexpected error occurred. Please try again.');
        }
      }
      
      setIsUploading(false);
      setIsAnalyzing(false);
      setIsCompressing(false);
      setProgress('error');
    }
  };

  const reset = () => {
    setIsUploading(false);
    setIsAnalyzing(false);
    setIsCompressing(false);
    setAnalysisResult(null);
    setError(null);
    setProgress('idle');
    setIsQuotaExceeded(false);
    setQuotaInfo(null);
  };

  return {
    uploadMeal,
    isUploading,
    isAnalyzing,
    isCompressing,
    analysisResult,
    error,
    progress,
    isQuotaExceeded,
    quotaInfo,
    reset,
  };
}
