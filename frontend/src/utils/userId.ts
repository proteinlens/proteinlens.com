// User ID utility for anonymous users
// Generates a persistent user ID stored in localStorage
// Will be replaced with real auth when implemented

const USER_ID_KEY = 'proteinlens_user_id';

/**
 * Generate a random user ID (UUID-like)
 */
function generateUserId(): string {
  // Generate a simple UUID-like ID
  return 'user_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get the current user ID, creating one if needed
 * Persists to localStorage for consistency across sessions
 */
export function getUserId(): string {
  // Check localStorage first
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate new ID for anonymous user
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('Generated new user ID:', userId);
  }
  
  return userId;
}

/**
 * Clear the user ID (for logout or testing)
 */
export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}

/**
 * Set a specific user ID (for after auth login)
 */
export function setUserId(userId: string): void {
  localStorage.setItem(USER_ID_KEY, userId);
}
