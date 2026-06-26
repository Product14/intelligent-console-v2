// Customer interface based on new API response

export interface CallInteractionContent {
  callDuration: string;
  agentName: string;
  transcript: string;
  recordingUrl: string;
  callType: string;
}

export interface LastInteraction {
  type: 'call' | 'chat' | 'email';
  timestamp: string; // ISO date string
  content: CallInteractionContent;
  role: 'system' | 'user' | 'agent' | 'dealer' | 'assistant';
  status: 'completed' | 'received' | 'sent' | 'missed';
}

// Unread counts interface
export interface UnreadCounts {
  totalUnread: number;
  chatUnread: number;
  callUnread: number;
  emailUnread: number;
  smsUnread: number;
}

// Customer interface based on new get-customers-list API
export interface Customer {
  customer_id: string;
  lastInteractionTime: string; // ISO date string
  lastInteraction: LastInteraction;
  customer_name: string;
  email_id?: string; // Optional field
  mobile_number: string;
  createdAt: string; // ISO date string
  unreadCounts: UnreadCounts;
}

export interface CustomersApiResponse {
  customers: Customer[];
  pagination: CustomersPagination;
  filters: {
    enterpriseId: string;
    teamId: string;
    unreadOnly: boolean;
  };
}

export interface CustomersPagination {
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  unreadCount: number;
}

// Agent Details interface
export interface AgentDetails {
  agentId: string;
  agentName: string;
  agentGender: string;
  agentDescription: string;
  imageUrl: string;
  colorTheme: string;
  audioUrl: string;
  description: string;
}

// Unified Conversation interface for the new customer-conversations API
export interface UnifiedConversation {
  externalCrmConversationId?: string | null;
  _id: string;
  conversationId: string;
  teamAgentMappingId: string;
  enterpriseId: string;
  teamId: string;
  type: 'call' | 'chat' | 'email' | 'sms';
  callId?: string;
  status: 'completed' | 'received' | 'sent' | 'missed';
  leadId: string;
  callData?: {
    callDuration: string;
    agentName: string;
    transcript: string;
    recordingUrl: string;
    callType: string;
  };
  summary?: string;
  isUnread: boolean;
  isAI: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  source: string;
  sourceDevice: string;
  messages: any[]; // For chat messages
  emails: any[]; // For email data
  callTitle: string | null; // New field for call title
  agentDetails: AgentDetails; // New field for agent details
  name?: string; // Customer name (for chat)
  number?: string; // Customer phone number (for chat)
  customerEmail?: string; // Customer email (for chat)
  lastReadAt?: string; // Last read timestamp
  mediaId?: string; // Media ID
  stats: {
    message_count: number;
    email_count: number;
    last_activity: string;
    duration_days: number;
  };
  // SMS-specific fields
  aiMode?: 'auto' | 'off';
  humanTakenOverAt?: string | null;
  smsMessages?: any[]; // SMS message data
  // Customer details from new API response
  customerDetails?: {
    customerId: string;
    name: string;
    email: string[];
    phone: string;
    createdAt: string;
  };
}

export interface CustomerConversationsApiResponse {
  status: boolean;
  message: string;
  data: {
    conversations: UnifiedConversation[];
    summary: {
      total_conversations: number;
      conversation_types: string[];
      conversation_statuses: string[];
    };
  };
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    customer_id: string;
    enterprise_id: string;
    team_id: string;
  };
}
