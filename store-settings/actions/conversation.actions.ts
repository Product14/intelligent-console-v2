import { createAction } from '@reduxjs/toolkit';

export const setActiveCustomer = createAction(
  'conversation/setActiveCustomer',
  (customer: any) => ({
    payload: { customer },
  })
);

export const fetchCustomers = createAction(
  'conversation/fetchCustomers',
  ({
    enterpriseId,
    teamId,
    page,
    limit,
    unreadOnly,
    department,
    startDate,
    endDate,
    isEmbedded,
    searchTerm,
  }: {
    enterpriseId?: string;
    teamId?: string;
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    department?: string;
    startDate?: string;
    endDate?: string;
    isEmbedded?: boolean;
    searchTerm?: string;
  }) => ({
    payload: {
      enterpriseId,
      teamId,
      page,
      limit,
      unreadOnly,
      department,
      startDate,
      endDate,
      isEmbedded,
      searchTerm,
    },
  })
);

export const fetchLeadDetails = createAction(
  'conversation/fetchLeadDetails',
  ({
    leadId,
    type,
    page = 1,
    limit = 10,
  }: {
    leadId: string;
    type: 'chat' | 'call' | 'email';
    page?: number;
    limit?: number;
  }) => ({
    payload: { leadId, type, page, limit },
  })
);

export const fetchCustomerConversations = createAction(
  'conversation/fetchCustomerConversations',
  ({
    customerId,
    enterpriseId,
    teamId,
    page = 1,
    pageSize = 10,
    type,
    isEmbedded,
    conversationId,
  }: {
    customerId: string;
    enterpriseId: string;
    teamId: string;
    page?: number;
    pageSize?: number;
    type?: 'chat' | 'call' | 'email' | 'sms';
    isEmbedded?: boolean;
    conversationId?: string;
  }) => ({
    payload: {
      customerId,
      enterpriseId,
      teamId,
      page,
      pageSize,
      type,
      isEmbedded,
      conversationId,
    },
  })
);

export const setCustomers = createAction(
  'conversation/setCustomers',
  (customers: any, page?: number) => ({
    payload: { customers, page },
  })
);

export const setCustomersLoading = createAction(
  'conversation/setCustomersLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setChatData = createAction(
  'conversation/setChatData',
  (chatData: any) => ({
    payload: { chatData },
  })
);

export const setChatDataLoading = createAction(
  'conversation/setChatDataLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setEmailData = createAction(
  'conversation/setEmailData',
  (emailData: any) => ({
    payload: { emailData },
  })
);

export const setEmailDataLoading = createAction(
  'conversation/setEmailDataLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCallData = createAction(
  'conversation/setCallData',
  (callData: any) => ({
    payload: { callData },
  })
);

export const setCallDataLoading = createAction(
  'conversation/setCallDataLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setUnifiedConversations = createAction(
  'conversation/setUnifiedConversations',
  (conversationsData: any) => ({
    payload: { conversationsData },
  })
);

export const setUnifiedConversationsLoading = createAction(
  'conversation/setUnifiedConversationsLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setActiveIndex = createAction(
  'conversation/setActiveIndex',
  (index: number) => ({
    payload: { index },
  })
);

// Summary page: Lead Info
export const fetchLeadInfo = createAction(
  'conversation/fetchLeadInfo',
  ({ leadId }: { leadId: string }) => ({
    payload: { leadId },
  })
);

export const setLeadInfo = createAction(
  'conversation/setLeadInfo',
  (leadInfo: any) => ({
    payload: { leadInfo },
  })
);

export const setLeadInfoLoading = createAction(
  'conversation/setLeadInfoLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

// Summary page: Conversation History (paginated)
export const fetchConversationHistory = createAction(
  'conversation/fetchConversationHistory',
  ({
    leadId,
    page = 1,
    limit = 8,
  }: {
    leadId: string;
    page?: number;
    limit?: number;
  }) => ({
    payload: { leadId, page, limit },
  })
);

export const setConversationHistory = createAction(
  'conversation/setConversationHistory',
  (
    history: any[],
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    },
    page?: number
  ) => ({
    payload: { history, pagination, page },
  })
);

export const clearConversationHistory = createAction(
  'conversation/clearConversationHistory',
  () => ({ payload: {} })
);

