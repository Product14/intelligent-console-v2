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
    bearerToken: urlParams.get('bearerToken') || undefined,
    enterpriseId: urlParams.get('enterpriseId') || undefined,
    teamId: urlParams.get('teamId') || undefined,
  }
}

export function validateAuthParams(params: AuthParams): boolean {
  return !!(params.bearerToken && params.enterpriseId && params.teamId)
}