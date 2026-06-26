import { createAction } from '@reduxjs/toolkit';

export interface CampaignListFetchPayload {
  enterpriseId: string;
  teamId: string;
  /** Debounced search string for the list API */
  search?: string;
}

/**
 * Saga trigger — fetch campaign list (page 1, replaces list).
 */
export const fetchCampaignList = createAction(
  'campaign/fetchCampaignList',
  (payload: CampaignListFetchPayload) => ({ payload })
);

/**
 * Saga trigger — load next page and append to the list (infinite scroll).
 */
export const fetchMoreCampaignList = createAction(
  'campaign/fetchMoreCampaignList',
  (payload: CampaignListFetchPayload) => ({ payload })
);

/**
 * Saga trigger — dispatched from Step 3 "Launch".
 * All required data (campaignData, selectedAgent, category, uploadedData) is
 * read from the Redux store inside the saga — no payload needed.
 */
export const launchCampaign = createAction('campaign/launchCampaign');

/**
 * Saga trigger — dispatched when the user clicks Continue on the upload-leads step.
 * The saga reads importSource / uploadedData / fileName from the Redux store
 * and routes accordingly (CRM dedupes phone counts; Excel uploads to S3).
 */
export const proceedFromLeadUpload = createAction(
  'campaign/proceedFromLeadUpload'
);

/**
 * Saga trigger — dispatched by step-2-crm-section whenever any CRM filter
 * changes (isSelected, date range, lead types, etc.).
 * The saga reads all filter config + enterprise/team IDs from the Redux store,
 * builds the payload, validates it, and fetches CRM leads with a 500 ms debounce.
 * No payload needed — saga selects everything from state.
 */
export const fetchCrmLeads = createAction('campaign/fetchCrmLeads');

/**
 * Saga trigger — dispatched by step-2-crm-section once when CRM is first
 * selected. The saga fetches lead types + sources for the filter dropdowns
 * and caches the result in Redux (skips re-fetch if already loaded).
 * No payload needed — saga selects enterprise/team IDs from state.
 */
export const fetchCrmLeadFilterOptions = createAction(
  'campaign/fetchCrmLeadFilterOptions'
);

/**
 * Saga trigger — dispatched immediately after a successful Excel file parse
 * in step-2-excel-section. The saga reads uploadedData + fileName from the
 * Redux store, uploads to S3, calls validateCustomerData, and stores the
 * result (validated customers + requestId) in Redux.
 * No payload needed — saga selects everything from state.
 */
export const validateExcelUpload = createAction('campaign/validateExcelUpload');

/**
 * Saga trigger — dispatched when transitioning from Step 2 → Step 3
 * with an un-uploaded Excel file. The saga uploads to S3 and then
 * advances currentStep to 3.
 */
export const uploadLeadsToS3 = createAction(
  'campaign/uploadLeadsToS3',
  ({ uploadedData, fileName }: { uploadedData: any[]; fileName: string }) => ({
    payload: { uploadedData, fileName },
  })
);

// =============================================================================
// Non-setup (persist=false) sagas — results stored in tempResults
// =============================================================================

/**
 * Saga trigger — call the keys-mapping API to auto-match column headers to
 * required API field names. Result stored in tempResults['keyMapping'].
 */
export const fetchKeyMapping = createAction(
  'campaign/fetchKeyMapping',
  ({
    requiredFields,
    columnHeaders,
    authKey,
  }: {
    requiredFields: string[];
    columnHeaders: string[];
    authKey?: string;
  }) => ({
    payload: { requiredFields, columnHeaders, authKey },
  })
);

/**
 * Saga trigger — fetch campaign detail + agent info for the detail modal.
 * Result stored in tempResults['campaignDetail'].
 */
export const fetchCampaignDetail = createAction(
  'campaign/fetchCampaignDetail',
  ({ campaignId }: { campaignId: string }) => ({
    payload: { campaignId },
  })
);

/**
 * Saga trigger — fetch campaign outcome filter options for the analytics tab.
 * Result stored in tempResults['analyticsOutcomes'].
 */
export const fetchAnalyticsOutcomes = createAction(
  'campaign/fetchAnalyticsOutcomes',
  ({ campaignId }: { campaignId: string }) => ({
    payload: { campaignId },
  })
);

/**
 * Saga trigger — export campaign leads to CSV.
 * Result stored in tempResults['leadsExport'].
 */
export const fetchLeadsExport = createAction(
  'campaign/fetchLeadsExport',
  ({
    campaignId,
    status,
    outcomeFilter,
    searchTerm,
  }: {
    campaignId: string;
    status?: string;
    outcomeFilter?: string;
    searchTerm?: string;
  }) => ({
    payload: { campaignId, status, outcomeFilter, searchTerm },
  })
);

/**
 * Saga trigger — poll campaign status once; component re-dispatches on interval.
 * Result stored in tempResults['campaignStatus'].
 */
export const fetchCampaignStatusPoll = createAction(
  'campaign/fetchCampaignStatusPoll',
  ({
    campaignId,
    page,
    limit,
    search,
    outcomes,
    status,
  }: {
    campaignId: string;
    page?: number;
    limit?: number;
    search?: string;
    outcomes?: string;
    status?: string;
  }) => ({
    payload: { campaignId, page, limit, search, outcomes, status },
  })
);

/**
 * Saga trigger — fetch `/campaign-analytics/:id` execution rollup (call/sms/common).
 * Result stored in tempResults['campaignExecutionAnalytics'].
 */
export const fetchCampaignExecutionAnalytics = createAction(
  'campaign/fetchCampaignExecutionAnalytics',
  ({ campaignId }: { campaignId: string }) => ({
    payload: { campaignId },
  })
);

/**
 * Saga trigger — fetch deployed agents list for the results page.
 * Result stored in tempResults['deployedAgents'].
 */
export const fetchDeployedAgentsList = createAction(
  'campaign/fetchDeployedAgentsList',
  ({
    enterpriseId,
    teamId,
    campaignType,
  }: {
    enterpriseId: string;
    teamId: string;
    campaignType: string;
  }) => ({
    payload: { enterpriseId, teamId, campaignType },
  })
);

/**
 * Saga trigger — fetch the workflow template for the given use case.
 * Result stored in tempResults['workflowTemplate'].
 */
export const fetchWorkflowTemplate = createAction(
  'campaign/fetchWorkflowTemplate',
  ({ useCase }: { useCase: string }) => ({
    payload: { useCase },
  })
);

/**
 * Saga trigger — fetch leads data for CSV export from utils.
 * Result stored in tempResults['leadsDataCsv'].
 */
/**
 * Saga trigger — stop outreach for a lead in a campaign.
 * Result stored in tempResults['closeLeadEngagement'].
 */
export const closeLeadEngagement = createAction(
  'campaign/closeLeadEngagement',
  ({
    campaignId,
    customerIds,
  }: {
    campaignId: string;
    customerIds: string[];
  }) => ({
    payload: { campaignId, customerIds },
  })
);

export const fetchLeadsDataForCsv = createAction(
  'campaign/fetchLeadsDataForCsv',
  ({
    enterpriseId,
    teamId,
    filterType,
    dateRange,
    recurringAge,
  }: {
    enterpriseId: string;
    teamId: string;
    filterType: string;
    dateRange?: { startDate: string; endDate: string };
    recurringAge?: number;
  }) => ({
    payload: { enterpriseId, teamId, filterType, dateRange, recurringAge },
  })
);
