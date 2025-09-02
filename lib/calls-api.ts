import { ApiClient } from './api-client'

// Types for the new calls API response
export interface CallApiResponse {
  calls: ApiCall[]
}

export interface ApiCall {
  callId: string
  leadId: string
  enterpriseId: string
  teamId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  qcAssignedTo: string | null
  qcStatus: 'yet_to_start' | 'in_progress' | 'completed'
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
  qcAssignedTo: string | null
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
}

export interface CallIssueGroup {
  secondsFromStart: number
  transcript: string
  issues: CallIssue[]
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
  }>
  updateIssues: Array<{
    id: string
    severity: 'low' | 'medium' | 'high'
  }>
  deleteIssues: string[]
}

export interface MarkIssueResponse {
  success: boolean
  message?: string
}

export interface AssignQCRequest {
  callId: string
  qcStatus: 'yet_to_start' | 'in_progress' | 'completed'
}

export interface AssignQCResponse {
  message: string
  callId: string
  updatedFields: {
    qcStatus: string
    qcAssignedTo: string
  }
}

class CallsApiService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = new ApiClient('https://beta-api.spyne.xyz')
  }

  async getCalls(params: GetCallsParams): Promise<CallApiResponse> {
    const searchParams = new URLSearchParams({
      enterpriseId: params.enterpriseId,
      teamId: params.teamId,
      limit: (params.limit || 10).toString(),
      page: (params.page || 1).toString(),
    })

    if (params.qcStatus) {
      searchParams.append('qcStatus', params.qcStatus)
    }

    return this.apiClient.get<CallApiResponse>(`/conversation/converse-qc/calls?${searchParams}`)
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
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
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

    const formattedCustomerName = formatCustomerName(apiCall.customerDetails.name)
    const customerInitials = formattedCustomerName !== 'Unknown Customer'
      ? formattedCustomerName.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'UC'

    return {
      id: apiCall.callId,
      customerName: formattedCustomerName,
      customerInitials,
      phoneNumber: apiCall.customerDetails.mobile_number || 'No phone',
      callType: 'Outbound', // Hardcoded as requested
      callLength: formatDuration(apiCall.callDetails.startedAt, apiCall.callDetails.endedAt),
      timestamp: formatTimestamp(apiCall.createdAt),
      callPriority: getPriorityFromAgentType(apiCall.callDetails.agentInfo.agentType),
      status: getStatusFromQcStatus(apiCall.qcStatus),
      recordingUrl: undefined, // Not provided in this API
      transcript: [], // Not provided in this API
      aiScore: 85, // Default value
      sentiment: 'Neutral', // Default value
      intent: 'General Inquiry', // Default value
      actionItems: [], // Default empty array
      qcStatus: apiCall.qcStatus,
      qcAssignedTo: apiCall.qcAssignedTo,
      rawApiData: apiCall
    }
  }
}

export const callsApiService = new CallsApiService()
