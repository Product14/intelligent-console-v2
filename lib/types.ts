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
}
