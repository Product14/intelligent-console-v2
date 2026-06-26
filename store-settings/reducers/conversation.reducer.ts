import { Lead, LeadsApiResponse, LeadsPagination } from '@/types/settings/conversations';
import {
  Customer,
  CustomersApiResponse,
  CustomersPagination,
  UnifiedConversation,
  UnreadCounts,
} from '@/types/settings/conversations/customers';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ConversationState {
  conversations: any[];
  activeCustomer: Lead | Customer | null;
  selectedConversations: any[];
  filterStatus: string;
  leads: Lead[];
  customers: Customer[];
  chatData: any[];
  emailData: any[];
  callData: any[];
  unifiedConversations: UnifiedConversation[];
  leadInfo?: any | null;
  conversationHistory: any[];
  conversationReports?: any | null;
  conversationHistoryPagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null;
  pagination: LeadsPagination;
  filters: Record<string, any>;
  customerDetails: any | null;
  customerLeads: any | null;
  customerLeadsPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null;
  customerServices: any | null;
  customerServicesPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null;
  vehicleList: any | null;
  loadingStates: {
    leadsLoading: boolean;
    leadsLoaded: boolean;
    leadsError: string | null;
    chatDataLoading: boolean;
    emailDataLoading: boolean;
    callDataLoading: boolean;
    leadInfoLoading: boolean;
    conversationHistoryLoading: boolean;
    conversationReportsLoading: boolean;
    leadStatusUpdating: boolean;
    unifiedConversationsLoading: boolean;
    customerDetailsLoading: boolean;
    customerLeadsLoading: boolean;
    assignmentLoading: boolean;
    stageUpdateLoading: boolean;
    vehicleListLoading: boolean;
    createLeadLoading: boolean;
    customerServicesLoading: boolean;
    createServiceLoading: boolean;
    updateServiceLoading: boolean;
    customerVehiclesLoading: boolean;
    toggleAILoading: boolean;
    sendSMSLoading: boolean;
    pollingActive: boolean;
  };
  errorStates: {
    customerDetailsError: string | null;
    customerLeadsError: string | null;
    assignmentError: string | null;
    stageUpdateError: string | null;
    vehicleListError: string | null;
    createLeadError: string | null;
    customerServicesError: string | null;
    createServiceError: string | null;
    updateServiceError: string | null;
    customerVehiclesError: string | null;
    toggleAIError: string | null;
    sendSMSError: string | null;
    pollingError: string | null;
  };
  loadedStates: {
    leadInfoLoaded: boolean;
    conversationHistoryLoaded: boolean;
    conversationReportsLoaded: boolean;
  };
  activeIndex: number;
}

