// Campaign Types

export interface Campaign {
  campaignId: string;
  name: string;
  campaignStatus?: string;
  status?: string;
  campaignType: string;
  campaignUseCase?: string;
  totalCallPlaced?: number;
  answerRate?: number;
  appointmentScheduled?: number;
  completedAt?: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
}

// Campaign Setup Types

export interface SetupStep {
  /** Auto-assigned from the step's position in the registry array (1-based). */
  id: number;
  /** Same as id — displayed inside the sidebar circle. Auto-assigned. */
  number: number;
  /** Stable string identifier used by navigation logic instead of hardcoded numbers. */
  key: string;
  name: string;
  /** Set true for steps that can emit a sub-status message while active (e.g. file upload). */
  showSubStatus?: boolean;
}

export interface DailyTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface CsvDataInfo {
  downloadUrl?: string;
  fileName?: string;
}

/** Persisted workflow editor state (Workflow setup step) — JSON-serializable. */
export type CampaignWorkflowTouchpointType = 'sms' | 'call' | 'recap_sms';

export interface CampaignWorkflowTouchpoint {
  type: CampaignWorkflowTouchpointType;
  title: string;
  timing: string;
  body: string;
  branches?: boolean;
  segmentInfo?: string;
  tip?: string;
}

export interface CampaignWorkflowDayBlock {
  day: number;
  dayOffset?: number;
  title: string;
  subtitle: string;
  touchpoints: CampaignWorkflowTouchpoint[];
}

export interface CampaignWorkflowScheduleDay {
  day: number;
  body: string;
  sendTime: string;
}

export type CampaignWorkflowChannelMode = 'sms' | 'call' | 'both';

export interface CampaignWorkflowScripts {
  callOpener?: string;
  callFinalAttempt?: string;
  recapSms?: string;
}

export interface CampaignWorkflowConfig {
  workflowTemplateId?: string;
  days: CampaignWorkflowDayBlock[];
  schedule: CampaignWorkflowScheduleDay[];
  channelMode: CampaignWorkflowChannelMode;
  scripts: CampaignWorkflowScripts;
}

// CRM Import Configuration Types
export type CRMFilterType = 'dateRange' | 'recurringAge';

export interface CRMDateRangeConfig {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  lastContactDays: number;
  lastContactDaysEnabled: boolean;
  lastAppointmentDays: number;
  lastAppointmentDaysEnabled: boolean;
}

export interface CRMRecurringAgeConfig {
  days: number;
  daysEnabled: boolean;
  lastContactDays: number;
  lastContactDaysEnabled: boolean;
  lastAppointmentDays: number;
  lastAppointmentDaysEnabled: boolean;
}

/** Inclusive day window (0–365). `null` in `CrmDayRanges` means filter off. */
export type CrmDayRange = { from: number; to: number };

export interface CrmDayRanges {
  leadAge: CrmDayRange | null;
  lastContact: CrmDayRange | null;
  noAppointment: CrmDayRange | null;
}

export interface CRMImportConfig {
  enabled: boolean;
  crmType: string; // e.g., 'vinsolutions'
  filterType: CRMFilterType;
  dateRange: CRMDateRangeConfig;
  recurringAge: CRMRecurringAgeConfig;
  /** UI day windows; API still uses scalar `days` / `lastContactDays` / `lastAppointmentDays` (= `from`). */
  crmDayRanges?: CrmDayRanges;
  /**
   * When true, allow leads with callConsent=false to be included (server still flags them).
   * This is passed to CRM leads fetch + campaign create payload as `bypassConsent`.
   */
  bypassConsent?: boolean;
  /** Selected lead types (externalType) sent in leadsFilterOptions */
  leadTypes?: string[];
  /** Selected lead sources sent in leadsFilterOptions */
  leadSources?: string[];
  /** When true, do not send source filter (all sources included) */
  allSourceSelected?: boolean;
  /** CRM UI: selected source strings (subset of API sources for selected lead types). */
  sourceTypes?: string[];
  /** CRM UI: selected provider names merged into `source` with `sourceTypes` / `leadSources`. */
  leadProviders?: string[];
  /**
   * When not `false`, exclude leads that appear in other active campaigns (default on).
   * Sent in `leadsFilterOptions` for CRM preview + launch.
   */
  excludeConflictingLeads?: boolean;
}

