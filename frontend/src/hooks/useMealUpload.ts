// Custom React hook for meal upload and analysis
// T039: Manage upload state and orchestrate API calls

import { useState } from 'react';
import { apiClient, AnalysisResponse } from '../services/apiClient';

export interface UseMealUploadResult {
  uploadMeal: (file: File) => Promise<void>;
  isUploading: boolean;
  isAnalyzing: boolean;
  analysisResult: AnalysisResponse | null;
  error: string | null;
  progress: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  reset: () => void;
}

export function useMealUpload(): UseMealUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');

  const uploadMeal = async (file: File): Promise<void> => {
    try {
      // Reset state
      setError(null);
      setAnalysisResult(null);
      setProgress('uploading');
      setIsUploading(true);

      // Step 1: Request upload SAS URL
      console.log('Requesting upload URL for:', file.name);
      const uploadUrlResponse = await apiClient.requestUploadUrl({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });

      console.log('Received SAS URL for blob:', uploadUrlResponse.blobName);

      // Step 2: Upload file to blob storage
      console.log('Uploading file to blob storage...');
      await apiClient.uploadToBlob(uploadUrlResponse.uploadUrl, file);
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
      setProgress('error');
    }
  };

  const reset = () => {
    setIsUploading(false);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
    setProgress('idle');
  };

  return {
    uploadMeal,
    isUploading,
    isAnalyzing,
    analysisResult,
    error,
    progress,
    reset,
  };
}
