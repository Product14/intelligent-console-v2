import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ServiceState {
  customerServices: any | null;
  customerVehicles: any | null;
  loadingStates: {
    customerServicesLoading: boolean;
    createServiceLoading: boolean;
    updateServiceLoading: boolean;
    customerVehiclesLoading: boolean;
  };
  errorStates: {
    customerServicesError: string | null;
    createServiceError: string | null;
    updateServiceError: string | null;
    customerVehiclesError: string | null;
  };
  createServiceSuccess: boolean;
  updateServiceSuccess: boolean;
}

const initialState: ServiceState = {
  customerServices: null,
  customerVehicles: null,
  loadingStates: {
    customerServicesLoading: false,
    createServiceLoading: false,
    updateServiceLoading: false,
    customerVehiclesLoading: false,
  },
  errorStates: {
    customerServicesError: null,
    createServiceError: null,
    updateServiceError: null,
    customerVehiclesError: null,
  },
  createServiceSuccess: false,
  updateServiceSuccess: false,
};

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    // Customer Services Actions
    setCustomerServices: (state, action: PayloadAction<{ services: any }>) => {
      state.customerServices = action.payload.services;
    },
    setCustomerServicesLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.customerServicesLoading = action.payload.loading;
    },
    setCustomerServicesError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.customerServicesError = action.payload.error;
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
      if (action.payload.success) {
        state.errorStates.createServiceError = null;
      }
    },
    clearCreateServiceState: (state) => {
      state.loadingStates.createServiceLoading = false;
      state.errorStates.createServiceError = null;
      state.createServiceSuccess = false;
    },

    // Update Service Actions
    setUpdateServiceLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.updateServiceLoading = action.payload.loading;
    },
    setUpdateServiceError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.updateServiceError = action.payload.error;
    },
    setUpdateServiceSuccess: (
      state,
      action: PayloadAction<{ success: boolean }>
    ) => {
      state.updateServiceSuccess = action.payload.success;
      if (action.payload.success) {
        state.errorStates.updateServiceError = null;
      }
    },
    clearUpdateServiceState: (state) => {
      state.loadingStates.updateServiceLoading = false;
      state.errorStates.updateServiceError = null;
      state.updateServiceSuccess = false;
    },
    setCustomerVehicles: (state, action: PayloadAction<{ vehicles: any }>) => {
      state.customerVehicles = action.payload.vehicles;
      state.errorStates.customerVehiclesError = null;
    },
    setCustomerVehiclesLoading: (
      state,
      action: PayloadAction<{ loading: boolean }>
    ) => {
      state.loadingStates.customerVehiclesLoading = action.payload.loading;
    },
    setCustomerVehiclesError: (
      state,
      action: PayloadAction<{ error: string | null }>
    ) => {
      state.errorStates.customerVehiclesError = action.payload.error;
    },
  },
});

export const {
  setCustomerServicesLoading,
  setCustomerServices,
  setCustomerServicesError,
  setCreateServiceLoading,
  setCreateServiceError,
  setCreateServiceSuccess,
  clearCreateServiceState,
  setUpdateServiceLoading,
  setUpdateServiceError,
  setUpdateServiceSuccess,
  clearUpdateServiceState,
  setCustomerVehicles,
  setCustomerVehiclesLoading,
  setCustomerVehiclesError,
} = serviceSlice.actions;

export default serviceSlice.reducer;
