// Last interaction interface

export interface CallInteractionContent {
  callDuration: string;
  agentName: string;
  imageUrl: string;
}

export interface LastInteraction {
  type: 'call' | 'chat' | 'email';
  timestamp: string; // ISO date string
  content: string | CallInteractionContent;
  role: 'system' | 'user' | 'agent' | 'dealer' | 'assistant';
  status: 'completed' | 'received' | 'sent' | 'missed';
}

// Unread counts interface
export interface UnreadCounts {
  totalUnread: number;
  chatUnread: number;
  callUnread: number;
  emailUnread: number;
}

// Main Lead interface
export interface Lead {
  _id: string;
  lastInteractionTime: string; // ISO date string
  lastInteraction: LastInteraction;
  lead_id: string;
  customer_name: string;
  email_id: string | null; // Can be empty string or null
  mobile_number: string;
  stage: string; // e.g., "NEW_LEAD"
  source: string; // e.g., "Conversational_AI"
  lead_type: string; // e.g., "HOT"
  createdAt: string; // ISO date string
  unreadCounts?: UnreadCounts; // Optional for backward compatibility
}

export interface LeadsApiResponse {
  leads: Lead[];
  pagination: LeadsPagination;
}

export interface LeadsPagination {
  currentPage: number;
  totalPages: number;
  totalLeads: number;
  totalCustomers?: number; // Add support for customer pagination
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  unreadCount?: number;
}
