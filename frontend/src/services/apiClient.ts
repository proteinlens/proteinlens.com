// API Client for backend communication
// Constitution Principle III: Blob-First Architecture
// T038: API client with upload and analyze methods

import { getUserId } from '../utils/userId';

export interface UploadUrlRequest {
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  blobName: string;
  expiresIn: number;
}

export interface AnalyzeRequest {
  blobName: string;
}

export interface FoodItem {
  name: string;
  portion: string;
  protein: number;
}

export interface AnalysisResponse {
  mealAnalysisId: string;
  foods: FoodItem[];
  totalProtein: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  blobName: string;
  requestId: string;
}

export interface ApiError {
  error: string;
  requestId?: string;
  message?: string;
  quota?: {
    used: number;
    limit: number;
    remaining: number;
    plan: string;
  };
  upgrade?: {
    message: string;
    url: string;
  };
}

/**
 * Custom error class for API errors with status and quota info
 */
export class ApiRequestError extends Error {
  status: number;
  quota?: ApiError['quota'];
  upgrade?: ApiError['upgrade'];

  constructor(message: string, status: number, errorBody?: ApiError) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.quota = errorBody?.quota;
    this.upgrade = errorBody?.upgrade;
  }
}

/**
 * T055: Meal corrections interface
 */
export interface MealCorrections {
  foods?: Array<{
    name: string;
    portion?: string;
    protein: number;
  }>;
  totalProtein?: number;
  notes?: string;
}

// VITE_API_URL is the base URL (e.g., https://api.proteinlens.com or http://localhost:7071)
// All API routes are under /api/* path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_PATH = `${API_BASE_URL}/api`;

/**
 * Get common headers including user ID
 */
function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getUserId(),
  };
}

class ApiClient {
  /**
   * Request SAS URL for blob upload
   * T038: Request upload SAS URL from backend
   */
  async requestUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(`${API_PATH}/upload-url`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || `Upload URL request failed: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw err;
    }
  }

  /**
   * Upload file directly to Azure Blob Storage using SAS URL
   * Constitution Principle III: Client → Blob (no base64 to backend)
   * Includes timeout and retry logic for mobile networks
   */
  async uploadToBlob(sasUrl: string, file: File | Blob, contentType?: string): Promise<void> {
    const mimeType = contentType || (file instanceof File ? file.type : 'image/jpeg');
    const maxRetries = 3;
    const timeoutMs = 60000; // 60 second timeout for mobile networks
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(sasUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': mimeType,
            'x-ms-blob-type': 'BlockBlob',
          },
          body: file,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Blob upload failed: ${response.status} ${response.statusText}`);
        }
        
        return; // Success!
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Upload failed');
        
        // Don't retry on non-retryable errors
        if (lastError.name !== 'AbortError' && !lastError.message.includes('network')) {
          if (attempt === maxRetries || (err instanceof Error && err.message.includes('403'))) {
            throw lastError;
          }
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError || new Error('Upload failed after retries');
  }

  /**
   * Request AI analysis of uploaded meal photo
   * T038: Request meal analysis from backend
   * Throws ApiRequestError with quota info on 429
   */
  async analyzeMeal(request: AnalyzeRequest): Promise<AnalysisResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for AI analysis
    
    try {
      const response = await fetch(`${API_PATH}/meals/analyze`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody: ApiError = await response.json();
        throw new ApiRequestError(
          errorBody.message || errorBody.error || `Analysis request failed: ${response.status}`,
          response.status,
          errorBody
        );
      }

      return response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Analysis timed out. Please try again.');
      }
      throw err;
    }
  }

  /**
   * Get user's meal history
   * T067: Get meal history (User Story 2, Phase 4)
   */
  async getMealHistory(userId?: string, limit = 50): Promise<AnalysisResponse[]> {
    // Use provided userId or get from storage
    const effectiveUserId = userId || getUserId();
    const response = await fetch(`${API_PATH}/meals?userId=${effectiveUserId}&limit=${limit}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `Get meal history failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete meal analysis
   * T081: Delete meal (User Story 3, Phase 5)
   */
  async deleteMeal(mealId: string): Promise<void> {
    const response = await fetch(`${API_PATH}/meals/${mealId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `Delete meal failed: ${response.status}`);
    }
  }

  /**
   * Update meal with user corrections
   * T055: Update meal corrections (User Story 2, Phase 4)
   */
  async updateMeal(mealId: string, corrections: MealCorrections): Promise<AnalysisResponse> {
    const response = await fetch(`${API_PATH}/meals/${mealId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ corrections }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `Update meal failed: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
