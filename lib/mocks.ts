import type { Call, QAEnum, Annotation } from "./types"

// Mock data for development
export const MOCKS = {
  calls: [
    {
      id: "call-1",
      customerName: "John Smith",
      customerInitials: "JS",
      phoneNumber: "+1-555-0123",
      callType: "Support",
      callLength: "5:23",
      timestamp: "2024-01-15T10:30:00Z",
      callPriority: "High",
      status: "Under Review",
      recordingUrl: "/audio/call-1.mp3",
      transcript: {
        items: [
          { t: 0, word: "Hello" },
          { t: 1000, word: "this" },
          { t: 2000, word: "is" },
          { t: 3000, word: "John" },
          { t: 4000, word: "Smith" }
        ]
      },
      aiScore: 85,
      sentiment: "Neutral",
      intent: "Technical Support",
      actionItems: ["Reset password", "Update contact info"],
      duration: 323,
      rawTranscript: "Hello this is John Smith calling about my account...",
      dealershipId: "dealership-1",
      agentId: "agent-1"
    },
    {
      id: "call-2",
      customerName: "Sarah Johnson",
      customerInitials: "SJ",
      phoneNumber: "+1-555-0456",
      callType: "Sales",
      callLength: "12:45",
      timestamp: "2024-01-15T14:15:00Z",
      callPriority: "Medium",
      status: "Completed",
      recordingUrl: "/audio/call-2.mp3",
      transcript: {
        items: [
          { t: 0, word: "Hi" },
          { t: 500, word: "I'm" },
          { t: 1000, word: "interested" },
          { t: 1500, word: "in" },
          { t: 2000, word: "your" },
          { t: 2500, word: "product" }
        ]
      },
      aiScore: 92,
      sentiment: "Positive",
      intent: "Product Inquiry",
      actionItems: ["Send product demo", "Follow up next week"],
      duration: 765,
      rawTranscript: "Hi I'm interested in your product and would like to learn more...",
      dealershipId: "dealership-1",
      agentId: "agent-2"
    }
  ] as Call[],
  
  enums: [
    {
      id: "enum-1",
      code: "TECH_ISSUE",
      title: "Technical Issue",
      description: "Customer experiencing technical problems",
      severity: "HIGH",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "enum-2",
      code: "BILLING_QUERY",
      title: "Billing Query",
      description: "Questions about billing or charges",
      severity: "MEDIUM",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "enum-3",
      code: "FEATURE_REQUEST",
      title: "Feature Request",
      description: "Customer requesting new features",
      severity: "LOW",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ] as QAEnum[],
  
  annotations: [
    {
      id: "ann-1",
      reviewId: "review-1",
      enumId: "enum-1",
      type: "Issue",
      description: "Customer unable to access account",
      severity: "HIGH",
      timestamp: 15000,
      transcriptText: "I can't seem to log into my account",
      createdAt: "2024-01-15T10:35:00Z"
    }
  ] as Annotation[],
  
  reviews: [
    {
      id: "review-1",
      callId: "call-1",
      pass: true,
      overallSummary: "Customer issue resolved successfully",
      createdAt: "2024-01-15T10:35:00Z"
    },
    {
      id: "review-2",
      callId: "call-2",
      pass: false,
      overallSummary: "Several quality issues identified",
      createdAt: "2024-01-15T14:20:00Z"
    }
  ],
  
  agents: [
    {
      id: "agent-1",
      name: "AI Assistant",
      type: "AI",
      dealershipId: "dealership-1"
    },
    {
      id: "agent-2",
      name: "John Smith",
      type: "Human",
      dealershipId: "dealership-1"
    }
  ],
  
  dealerships: [
    {
      id: "dealership-1",
      name: "Main Branch"
    }
  ]
}

// Utility functions
export function formatTimestamp(timestamp: number): string {
  const minutes = Math.floor(timestamp / 60000)
  const seconds = Math.floor((timestamp % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case "HIGH":
      return "destructive"
    case "MEDIUM":
      return "default"
    case "LOW":
      return "secondary"
    default:
      return "default"
  }
}

export function getSeverityWeight(severity: string): number {
  switch (severity.toUpperCase()) {
    case "HIGH":
      return 3
    case "MEDIUM":
      return 2
    case "LOW":
      return 1
    default:
      return 0
  }
}

export function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
