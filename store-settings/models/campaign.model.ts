import {
  Agent,
  CampaignLeadsFilterDataResponse,
  CampaignTypesResponse,
  LeadFilterOptionsResponse,
  ValidatedCustomerRow,
} from '@/types/settings/campaign-api.types';
import { Campaign, CampaignData, ValidationErrors } from '@/types/settings/campaigns';

import type {
  CampaignAnalyticsChannelFilter,
  CampaignAnalyticsDateRange,
} from '@/components/settings/campaign/campaign-config/constants';

/** Drives `/campaign-analytics/:id` query params (preset → dates in saga; channel verbatim). */
export interface CampaignAnalyticsFilterState {
  dateRangePreset: CampaignAnalyticsDateRange;
  channel: CampaignAnalyticsChannelFilter;
}

export const INITIAL_CAMPAIGN_ANALYTICS_FILTER: CampaignAnalyticsFilterState = {
  channel: 'all',
  dateRangePreset: 'all_time',
};

/**
 * CRM leads fetch state — managed entirely by the fetchCrmLeadsSaga.
 * The component reads this and never touches it directly.
 */
export interface CrmLeadsStatus {
  isLoading: boolean;
  response: CampaignLeadsFilterDataResponse | null;
  /** Human-readable summary of leads removed due to flagging, e.g. "3 DNC, 5 Opted-out". Null when none. */
  excludedBeforeImportLine: string | null;
}

/**
 * CRM lead-filter dropdown options (lead types + sources) — fetched once per
 * wizard session by fetchCrmLeadFilterOptionsSaga.
 */
export interface CrmLeadFilterOptions {
  isLoading: boolean;
  options: LeadFilterOptionsResponse;
}
export interface ExcelValidationStatus {
  isLoading: boolean;
  customers: ValidatedCustomerRow[] | null;
  removedDueToFlagging: Record<string, number> | null;
  error: string | null;
}
export interface LeadUploadStatus {
  isUploading: boolean;
  uploadComplete: boolean;
  hasError: boolean;
  csvMappingComplete: boolean;
  hasNoPhoneNumbers: boolean;
}

export interface CampaignSortBy {
  field: string;
  order: 'asc' | 'desc';
}

export interface CampaignListPaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}
export interface CampaignSetupShell {
  isActive: boolean;
  category: 'sales' | 'service';
  currentStep: number;
  showBackConfirmModal: boolean;
  isLaunching: boolean;
  isUploadingMappedLeadFile: boolean;
  leadUploadSubStatus: string | undefined;
  mappedLeadFileS3Path: string | undefined;
  createdCampaignId: string;
  timezoneErrorMessage: string;
  launchError: string | null;
  errors: ValidationErrors;

  /** Drives the Continue button disabled state; computed from local + Redux deps. */
  isContinueDisabled: boolean;

  // Phase 3 — form data stored per-step for cross-step access and API pipeline.
  /** Full campaign form object; each step writes its fields here. */
  campaignData: CampaignData;
  /** AI agent selected in step 1. */
  selectedAgent: Agent | null;
  /** Raw customer rows from step 2; available to step 3, step 4, and the launch saga. */
  uploadedData: any[];
  /** Column → API-field mapping produced by the CSV mapping flow (PascalCase values). */
  columnKeyMapping: Record<string, string>;

  // Step 1 — agent list (fetched by saga when category changes; never local state).
  availableAgents: Agent[];
  isLoadingAgents: boolean;
  agentError: string | null;
  leadUploadStatus: LeadUploadStatus;
  excelValidationStatus: ExcelValidationStatus;
  crmLeadsStatus: CrmLeadsStatus;
  crmLeadFilterOptions: CrmLeadFilterOptions;
  campaignTypes: CampaignTypesResponse | null;

  /**
   * Temporary one-shot API results keyed by a string identifier.
   * Sagas write here when persist=false; components read + clear on unmount.
   * Data that needs to survive the whole app session lives in named fields above.
   * Known keys include `campaignExecutionAnalytics` (execution analytics API response), etc.
   */
  tempResults: Record<
    string,
    { data: unknown; loading: boolean; error: string | null }
  >;
}

// ─── Root campaign state ──────────────────────────────────────────────────────

export interface CampaignState {
  // List domain (Phase 1)
  campaigns: Campaign[];
  activeTab: 'sales' | 'service';
  searchTerm: string;
  activeStatusFilters: string[];
  sortBy: CampaignSortBy;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  initialFetchDone: boolean;
  listPagination: CampaignListPaginationState;
  /** Set after that tab's list has been fetched; null = count hidden in tab label */
  salesCount: number | null;
  serviceCount: number | null;

  /** Shared presets for campaign execution analytics (results + optional list-header UI). */
  campaignAnalyticsFilter: CampaignAnalyticsFilterState;

  // Setup shell (Phases 2, 3 + 5)
  setup: CampaignSetupShell;
}
