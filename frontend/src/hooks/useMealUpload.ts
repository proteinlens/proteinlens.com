// Custom React hook for meal upload and analysis
// T039: Manage upload state and orchestrate API calls
// T073: File size validation before upload

import { useState } from 'react';
import { apiClient, AnalysisResponse } from '../services/apiClient';
import { compressImage, shouldCompress, formatFileSize } from '../utils/imageCompression';

// T073: File validation constants
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const COMPRESSION_THRESHOLD_MB = 2;

export interface UseMealUploadResult {
  uploadMeal: (file: File) => Promise<void>;
  isUploading: boolean;
  isAnalyzing: boolean;
  isCompressing: boolean;
  analysisResult: AnalysisResponse | null;
  error: string | null;
  progress: 'idle' | 'compressing' | 'uploading' | 'analyzing' | 'complete' | 'error';
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
      await apiClient.uploadToBlob(uploadUrlResponse.uploadUrl, fileToUpload);
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

      // Step 4: Update state with results
      setAnalysisResult(analysisResponse);
      setIsAnalyzing(false);
      setProgress('complete');

    } catch (err) {
      console.error('Upload/analysis failed:', err);
      setError((err as Error).message || 'An unexpected error occurred');
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
  };

  return {
    uploadMeal,
    isUploading,
    isAnalyzing,
    isCompressing,
    analysisResult,
    error,
    progress,
    reset,
  };
}
