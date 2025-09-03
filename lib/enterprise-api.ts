import { ApiClient } from './api-client'

export interface Enterprise {
  enterpriseId: string
  name: string
  created_at?: string
  updated_at?: string
  // Add id as alias for enterpriseId for compatibility
  id?: string
}

export interface EnterpriseResponse {
  data: {
    enterprises: Enterprise[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNextPage: boolean
      hasPreviousPage: boolean
      limit: number
    }
  }
  error: boolean
  message: string
  code: string
  details: any
}

export interface Team {
  enterprise_id: string
  team_id: string
  team_name: string
}

export interface TeamResponse {
  data: Team[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface QueryBuilderRequest {
  table: string
  columns: string
  filter?: {
    [key: string]: any
    $and?: any[]
    $or?: any[]
  }
  joins?: any[]
  groupBy?: string[]
  having?: any
  orderBy?: string[]
  limit?: number
  offset?: number
}

export interface QueryBuilderResponse {
  data: any[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

class EnterpriseApiService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = new ApiClient('https://beta-api.spyne.xyz')
  }

  async getEnterprises(params: { 
    limit?: number
    page?: number 
  } = {}): Promise<EnterpriseResponse> {
    const searchParams = new URLSearchParams({
      limit: (params.limit || 20).toString(),
      page: (params.page || 1).toString(),
    })

    const url = `/credit/v6/conversational-ai/enterprises?${searchParams}`
    
    try {
      const response = await this.apiClient.get<EnterpriseResponse>(url)
      return response
    } catch (error) {
      throw error
    }
  }

  async getTeamsByEnterpriseId(enterpriseId: string): Promise<Team[]> {
    const queryBuilderRequest: QueryBuilderRequest = {
      table: "enterprise_team_details",
      columns: "enterprise_id, team_id, team_name",
      filter: {
        enterprise_id: enterpriseId
      },
      limit: 100, // Get all teams for the enterprise
      offset: 0
    }

    // Use the query builder API
    const response = await this.apiClient.post<QueryBuilderResponse>('/user-management/v1/query-builder/get', queryBuilderRequest)
    
    return response.data.map((row: any) => ({
      enterprise_id: row.enterprise_id,
      team_id: row.team_id,
      team_name: row.team_name
    }))
  }
}

export const enterpriseApiService = new EnterpriseApiService()