const initialState: ConversationState = {
  conversations: [],
  activeCustomer: null,
  selectedConversations: [],
  filterStatus: 'all',
  leads: [],
  customers: [],
  chatData: [],
  emailData: [],
  callData: [],
  unifiedConversations: [],
  leadInfo: null,
  conversationHistory: [],
  conversationReports: null,
  conversationHistoryPagination: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    hasNext: false,
    hasPrevious: false,
    limit: 25,
  },
  filters: {},
  customerDetails: null,
  customerLeads: null,
  customerLeadsPagination: null,
  customerServices: null,
  customerServicesPagination: null,
  vehicleList: null,
  loadingStates: {
    leadsLoading: false,
    leadsLoaded: false,
    leadsError: null,
    chatDataLoading: false,
    emailDataLoading: false,
    callDataLoading: false,
    leadInfoLoading: false,
    conversationHistoryLoading: false,
    conversationReportsLoading: false,
    leadStatusUpdating: false,
    unifiedConversationsLoading: false,
    customerDetailsLoading: false,
    customerLeadsLoading: false,
    assignmentLoading: false,
    stageUpdateLoading: false,
    vehicleListLoading: false,
    createLeadLoading: false,
    customerServicesLoading: false,
    createServiceLoading: false,
    updateServiceLoading: false,
    customerVehiclesLoading: false,
    toggleAILoading: false,
    sendSMSLoading: false,
    pollingActive: false,
  },
  errorStates: {
    customerDetailsError: null,
    customerLeadsError: null,
    assignmentError: null,
    stageUpdateError: null,
    vehicleListError: null,
    createLeadError: null,
    customerServicesError: null,
    createServiceError: null,
    updateServiceError: null,
    customerVehiclesError: null,
    toggleAIError: null,
    sendSMSError: null,
    pollingError: null,
  },
  loadedStates: {
    leadInfoLoaded: false,
    conversationHistoryLoaded: false,
    conversationReportsLoaded: false,
  },
  activeIndex: 0,
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setActiveCustomer: (
      state,
      action: PayloadAction<{ customer: Lead | Customer }>
    ) => {
      state.activeCustomer = action.payload.customer;
    },
    setCustomers: (
      state,
      action: PayloadAction<{
        customers: LeadsApiResponse | CustomersApiResponse;
        page?: number;
      }>
    ) => {
      const { customers, page } = action.payload;

      // Handle both old leads API and new customers API
      if ('leads' in customers) {
        // Old leads API
        if (page === 1) {
          state.leads = customers.leads;
        } else {
          state.leads = [...state.leads, ...customers.leads];
        }
        state.pagination = customers.pagination;
      } else {
        // New customers API
        if (page === 1) {
          state.customers = customers.customers;
          state.leads = customers.customers as any; // Keep backwards compatibility
        } else {
          state.customers = [...state.customers, ...customers.customers];
          state.leads = [...state.leads, ...customers.customers] as any;
        }
        // Map customer pagination to lead pagination format
        state.pagination = {
          currentPage: customers.pagination.currentPage,
          totalPages: customers.pagination.totalPages,
          totalLeads: customers.pagination.totalCustomers,
          hasNext: customers.pagination.hasNext,
          hasPrevious: customers.pagination.hasPrevious,
          limit: customers.pagination.limit,
          unreadCount: customers.pagination.unreadCount,
        };
      }
    },
    setCustomersLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.leadsLoading = action.payload?.loading;
    },

    setChatData: (state, action: PayloadAction<any>) => {
      console.log(action.payload);
      const { chatData } = action.payload;
      state.chatData = chatData.conversations;
    },
    setChatDataLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.chatDataLoading = action.payload?.loading;
    },

    setEmailData: (state, action: PayloadAction<any>) => {
      const { emailData } = action.payload;
      state.emailData = emailData.conversations;
    },
    setEmailDataLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.emailDataLoading = action.payload?.loading;
    },

    setCallData: (state, action: PayloadAction<any>) => {
      const { callData } = action.payload;
      state.callData = callData.conversations;
    },
    setCallDataLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.callDataLoading = action.payload?.loading;
    },

    setUnifiedConversations: (
      state,
      action: PayloadAction<{ conversationsData: any }>
    ) => {
      const { conversationsData } = action.payload;
      state.unifiedConversations = conversationsData?.data?.conversations || [];
    },
    setUnifiedConversationsLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.unifiedConversationsLoading = action.payload?.loading;
    },

    setActiveIndex: (state, action: PayloadAction<any>) => {
      state.activeIndex = action.payload.index;
    },

    clearConversationHistory: (state) => {
      state.conversationHistory = [];
      state.conversationHistoryPagination = null;
      state.loadedStates.conversationHistoryLoaded = false;
    },

    // Lead Info
    setLeadInfo: (state, action: PayloadAction<{ leadInfo: any }>) => {
      state.leadInfo = action.payload.leadInfo;
      state.loadedStates.leadInfoLoaded = true;
    },
    setLeadInfoLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.leadInfoLoading = action.payload.loading;
      if (action.payload.loading === false) {
        state.loadedStates.leadInfoLoaded = true;
      }
    },

    // Conversation History
    setConversationHistory: (
      state,
      action: PayloadAction<{
        history: any[];
        pagination: any;
        page?: number;
      }>
    ) => {
      const { history, pagination, page } = action.payload;
      if (page && page > 1) {
        state.conversationHistory = [...state.conversationHistory, ...history];
      } else {
        state.conversationHistory = history;
      }
      state.conversationHistoryPagination = pagination;
      state.loadedStates.conversationHistoryLoaded = true;
      state.pagination = {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalLeads: pagination.totalCount,
        hasNext: pagination.hasNextPage,
        hasPrevious: pagination.hasPrevPage,
        limit: pagination.limit,
      } as any;
    },
    setConversationHistoryLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.conversationHistoryLoading = action.payload.loading;
      if (action.payload.loading === false) {
        state.loadedStates.conversationHistoryLoaded = true;
      }
    },

    // Reports
    setConversationReports: (
      state,
      action: PayloadAction<{ reports: any }>
    ) => {
      state.conversationReports = action.payload.reports;
      state.loadedStates.conversationReportsLoaded = true;
    },
    setConversationReportsLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.conversationReportsLoading = action.payload.loading;
      if (action.payload.loading === false) {
        state.loadedStates.conversationReportsLoaded = true;
      }
    },

    // Lead Status Update
    setLeadStatusUpdating: (
      state,
      action: PayloadAction<{ updating: boolean }>
    ) => {
      state.loadingStates.leadStatusUpdating = action.payload.updating;
    },

    // Update Lead in List
    updateLeadInList: (
      state,
      action: PayloadAction<{ leadId: string; leadType: string }>
    ) => {
      const { leadId, leadType } = action.payload;
      state.leads = state.leads.map((lead) =>
        lead.lead_id === leadId || lead._id === leadId
          ? { ...lead, lead_type: leadType }
          : lead
      );
    },

    // Update Unread Counts
    updateUnreadCounts: (
      state,
      action: PayloadAction<{
        leadId: string;
        type: 'chat' | 'call' | 'email' | 'sms';
      }>
    ) => {
      const { leadId, type } = action.payload;
      console.log('🔄 updateUnreadCounts called:', { leadId, type });

      // Update in leads list
      state.leads = state.leads.map((lead) => {
        if (lead.lead_id === leadId || lead._id === leadId) {
          const updatedLead = { ...lead };
          if (updatedLead.unreadCounts) {
            // Reset the specific type count to 0
            switch (type) {
              case 'chat':
                updatedLead.unreadCounts.chatUnread = 0;
                break;
              case 'call':
                updatedLead.unreadCounts.callUnread = 0;
                break;
              case 'email':
                updatedLead.unreadCounts.emailUnread = 0;
                break;
              case 'sms':
                (updatedLead.unreadCounts as any).smsUnread = 0;
                break;
            }
            // Recalculate total
            updatedLead.unreadCounts.totalUnread =
              updatedLead.unreadCounts.chatUnread +
              updatedLead.unreadCounts.callUnread +
              updatedLead.unreadCounts.emailUnread +
              ((updatedLead.unreadCounts as any).smsUnread || 0);
          }
          return updatedLead;
        }
        return lead;
      });

      // Update in customers list as well
      state.customers = state.customers.map((customer) => {
        if (customer.customer_id === leadId) {
          console.log('✅ Found matching customer for update:', {
            customerId: customer.customer_id,
            leadId,
            currentUnread: customer.unreadCounts?.totalUnread,
            type,
          });
          const updatedCustomer = { ...customer };
          if (updatedCustomer.unreadCounts) {
            // Reset the specific type count to 0
            switch (type) {
              case 'chat':
                updatedCustomer.unreadCounts.chatUnread = 0;
                break;
              case 'call':
                updatedCustomer.unreadCounts.callUnread = 0;
                break;
              case 'email':
                updatedCustomer.unreadCounts.emailUnread = 0;
                break;
              case 'sms':
                (updatedCustomer.unreadCounts as any).smsUnread = 0;
                break;
            }
            // Recalculate total
            updatedCustomer.unreadCounts.totalUnread =
              updatedCustomer.unreadCounts.chatUnread +
              updatedCustomer.unreadCounts.callUnread +
              updatedCustomer.unreadCounts.emailUnread +
              ((updatedCustomer.unreadCounts as any).smsUnread || 0);

            console.log('📊 Updated customer unread counts:', {
              customerId: customer.customer_id,
              type,
              chatUnread: updatedCustomer.unreadCounts.chatUnread,
              callUnread: updatedCustomer.unreadCounts.callUnread,
              emailUnread: updatedCustomer.unreadCounts.emailUnread,
              totalUnread: updatedCustomer.unreadCounts.totalUnread,
            });
          }
          return updatedCustomer;
        }
        return customer;
      });

      // Update active customer if it matches
      if (
        state.activeCustomer &&
        (('lead_id' in state.activeCustomer &&
          state.activeCustomer.lead_id === leadId) ||
          ('customer_id' in state.activeCustomer &&
            state.activeCustomer.customer_id === leadId) ||
          ('_id' in state.activeCustomer &&
            state.activeCustomer._id === leadId))
      ) {
        const updatedActiveCustomer = { ...state.activeCustomer };
        if (updatedActiveCustomer.unreadCounts) {
          // Reset the specific type count to 0
          switch (type) {
            case 'chat':
              updatedActiveCustomer.unreadCounts.chatUnread = 0;
              break;
            case 'call':
              updatedActiveCustomer.unreadCounts.callUnread = 0;
              break;
            case 'email':
              updatedActiveCustomer.unreadCounts.emailUnread = 0;
              break;
            case 'sms':
              (updatedActiveCustomer.unreadCounts as any).smsUnread = 0;
              break;
          }
          // Recalculate total
          updatedActiveCustomer.unreadCounts.totalUnread =
            updatedActiveCustomer.unreadCounts.chatUnread +
            updatedActiveCustomer.unreadCounts.callUnread +
            updatedActiveCustomer.unreadCounts.emailUnread +
            ((updatedActiveCustomer.unreadCounts as any).smsUnread || 0);
        }
        state.activeCustomer = updatedActiveCustomer;
      }
    },

    // Customer Details Actions
    setCustomerDetailsLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.customerDetailsLoading = action.payload.loading;
    },
    setCustomerDetails: (
      state,
      action: PayloadAction<{ customerDetails: any }>
    ) => {
      state.customerDetails = action.payload.customerDetails;
      state.errorStates.customerDetailsError = null;
    },
    setCustomerDetailsError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.customerDetailsError = action.payload.error;
    },

    // Customer Leads Actions
    setCustomerLeadsLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.customerLeadsLoading = action.payload.loading;
    },
    setCustomerLeads: (
      state,
      action: PayloadAction<{ customerLeads: any }>
    ) => {
      state.customerLeads = action.payload.customerLeads;

      // Handle pagination data if present
      if (action.payload.customerLeads?.pagination) {
        const paginationData = action.payload.customerLeads.pagination;
        state.customerLeadsPagination = {
          currentPage: paginationData.page || 1,
          totalPages: paginationData.total_pages || 1,
          totalCount: paginationData.total || 0,
          hasNextPage: paginationData.has_next || false,
          hasPrevPage: paginationData.has_previous || false,
          limit: paginationData.page_size || 10,
        };
      }

      state.errorStates.customerLeadsError = null;
    },
    setCustomerLeadsError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.customerLeadsError = action.payload.error;
    },

    // Customer Services Actions
    setCustomerServicesLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.customerServicesLoading = action.payload.loading;
    },
    setCustomerServices: (
      state,
      action: PayloadAction<{ customerServices: any }>
    ) => {
      state.customerServices = action.payload.customerServices;

      // Handle pagination data if present
      if (action.payload.customerServices?.pagination) {
        const paginationData = action.payload.customerServices.pagination;
        state.customerServicesPagination = {
          currentPage: paginationData.page || 1,
          totalPages: paginationData.total_pages || 1,
          totalCount: paginationData.total || 0,
          hasNextPage: paginationData.has_next || false,
          hasPrevPage: paginationData.has_previous || false,
          limit: paginationData.page_size || 10,
        };
      }

      state.errorStates.customerServicesError = null;
    },
    setCustomerServicesError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.customerServicesError = action.payload.error;
    },

    // Create Customer Service Actions
    setCreateServiceLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.createServiceLoading = action.payload.loading;
    },
    setCreateServiceError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.createServiceError = action.payload.error;
    },
    setCreateServiceSuccess: (
      state,
      action: PayloadAction<{ success: boolean }>
    ) => {
      if (action.payload.success) {
        state.errorStates.createServiceError = null;
      }
    },

    // Assignment Actions
    setAssignmentLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.assignmentLoading = action.payload.loading;
    },
    setAssignmentError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.assignmentError = action.payload.error;
    },

    // Stage Update Actions
    setStageUpdateLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.stageUpdateLoading = action.payload.loading;
    },
    setStageUpdateError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.stageUpdateError = action.payload.error;
    },

    // Vehicle List Actions for Create Lead
    setVehicleList: (state, action: PayloadAction<{ vehicleData: any }>) => {
      state.vehicleList = action.payload.vehicleData;
      state.errorStates.vehicleListError = null;
    },
    setVehicleListLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.vehicleListLoading = action.payload.loading;
    },
    setVehicleListError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.vehicleListError = action.payload.error;
    },

    // Create Lead Actions
    setCreateLeadLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.createLeadLoading = action.payload.loading;
    },
    setCreateLeadError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.createLeadError = action.payload.error;
    },
    setCreateLeadSuccess: (
      state,
      action: PayloadAction<{ success: boolean }>
    ) => {
      if (action.payload.success) {
        state.errorStates.createLeadError = null;
      }
    },
    clearCreateLeadState: (state) => {
      state.loadingStates.createLeadLoading = false;
      state.errorStates.createLeadError = null;
    },

    // Toggle AI Actions
    setToggleAILoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.toggleAILoading = action.payload.loading;
    },
    setToggleAIError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.toggleAIError = action.payload.error;
    },
    setToggleAISuccess: (
      state,
      action: PayloadAction<{ success: boolean }>
    ) => {
      if (action.payload.success) {
        state.errorStates.toggleAIError = null;
      }
    },

    // Send SMS Actions
    setSendSMSLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
      state.loadingStates.sendSMSLoading = action.payload.loading;
    },
    setSendSMSError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.sendSMSError = action.payload.error;
    },
    setSendSMSSuccess: (state, action: PayloadAction<{ success: boolean }>) => {
      if (action.payload.success) {
        state.errorStates.sendSMSError = null;
      }
    },
    addSMSMessageToConversation: (state, action: PayloadAction<any>) => {
      // Add the new message to the conversations - handle both direct message and wrapped message
      const newMessage = action.payload.message || action.payload;
      console.log('🔄 Adding SMS message to conversation:', {
        payload: action.payload,
        newMessage,
        hasMessage: !!action.payload.message,
        directPayload: action.payload,
      });

      // Don't add messages without a body
      if (!newMessage.body) {
        console.warn('⚠️ Skipping message without body:', newMessage);
        return;
      }

      // Find the conversation and add the message
      const conversationIndex = state.unifiedConversations.findIndex(
        (conv) => conv.conversationId === newMessage.conversationId
      );

      if (conversationIndex !== -1) {
        if (!state.unifiedConversations[conversationIndex].smsMessages) {
          state.unifiedConversations[conversationIndex].smsMessages = [];
        }

        const messages =
          state.unifiedConversations[conversationIndex].smsMessages;

        // Check if this is an update to a temporary message (optimistic update)
        const tempMessageIndex = messages.findIndex(
          (msg: any) =>
            msg.messageId &&
            msg.messageId.startsWith('temp-') &&
            msg.body === newMessage.body &&
            msg.direction === 'out'
        );

        if (
          tempMessageIndex !== -1 &&
          !newMessage.messageId.startsWith('temp-')
        ) {
          // Replace the temporary message with the real one
          console.log(
            '🔄 Replacing temporary message with real message from API response'
          );
          messages[tempMessageIndex] = newMessage;
        } else if (
          !messages.find((msg: any) => msg.messageId === newMessage.messageId)
        ) {
          // Check for duplicate by body and timestamp (within 5 seconds)
          const isDuplicate = messages.some((msg: any) => {
            if (msg.messageId?.startsWith('temp-')) {
              // Don't consider temp messages as duplicates
              return false;
            }
            const timeDiff = Math.abs(
              new Date(msg.createdAt).getTime() -
                new Date(newMessage.createdAt).getTime()
            );
            return (
              msg.body === newMessage.body &&
              msg.direction === newMessage.direction &&
              timeDiff < 5000 // Within 5 seconds
            );
          });

          if (!isDuplicate) {
            console.log('➕ Adding new message to conversation');
            messages.push(newMessage);
            // Sort messages by createdAt
            messages.sort(
              (a: any, b: any) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          } else {
            console.log('⚠️ Duplicate message detected, skipping');
          }
        } else {
          console.log('⚠️ Message with same ID already exists, skipping');
        }

        // Update the conversation's updatedAt timestamp
        state.unifiedConversations[conversationIndex].updatedAt =
          newMessage.createdAt;
      } else {
        console.log('⚠️ Conversation not found, creating new one with message');
        // If conversation doesn't exist, create it with the message
        // Get the active customer to get leadId
        const activeCustomer = state.activeCustomer;
        const leadId = activeCustomer
          ? ('customer_id' in activeCustomer && activeCustomer.customer_id) ||
            ('lead_id' in activeCustomer && activeCustomer.lead_id) ||
            ('_id' in activeCustomer && activeCustomer._id) ||
            ''
          : '';

        state.unifiedConversations.push({
          _id: `temp-conv-${Date.now()}`, // Temporary ID
          conversationId: newMessage.conversationId,
          type: 'sms',
          status: 'in_progress',
          updatedAt: newMessage.createdAt,
          createdAt: newMessage.createdAt,
          smsMessages: [newMessage],
          leadId,
          aiMode: 'off', // Assuming manual mode when sending
          messages: [], // For compatibility
        } as any);
      }
    },

    // Polling Actions
    setPollingActive: (state, action: PayloadAction<{ active: boolean }>) => {
      state.loadingStates.pollingActive = action.payload.active;
    },
    setPollingError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.pollingError = action.payload.error;
    },
    updateConversationsFromPolling: (
      state,
      action: PayloadAction<{ pollingData: any }>
    ) => {
      const { pollingData } = action.payload;
      const newConversations = pollingData?.data?.conversations || [];

      if (newConversations.length > 0) {
        // Update existing conversations with new messages
        newConversations.forEach((newConv: any) => {
          const existingIndex = state.unifiedConversations.findIndex(
            (conv) => conv.conversationId === newConv.conversationId
          );

          if (existingIndex !== -1) {
            // Update existing conversation with new messages
            const existingConv = state.unifiedConversations[existingIndex];

            if (newConv.type === 'sms' && newConv.smsMessages) {
              // For SMS, we need to handle both temporary and real messages
              const existingMessages = existingConv.smsMessages || [];

              // Create a map of existing messages by ID and body for duplicate detection
              const existingMessageMap = new Map();
              existingMessages.forEach((msg: any) => {
                existingMessageMap.set(msg.messageId, msg);
                // Also track by body for temporary message matching
                if (msg.messageId?.startsWith('temp-')) {
                  existingMessageMap.set(`body:${msg.body}`, msg);
                }
              });

              // Process new messages and handle replacements
              const updatedMessages = [...existingMessages];
              let hasUpdates = false;

              newConv.smsMessages.forEach((newMsg: any) => {
                // Check if this message already exists by ID
                if (existingMessageMap.has(newMsg.messageId)) {
                  // Message with same ID already exists, skip
                  return;
                }

                // Check if this is replacing a temporary message
                const tempKey = `body:${newMsg.body}`;
                const tempMessage = existingMessageMap.get(tempKey);

                if (tempMessage && tempMessage.messageId?.startsWith('temp-')) {
                  // Replace the temporary message with the real one
                  console.log(
                    '🔄 Replacing temp message with real message from polling'
                  );
                  const tempIndex = updatedMessages.findIndex(
                    (m: any) => m.messageId === tempMessage.messageId
                  );
                  if (tempIndex !== -1) {
                    updatedMessages[tempIndex] = newMsg;
                    hasUpdates = true;
                  }
                } else {
                  // Check if message with same body and similar timestamp exists (within 5 seconds)
                  const isDuplicate = updatedMessages.some(
                    (existingMsg: any) => {
                      const timeDiff = Math.abs(
                        new Date(existingMsg.createdAt).getTime() -
                          new Date(newMsg.createdAt).getTime()
                      );
                      return (
                        existingMsg.body === newMsg.body &&
                        existingMsg.direction === newMsg.direction &&
                        timeDiff < 5000 // Within 5 seconds
                      );
                    }
                  );

                  if (!isDuplicate) {
                    // This is a genuinely new message
                    console.log('➕ Adding new message from polling');
                    updatedMessages.push(newMsg);
                    hasUpdates = true;
                  }
                }
              });

              if (hasUpdates) {
                // Sort messages by createdAt to maintain order
                updatedMessages.sort(
                  (a: any, b: any) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );

                state.unifiedConversations[existingIndex] = {
                  ...existingConv,
                  smsMessages: updatedMessages,
                  updatedAt: newConv.updatedAt,
                  status: newConv.status,
                };
              }
            } else {
              // For other conversation types, update the entire conversation
              state.unifiedConversations[existingIndex] = {
                ...existingConv,
                ...newConv,
              };
            }
          } else {
            // Add new conversation if it doesn't exist
            state.unifiedConversations.push(newConv);
          }
        });

        // Sort conversations by updatedAt to maintain chronological order
        state.unifiedConversations.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    },
  },
});

export const {
  setActiveCustomer,
  setActiveIndex,
  setCustomers,
  setCustomersLoading,
  setUnifiedConversations,
  setUnifiedConversationsLoading,
  setCustomerDetails,
  setCustomerDetailsLoading,
  setCustomerLeads,
  setCustomerLeadsLoading,
  setConversationHistory,
  setConversationHistoryLoading,
  setConversationReports,
  setConversationReportsLoading,
  setLeadInfo,
  setLeadInfoLoading,
  setAssignmentLoading,
  setStageUpdateLoading,
  setVehicleList,
  setVehicleListLoading,
  setVehicleListError,
  setCreateLeadLoading,
  setCreateLeadError,
  setCreateLeadSuccess,
  clearCreateLeadState,
  setToggleAILoading,
  setToggleAIError,
  setToggleAISuccess,
  setSendSMSLoading,
  setSendSMSError,
  setSendSMSSuccess,
  addSMSMessageToConversation,
  setPollingActive,
  setPollingError,
  updateConversationsFromPolling,
} = conversationSlice.actions;

export default conversationSlice.reducer;
