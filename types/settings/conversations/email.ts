// Email interface
export interface Email {
  _id: string;
  senderEmail: string;
  receiverEmail: string;
  subject: string;
  body: string;
  status: string;
  createdAt: string;
}

// Email conversation interface
export interface EmailConversation {
  _id: string;
  conversationId: string;
  teamAgentMappingId: string;
  enterpriseId: string;
  teamId: string;
  type: 'email';
  status: string;
  createdAt: string;
  updatedAt: string;
  leadId: string;
  emails: Email[];
  summary: string;
}

// Email API response pagination
export interface EmailPagination {
  currentPage: number;
  totalPages: number;
  totalConversations: number;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
}

// Email API response interface
export interface EmailApiResponse {
  conversations: EmailConversation[];
  pagination: EmailPagination;
  filters: {
    leadId: string;
    type: 'email';
  };
}
