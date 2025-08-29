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

export function getAuthParamsOrDefaults(): Required<AuthParams> {
  const params = getAuthParamsFromUrl()
  
  return {
    bearerToken: params.bearerToken || 'eyJhdXRoS2V5IjoiY2YwNTllY2MtYzFhNS00ZjQ3LWFmZDAtYTQ3NGVhNGY0ZDJmIiwiZGV2aWNlSWQiOiI3NjNmMWEzNWVhYWRiMWFiMDUyOTI5YjRiNjU1MDFmYyIsImVudGVycHJpc2VfaWQiOiJUYUQxVkMxS28ifQ==',
    enterpriseId: params.enterpriseId || 'e2da4572c',
    teamId: params.teamId || 'bc006ff86d',
  }
}
