import { apiClient } from '../api/client'
import type {
  Enterprise,
  EnterpriseResponse,
  Team,
  TeamListResponse,
  EnterpriseDetails,
  QueryBuilderRequest,
  QueryBuilderResponse,
} from './enterprise.types'

export class EnterpriseService {
  /**
   * Get enterprises with pagination and search
   */
  static async getEnterprises(params: {
    limit?: number
    page?: number
    search?: string
  } = {}): Promise<EnterpriseResponse> {
    const searchParams = new URLSearchParams({
      limit: (params.limit || 20).toString(),
      page: (params.page || 1).toString(),
    })
    
    if (params.search && params.search.trim()) {
      searchParams.append('search', params.search.trim())
    }

    return apiClient.get<EnterpriseResponse>(
      `/conversation/enterprise-call-reports/enterprises?${searchParams}`
    )
  }

  /**
   * Get teams by enterprise ID
   */
  static async getTeamsByEnterpriseId(
    enterpriseId: string
  ): Promise<{ teams: Team[]; enterpriseDetails: EnterpriseDetails }> {
    const response = await apiClient.get<TeamListResponse>(
      `/console/v1/enterprise/get-team-list?enterpriseId=${enterpriseId}`
    )
    
    return {
      teams: response.data.teamDetails,
      enterpriseDetails: response.data.entepriseDetails,
    }
  }

  /**
   * Query builder for custom queries
   */
  static async queryBuilder(request: QueryBuilderRequest): Promise<QueryBuilderResponse> {
    return apiClient.post<QueryBuilderResponse>('/query-builder', request)
  }
}

