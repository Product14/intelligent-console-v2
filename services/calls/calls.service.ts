import { apiClient } from '../api/client'
import type {
  GetCallsParams,
  CallApiResponse,
  CallIssuesResponse,
  MarkIssueRequest,
  MarkIssueResponse,
  DeleteIssueRequest,
  DeleteIssueResponse,
  AssignQCRequest,
  AssignQCResponse,
  QCStatsResponse,
  TransformedCall,
  ApiCall,
} from './calls.types'

export class CallsService {
  /**
   * Fetch calls with filters
   */
  static async getCalls(params: GetCallsParams, signal?: AbortSignal): Promise<CallApiResponse> {
    const searchParams = new URLSearchParams({
      enterpriseId: params.enterpriseId,
      teamId: params.teamId,
      limit: (params.limit || 10).toString(),
      page: (params.page || 1).toString(),
    })
    
    if (params.qcStatus) searchParams.append('qcStatus', params.qcStatus)
    if (params.agentName) searchParams.append('agentName', params.agentName)
    if (params.agentType && params.agentType !== 'all') {
      searchParams.append('agentType', params.agentType)
    }
    if (params.startDate) searchParams.append('startDate', params.startDate)
    if (params.endDate) searchParams.append('endDate', params.endDate)
    if (params.callType) searchParams.append('callType', params.callType)
    if (params.callId) searchParams.append('callId', params.callId)
    
    return apiClient.get<CallApiResponse>(
      `/conversation/converse-qc/calls?${searchParams.toString()}`,
      signal
    )
  }

  /**
   * Fetch call issues
   */
  static async getCallIssues(callId: string): Promise<CallIssuesResponse> {
    return apiClient.get<CallIssuesResponse>(
      `/conversation/converse-qc/issues?callId=${callId}`
    )
  }

  /**
   * Mark call issues (add/update/delete)
   */
  static async markCallIssues(request: MarkIssueRequest): Promise<MarkIssueResponse> {
    return apiClient.post<MarkIssueResponse>(
      '/conversation/converse-qc/issues',
      request
    )
  }

  /**
   * Delete a specific issue from a call
   */
  static async deleteCallIssue(request: DeleteIssueRequest): Promise<DeleteIssueResponse> {
    return apiClient.delete<DeleteIssueResponse>(
      '/conversation/converse-qc/issues',
      request
    )
  }

  /**
   * Assign QC status to a call
   */
  static async assignQC(request: AssignQCRequest): Promise<AssignQCResponse> {
    return apiClient.put<AssignQCResponse>(
      '/conversation/converse-qc/call',
      request
    )
  }

  /**
   * Update call QC status (simplified)
   */
  static async updateCallStatus(
    callId: string,
    qcStatus: string
  ): Promise<{ success: boolean }> {
    return apiClient.put('/conversation/converse-qc/call', {
      callId,
      qcStatus,
    })
  }

  /**
   * Get QC stats for enterprise and team
   */
  static async getQCStats(
    enterpriseId: string,
    teamId: string
  ): Promise<QCStatsResponse> {
    return apiClient.get<QCStatsResponse>(
      `/conversation/converse-qc/stats?enterpriseId=${enterpriseId}&teamId=${teamId}`
    )
  }

  /**
   * Transform API call data to UI format
   */
  static transformCallData(apiCall: ApiCall): TransformedCall {
    const formatDuration = (startTime: string, endTime: string): string => {
      const start = new Date(startTime).getTime()
      const end = new Date(endTime).getTime()
      const durationMs = end - start
      const durationSeconds = Math.floor(durationMs / 1000)
      const minutes = Math.floor(durationSeconds / 60)
      const seconds = durationSeconds % 60
      
      if (minutes === 0) return `${seconds}s`
      if (seconds === 0) return `${minutes}m`
      return `${minutes}m ${seconds}s`
    }

    const formatTimestamp = (dateString: string): string => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      })
    }

    const formatCustomerName = (name: string): string => {
      if (!name) return 'Unknown Customer'
      return name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }

    const getStatusFromQcStatus = (qcStatus: string): string => {
      switch (qcStatus) {
        case 'completed':
        case 'done':
          return 'Pass'
        case 'in_progress':
          return 'In Progress'
        case 'yet_to_start':
        default:
          return 'Unreviewed'
      }
    }

    const getPriorityFromAgentType = (agentType: string): string => {
      return agentType.toLowerCase() === 'sales' ? 'High' : 'Medium'
    }

    const formattedCustomerName = formatCustomerName(apiCall.customerDetails?.name || 'Unknown Customer')
    const customerInitials = formattedCustomerName !== 'Unknown Customer'
      ? formattedCustomerName.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase()
      : 'UC'

    return {
      id: apiCall.callId,
      customerName: formattedCustomerName,
      customerInitials,
      phoneNumber: apiCall.customerDetails?.mobile_number || 'No phone',
      callType: 'Outbound',
      callLength: formatDuration(apiCall.callDetails?.startedAt, apiCall.callDetails?.endedAt),
      timestamp: formatTimestamp(apiCall.createdAt),
      callPriority: getPriorityFromAgentType(apiCall.callDetails?.agentInfo?.agentType || 'Service'),
      status: getStatusFromQcStatus(apiCall.qcStatus),
      recordingUrl: undefined,
      transcript: [],
      aiScore: 85,
      sentiment: 'Neutral',
      intent: 'General Inquiry',
      actionItems: [],
      qcStatus: apiCall.qcStatus,
      qcAssignedTo: apiCall.qcAssignedTo,
      agentName: apiCall.callDetails.agentInfo.agentName,
      agentType: apiCall.callDetails.agentInfo.agentType,
      rawApiData: apiCall,
    }
  }
}

