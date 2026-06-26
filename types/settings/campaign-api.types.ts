// ─── Agent ────────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  city: string;
  languageName: string;
  totalCalls: number;
  successRate?: number;
  available: boolean;
  description?: string;
  type?: string;
  agentUseCase?: string;
  age?: number;
  isOnboarded?: boolean;
}

export interface AgentResponse {
  success: boolean;
  agents: Agent[];
  message?: string;
}

export interface RequiredKey {
  name: string;
  isActive: boolean;
}

export interface ApiCampaignType {
  name: string;
  description: string;
  isActive: boolean;
  requiredKeys: RequiredKey[];
  sampleCsv: string | null;
}

export interface ApiCampaignGroup {
  _id: string;
  campaignFor: 'Sales' | 'Service';
  campaignTypes: ApiCampaignType[];
  createdAt: string;
  isActive: boolean;
  updatedAt: string;
  __v: number;
}

export interface ApiCampaignTypesResponse {
  success: boolean;
  data: ApiCampaignGroup[];
}

export interface CampaignSubCase {
  value: string;
  label: string;
  requiredKeys?: RequiredKey[];
  sampleCsv?: string | null;
}

export interface CampaignType {
  value: string;
  label: string;
  subCases: CampaignSubCase[];
}

export interface CampaignTypesResponse {
  sales?: CampaignType;
  service?: CampaignType;
}

// ─── Campaign Detail ──────────────────────────────────────────────────────────

export interface CampaignDetail {
  _id?: string;
  campaignId?: string;
  name?: string;
  campaignType?: 'Sales' | 'Service';
  journeyName?: string;
  campaignStatus?: string;
  status?: string;
  totalCustomers?: number;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  enterpriseId?: string;
  teamId?: string;
  teamAgentMappingId?: string;
  agentId?: string;
  callLimits?: {
    dailyContactLimit?: number;
    hourlyThrottle?: number;
    maxConcurrentCalls?: number;
  };
  retryLogic?: {
    maxAttempts?: number;
    retryDelay?: number;
    smsSwitchover?: boolean;
  };
  voicemailConfig?: {
    method?: string;
    voicemailMessage?: string;
  };
  scheduledTime?: Array<{ start: string; end: string }>;
  [key: string]: any;
}

export interface CampaignDetailResponse {
  success?: boolean;
  campaign?: CampaignDetail;
  message?: string;
}

// ─── Leads / CRM ──────────────────────────────────────────────────────────────

export interface CampaignLeadsCountResponse {
  success: boolean;
  count: number;
  message?: string;
}

export interface LeadsFilterOptions {
  leadAgeDays?: {
    min: number;
    max: number;
  };
  lastContactDays?: {
    min: number;
    max: number;
  };
  noAppointmentBookedDays?: {
    min: number;
    max: number;
  };
  externalType?: string[];
  source?: string[];
  department?: 'sales' | 'service';
  /** When true, include leads with callConsent=false (server may still flag them). */
  bypassConsent?: boolean;
  bypassConflictingLeads?: boolean;
  /** Maximum number of leads to pull from the CRM pool. null = no cap. */
  maxPoolSize?: number | null;
}

export interface LeadFilterOptionItem {
  external_type: string;
  source: string[];
}

export type LeadFilterOptionsResponse = LeadFilterOptionItem[];

export interface CampaignLeadsFilterDataResponse {
  success: boolean;
  count: number;
  totalCount?: number;
  message?: string;
  /** Pass to campaign create instead of sending `customers` (CRM flow). */
  requestId?: string;
  /**
   * Counts removed per flag reason (e.g. DUPLICATE) from campaign-leads-data.
   * Pass to preview chips; empty object `{}` means none removed for tracked reasons.
   */
  totalCustomerRemovedDueToFlagging?: Record<string, number>;
  /**
   * CRM leads from campaign-leads-data JSON (same row shape as file-upload / mapping).
   */
  customersFromApi?: ParsedCRMCustomer[];
}

export interface CampaignLeadsCustomerApi {
  name: string;
  contactPhoneNumber: string;
  emails: string;
  flagged?: boolean;
  flagReason?: string | null;
}

export interface ParsedCRMCustomer {
  [key: string]: string | number | boolean | null;
}

export interface DownloadCSVResponse {
  success: boolean;
  data: ParsedCRMCustomer[];
  columns: string[];
  message?: string;
}

