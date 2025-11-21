/**
 * Centralized API Client for QA Dashboard
 * Handles authentication, error handling, retries, and request/response formatting
 */

export interface ApiResponse<T = any> {
  data: T
  error?: string
  message?: string
}

const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.spyne.ai',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
}

// Get bearer token from URL params or localStorage
function getBearerToken(): string | null {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('auth_key') || urlParams.get('bearerToken') || urlParams.get('token')
    if (tokenFromUrl) {
      const cleanToken = tokenFromUrl.startsWith('Bearer ') 
        ? tokenFromUrl.substring(7) 
        : tokenFromUrl
      localStorage.setItem('qa_dashboard_token', cleanToken)
      return cleanToken
    }
    return localStorage.getItem('qa_dashboard_token')
  }
  return null
}

export class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
  }

  private getHeaders(): Record<string, string> {
    const token = getBearerToken()
    if (!token) {
      throw new Error('No authentication token found')
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {}
      throw new ApiError(errorMessage, response.status)
    }
    return await response.json()
  }

  async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: signal || AbortSignal.timeout(this.timeout),
    })
    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    })
    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    })
    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    })
    return this.handleResponse<T>(response)
  }
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

