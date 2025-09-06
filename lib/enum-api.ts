/**
 * Enum/Issue Master API endpoints and types
 */

import { apiClient, ApiResponse } from './api-client'

// Enum category codes mapping
export const ENUM_CATEGORIES = {
  COMMUNICATION_CALL_QUALITY: 'communication_call_quality',
  FOLLOWUP_COMMUNICATION: 'followup_communication',
  PROCESS_CUSTOMER_MANAGEMENT: 'process_customer_management',
  VEHICLE_DATA_SYSTEM: 'vehicle_data_system',
} as const

// Human-readable labels for dropdown
export const ENUM_CATEGORY_LABELS = {
  [ENUM_CATEGORIES.COMMUNICATION_CALL_QUALITY]: 'Communication & Call Quality',
  [ENUM_CATEGORIES.FOLLOWUP_COMMUNICATION]: 'Follow-up & Communications', 
  [ENUM_CATEGORIES.PROCESS_CUSTOMER_MANAGEMENT]: 'Process & Customer Management',
  [ENUM_CATEGORIES.VEHICLE_DATA_SYSTEM]: 'Vehicle Data & System',
} as const

// Types
export type EnumCategoryCode = typeof ENUM_CATEGORIES[keyof typeof ENUM_CATEGORIES]

export type SeverityLevel = 'low' | 'medium' | 'high'

export interface IssueMaster {
  _id: string
  code: EnumCategoryCode
  title: string
  description: string
  defaultSeverity: SeverityLevel
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateIssueMasterRequest {
  code: EnumCategoryCode
  title: string
  description: string
  defaultSeverity: SeverityLevel
  isActive: boolean
}

export interface UpdateIssueMasterRequest {
  code?: EnumCategoryCode
  title?: string
  description?: string
  defaultSeverity?: SeverityLevel
  isActive?: boolean
}

export interface GetIssueMastersParams {
  search?: string
  code?: EnumCategoryCode
  isActive?: boolean
  page?: number
  limit?: number
}

export interface GetIssueMastersResponse {
  data: IssueMaster[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Functions
class EnumApiService {
  private readonly baseEndpoint = '/conversation/converse-qc'

  /**
   * Get all issue masters with optional filtering
   */
  async getIssueMasters(params?: GetIssueMastersParams): Promise<GetIssueMastersResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      // Add parameters as query parameters
      if (params?.search) queryParams.append('search', params.search)
      if (params?.code) queryParams.append('code', params.code)
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

      const endpoint = `${this.baseEndpoint}/issue-masters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await apiClient.get<GetIssueMastersResponse>(endpoint)
      return response
    } catch (error) {
      console.error('Failed to fetch issue masters:', error)
      throw error
    }
  }

  /**
   * Create a new issue master
   */
  async createIssueMaster(data: CreateIssueMasterRequest): Promise<IssueMaster> {
    try {
      const response = await apiClient.post<IssueMaster>(
        `${this.baseEndpoint}/issue-master`,
        data
      )
      return response
    } catch (error) {
      console.error('Failed to create issue master:', error)
      throw error
    }
  }

  /**
   * Update an existing issue master
   */
  async updateIssueMaster(id: string, data: UpdateIssueMasterRequest): Promise<IssueMaster> {
    try {
      const response = await apiClient.put<IssueMaster>(
        `${this.baseEndpoint}/issue-master/${id}`,
        data
      )
      return response
    } catch (error) {
      console.error('Failed to update issue master:', error)
      throw error
    }
  }



  /**
   * Search issue masters by title and code
   */
  async searchIssueMasters(query: string): Promise<GetIssueMastersResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('search', query)
      
      const endpoint = `${this.baseEndpoint}/issue-masters?${queryParams.toString()}`
      
      const response = await apiClient.get<GetIssueMastersResponse>(endpoint)
      return response
    } catch (error) {
      console.error('Failed to search issue masters:', error)
      throw error
    }
  }
}

// Export singleton instance
export const enumApiService = new EnumApiService()

// Utility functions
export function getEnumCategoryLabel(code: EnumCategoryCode): string {
  return ENUM_CATEGORY_LABELS[code] || code
}

export function getAllEnumCategories(): Array<{ code: EnumCategoryCode; label: string }> {
  return Object.entries(ENUM_CATEGORY_LABELS).map(([code, label]) => ({
    code: code as EnumCategoryCode,
    label,
  }))
}

export function isValidSeverityLevel(severity: string): severity is SeverityLevel {
  return ['low', 'medium', 'high'].includes(severity)
}

export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'default'
  }
}

export function getSeverityWeight(severity: SeverityLevel): number {
  switch (severity) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
    default:
      return 0
  }
}