// ─── Campaign List ────────────────────────────────────────────────────────────

export interface CampaignListItem {
  campaignId: string;
  name: string;
  campaignType: string;
  journeyName?: string;
  status?: string;
  campaignStatus?: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  totalCallPlaced?: number;
  answerRate?: number;
  appointmentScheduled?: number;
  completedAt?: string;
}

export interface CampaignListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CampaignListQueryParams {
  enterpriseId: string;
  teamId: string;
  page?: number;
  limit?: number;
  campaignType?: 'sales' | 'service';
  status?: string;
  search?: string;
  sortCreatedAt?: 'asc' | 'desc';
}

export interface CampaignListResponse {
  success: boolean;
  campaigns: CampaignListItem[];
  message?: string;
  pagination?: CampaignListPagination;
}

// ─── Campaign Agents ──────────────────────────────────────────────────────────

export interface CampaignAgent {
  id: string;
  enterpriseId: string;
  teamId: string;
  agentId: string;
  agentTypeId: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'Sales' | 'Service';
  agentCallType: 'outbound' | 'inbound';
  agentUseCase: string;
  colorTheme?: string;
  available: boolean;
  order?: number;
  squadId?: string;
  faqs?: any[];
  totalCalls?: number;
  lastCallDate?: string;
  age?: number | string;
  city?: string;
  languageName?: string;
  isOnboarded?: boolean;
  step?: string[];
  subStep?: string[];
}

export interface FetchAgentsParams {
  enterpriseId: string;
  teamId: string;
  agentType: 'Sales' | 'Service';
  agentCallType?: 'outbound' | 'inbound';
}

export interface FetchAgentsResponse {
  success: boolean;
  agents: CampaignAgent[];
  message?: string;
}

// ─── Leads Data ───────────────────────────────────────────────────────────────

export interface CsvDownloadInfo {
  downloadUrl?: string;
  fileName?: string;
}

export interface CampaignLeadsDataResponse {
  success: boolean;
  count: number;
  csv?: CsvDownloadInfo;
  message?: string;
}

export interface CampaignLeadsDateRange {
  startDate: string;
  endDate: string;
}

export interface KeyMappingResponse {
  [apiField: string]: string;
}

export interface ProcessKeyMappingResult {
  mapping: Record<string, string>;
}

// ─── Create Campaign ──────────────────────────────────────────────────────────

export interface CreateCampaignPayload {
  isCreated?: boolean;
  name: string;
  campaignType: 'Sales' | 'Service';
  journeyName: string;
  teamAgentMappingId: string;
  enterpriseId: string;
  teamId: string;
  requestId?: string;
  customers?: Array<{
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    vintage?: string;
    vin?: string;
    [key: string]: any;
  }>;
  communicationChannel?: string;
  complianceSettings?: string[];
  callLimits: {
    dailyContactLimit: number;
    hourlyThrottle: number;
    maxConcurrentCalls: number;
  };
  retryLogic: {
    maxAttempts: number;
    retryDelay: number;
    smsSwitchover: boolean;
  };
  handoffSettings?: {
    targerType?: string;
    targetPhone?: string[];
  };
  voicemailConfig?: {
    method: 'leave_message' | 'hang_up' | 'transfer' | 'sms_fallback';
    voicemailMessage?: string;
  };
  escalationTriggers?: string[];
  startDate: string;
  endDate: string;
  importSource?: string;
  s3Path?: string;
  isRecurring?: boolean;
  recurringConfig?: {
    frequency: 'instant' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
    enrolledMaxPoolSize: number;
  };
  leadsFilterOptions?: {
    leadAgeDays?: {
      min: number;
      max: number;
    };
    lastContactDays?: {
      min: number;
      max: number;
    };
    noAppointmentBookedDays?: {
      min: number;
      max: number;
    };
    externalType?: string[];
    source?: string[];
    department?: 'sales' | 'service';
    /** When true, include leads with callConsent=false (server may still flag them). */
    bypassConsent?: boolean;
    bypassConflictingLeads?: boolean;
  };
  scheduledTime?: Array<{
    start: string;
    end: string;
  }>;
  campaignOffers?: Array<{
    priority: number;
    offer: string;
  }>;
  lenderName?: string;
  approvalAmount?: number;
  expirationDate?: string;
  expirationDays?: number;
  dealType?: string;
  workflowTemplateId?: string;
}

