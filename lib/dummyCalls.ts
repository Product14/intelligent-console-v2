// Dummy call data for fallback when API fails
export const dummyCalls = [
  {
    id: "call-1",
    customerName: "John Smith",
    customerInitials: "JS",
    phoneNumber: "+1-555-0123",
    callType: "Support",
    callLength: "5:23",
    timestamp: "2024-01-15T10:30:00Z",
    callPriority: "High",
    status: "In Progress",
    recordingUrl: "/audio/call-1.mp3",
    transcript: [
      {
        speaker: "Agent",
        timestamp: "00:00",
        text: "Hello, thank you for calling customer support. How can I help you today?"
      },
      {
        speaker: "Customer",
        timestamp: "00:05",
        text: "Hi, I'm having trouble logging into my account."
      },
      {
        speaker: "Agent",
        timestamp: "00:10",
        text: "I'd be happy to help you with that. Can you tell me what happens when you try to log in?"
      }
    ],
    aiScore: 85,
    sentiment: "Neutral",
    intent: "Technical Support",
    actionItems: ["Reset password", "Update contact info"]
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
    status: "Pass",
    recordingUrl: "/audio/call-2.mp3",
    transcript: [
      {
        speaker: "Agent",
        timestamp: "00:00",
        text: "Good afternoon! Thank you for your interest in our product. How can I assist you today?"
      },
      {
        speaker: "Customer",
        timestamp: "00:05",
        text: "Hi! I'm interested in learning more about your enterprise solution."
      },
      {
        speaker: "Agent",
        timestamp: "00:10",
        text: "Excellent! I'd be happy to walk you through our enterprise features and pricing."
      }
    ],
    aiScore: 92,
    sentiment: "Positive",
    intent: "Product Inquiry",
    actionItems: ["Send product demo", "Follow up next week"]
  },
  {
    id: "call-3",
    customerName: "Mike Davis",
    customerInitials: "MD",
    phoneNumber: "+1-555-0789",
    callType: "Billing",
    callLength: "8:12",
    timestamp: "2024-01-15T16:30:00Z",
    callPriority: "High",
    status: "Fail",
    recordingUrl: "/audio/call-3.mp3",
    transcript: [
      {
        speaker: "Agent",
        timestamp: "00:00",
        text: "Hello, this is billing support. How can I help you today?"
      },
      {
        speaker: "Customer",
        timestamp: "00:05",
        text: "I have a question about a charge on my bill that I don't recognize."
      },
      {
        speaker: "Agent",
        timestamp: "00:10",
        text: "I understand your concern. Let me pull up your account and take a look at that charge."
      }
    ],
    aiScore: 78,
    sentiment: "Negative",
    intent: "Billing Question",
    actionItems: ["Review charges", "Process refund if applicable"]
  }
]
