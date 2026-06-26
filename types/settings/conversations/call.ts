// Call agent info interface
export interface CallAgentInfo {
  agentName: string;
  agentType: string;
}

// Call details interface
export interface CallDetails {
  agentInfo: CallAgentInfo;
  callType: string;
  startedAt: string;
  endedAt: string;
  recordingUrl: string;
  status: string;
  name: string;
  email: string | null;
  mobile: string;
  teamAgentMappingId: string;
  duration: number;
}

// AI Response Quality interface
export interface AIResponseQuality {
  score: string;
  metrics: {
    responseRelevanceAndClarity: string;
    followUpPrompting: string;
    engagemetRetention: string;
    toneAndProfessionalism: string;
  };
  whatAiCouldHaveDoneBetter: string[];
  whatAiDidBetter: string[];
}

// Call overview interface
export interface CallOverview {
  overall: {
    customerIntent: string;
    sentiment: string;
    sentimentScore: number;
    sentimentDropReasons: string[];
    aiResponseQuality: AIResponseQuality;
  };
  appointmentScheduled: string;
  appointmentType: string;
  callOutcome: string;
  appointmentDetails: string[];
}

// Vehicle requested interface
export interface VehicleRequested {
  vehicleName: string;
}

// Trade in mention interface
export interface TradeInMention {
  value: string;
  vehicleName: string;
}

// Sales interface
export interface CallSales {
  vehicleRequested: VehicleRequested[];
  leadQualificationScore: string;
  vehicleType: string;
  budgetRange: string;
  budgetSensitivity: string;
  competitionName: string;
  financingRequest: string;
  tradeInMention: TradeInMention;
  potentialUpsell: string;
}

// Service requested interface
export interface ServiceRequested {
  value: string;
  vehicleName: string;
}

// Service interface
export interface CallService {
  serviceRequested: ServiceRequested;
  serviceIntent: string;
  urgency: string;
  partsAvailable: string;
  pickupAndDropService: string;
  customerEscalations: string;
}

// Call report interface
export interface CallReport {
  title: string;
  summary: string[];
  actionItems: string[];
  overview: CallOverview;
  sales: CallSales;
  service: CallService;
}

// Call data interface
export interface CallData {
  callId: string;
  callDetails: CallDetails;
  report: CallReport;
  note: string;
  createdAt: string;
}

// Call conversation interface
export interface CallConversation {
  type: 'call';
  callData: CallData;
  createdAt: string;
  updatedAt: string;
  leadId: string;
  callTitle?: string | null; // New field for call title
  agentDetails?: {
    agentId: string;
    agentName: string;
    agentGender: string;
    agentDescription: string;
    imageUrl: string;
    colorTheme: string;
    audioUrl: string;
    description: string;
  }; // New field for agent details
}

// Call API response pagination
export interface CallPagination {
  currentPage: number;
  totalPages: number;
  totalConversations: number;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
}

// Call API response interface
export interface CallApiResponse {
  conversations: CallConversation[];
  pagination: CallPagination;
  filters: {
    leadId: string;
    type: 'call';
  };
}