export interface CreateCampaignResponse {
  success: boolean;
  campaignId?: string;
  message?: string;
  data?: {
    _id?: string;
    id?: string;
    campaignId?: string;
    [key: string]: any;
  };
  error?: string;
}

// ─── Deployed Agents ──────────────────────────────────────────────────────────

export interface DeployedAgent {
  id?: string;
  agentId?: string;
  name: string;
  agentName?: string;
  type?: 'Sales' | 'Service';
  agentType?: string;
  imageUrl?: string;
  description?: string;
  available?: boolean;
  totalCalls?: number;
  agentUseCase?: string;
  agentCallType?: 'inbound' | 'outbound';
  enterpriseId?: string;
  teamId?: string;
  [key: string]: any;
}

export interface FetchDeployedAgentsResponse {
  success: boolean;
  agents: DeployedAgent[];
  message?: string;
}

// ─── Leads Export ─────────────────────────────────────────────────────────────

export interface CampaignLeadsExportItem {
  customerName: string;
  connectionStatus: string;
  statusUpdatedAt: string;
  duration: string;
  outcome: string;
  agentName: string;
  aiQuality: string;
  retryCount: number;
  vehicleName: string;
  vin: string;
  isCallback: boolean;
}

export interface CampaignLeadsExportResponse {
  success: boolean;
  campaignId: string;
  total: number;
  data: CampaignLeadsExportItem[];
  message?: string;
}

// ─── Campaign Outcomes ────────────────────────────────────────────────────────

export interface CampaignOutcomeItem {
  count: number;
  outcome: string;
}

export interface CampaignOutcomesApiResponse {
  success: boolean;
  campaignId: string;
  outcomes: CampaignOutcomeItem[];
}

// ─── Campaign Analytics ───────────────────────────────────────────────────────

