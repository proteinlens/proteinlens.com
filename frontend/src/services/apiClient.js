// API Client for backend communication
// Constitution Principle III: Blob-First Architecture
// T038: API client with upload and analyze methods
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
class ApiClient {
    /**
     * Request SAS URL for blob upload
     * T038: Request upload SAS URL from backend
     */
    async requestUploadUrl(request) {
        const response = await fetch(`${API_BASE_URL}/upload-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Upload URL request failed: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Upload file directly to Azure Blob Storage using SAS URL
     * Constitution Principle III: Client → Blob (no base64 to backend)
     */
    async uploadToBlob(sasUrl, file) {
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
    async analyzeMeal(request) {
        const response = await fetch(`${API_BASE_URL}/meals/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Analysis request failed: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Get user's meal history
     * T067: Get meal history (User Story 2, Phase 4)
     */
    async getMealHistory(userId, limit = 50) {
        const response = await fetch(`${API_BASE_URL}/meals?userId=${userId}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Get meal history failed: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Delete meal analysis
     * T081: Delete meal (User Story 3, Phase 5)
     */
    async deleteMeal(mealId) {
        const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Delete meal failed: ${response.status}`);
        }
    }
    /**
     * Update meal with user corrections
     * T055: Update meal corrections (User Story 2, Phase 4)
     */
    async updateMeal(mealId, corrections) {
        const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ corrections }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Update meal failed: ${response.status}`);
        }
        return response.json();
    }
}
export const apiClient = new ApiClient();
