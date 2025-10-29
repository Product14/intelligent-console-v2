import { ApiClient } from './api-client'

// Dashboard API interfaces
export interface DashboardIssueStats {
  _id: string
  code: string
  title: string
  description: string
  isActive: boolean
  status: 'resolved' | 'in_dev' | 'unresolved'
  lastResolvedAt: string | null
  lastResolvedBy: string | null
  occurrence: {
    total: number
    liveCall: number
    demoCall: number
    afterLastResolved: number
    uniqueCallsCount?: number
  }
  uniqueCallsCount?: number
  severityOccurrence: {
    high: number
    medium: number
    low: number
  }
  createdAt: string
  updatedAt: string
  firstMarkDate?: string
  lastMarkDate?: string
}

export interface DashboardFilters {
  page?: number
  limit?: number
  isActive?: boolean
  status?: 'resolved' | 'in_dev' | 'unresolved'
  severity?: 'high' | 'medium' | 'low'
  code?: string
  search?: string
  startDate?: string
  endDate?: string
  callType?: string
}

export interface DashboardApiResponse {
  data: DashboardIssueStats[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: Record<string, any>
}

export class DashboardApiService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = new ApiClient()
  }

  /**
   * Get dashboard issue statistics with filtering and pagination
   */
  async getIssueStats(filters: DashboardFilters = {}): Promise<DashboardApiResponse> {
    const queryParams = new URLSearchParams()
    
    // Add filters as query parameters
    if (filters.page !== undefined) queryParams.append('page', filters.page.toString())
    if (filters.limit !== undefined) queryParams.append('limit', filters.limit.toString())
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString())
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.severity) queryParams.append('severity', filters.severity)
    if (filters.code) queryParams.append('code', filters.code)
    if (filters.search) queryParams.append('search', filters.search)
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    if (filters.callType) queryParams.append('callType', filters.callType)

    const endpoint = `/conversation/converse-qc/issues-stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    try {
      const response = await this.apiClient.get<DashboardApiResponse>(endpoint)
      return response
    } catch (error) {
      console.error('Error fetching dashboard issue stats:', error)
      throw error
    }
  }

  /**
   * Update issue status using PUT API
   */
  async updateIssueStatus(issueId: string, status: 'resolved' | 'in_dev' | 'unresolved'): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.apiClient.put<{ success: boolean; message?: string }>(
        `/conversation/converse-qc/issue-master/${issueId}`,
        { status }
      )
      return response
    } catch (error) {
      console.error('Error updating issue status:', error)
      throw error
    }
  }

  /**
   * Mark an issue as resolved
   */
  async markIssueResolved(issueId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.apiClient.post<{ success: boolean; message?: string }>(
        `/conversation/converse-qc/issues-stats/${issueId}/resolve`,
        {}
      )
      return response
    } catch (error) {
      console.error('Error marking issue as resolved:', error)
      throw error
    }
  }

  /**
   * Mark an issue as unresolved
   */
  async markIssueUnresolved(issueId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.apiClient.post<{ success: boolean; message?: string }>(
        `/conversation/converse-qc/issues-stats/${issueId}/unresolve`,
        {}
      )
      return response
    } catch (error) {
      console.error('Error marking issue as unresolved:', error)
      throw error
    }
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService()
