/**
 * Centralized API Client for QA Dashboard
 * Handles authentication, error handling, retries, and request/response formatting
 */

// Types for API responses
export interface ApiResponse<T = any> {
  data: T
  error?: string
  message?: string
}

// Configuration
const API_CONFIG = {
  baseURL: 'https://api.spyne.ai',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
}

// Get bearer token from URL params or localStorage
function getBearerToken(): string | null {
  // First try to get from URL params
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('bearerToken') || urlParams.get('token')
    if (tokenFromUrl) {
      // Store in localStorage for future use
      localStorage.setItem('qa_dashboard_token', tokenFromUrl)
      return tokenFromUrl
    }
    
    // Fallback to localStorage
    return localStorage.getItem('qa_dashboard_token')
  }
  
  return null
}

export class ApiClient {
  private baseURL: string
  private timeout: number
  private retryAttempts: number
  private retryDelay: number

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.retryAttempts = API_CONFIG.retryAttempts
    this.retryDelay = API_CONFIG.retryDelay
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private getHeaders(): Record<string, string> {
    const token = getBearerToken()
    
    if (!token) {
      throw new Error('No authentication token found. Please provide a bearer token via URL parameter (?bearerToken=...) or ensure one is stored in localStorage.')
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Ignore JSON parsing errors for error response
      }
      
      throw new ApiError({
        message: errorMessage,
        status: response.status,
      })
    }

    try {
      return await response.json()
    } catch (error) {
      throw new ApiError({
        message: 'Failed to parse response JSON',
        status: response.status,
      })
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = this.getHeaders()

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    }

        try {
      const response = await fetch(url, config)
      return await this.handleResponse<T>(response)
    } catch (error) {
      // Retry logic for network errors
      if (attempt < this.retryAttempts && !(error instanceof ApiError)) {
        await this.delay(this.retryDelay * attempt)
        return this.makeRequest<T>(endpoint, options, attempt + 1)
      }
      
      // Re-throw the error if it's an ApiError or we've exhausted retries
      throw error instanceof ApiError ? error : new ApiError({
        message: error instanceof Error ? error.message : 'Network request failed',
        code: 'NETWORK_ERROR',
      })
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Custom error class
export class ApiError extends Error {
  status?: number
  code?: string

  constructor({ message, status, code }: { message: string; status?: number; code?: string }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}