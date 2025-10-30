// UI-related types only
export interface Call {
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
  transcript?: {
    items: Array<{
      t: number
      word: string
    }>
  }
  aiScore: number
  sentiment: string
  intent: string
  actionItems: string[]
  duration: number
  rawTranscript?: string
  dealershipId?: string
  agentId?: string
}

export type Severity = "LOW" | "MEDIUM" | "HIGH"

export interface QAAnnotation {
  id: string
  reviewId: string
  enumId?: string
  type: string
  description: string
  severity: string
  timestamp: number
  transcriptText: string
  createdAt: string
  callTsSec: number
  note?: string
  aiSummary?: string
}

export interface Filters {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  status: string[]
  priority: string[]
  callType: string[]
  severity: string[]
  searchQuery: string
  dealerships: string[]
  agents: string[]
  aiOnly: boolean
  enumStatus: string[]
}

export interface QAReview {
  id: string
  callId: string
  pass: boolean | null
  overallSummary: string
  createdAt: string
}

export interface QAEnum {
  id: string
  code: string
  title: string
  description: string
  severity: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Annotation {
  id: string
  reviewId: string
  enumId?: string
  type: string
  description: string
  severity: string
  timestamp: number
  transcriptText: string
  createdAt: string
  callTsSec: number
  note?: string
  aiSummary?: string
}

// Review page filter state
export interface ReviewFilterState {
  statusFilter: 'pending' | 'completed' | 'all'
  startDate: Date | undefined
  endDate: Date | undefined
  selectedAgentName: string
  selectedAgentType: string
  selectedCallType: string
}

export type ReviewFilterUpdate = Partial<ReviewFilterState>

export const DEFAULT_REVIEW_FILTERS: ReviewFilterState = {
  statusFilter: 'pending',
  startDate: undefined,
  endDate: undefined,
  selectedAgentName: 'all',
  selectedAgentType: 'all',
  selectedCallType: 'all'
}
