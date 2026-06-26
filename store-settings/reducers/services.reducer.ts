import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ServicesState {
  latestService: any | null;
  customerServices: any | null;
  customerServicesPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null;
  customerServicesFilters: {
    search?: string;
    status?: string[];
  };
  loadingStates: {
    latestServiceLoading: boolean;
    latestServiceLoaded: boolean;
    customerServicesLoading: boolean;
    createServiceLoading: boolean;
  };
  errorStates: {
    latestServiceError: string | null;
    customerServicesError: string | null;
    createServiceError: string | null;
  };
  createServiceSuccess: boolean;
}

const initialState: ServicesState = {
  latestService: null,
  customerServices: null,
  customerServicesPagination: null,
  customerServicesFilters: {
    search: undefined,
    status: undefined,
  },
  loadingStates: {
    latestServiceLoading: false,
    latestServiceLoaded: false,
    customerServicesLoading: false,
    createServiceLoading: false,
  },
  errorStates: {
    latestServiceError: null,
    customerServicesError: null,
    createServiceError: null,
  },
  createServiceSuccess: false,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    upsertLatestService: (state, action: PayloadAction<{ service: any }>) => {
      const { service } = action.payload;
      state.latestService = service;
      state.loadingStates.latestServiceLoaded = true;
      state.loadingStates.latestServiceLoading = false;
      state.errorStates.latestServiceError = null;
    },

    setLatestServiceLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.latestServiceLoading = action.payload.loading;
      if (action.payload.loading) {
        state.errorStates.latestServiceError = null;
      }
    },

    setLatestServiceLoaded: (
      state,
      action: PayloadAction<{ loaded: boolean }>
    ) => {
      state.loadingStates.latestServiceLoaded = action.payload.loaded;
    },

    setLatestServiceError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.latestServiceError = action.payload.error;
      state.loadingStates.latestServiceLoading = false;
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

    clearCustomerServices: (state) => {
      state.customerServices = null;
      state.customerServicesPagination = null;
      state.errorStates.customerServicesError = null;
    },

    setCustomerServicesFilters: (
      state,
      action: PayloadAction<{ search?: string; status?: string[] }>
    ) => {
      state.customerServicesFilters = {
        search: action.payload.search,
        status: action.payload.status,
      };
    },

    // Create Service Actions
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
      state.createServiceSuccess = action.payload.success;
    },
  },
});

export const {
  upsertLatestService,
  setLatestServiceLoading,
  setLatestServiceLoaded,
  setLatestServiceError,
  setCustomerServicesLoading,
  setCustomerServices,
  setCustomerServicesError,
  clearCustomerServices,
  setCustomerServicesFilters,
  setCreateServiceLoading,
  setCreateServiceError,
  setCreateServiceSuccess,
} = servicesSlice.actions;

export default servicesSlice.reducer;
