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
  carbs?: number;    // NEW - macro ingredients analysis
  fat?: number;      // NEW - macro ingredients analysis
}

export interface AnalysisResponse {
  mealAnalysisId: string;
  foods: FoodItem[];
  totalProtein: number;
  totalCarbs?: number;    // NEW - macro ingredients analysis
  totalFat?: number;      // NEW - macro ingredients analysis
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  dietFeedback?: string; // Feature 017: Diet-specific feedback based on user's diet style
  shareUrl?: string;      // Shareable meal link
  shareId?: string;       // Meal share ID
  blobName: string;
  requestId: string;
  quota?: {
    used: number;
    limit: number;
    remaining: number;
    plan: string;
  };
}

export interface MealHistoryItem {
  id: string;
  mealAnalysisId: string;
  uploadedAt: string;
  imageUrl: string;
  analysis: {
    totalProtein: number;
    totalCarbs?: number;    // NEW - macro ingredients analysis
    totalFat?: number;      // NEW - macro ingredients analysis
    confidence: 'high' | 'medium' | 'low';
    foods: FoodItem[];
    notes?: string;
  };
  aiModel?: string;
  requestId?: string;
  userCorrections?: any;
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
   * Increased timeout for mobile networks and cold start scenarios
   */
  async requestUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    const controller = new AbortController();
    // 45s timeout to account for cold start (can take 10-20s) + network latency
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    
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
        throw new Error('Request timed out. The server may be waking up - please try again.');
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
    // 90 second timeout for mobile networks (especially on slow 3G/4G)
    const timeoutMs = 90000;
    
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
   * Includes retry logic for transient failures (cold start scenarios)
   */
  async analyzeMeal(request: AnalyzeRequest): Promise<AnalysisResponse> {
    const maxRetries = 2;  // Retry once on timeout
    const timeoutMs = 120000; // 2 minute timeout for AI analysis (includes cold start)
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
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
        lastError = err instanceof Error ? err : new Error('Analysis failed');
        
        // Only retry on timeout (AbortError), not on server errors
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`Analysis attempt ${attempt} timed out, ${attempt < maxRetries ? 'retrying...' : 'giving up'}`);
          if (attempt < maxRetries) {
            // Brief delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error('Analysis timed out. The server may be busy - please try again in a moment.');
        }
        throw err;
      }
    }
    
    throw lastError || new Error('Analysis failed after retries');
  }

  /**
   * Get user's meal history
   * T067: Get meal history (User Story 2, Phase 4)
   */
  async getMealHistory(userId?: string, limit = 50): Promise<MealHistoryItem[]> {
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

    const meals = await response.json();
    
    // Transform API response to match component expected format
    return meals.map((meal: any) => ({
      id: meal.id,
      mealAnalysisId: meal.id,
      uploadedAt: meal.timestamp,
      imageUrl: meal.imageUrl,
      analysis: {
        totalProtein: meal.totalProtein,
        confidence: meal.confidence,
        foods: meal.foods,
        notes: meal.notes,
      },
      aiModel: meal.aiModel,
      requestId: meal.requestId,
      userCorrections: meal.userCorrections,
    }));
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

  /**
   * Feature 017: Update meal privacy status
   * T020: Toggle public/private visibility for meal sharing
   */
  async updateMealPrivacy(mealId: string, isPublic: boolean): Promise<{
    id: string;
    shareId: string;
    isPublic: boolean;
    shareUrl: string | null;
  }> {
    const response = await fetch(`${API_PATH}/meals/${mealId}/privacy`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ isPublic }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `Update privacy failed: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
