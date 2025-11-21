// Types for Calls API Service

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
  callId?: string
  durationRange?: string
  outcome?: string
}

export interface CallApiResponse {
  calls: ApiCall[]
}

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

export interface DeleteIssueRequest {
  callId: string
  id: string
}

export interface DeleteIssueResponse {
  success: boolean
  message?: string
}

export interface AssignQCRequest {
  callId: string
  qcStatus: 'yet_to_start' | 'in_progress' | 'done'
  qcAssignedTo?: QCAssignedUser | null
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

export interface QCStatusStat {
  status: 'yet_to_start' | 'in_progress' | 'done'
  count: number
}

export interface QCStatsResponse {
  stats: QCStatusStat[]
  totalCalls: number
  enterpriseId: string
  teamId: string
}

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