export const setConversationHistoryLoading = createAction(
  'conversation/setConversationHistoryLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

// Summary page: Reports (Overall/Sales/Service/At-a-glance)
export const fetchConversationReports = createAction(
  'conversation/fetchConversationReports',
  ({ leadId }: { leadId: string }) => ({
    payload: { leadId },
  })
);

export const setConversationReports = createAction(
  'conversation/setConversationReports',
  (reports: any) => ({
    payload: { reports },
  })
);

export const setConversationReportsLoading = createAction(
  'conversation/setConversationReportsLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

// Update Lead Status
export const updateLeadStatus = createAction(
  'conversation/updateLeadStatus',
  ({
    leadId,
    leadType,
    enterpriseId,
    teamId,
  }: {
    leadId: string;
    leadType: string;
    enterpriseId: string;
    teamId: string;
  }) => ({
    payload: { leadId, leadType, enterpriseId, teamId },
  })
);

export const setLeadStatusUpdating = createAction(
  'conversation/setLeadStatusUpdating',
  (updating: boolean) => ({
    payload: { updating },
  })
);

export const updateLeadInList = createAction(
  'conversation/updateLeadInList',
  ({ leadId, leadType }: { leadId: string; leadType: string }) => ({
    payload: { leadId, leadType },
  })
);

// Mark messages as read
export const markAsRead = createAction(
  'conversation/markAsRead',
  ({
    leadId,
    type,
  }: {
    leadId: string;
    type: 'chat' | 'call' | 'email' | 'sms';
  }) => ({
    payload: { leadId, type },
  })
);

export const updateUnreadCounts = createAction(
  'conversation/updateUnreadCounts',
  ({
    leadId,
    type,
  }: {
    leadId: string;
    type: 'chat' | 'call' | 'email' | 'sms';
  }) => ({
    payload: { leadId, type },
  })
);

// Customer Profile Actions
export const fetchCustomerDetails = createAction(
  'conversation/fetchCustomerDetails',
  ({ customerId }: { customerId: string }) => ({
    payload: { customerId },
  })
);

export const setCustomerDetails = createAction(
  'conversation/setCustomerDetails',
  (customerDetails: any) => ({
    payload: { customerDetails },
  })
);

export const setCustomerDetailsLoading = createAction(
  'conversation/setCustomerDetailsLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCustomerDetailsError = createAction(
  'conversation/setCustomerDetailsError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Customer Leads Actions
export const fetchCustomerLeads = createAction(
  'conversation/fetchCustomerLeads',
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
  'conversation/setCustomerLeads',
  (customerLeads: any) => ({
    payload: { customerLeads },
  })
);

export const fetchCustomerServices = createAction(
  'conversation/fetchCustomerServices',
  ({
    customerId,
    enterpriseId,
    teamId,
    page = 1,
    limit = 10,
    shouldUpsertLatestService = false,
  }: {
    customerId: string;
    enterpriseId: string;
    teamId: string;
    page?: number;
    limit?: number;
    shouldUpsertLatestService?: boolean;
  }) => ({
    payload: {
      customerId,
      enterpriseId,
      teamId,
      page,
      limit,
      shouldUpsertLatestService,
    },
  })
);

export const setCustomerServices = createAction(
  'conversation/setCustomerServices',
  (customerServices: any) => ({
    payload: { customerServices },
  })
);

export const setCustomerLeadsLoading = createAction(
  'conversation/setCustomerLeadsLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCustomerLeadsError = createAction(
  'conversation/setCustomerLeadsError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setCustomerServicesLoading = createAction(
  'conversation/setCustomerServicesLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCustomerServicesError = createAction(
  'conversation/setCustomerServicesError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Create Customer Service Actions
export const createCustomerService = createAction(
  'conversation/createCustomerService',
  (serviceData: {
    customerId: string;
    enterpriseId: string;
    teamId: string;
    serviceType: string;
    vehicleInformation: {
      vehicleDetails: string;
      vin: string;
    };
    estimatedCost?: number;
    assignedTo?: string;
    notes?: string;
  }) => ({
    payload: serviceData,
  })
);

export const setCreateServiceLoading = createAction(
  'conversation/setCreateServiceLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCreateServiceError = createAction(
  'conversation/setCreateServiceError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setCreateServiceSuccess = createAction(
  'conversation/setCreateServiceSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);

// User List Actions

// Assignment Actions
export const assignLead = createAction(
  'conversation/assignLead',
  ({
    leadId,
    userId,
    action,
    isSalesAssignment,
    customerId,
    enterpriseId,
    teamId,
  }: {
    leadId: string;
    userId?: string;
    action: 'assign' | 'unassign';
    isSalesAssignment?: boolean;
    customerId?: string;
    enterpriseId?: string;
    teamId?: string;
  }) => ({
    payload: {
      leadId,
      userId,
      action,
      isSalesAssignment,
      customerId,
      enterpriseId,
      teamId,
    },
  })
);

export const setAssignmentLoading = createAction(
  'conversation/setAssignmentLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setAssignmentError = createAction(
  'conversation/setAssignmentError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Lead Stage Actions
export const updateLeadStage = createAction(
  'conversation/updateLeadStage',
  ({ leadId, newStage }: { leadId: string; newStage: string }) => ({
    payload: { leadId, newStage },
  })
);

export const setStageUpdateLoading = createAction(
  'conversation/setStageUpdateLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setStageUpdateError = createAction(
  'conversation/setStageUpdateError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Vehicle List Actions
export const fetchVehicleList = createAction(
  'conversation/fetchVehicleList',
  ({
    enterpriseId,
    teamId,
    customerId,
    page,
    perPage,
    isSold,
    sortBy,
    sortOrder,
    q,
  }: {
    enterpriseId: string;
    teamId: string;
    customerId: string;
    page?: number;
    perPage?: number;
    isSold?: boolean;
    sortBy?: string;
    sortOrder?: string;
    q?: string;
  }) => ({
    payload: {
      enterpriseId,
      teamId,
      customerId,
      page,
      perPage,
      isSold,
      sortBy,
      sortOrder,
      q,
    },
  })
);

export const setVehicleList = createAction(
  'conversation/setVehicleList',
  (vehicleData: any) => ({
    payload: { vehicleData },
  })
);

export const setVehicleListLoading = createAction(
  'conversation/setVehicleListLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setVehicleListError = createAction(
  'conversation/setVehicleListError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setCreateLeadLoading = createAction(
  'conversation/setCreateLeadLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCreateLeadError = createAction(
  'conversation/setCreateLeadError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setCreateLeadSuccess = createAction(
  'conversation/setCreateLeadSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);

export const clearCreateLeadState = createAction(
  'conversation/clearCreateLeadState',
  () => ({
    payload: {},
  })
);

// Toggle AI Actions
export const toggleAI = createAction(
  'conversation/toggleAI',
  ({
    conversationId,
    enabled,
  }: {
    conversationId: string;
    enabled: boolean;
  }) => ({
    payload: { conversationId, enabled },
  })
);

export const setToggleAILoading = createAction(
  'conversation/setToggleAILoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setToggleAIError = createAction(
  'conversation/setToggleAIError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setToggleAISuccess = createAction(
  'conversation/setToggleAISuccess',
  (success: boolean) => ({
    payload: { success },
  })
);

// Send SMS Message Actions
export const sendSMSMessage = createAction(
  'conversation/sendSMSMessage',
  ({ conversationId, body }: { conversationId: string; body: string }) => ({
    payload: { conversationId, body },
  })
);

export const setSendSMSLoading = createAction(
  'conversation/setSendSMSLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setSendSMSError = createAction(
  'conversation/setSendSMSError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setSendSMSSuccess = createAction(
  'conversation/setSendSMSSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);

export const addSMSMessageToConversation = createAction(
  'conversation/addSMSMessageToConversation',
  (message: any) => ({
    payload: { message },
  })
);

// Polling Actions
export const pollConversations = createAction(
  'conversation/pollConversations',
  ({
    customerId,
    enterpriseId,
    teamId,
    conversationId,
  }: {
    customerId: string;
    enterpriseId: string;
    teamId: string;
    conversationId?: string;
  }) => ({
    payload: { customerId, enterpriseId, teamId, conversationId },
  })
);

export const setPollingActive = createAction(
  'conversation/setPollingActive',
  (active: boolean) => ({
    payload: { active },
  })
);

export const setPollingError = createAction(
  'conversation/setPollingError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const updateConversationsFromPolling = createAction(
  'conversation/updateConversationsFromPolling',
  (pollingData: any) => ({
    payload: { pollingData },
  })
);
