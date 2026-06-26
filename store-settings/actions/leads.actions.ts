import { createAction } from '@reduxjs/toolkit';

// Upsert Latest Lead Action
export const upsertLatestLead = createAction(
  'leads/upsertLatestLead',
  (lead: any) => ({
    payload: { lead },
  })
);

// Set Latest Lead Loading State
export const setLatestLeadLoading = createAction(
  'leads/setLatestLeadLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

// Set Latest Lead Loaded State
export const setLatestLeadLoaded = createAction(
  'leads/setLatestLeadLoaded',
  (loaded: boolean) => ({
    payload: { loaded },
  })
);

// Set Latest Lead Error State
export const setLatestLeadError = createAction(
  'leads/setLatestLeadError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Customer Leads Actions (for customer profile page)
export const fetchCustomerLeads = createAction(
  'leads/fetchCustomerLeads',
  ({
    customerId,
    page,
    page_size,
    shouldUpsertLatestLead = false,
    search,
    stages,
  }: {
    customerId: string;
    page?: number;
    page_size?: number;
    shouldUpsertLatestLead?: boolean;
    search?: string;
    stages?: string[];
  }) => ({
    payload: {
      customerId,
      page,
      page_size,
      shouldUpsertLatestLead,
      search,
      stages,
    },
  })
);

export const setCustomerLeads = createAction(
  'leads/setCustomerLeads',
  (customerLeads: any) => ({
    payload: { customerLeads },
  })
);

export const setCustomerLeadsLoading = createAction(
  'leads/setCustomerLeadsLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCustomerLeadsError = createAction(
  'leads/setCustomerLeadsError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const clearCustomerLeads = createAction(
  'leads/clearCustomerLeads',
  () => ({
    payload: {},
  })
);

// Lead Assignment Actions
export const assignLead = createAction(
  'leads/assignLead',
  ({
    leadId,
    userId,
    action,
  }: {
    leadId: string;
    userId?: string;
    action: 'assign' | 'unassign';
  }) => ({
    payload: { leadId, userId, action },
  })
);

export const setAssignmentLoading = createAction(
  'leads/setAssignmentLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setAssignmentError = createAction(
  'leads/setAssignmentError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Lead Stage Actions
export const updateLeadStage = createAction(
  'leads/updateLeadStage',
  ({
    leadId,
    newStage,
    customerId,
  }: {
    leadId: string;
    newStage: string;
    customerId?: string;
  }) => ({
    payload: { leadId, newStage, customerId },
  })
);

// Create Lead Actions
export const createLead = createAction(
  'leads/createLead',
  (leadData: {
    enterpriseId: string;
    teamId: string;
    customerId: string;
    assignedTo?: string;
    vehicleName: string;
    vin: string;
    stockNumber?: string;
    registrationNumber?: string;
    mileage?: number;
    price?: number;
    tradeInVehicleData?: {
      vehicleDetails?: string;
      vin?: string;
      estimatedPrice?: number;
    };
  }) => ({
    payload: leadData,
  })
);

export const setStageUpdateLoading = createAction(
  'leads/setStageUpdateLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setStageUpdateError = createAction(
  'leads/setStageUpdateError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Customer Leads Filters Actions
export const setCustomerLeadsFilters = createAction(
  'leads/setCustomerLeadsFilters',
  ({ search, stages }: { search?: string; stages?: string[] }) => ({
    payload: { search, stages },
  })
);

// Fetch Inventory Vehicles (for dropdown - uses CRM inventory API)
export const fetchInventoryVehicles = createAction(
  'leads/fetchInventoryVehicles',
  ({
    enterpriseId,
    teamId,
    page,
    perPage,
    q,
  }: {
    enterpriseId: string;
    teamId: string;
    page?: number;
    perPage?: number;
    q?: string;
  }) => ({
    payload: {
      enterpriseId,
      teamId,
      page,
      perPage,
      q,
    },
  })
);

// Create Outbound Sales Lead Action
export const createOutboundSalesLead = createAction(
  'leads/createOutboundSalesLead',
  ({
    enterpriseId,
    teamId,
    customerName,
    email,
    phoneNumber,
    vehicleExternalId,
    assignedTo,
    source,
  }: {
    enterpriseId: string;
    teamId: string;
    customerName: string;
    email: string;
    phoneNumber: string;
    vehicleExternalId?: string;
    assignedTo?: string;
    source?: string;
  }) => ({
    payload: {
      enterpriseId,
      teamId,
      customerName,
      email,
      phoneNumber,
      vehicleExternalId,
      assignedTo,
      source,
    },
  })
);

// Create Outbound Sales Lead Loading/Error/Success Actions
export const setCreateOutboundLeadLoading = createAction(
  'leads/setCreateOutboundLeadLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCreateOutboundLeadError = createAction(
  'leads/setCreateOutboundLeadError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setCreateOutboundLeadSuccess = createAction(
  'leads/setCreateOutboundLeadSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);

// Trigger Outbound Phone Call Action
export const triggerOutboundPhoneCall = createAction(
  'leads/triggerOutboundPhoneCall',
  ({
    enterpriseId,
    teamId,
    agentId,
    customerDetails,
  }: {
    enterpriseId: string;
    teamId: string;
    agentId: string;
    customerDetails: Record<string, unknown>;
  }) => ({
    payload: {
      enterpriseId,
      teamId,
      agentId,
      customerDetails,
    },
  })
);

// Trigger Outbound Phone Call Loading/Error/Success Actions
export const setTriggerOutboundCallLoading = createAction(
  'leads/setTriggerOutboundCallLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setTriggerOutboundCallError = createAction(
  'leads/setTriggerOutboundCallError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setTriggerOutboundCallSuccess = createAction(
  'leads/setTriggerOutboundCallSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);
