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

export interface ApiResponse {
  data: CallData[]
  analytics: {
    totalCalls: number
    appointmentCount: number
    sentimentBreakdown: {
      happy: number
      sad: number
      angry: number
      neutral: number
    }
    avgAiScore: number
    sentimentAnalysis: Array<{
      label: string
      value: number
    }>
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export async function fetchCalls(limit: number = 20): Promise<ApiResponse> {
  try {
    // Using the correct endpoint with required parameters
    const response = await fetch(`https://api.spyne.ai/conversation/vapi/end-call-reports?enterpriseId=9642744ac&teamId=55ca0edab2&limit=${limit}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching calls:', error)
    // Re-throw so UI can explicitly surface the failure
    throw error
  }
}

export async function fetchCallById(callId: string): Promise<CallData | null> {
  try {
    const response = await fetch(`https://beta-api.spyne.xyz/conversation/vapi/end-call-report-by-id?callId=${callId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching call by ID:', error)
    return null
  }
}

export function transformCallData(apiCall: CallData) {
  const formatDuration = (seconds: number) => {
    // Handle very large numbers that might be milliseconds
    let totalSeconds = seconds
    if (seconds > 86400) { // If more than 24 hours, it's likely milliseconds
      totalSeconds = Math.round(seconds / 1000)
    } else {
      totalSeconds = Math.round(seconds)
    }
    
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    
    if (mins === 0) {
      return `${secs}s`
    } else if (secs === 0) {
      return `${mins}m`
    } else {
      return `${mins}m ${secs}s`
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCustomerName = (name: string) => {
    if (!name) return 'Unknown Customer'
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const timeDisplay = formatTimestamp(apiCall.createdAt)
  
  const getStatus = (sentiment: string) => {
    if (sentiment === 'happy') return 'Pass'
    if (sentiment === 'sad' || sentiment === 'angry') return 'Fail'
    return 'Unreviewed'
  }

  // Calculate call duration from start and end times if available
  let callDuration = apiCall.callDuration
  if (apiCall.callDetails.startedAt && apiCall.callDetails.endedAt) {
    const startTime = new Date(apiCall.callDetails.startedAt).getTime()
    const endTime = new Date(apiCall.callDetails.endedAt).getTime()
    callDuration = Math.floor((endTime - startTime) / 1000)
  }

  const formattedCustomerName = formatCustomerName(apiCall.callDetails.name || '')

  return {
    id: apiCall.callId,
    customerName: formattedCustomerName,
    customerInitials: formattedCustomerName !== 'Unknown Customer'
      ? formattedCustomerName.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'UC',
    phoneNumber: apiCall.callDetails.mobile || 'No phone',
    callType: apiCall.callDetails.callType === 'inboundPhoneCall' ? 'Inbound' : 'Outbound',
    callLength: formatDuration(callDuration),
    timestamp: timeDisplay,
    callPriority: apiCall.report.overview.overall.sentiment === 'sad' ? 'High' : 'Medium',
    status: getStatus(apiCall.report.overview.overall.sentiment),
    recordingUrl: apiCall.callDetails.recordingUrl || '',
    transcript: apiCall.callDetails.transcript ? [
      { speaker: 'Agent', timestamp: '[00:00]', text: apiCall.report.title || 'Call started' },
      { speaker: formattedCustomerName, timestamp: '[00:10]', text: apiCall.note || 'Customer inquiry' }
    ] : [],
    aiScore: apiCall.aiResponseQualityScore,
    sentiment: apiCall.report.overview.overall.sentiment,
    intent: apiCall.report.overview.overall.customerIntent,
    actionItems: apiCall.report.actionItems,
    duration: callDuration,
    rawTranscript: apiCall.callDetails.transcript || ''
  }
}
