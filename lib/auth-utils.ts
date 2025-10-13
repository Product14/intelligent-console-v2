// Utility functions for extracting authentication parameters from URL

export interface AuthParams {
  bearerToken?: string
  enterpriseId?: string
  teamId?: string
}

export function getAuthParamsFromUrl(): AuthParams {
  if (typeof window === 'undefined') {
    // Server-side rendering - return empty params
    return {}
  }

  const urlParams = new URLSearchParams(window.location.search)
  
  return {
    bearerToken: urlParams.get('auth_key') || urlParams.get('bearerToken') || undefined,
    enterpriseId: urlParams.get('enterpriseId') || undefined,
    teamId: urlParams.get('teamId') || undefined,
  }
}

export function validateAuthParams(params: AuthParams): boolean {
  return !!(params.bearerToken && params.enterpriseId && params.teamId)
}

/**
 * Get current user ID from multiple sources in priority order:
 * 1. localStorage.userDetails.userId or localStorage.userDetails.user_id
 * 2. URL query parameter 'userId'
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    // Priority 1: Check localStorage.userDetails.userId or user_id
    const userDetailsStr = localStorage.getItem('userDetails')
    if (userDetailsStr) {
      try {
        const userDetails = JSON.parse(userDetailsStr)
        // Check both userId (camelCase) and user_id (snake_case)
        if (userDetails.userId || userDetails.user_id) {
          return userDetails.userId || userDetails.user_id
        }
      } catch (e) {
        console.error('Error parsing userDetails from localStorage:', e)
      }
    }
    
    // Priority 2: Check URL query parameter 'userId'
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('userId')
    if (userIdFromUrl) {
      return userIdFromUrl
    }
    
    // No user ID found
    return null
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}