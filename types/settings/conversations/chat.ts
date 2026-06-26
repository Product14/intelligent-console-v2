// Chat message interface
export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'sent' | 'received';
  timestamp: string;
}

// Chat conversation interface
export interface ChatConversation {
  _id: string;
  conversationId: string;
  teamAgentMappingId: string;
  enterpriseId: string;
  teamId: string;
  type: 'chat';
  status: string;
  createdAt: string;
  updatedAt: string;
  leadId: string;
  messages: ChatMessage[];
}

// Chat API response pagination
export interface ChatPagination {
  currentPage: number;
  totalPages: number;
  totalConversations: number;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
}

// Chat API response interface
export interface ChatApiResponse {
  conversations: ChatConversation[];
  pagination: ChatPagination;
  filters: {
    leadId: string;
    type: 'chat';
  };
}
