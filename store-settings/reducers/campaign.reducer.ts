import {
  Agent,
  CampaignLeadsFilterDataResponse,
  CampaignTypesResponse,
  LeadFilterOptionsResponse,
} from '@/types/settings/campaign-api.types';
import {
  Campaign,
  CampaignData,
  INITIAL_CAMPAIGN_DATA,
  ValidationErrors,
} from '@/types/settings/campaigns';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type {
  CampaignAnalyticsChannelFilter,
  CampaignAnalyticsDateRange,
} from '@/components/settings/campaign/campaign-config/constants';

import {
  CampaignListPaginationState,
  CampaignSetupShell,
  CampaignSortBy,
  CampaignState,
  CrmLeadFilterOptions,
  CrmLeadsStatus,
  ExcelValidationStatus,
  INITIAL_CAMPAIGN_ANALYTICS_FILTER,
  LeadUploadStatus,
} from '../models/campaign.model';

const DEFAULT_SORT: CampaignSortBy = { field: 'completedAt', order: 'desc' };

const INITIAL_LIST_PAGINATION: CampaignListPaginationState = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
};

const INITIAL_SETUP_SHELL: CampaignSetupShell = {
  // Wizard shell
  isActive: false,
  category: 'sales',
  currentStep: 1,
  showBackConfirmModal: false,
  // Launch pipeline
  isLaunching: false,
  isUploadingMappedLeadFile: false,
  leadUploadSubStatus: undefined,
  mappedLeadFileS3Path: undefined,
  createdCampaignId: '',
  timezoneErrorMessage: '',
  launchError: null,
  errors: {},
  isContinueDisabled: false,
  // Phase 3 — form data
  campaignData: INITIAL_CAMPAIGN_DATA,
  selectedAgent: null,
  uploadedData: [],
  columnKeyMapping: {},
  // Step 1 — agent list
  availableAgents: [],
  isLoadingAgents: false,
  agentError: null,
  // Lead upload status
  leadUploadStatus: {
    isUploading: false,
    uploadComplete: false,
    hasError: false,
    csvMappingComplete: true,
    hasNoPhoneNumbers: false,
  },
  // Step 2 — Excel server validation (owned by sagas)
  excelValidationStatus: {
    isLoading: false,
    customers: null,
    removedDueToFlagging: null,
    error: null,
  },
  // Step 2 — CRM domain (owned by sagas)
  crmLeadsStatus: {
    isLoading: false,
    response: null,
    excludedBeforeImportLine: null,
  },
  crmLeadFilterOptions: { isLoading: false, options: [] },
  // Campaign type definitions
  campaignTypes: null,
  // Temp results for one-shot API calls (persist=false)
  tempResults: {},
};