/** One CRM import time-window change (toggle a window or edit from/to days). */
export type CrmDayRangesUpdate =
  | {
      action: 'toggleWindow';
      windowKey: keyof CrmDayRanges;
      range: CrmDayRange | null;
    }
  | {
      action: 'changeBound';
      windowKey: keyof CrmDayRanges;
      bound: 'from' | 'to';
      value: number;
    };

export type CrmDayRangesUpdateResult =
  | {
      ok: true;
      crmImportConfig: CRMImportConfig;
      patchLeadAgeRangeError?: boolean;
    }
  | { ok: false };

export const INITIAL_CRM_IMPORT_CONFIG: CRMImportConfig = {
  enabled: false,
  crmType: '',
  filterType: 'dateRange',
  dateRange: {
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    lastContactDays: 0,
    lastContactDaysEnabled: false,
    lastAppointmentDays: 0,
    lastAppointmentDaysEnabled: false,
  },
  recurringAge: {
    days: 0,
    daysEnabled: true,
    lastContactDays: 0,
    lastContactDaysEnabled: false,
    lastAppointmentDays: 0,
    lastAppointmentDaysEnabled: false,
  },
  bypassConsent: false,
  excludeConflictingLeads: true,
};

export interface CampaignData {
  campaignName: string;
  useCase: string;
  subUseCase: string;
  fileName: string;
  totalRecords: number;
  consentedRecords: number;
  runForDays: number;
  runForDaysEnabled: boolean;
  csvData?: CsvDataInfo;
  schedule: 'now' | 'scheduled';
  scheduledDate: string;
  scheduledEndDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
  callWindowStart: string;
  callWindowEnd: string;
  dailyTimeSlots: DailyTimeSlot[];
  maxRetryAttempts: number;
  retryDelayMinutes: number;
  voicemailStrategy: 'leave_message' | 'hang_up' | 'transfer' | 'sms_fallback';
  voicemailMessage: string;
  phoneNumber?: string;
  maxCallsPerDay: number;
  maxCallsPerHour: number;
  maxConcurrentCalls: number;
  smsSwitchOnSecondAttempt: boolean;
  smsQuietStart: string;
  smsQuietEnd: string;
  // Campaign Offers (up to 10 text items)
  campaignOffers?: string[];
  // Pre-Approved Customer fields
  lenderName?: string;
  dealershipIncentives?: string;
  dealType?: 'finance' | 'lease';
  approvalAmount?: number;
  offerExpirationType?: 'fixedDate' | 'daysFromToday';
  offerExpirationDate?: string;
  offerExpirationDays?: number;
  // CRM Import Configuration
  importSource?: 'excel' | 'crm';
  crmImportConfig?: CRMImportConfig;
  validatedCustomerDataRequestId?: string;
  /** Multi-touch sequence (days, SMS/call scripts, channel mode) from the Workflow step */
  workflow?: CampaignWorkflowConfig;
  /** CRM recurring enrollment (sales — step 1 campaign mode) */
  recurringCampaignSettings?: RecurringCampaignSettings;
  /** Cadence when `recurringCampaignSettings.enableRecurringLeads` is true */
  recurringFrequency?: RecurringCampaignFrequency;
}

export type RecurringCampaignFrequency =
  | 'instant'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly';

export interface RecurringCampaignSettings {
  enableRecurringLeads: boolean;
  /** Only enroll leads not contacted within this many days (recurring mode) */
  leadAgeDays: number;
  /** Stop the campaign once cumulative delivered leads reach this number. null = no cap. */
  maxTotalLeads?: number | null;
}

export const INITIAL_CAMPAIGN_DATA: CampaignData = {
  campaignName: '',
  useCase: '',
  subUseCase: '',
  fileName: '',
  totalRecords: 0,
  consentedRecords: 0,
  runForDays: 7,
  runForDaysEnabled: false,
  csvData: undefined,
  schedule: 'now',
  scheduledDate: '',
  scheduledEndDate: '',
  dailyStartTime: '09:00',
  dailyEndTime: '17:00',
  callWindowStart: '09:00',
  callWindowEnd: '17:00',
  dailyTimeSlots: [
    { id: Date.now().toString(), startTime: '09:00', endTime: '17:00' },
  ],
  maxRetryAttempts: 1,
  retryDelayMinutes: 120,
  voicemailStrategy: 'leave_message',
  voicemailMessage: '',
  maxCallsPerDay: 110,
  maxCallsPerHour: 10,
  maxConcurrentCalls: 5,
  smsSwitchOnSecondAttempt: false,
  smsQuietStart: '09:00',
  smsQuietEnd: '21:00',
  campaignOffers: [],
  importSource: undefined,
  crmImportConfig: INITIAL_CRM_IMPORT_CONFIG,
  validatedCustomerDataRequestId: undefined,
  recurringCampaignSettings: {
    enableRecurringLeads: false,
    leadAgeDays: 10,
  },
  recurringFrequency: 'weekly',
};

