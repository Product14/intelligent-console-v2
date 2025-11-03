import { ApiClient } from './api-client'

// Types for the new calls API response
export interface CallApiResponse {
  calls: ApiCall[]
}

export interface QCAssignedUser {
  id: string
  name: string
}

export interface ApiCall {
  callId: string
  leadId: string
  enterpriseId: string
  teamId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  qcAssignedTo: QCAssignedUser | null
  qcStatus: 'yet_to_start' | 'in_progress' | 'completed' | 'done'
  callDetails: {
    agentInfo: {
      agentName: string
      agentType: string
    }
    startedAt: string
    endedAt: string
  }
  customerDetails: {
    emails: string[]
    mobile_number: string
    name: string
    customer_id: string
  }
}

export interface GetCallsParams {
  enterpriseId: string
  teamId: string
  limit?: number
  page?: number
  qcStatus?: string
  agentName?: string
  agentType?: string
  startDate?: string
  endDate?: string
  callType?: string
}

// Transform API call data to match UI expectations
export interface TransformedCall {
  id: string
  customerName: string
  customerInitials: string
  phoneNumber: string
  callType: string
  callLength: string
  timestamp: string
  callPriority: string
  status: string
  recordingUrl?: string
  transcript: Array<{
    speaker: string
    timestamp: string
    text: string
  }>
  aiScore: number
  sentiment: string
  intent: string
  actionItems: string[]
  qcStatus: string
  qcAssignedTo: QCAssignedUser | null
  agentName: string
  agentType: string
  rawApiData: ApiCall
}

// Additional API interfaces for issues
export interface CallIssue {
  _id: string
  issueId: string
  code: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  isActive: boolean
  note?: string
}

export interface CallIssueGroup {
  secondsFromStart: number
  transcript: string
  issues: CallIssue[]
  note?: string
}

export interface CallIssuesResponse {
  callId: string
  data: CallIssueGroup[]
}

// Interfaces for marking issues POST API
export interface MarkIssueRequest {
  callId: string
  secondsFromStart: number
  transcript: string
  addIssues: Array<{
    issueId: string
    severity: 'low' | 'medium' | 'high'
    note?: string
  }>
  updateIssues: Array<{
    id: string
    severity: 'low' | 'medium' | 'high'
    note?: string
  }>
  deleteIssues: string[]
}

export interface MarkIssueResponse {
  success: boolean
  message?: string
}

export interface AssignQCRequest {
  callId: string
  qcStatus: 'yet_to_start' | 'in_progress' | 'done'
  qcRating?: string
}

export interface AssignQCResponse {
  message: string
  callId: string
  updatedFields: {
    qcStatus: string
    qcAssignedTo: QCAssignedUser
  }
}

class CallsApiService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = new ApiClient('https://api.spyne.ai')
  }

  async getCalls(params: GetCallsParams, signal?: AbortSignal): Promise<CallApiResponse> {
        const searchParams = new URLSearchParams({
      enterpriseId: params.enterpriseId,
      teamId: params.teamId,
      limit: (params.limit || 10).toString(),
      page: (params.page || 1).toString(),
    })
    
    if (params.qcStatus) {
      searchParams.append('qcStatus', params.qcStatus)
    }

    if (params.agentName) {
      searchParams.append('agentName', params.agentName)
    }

    if (params.agentType && params.agentType !== 'all') {
      searchParams.append('agentType', params.agentType)
    }
    
    if (params.startDate) {
      searchParams.append('startDate', params.startDate)
    }
    
    if (params.endDate) {
      searchParams.append('endDate', params.endDate)
    }

    if (params.callType) {
      searchParams.append('callType', params.callType)
    }
    
    return this.apiClient.get<CallApiResponse>(`/conversation/converse-qc/calls?${searchParams}`, signal)
  }

  async getCallIssues(callId: string): Promise<CallIssuesResponse> {
    return this.apiClient.get<CallIssuesResponse>(`/conversation/converse-qc/issues?callId=${callId}`)
  }

  async markCallIssues(request: MarkIssueRequest): Promise<MarkIssueResponse> {
    return this.apiClient.post<MarkIssueResponse>('/conversation/converse-qc/issues', request)
  }

  /**
   * Assign QC status to a call
   */
  async assignQC(request: AssignQCRequest): Promise<AssignQCResponse> {
    try {
      const response = await this.apiClient.put<AssignQCResponse>(
        '/conversation/converse-qc/call',
        request
      )
      return response
    } catch (error) {
      console.error('Error assigning QC:', error)
      throw error
    }
  }

  /**
   * Call stats API endpoint (used for unassign action)
   */
  async callStatsAPI(enterpriseId: string, teamId: string): Promise<any> {
    try {
      const response = await this.apiClient.get<any>(
        `/conversation/converse-qc/stats?enterpriseId=${enterpriseId}&teamId=${teamId}`
      )
      return response
    } catch (error) {
      console.error('Error calling stats API:', error)
      throw error
    }
  }

  transformCallData(apiCall: ApiCall): TransformedCall {
    const formatDuration = (startTime: string, endTime: string): string => {
      const start = new Date(startTime).getTime()
      const end = new Date(endTime).getTime()
      const durationMs = end - start
      const durationSeconds = Math.floor(durationMs / 1000)
      
      const minutes = Math.floor(durationSeconds / 60)
      const seconds = durationSeconds % 60
      
      if (minutes === 0) {
        return `${seconds}s`
      } else if (seconds === 0) {
        return `${minutes}m`
      } else {
        return `${minutes}m ${seconds}s`
      }
    }

    const formatTimestamp = (dateString: string): string => {
      const date = new Date(dateString)
      // Use UTC methods to avoid timezone conversion issues
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC' // Force UTC to match API data
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
      callType: 'Outbound', // Hardcoded as requested
      callLength: formatDuration(apiCall.callDetails?.startedAt, apiCall.callDetails?.endedAt),
      timestamp: formatTimestamp(apiCall.createdAt),
      callPriority: getPriorityFromAgentType(apiCall.callDetails?.agentInfo?.agentType || 'Service'),
      status: getStatusFromQcStatus(apiCall.qcStatus),
      recordingUrl: undefined, // Not provided in this API
      transcript: [], // Not provided in this API
      aiScore: 85, // Default value
      sentiment: 'Neutral', // Default value
      intent: 'General Inquiry', // Default value
      actionItems: [], // Default empty array
      qcStatus: apiCall.qcStatus,
      qcAssignedTo: apiCall.qcAssignedTo,
      agentName: apiCall.callDetails.agentInfo.agentName,
      agentType: apiCall.callDetails.agentInfo.agentType,
      rawApiData: apiCall
    }
  }
}

export const callsApiService = new CallsApiService()

// Utility function to filter calls by date range
export function filterCallsByDateRange(calls: TransformedCall[], startDate?: Date, endDate?: Date): TransformedCall[] {
  if (!startDate && !endDate) {
    return calls
  }

  return calls.filter(call => {
    // Extract createdAt from the raw API data
    const callDate = new Date(call.rawApiData.createdAt)
    
    // Check start date
    if (startDate) {
      const startOfDay = new Date(startDate)
      startOfDay.setHours(0, 0, 0, 0)
      if (callDate < startOfDay) {
        return false
      }
    }
    
    // Check end date
    if (endDate) {
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      if (callDate > endOfDay) {
        return false
      }
    }
    
    return true
  })
}