const initialState: CampaignState = {
  // List domain
  campaigns: [],
  activeTab: 'sales',
  searchTerm: '',
  activeStatusFilters: [],
  sortBy: DEFAULT_SORT,
  loading: true,
  loadingMore: false,
  error: null,
  initialFetchDone: false,
  listPagination: INITIAL_LIST_PAGINATION,
  salesCount: null,
  serviceCount: null,

  campaignAnalyticsFilter: { ...INITIAL_CAMPAIGN_ANALYTICS_FILTER },

  // Setup shell
  setup: INITIAL_SETUP_SHELL,
};

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    // ─── List domain ───────────────────────────────────────────────────────────

    setCampaigns: (state, action: PayloadAction<Campaign[]>) => {
      state.campaigns = action.payload;
      state.error = null;
    },

    appendCampaigns: (state, action: PayloadAction<Campaign[]>) => {
      const existingIds = new Set(state.campaigns.map((c) => c.campaignId));
      const newItems = action.payload.filter(
        (c) => !existingIds.has(c.campaignId)
      );
      state.campaigns.push(...newItems);
      state.error = null;
    },

    setCampaignListPagination: (
      state,
      action: PayloadAction<CampaignListPaginationState>
    ) => {
      state.listPagination = action.payload;
    },

    setCampaignTabCounts: (
      state,
      action: PayloadAction<{ salesCount?: number; serviceCount?: number }>
    ) => {
      if (action.payload.salesCount !== undefined) {
        state.salesCount = action.payload.salesCount;
      }
      if (action.payload.serviceCount !== undefined) {
        state.serviceCount = action.payload.serviceCount;
      }
    },

    setCampaignListLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setCampaignListLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.loadingMore = action.payload;
    },

    setCampaignListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    setInitialFetchDone: (state, action: PayloadAction<boolean>) => {
      state.initialFetchDone = action.payload;
    },

    setActiveTab: (state, action: PayloadAction<'sales' | 'service'>) => {
      state.activeTab = action.payload;
      state.searchTerm = '';
      state.activeStatusFilters = [];
      state.sortBy = DEFAULT_SORT;
      state.campaigns = [];
      state.listPagination = INITIAL_LIST_PAGINATION;
      state.initialFetchDone = false;
      state.error = null;
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    setActiveStatusFilters: (state, action: PayloadAction<string[]>) => {
      state.activeStatusFilters = action.payload;
      state.campaigns = [];
      state.listPagination = INITIAL_LIST_PAGINATION;
      state.initialFetchDone = false;
    },

    setSortBy: (state, action: PayloadAction<CampaignSortBy>) => {
      state.sortBy = action.payload;
      state.campaigns = [];
      state.listPagination = INITIAL_LIST_PAGINATION;
      state.initialFetchDone = false;
    },

    resetCampaignListFilters: (state) => {
      state.searchTerm = '';
      state.activeStatusFilters = [];
      state.sortBy = DEFAULT_SORT;
      state.campaigns = [];
      state.listPagination = INITIAL_LIST_PAGINATION;
      state.initialFetchDone = false;
    },

    setCampaignAnalyticsDateRangePreset: (
      state,
      action: PayloadAction<CampaignAnalyticsDateRange>
    ) => {
      state.campaignAnalyticsFilter.dateRangePreset = action.payload;
    },

    setCampaignAnalyticsChannelFilter: (
      state,
      action: PayloadAction<CampaignAnalyticsChannelFilter>
    ) => {
      state.campaignAnalyticsFilter.channel = action.payload;
    },

    // ─── Setup shell — wizard navigation ───────────────────────────────────────

    /** Open the wizard for the given category and reset to a clean state. */
    openSetup: (
      state,
      action: PayloadAction<{ category: 'sales' | 'service' }>
    ) => {
      state.setup = {
        ...INITIAL_SETUP_SHELL,
        isActive: true,
        category: action.payload.category,
        // Initialise campaignData.useCase to match the selected category
        campaignData: {
          ...INITIAL_CAMPAIGN_DATA,
          useCase: action.payload.category,
        },
      };
    },

    /**
     * Close the wizard and fully reset setup shell state.
     * Call this on user-initiated exit OR after a successful launch.
     */
    closeSetup: (state) => {
      state.setup = INITIAL_SETUP_SHELL;
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.setup.currentStep = action.payload;
      // Step change = fresh validation slate; errors are step-scoped.
      state.setup.errors = {};
    },

    setShowBackConfirmModal: (state, action: PayloadAction<boolean>) => {
      state.setup.showBackConfirmModal = action.payload;
    },

    /**
     * Reset wizard navigation without closing — used by "Start Fresh Campaign"
     * on the Launch Campaign success screen. Preserves agent list so it doesn't need
     * to be re-fetched for the same category.
     */
    resetSetupShell: (state) => {
      state.setup = {
        ...INITIAL_SETUP_SHELL,
        isActive: true,
        category: state.setup.category,
        campaignData: {
          ...INITIAL_CAMPAIGN_DATA,
          useCase: state.setup.category,
        },
        availableAgents: state.setup.availableAgents,
        isLoadingAgents: state.setup.isLoadingAgents,
        agentError: state.setup.agentError,
        // Preserve so they don't need to be re-fetched on "Start Fresh"
        campaignTypes: state.setup.campaignTypes,
        // Preserve CRM dropdown options (fetched once per session)
        crmLeadFilterOptions: state.setup.crmLeadFilterOptions,
      };
    },

    // ─── Setup shell — launch pipeline ─────────────────────────────────────────

    setIsLaunching: (state, action: PayloadAction<boolean>) => {
      state.setup.isLaunching = action.payload;
    },

    setIsUploadingMappedLeadFile: (state, action: PayloadAction<boolean>) => {
      state.setup.isUploadingMappedLeadFile = action.payload;
    },

    setLeadUploadSubStatus: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.setup.leadUploadSubStatus = action.payload;
    },

    setMappedLeadFileS3Path: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.setup.mappedLeadFileS3Path = action.payload;
    },

    setCreatedCampaignId: (state, action: PayloadAction<string>) => {
      state.setup.createdCampaignId = action.payload;
    },

    /** Pass a non-empty string to set the error, empty string to clear it. */
    setTimezoneError: (state, action: PayloadAction<string>) => {
      state.setup.timezoneErrorMessage = action.payload;
    },

    setLaunchError: (state, action: PayloadAction<string | null>) => {
      state.setup.launchError = action.payload;
    },

    setValidationErrors: (
      state,
      action: PayloadAction<Partial<ValidationErrors>>
    ) => {
      state.setup.errors = { ...state.setup.errors, ...action.payload };
    },

    setIsContinueDisabled: (state, action: PayloadAction<boolean>) => {
      state.setup.isContinueDisabled = action.payload;
    },

    // ─── Setup shell — Phase 3: form data ──────────────────────────────────────

    /** Replace the entire campaignData object (used for full resets). */
    setCampaignData: (state, action: PayloadAction<CampaignData>) => {
      state.setup.campaignData = action.payload;
    },

    /**
     * Merge partial fields into campaignData — mirrors the React functional
     * update pattern: setCampaignData(prev => ({ ...prev, field: value })).
     */
    patchCampaignData: (
      state,
      action: PayloadAction<Partial<CampaignData>>
    ) => {
      state.setup.campaignData = {
        ...state.setup.campaignData,
        ...action.payload,
      };
    },

    setSelectedAgent: (state, action: PayloadAction<Agent | null>) => {
      state.setup.selectedAgent = action.payload;
    },

    /** Raw customer rows uploaded in step 2; available to step 3, step 4, and sagas. */
    setUploadedData: (state, action: PayloadAction<any[]>) => {
      state.setup.uploadedData = action.payload;
    },

    /** Column → API-field key mapping produced by the CSV mapping flow. */
    setColumnKeyMapping: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.setup.columnKeyMapping = action.payload;
    },

    /**
     * Update campaign category (user selects sales/service in step 1).
     * Clears subUseCase and resets agent state — the saga re-fetches agents.
     */
    setCategory: (state, action: PayloadAction<'sales' | 'service'>) => {
      state.setup.category = action.payload;
      state.setup.campaignData.useCase = action.payload;
      state.setup.campaignData.subUseCase = '';
      state.setup.selectedAgent = null;
      state.setup.availableAgents = [];
      state.setup.agentError = null;
      if (action.payload === 'service') {
        state.setup.campaignData.recurringCampaignSettings = {
          ...state.setup.campaignData.recurringCampaignSettings,
          enableRecurringLeads: false,
        };
      }
    },

    // ─── Step 1 — agent list ────────────────────────────────────────────────────

    setAvailableAgents: (state, action: PayloadAction<Agent[]>) => {
      state.setup.availableAgents = action.payload;
    },

    setIsLoadingAgents: (state, action: PayloadAction<boolean>) => {
      state.setup.isLoadingAgents = action.payload;
    },

    setAgentError: (state, action: PayloadAction<string | null>) => {
      state.setup.agentError = action.payload;
    },

    // ─── Lead upload status + campaign types ──────────────────────────────────

    /** Written by the upload-leads step whenever upload/mapping state changes. */
    setLeadUploadStatus: (state, action: PayloadAction<LeadUploadStatus>) => {
      state.setup.leadUploadStatus = action.payload;
    },

    /** Set by saga after fetching campaign types on wizard open. */
    setCampaignTypes: (
      state,
      action: PayloadAction<CampaignTypesResponse | null>
    ) => {
      state.setup.campaignTypes = action.payload;
    },

    // ─── Excel server validation (written exclusively by sagas) ──────────────

    /** Updated by validateExcelUploadSaga: validation loading, validated customers, error. */
    setExcelValidationStatus: (
      state,
      action: PayloadAction<Partial<ExcelValidationStatus>>
    ) => {
      state.setup.excelValidationStatus = {
        ...state.setup.excelValidationStatus,
        ...action.payload,
      };
    },

    // ─── CRM domain (written exclusively by sagas) ───────────────────────────

    /** Updated by fetchCrmLeadsSaga: loading flag + raw API response. */
    setCrmLeadsStatus: (state, action: PayloadAction<CrmLeadsStatus>) => {
      state.setup.crmLeadsStatus = action.payload;
    },

    /** Updated by fetchCrmLeadFilterOptionsSaga: dropdown options for lead type/source. */
    setCrmLeadFilterOptions: (
      state,
      action: PayloadAction<CrmLeadFilterOptions>
    ) => {
      state.setup.crmLeadFilterOptions = action.payload;
    },

    /**
     * Merge partial validation errors without overwriting the whole object.
     * Used by individual steps to clear specific field errors inline.
     */
    patchValidationErrors: (
      state,
      action: PayloadAction<
        Partial<import('@/types/settings/campaigns').ValidationErrors>
      >
    ) => {
      state.setup.errors = { ...state.setup.errors, ...action.payload };
    },

    // ─── Temp results (saga-owned, non-persistent) ─────────────────────────────

    /** Mark a key as loading (clears previous data/error). */
    setSagaLoading: (state, action: PayloadAction<{ key: string }>) => {
      state.setup.tempResults[action.payload.key] = {
        data: null,
        loading: true,
        error: null,
      };
    },

    /** Store saga result for a key (e.g. `campaignExecutionAnalytics`). */
    setSagaResult: (
      state,
      action: PayloadAction<{ key: string; data: unknown }>
    ) => {
      state.setup.tempResults[action.payload.key] = {
        data: action.payload.data,
        loading: false,
        error: null,
      };
    },

    /** Clear a temp result (call on component unmount). */
    clearSagaResult: (state, action: PayloadAction<{ key: string }>) => {
      delete state.setup.tempResults[action.payload.key];
    },
  },
});