export interface ValidationErrors {
  campaignName?: boolean;
  useCase?: boolean;
  subUseCase?: boolean;
  agentSelection?: boolean;
  fileUpload?: boolean;
  crmSelection?: boolean;
  crmDateRange?: boolean;
  crmFromDateRequired?: boolean;
  leadAgeDays?: boolean;
  scheduledDate?: boolean;
  scheduledEndDate?: boolean;
  dailyStartTime?: boolean;
  dailyEndTime?: boolean;
  retrySettings?: boolean;
  voicemailStrategy?: boolean;
  campaignSummary?: boolean;
  scheduleCampaign?: boolean;
  unsavedOffer?: boolean;
  timezoneError?: boolean;
  // Pre-approved customer offer fields (step 3, driven by subCase requiredKeys)
  lenderName?: boolean;
  dealershipIncentives?: boolean;
  dealType?: boolean;
  approvalAmount?: boolean;
  offerExpirationType?: boolean;
  offerExpirationDate?: boolean;
  offerExpirationDays?: boolean;
  recurringFrequency?: boolean;
  recurringCampaignLeadAge?: boolean;
  leadAgeRange?: boolean;
  lastContactRange?: boolean;
  noAppointmentRange?: boolean;
  maxTotalLeads?: boolean;
}

export interface UploadState {
  progress?: number;
  isUploading: boolean;
  uploadComplete: boolean;
  isComplete?: boolean;
  hasError: boolean;
  fileName?: string;
  totalRecords?: number;
  errors?: string[];
  missingColumns?: string[];
  uploadedData: any[];
}

// Column mapping (spreadsheet / Excel upload)

export interface ColumnFieldMapping {
  columnHeader: string;
  importAs: string;
  spyneProperty: string | null;
  mappingStatus: 'mapped' | 'unmapped' | 'ambiguous';
}

export interface MappingValidationResult {
  isValid: boolean;
  missingRequired: string[];
  unmappedCount: number;
}

// Campaign Setup Consolidated Props

export interface UploadStatusState {
  progress: number;
  isUploading: boolean;
  isComplete: boolean;
  hasError: boolean;
  parseErrors: string[];
  missingColumns: string[];
}

export interface CSVMappingState {
  showStep: boolean;
  parseResult: any | null;
  isComplete: boolean;
  keyMapping: Record<string, string> | null;
  isProcessing: boolean;
}

// CRM Configuration Types
export interface CRMDateRange {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface CRMConfig {
  id: string;
  name: string;
  type: 'vinSolutions' | 'dealerSocket' | 'cdk' | 'other';
  dateRange: CRMDateRange;
  enableRecurring: boolean;
  leadAgeDays: number;
  isActive: boolean;
}

export const CRM_OPTIONS: Array<{
  id: string;
  name: string;
  type: CRMConfig['type'];
}> = [
  { id: 'vinSolutions', name: 'VinSolutions', type: 'vinSolutions' },
  { id: 'dealerSocket', name: 'DealerSocket', type: 'dealerSocket' },
  { id: 'cdk', name: 'CDK', type: 'cdk' },
];

// Campaign Outcomes Types
export interface CampaignOutcome {
  count: number;
  outcome: string;
}

export interface CampaignOutcomesResponse {
  success: boolean;
  campaignId: string;
  outcomes: CampaignOutcome[];
}

// Campaign Detail Modal Types

export interface CampaignDetailData {
  name: string;
  type: string;
  useCase: string;
  status: string;
  totalCustomers: number;
  agentName?: string;
  agentImageUrl?: string;
  schedule: 'now' | 'scheduled';
  startDate?: string;
  endDate?: string;
  timeSlots?: Array<{ startTime: string; endTime: string }>;
  maxRetryAttempts?: number;
  retryDelayMinutes?: number;
  voicemailStrategy?: string;
  voicemailMessage?: string;
  smsSwitchOnSecondAttempt?: boolean;
  maxCallsPerDay?: number;
  maxCallsPerHour?: number;
  maxConcurrentCalls?: number;
}
