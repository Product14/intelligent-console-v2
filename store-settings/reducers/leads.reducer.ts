import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface LeadsState {
  latestLead: any | null;
  customerLeads: any | null;
  customerLeadsPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null;
  customerLeadsFilters: {
    search?: string;
    stages?: string[];
  };
  loadingStates: {
    latestLeadLoading: boolean;
    latestLeadLoaded: boolean;
    customerLeadsLoading: boolean;
  };
  errorStates: {
    latestLeadError: string | null;
    customerLeadsError: string | null;
  };
}

const initialState: LeadsState = {
  latestLead: null,
  customerLeads: null,
  customerLeadsPagination: null,
  customerLeadsFilters: {
    search: undefined,
    stages: undefined,
  },
  loadingStates: {
    latestLeadLoading: false,
    latestLeadLoaded: false,
    customerLeadsLoading: false,
  },
  errorStates: {
    latestLeadError: null,
    customerLeadsError: null,
  },
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    upsertLatestLead: (state, action: PayloadAction<{ lead: any }>) => {
      const { lead } = action.payload;
      state.latestLead = lead;
      state.loadingStates.latestLeadLoaded = true;
      state.loadingStates.latestLeadLoading = false;
      state.errorStates.latestLeadError = null;
    },

    setLatestLeadLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.latestLeadLoading = action.payload.loading;
      if (action.payload.loading) {
        state.errorStates.latestLeadError = null;
      }
    },

    setLatestLeadLoaded: (
      state,
      action: PayloadAction<{ loaded: boolean }>
    ) => {
      state.loadingStates.latestLeadLoaded = action.payload.loaded;
    },

    setLatestLeadError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.latestLeadError = action.payload.error;
      state.loadingStates.latestLeadLoading = false;
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

    clearCustomerLeads: (state) => {
      state.customerLeads = null;
      state.customerLeadsPagination = null;
      state.errorStates.customerLeadsError = null;
    },

    setCustomerLeadsFilters: (
      state,
      action: PayloadAction<{ search?: string; stages?: string[] }>
    ) => {
      state.customerLeadsFilters = {
        search: action.payload.search,
        stages: action.payload.stages,
      };
    },
  },
});

export const {
  upsertLatestLead,
  setLatestLeadLoading,
  setLatestLeadLoaded,
  setLatestLeadError,
  setCustomerLeadsLoading,
  setCustomerLeads,
  setCustomerLeadsError,
  clearCustomerLeads,
  setCustomerLeadsFilters,
} = leadsSlice.actions;

export default leadsSlice.reducer;
