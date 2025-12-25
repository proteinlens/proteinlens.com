// API Client for backend communication
// Constitution Principle III: Blob-First Architecture
// T038: API client with upload and analyze methods

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

class ApiClient {
  /**
   * Request SAS URL for blob upload
   * T038: Request upload SAS URL from backend
   */
  async requestUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    const response = await fetch(`${API_PATH}/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `Upload URL request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Upload file directly to Azure Blob Storage using SAS URL
   * Constitution Principle III: Client → Blob (no base64 to backend)
   */
  async uploadToBlob(sasUrl: string, file: File): Promise<void> {
    const response = await fetch(sasUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-ms-blob-type': 'BlockBlob',
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Blob upload failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Request AI analysis of uploaded meal photo
   * T038: Request meal analysis from backend
   */
  async analyzeMeal(request: AnalyzeRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${API_PATH}/meals/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `Analysis request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get user's meal history
   * T067: Get meal history (User Story 2, Phase 4)
   */
  async getMealHistory(userId: string, limit = 50): Promise<AnalysisResponse[]> {
    const response = await fetch(`${API_PATH}/meals?userId=${userId}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