export const {
  // List
  setCampaigns,
  appendCampaigns,
  setCampaignListPagination,
  setCampaignTabCounts,
  setCampaignListLoading,
  setCampaignListLoadingMore,
  setCampaignListError,
  setInitialFetchDone,
  setActiveTab,
  setSearchTerm,
  setActiveStatusFilters,
  setSortBy,
  resetCampaignListFilters,
  setCampaignAnalyticsDateRangePreset,
  setCampaignAnalyticsChannelFilter,
  // Setup shell — wizard
  openSetup,
  closeSetup,
  setCurrentStep,
  setShowBackConfirmModal,
  resetSetupShell,
  // Setup shell — launch pipeline
  setIsLaunching,
  setIsUploadingMappedLeadFile,
  setLeadUploadSubStatus,
  setMappedLeadFileS3Path,
  setCreatedCampaignId,
  setTimezoneError,
  setLaunchError,
  setValidationErrors,
  setIsContinueDisabled,
  // Setup shell — Phase 3: form data
  setCampaignData,
  patchCampaignData,
  setSelectedAgent,
  setUploadedData,
  setColumnKeyMapping,
  setCategory,
  // Setup shell — Step 1: agent list
  setAvailableAgents,
  setIsLoadingAgents,
  setAgentError,
  patchValidationErrors,
  // Setup shell — lead upload status + campaign types
  setLeadUploadStatus,
  setCampaignTypes,
  // Setup shell — Excel server validation (saga-owned)
  setExcelValidationStatus,
  // Setup shell — CRM domain (saga-owned)
  setCrmLeadsStatus,
  setCrmLeadFilterOptions,
  // Temp results
  setSagaLoading,
  setSagaResult,
  clearSagaResult,
} = campaignSlice.actions;

export default campaignSlice.reducer;
