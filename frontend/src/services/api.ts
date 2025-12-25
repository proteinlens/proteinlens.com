import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthProvider';

export function useApiAuthHeaders() {
  const { getAccessToken } = useAuth();
  return async (): Promise<Record<string, string>> => {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
}

export const API_PATH = `${API_BASE_URL}/api`;

/**
 * Fetch with automatic token refresh and 401 retry
 * T024: Implements token refresh on 401 response
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(url, { ...options, headers });

  // On 401, attempt to refresh token and retry once
  if (response.status === 401 && token) {
    const newToken = await getToken(); // This triggers silent refresh in MSAL
    if (newToken && newToken !== token) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    }
  }

  return response;
}

/**
 * Hook for authenticated API calls with automatic retry
 */
export function useAuthenticatedFetch() {
  const { getAccessToken, logout } = useAuth();

  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const response = await fetchWithAuth(url, options, getAccessToken);
    
    // If still 401 after retry, log out
    if (response.status === 401) {
      await logout();
    }
    
    return response;
  };
}