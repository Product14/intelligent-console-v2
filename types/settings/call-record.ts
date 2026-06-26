export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface CallRecord {
  call_id: string;
  /** Unified-conversations customer id (e.g. cust_xxx) for fetching thread. */
  customer_id?: string;
  domain?: string;
  callType?: string;
  ai_score?: number;
  summary?: string;
  title?: string;
  transcript?: string | TranscriptEntry[];
  report?: any;
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    trim?: string;
    delivery_type?: string;
  };
  tags?: string[];
  ended_at?: string;
  metrics?: {
    duration_sec?: number;
  };
  callStatus?: string;
  endedReason?: string;
  campaign_id?: string;
  callre?: string;
  recordingUrl?: string;
  primary_intent?: string;
  customer_name?: string;
  agent_name?: string;
  phoneNumber?: string;
  createdAt?: string;
  outcome?: string;
  leadId?: string;
}

// Call Report Data interfaces
export interface CallReportData {
  callId: string;
  callDetails: {
    agentInfo: {
      agentName: string;
      agentType: string;
    };
    callType: string;
    /** ISO timestamp from end-call report (VAPI / telephony). */
    startedAt?: string;
    endedAt?: string;
    recordingUrl: string;
    analysis: {
      summary: string;
    };
    messages: Array<{
      role: string;
      message: string;
      secondsFromStart: number;
    }>;
    name: string;
    email: string | null;
    mobile: string;
    callStatus: string;
  };
  createdAt: string;
  callDuration: number;
  report: {
    title: string;
    summary: string[];
    actionItems: string[];
    queryResolved: string;
    Outcome: string;
    overview: {
      overall: {
        customerIntent: string;
        sentiment: string;
        sentimentScore: number;
        aiResponseQuality: {
          score: string;
          metrics: {
            responseRelevanceAndClarity: string;
            followUpPrompting: string;
            engagemetRetention: string;
            toneAndProfessionalism: string;
          };
          whatAiDidBetter: string[];
          whatAiCouldHaveDoneBetter: string[];
        };
      };
      appointmentScheduled: string;
      appointmentType: string;
      appointmentDetails: string[];
    };
    topics: Record<string, string>;
  };
  aiResponseQualityScore: number;
  leadDetails?: {
    customer_name: string;
    mobile_number: string;
    lead_type: string;
    stage: string;
  };
}

// API Response & Request Interfaces

export interface SentimentAnalysis {
  label: string;
  value: number;
}

export interface SentimentBreakdown {
  happy: number;
  sad: number;
  angry: number;
  neutral: number;
}

export interface AgentTypeCounts {
  Sales: number;
  Service: number;
  Receptionist: number;
}

export interface CallLogsAnalytics {
  totalCalls: number;
  appointmentCount: number;
  sentimentBreakdown: SentimentBreakdown;
  avgAiScore: number;
  sentimentAnalysis: SentimentAnalysis[];
  agentTypeCounts: AgentTypeCounts;
  totalSalesCalls: number;
  totalServiceCalls: number;
  totalReceptionistCalls: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface CallLogsApiResponse {
  calls: CallLogsCall[];
  pagination: Pagination;
  analytics?: CallLogsAnalytics;
}

export interface CallLogsCall {
  callId: string;
  createdAt: string;
  phoneNumber: string;
  callSummary: string;
  callTitle: string;
  callType: string;
  name: string;
  email: string;
  aiQualityScore: number;
  customerSentiment: string;
  customerIntent: string;
  assistantName: string;
  callDuration: string;
  actionItemCount: number;
  actionItems?: string[];
  queryResolved?: string;
  notes?: string;
  vehicle?: { vehicleName: string }[];
  customer_name?: string;
  agent_name?: string;
  recordingUrl?: string;
  transcript?: TranscriptEntry[];
  callStatus?: string;
  endedReason?: string;
}

export interface CallLogsApiParams {
  page?: number;
  limit?: number;
  teamId?: string;
  enterpriseId?: string;
  dateRange?: string;
  sentiment?: string;
  intent?: string;
  outcome?: string | string[];
  sortBy?: string[];
  sortOrder?: string[];
  customStartDate?: string;
  customEndDate?: string;
  queryResolved?: string | string[];
  callStatus?: string;
  agentType?: string;
  callType?: string;
  campaignId?: string | string[];
  search?: string;
  endedReason?: string;
}

export interface Campaign {
  campaignId: string;
  name: string;
  description?: string;
  status?: string;
}

export interface CampaignsApiResponse {
  success: boolean;
  campaigns: Campaign[];
}
