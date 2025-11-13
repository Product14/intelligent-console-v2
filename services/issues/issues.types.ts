// Types for Issues API Service

export interface CallData {
  callId: string
  callDetails: {
    agentInfo?: {
      agentName: string
      agentType: string
    }
    callType: string
    name: string | null
    email: string | null
    mobile: string
    recordingUrl?: string
    transcript?: string
    startedAt?: string
    endedAt?: string
    messages?: Array<{
      role: string
      message: string
      timestamp?: string | number
      secondsFromStart?: number
      time?: number
      startTime?: number
      issueCount?: number
    }>
  }
  createdAt: string
  note: string
  report: {
    title: string
    actionItems: string[]
    overview: {
      overall: {
        customerIntent: string
        sentiment: string
        aiResponseQuality: {
          score: string
        }
      }
    }
    sales: {
      vehicleRequested: Array<{
        vehicleName: string
      }>
    }
  }
  callDuration: number
  aiResponseQualityScore: number
}

