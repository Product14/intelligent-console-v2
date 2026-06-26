export interface CallSummaryReport {
  callId: string;
  callDetails: CallDetails;
  report: Report;
  note?: string;
}

export interface CallDetails {
  assistantId: string;
  callType: string;
  startedAt: string;
  endedAt: string;
  recordingUrl: string;
  status: string;
  endedReason: string;
  analysis: Analysis;
  messages: Message[];
  formattedMessages: FormattedMessage[];
  transcript: string;
  name?: string;
  email?: string;
  mobile?: string;
}

export interface Analysis {
  summary: string;
  successEvaluation: string;
}

export interface Message {
  role: string;
  time: number;
  source?: string;
  endTime: number;
  message: string;
  duration: number;
  secondsFromStart: number;
}

export interface FormattedMessage {
  content: string;
  role: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface Report {
  title: string;
  summary: string[];
  actionItems: string[];
  callRageQuit: string;
  queryResolved: string;
  complaints: string[];
  overview: Overview;
  sales: Sales;
  service: Service;
}

export interface Overview {
  overall: Overall;
  appointmentDetails: string[];
}

export interface Overall {
  customerIntent: string;
  sentiment: string;
  aiResponseQuality: AIResponseQuality;
}

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

export interface Sales {
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

export interface VehicleRequested {
  vehicleName: string;
}

export interface TradeInMention {
  value: string;
  vehicleName: string;
}

export interface Service {
  serviceRequested: ServiceRequested;
  serviceIntent: string;
  urgency: string;
  partsAvailable: string;
  pickupAndDropService: string;
  customerEscalations: string;
}

export interface ServiceRequested {
  value: string;
  vehicleName: string;
}

export enum SummaryTabs {
  OVERVIEW = 'Overview',
  TRANSCRIPTION = 'Transcription',
  ACTION_ITEMS = 'Action Items',
}