export interface CampaignAnalyticsSchedule {
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export interface CampaignAnalyticsOverview {
  totalCallsInitiated: number;
  totalVoicemailCount: number;
  totalAppointments: number;
  totalCallsFailed: number;
  avgCallDuration: string;
  totalCallsNotPicked: number;
  totalCallsOptedOut: number;
}

export interface PerformanceByTime {
  hour: string;
  totalCalls: number;
  successfulCalls: number;
  successRate: number;
}

export interface CampaignAnalyticsData {
  campaignId: string;
  campaignName: string;
  campaignType: 'Sales' | 'Service';
  journeyName: string;
  campaignStatus: string;
  schedule: CampaignAnalyticsSchedule;
  createdAt: string;
  agentName: string;
  agentImageUrl: string;
  enterpriseId: string;
  teamId: string;
  totalLeads: number;
  totalLeadsContacted: number;
  totalLeadsAttempted: number;
  overview: CampaignAnalyticsOverview;
  performanceByTime: PerformanceByTime[];
}

export interface CampaignAnalyticsResponse {
  success: boolean;
  data?: CampaignAnalyticsData;
  message?: string;
}

// ─── Campaign execution analytics ────────────────────────────────────────────
// GET /conversation/campaign/campaign-analytics/:campaignId
// Same shape on `call`, `sms`, and `common` (some fields channel-specific).

/** Per-channel execution metrics (call / sms / common rollup). */
export interface CampaignExecutionChannelAnalytics {
  appointmentBooked?: number;
  /** Subset reached / “contacted” — funnel stage after enrolled when API sends it. */
  totalLeadsContacted?: number;
  avgCallDuration?: number;
  avgMessageTurnRate?: number;
  /** 0–1 fraction or 0–100 percentage — normalize in UI */
  connectRate?: number;
  engaged?: number;
  exitedLeads?: number;
  /** Fraction or rate — normalize in UI */
  overall?: number;
  /** Label → count */
  outcomeDistribution?: Record<string, number>;
  /** Aggregate “couldn’t reach” counter when channel breakdown unavailable */
  noInteraction?: number;
  total?: number;
  totalEnrolled?: number;
  totalFailedCalls?: number;
  totalFailedSms?: number;
  /** Inbound callbacks received (call channel). */
  totalInboundCallbacks?: number;
  totalOptedOut?: number;
  qualifiedLeads?: number;
  /** Present on `common` only */
  bestChannelToReach?: string;
}

/**
 * Root JSON body — `{ call, sms, common }`.
 * UI funnel should use **`common`** for enrolled (`totalEnrolled`), optional contacted (`totalLeadsContacted`),
 * warm leads (`qualifiedLeads`), booked (`appointmentBooked`), rates, outcomes, `bestChannelToReach`.
 */
export interface CampaignExecutionAnalyticsPayload {
  call: CampaignExecutionChannelAnalytics;
  common: CampaignExecutionChannelAnalytics;
  sms: CampaignExecutionChannelAnalytics;
}

export interface CampaignExecutionAnalyticsResponse {
  data?: CampaignExecutionAnalyticsPayload;
  message?: string;
  success: boolean;
}

// ─── Campaign Status ──────────────────────────────────────────────────────────

export interface CampaignStatusTask {
  outboundTaskId: string;
  status: string;
  connectionStatus: string;
  statusUpdatedAt: string;
  leadId: string;
  leadName: string;
  phoneNumber: string;
  email: string;
  vehicleName: string;
  vehicleIdentificationNumber: unknown;
  serviceName: string;
  isCallback: boolean;
  errorReason?: string;
  /** Present on completed / in-progress call rows */
  callId?: string;
  duration?: string;
  outcome?: string[];
  retryCount?: number;
  nextVisibleAt?: string;
  aiQuality?: string;
  followUpRequested?: boolean;
  queryResolved?: boolean;
  appointmentScheduled?: boolean;
  customerSentimentScore?: number;
  actionItems?: string[];
  callRecordingUrl?: string;
  transcriptMessages?: unknown[];
  isOptedOut?: boolean;
  optedOut?: boolean;
}

export interface CampaignStatusPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CampaignStatusResponse {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  campaignUseCase: string;
  campaignStatus: string;
  schedule: { startDate: string; endDate: string };
  createdAt: string;
  agentName: string;
  agentImageUrl: string;
  enterpriseId: string;
  teamId: string;
  totalLeads: number;
  totalLeadsContacted: number;
  totalLeadsAttempted: number;
  totalCustomers: number;
  totalCustomersLeadCreated: number;
  totalCustomersLeadFailed: number;
  campaignCustomerCreationStatus?: string;
  totalResolvedCustomers?: number;
  /** Total steps configured in the campaign workflow. */
  totalStepsInWorkflow?: number;
  poll: boolean;
  pagination: CampaignStatusPagination;
  tasks: CampaignStatusTask[];
  instanceTime?: string;
}

export interface FetchCampaignStatusParams {
  page?: number;
  limit?: number;
  search?: string;
  outcomes?: string;
  status?: string;
}

export const CAMPAIGN_STATUS_POLL_INTERVAL_MS = 5000;

export interface PollCampaignStatusOptions {
  /** Defaults to {@link CAMPAIGN_STATUS_POLL_INTERVAL_MS} (5s). */
  intervalMs?: number;
  /** Safety cap (default 720 ≈ 1h at 5s intervals). */
  maxAttempts?: number;
  signal?: AbortSignal;
  onPoll?: (response: CampaignStatusResponse, attempt: number) => void;
}

// ─── Validate Customer Data ───────────────────────────────────────────────────

/** Single row from POST /conversation/campaign/validate-customer-data */
export interface ValidatedCustomerRow {
  [key: string]: unknown;
  flagged?: boolean;
  flagReason?: string | null;
}

export interface ValidateCustomerDataResponse {
  requestId?: string;
  customers: ValidatedCustomerRow[];
  totalCustomer?: number;
  totalCustomerRemovedDueToFlagging?: Record<string, number>;
}

// ─── Workflow Templates ───────────────────────────────────────────────────────

export interface WorkflowTemplateStep {
  step: number;
  dayOffset: number;
  scheduledTime?: string;
  action: 'sms' | 'call';
  sms?: { message: string };
}

export interface WorkflowTemplate {
  _id?: string;
  workflowTemplateId: string;
  name: string;
  useCase: string;
  isDefault: boolean;
  isActive: boolean;
  steps: WorkflowTemplateStep[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type WorkflowTemplateResponse =
  | WorkflowTemplate
  | WorkflowTemplate[]
  | { data?: WorkflowTemplate | WorkflowTemplate[] };
