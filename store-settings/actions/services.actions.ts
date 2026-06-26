import { createAction } from '@reduxjs/toolkit';

// Upsert Latest Service Action
export const upsertLatestService = createAction(
  'services/upsertLatestService',
  (service: any) => ({
    payload: { service },
  })
);

// Set Latest Service Loading State
export const setLatestServiceLoading = createAction(
  'services/setLatestServiceLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

// Set Latest Service Loaded State
export const setLatestServiceLoaded = createAction(
  'services/setLatestServiceLoaded',
  (loaded: boolean) => ({
    payload: { loaded },
  })
);

// Set Latest Service Error State
export const setLatestServiceError = createAction(
  'services/setLatestServiceError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Customer Services Actions (for customer profile page)
export const fetchCustomerServices = createAction(
  'services/fetchCustomerServices',
  ({
    customerId,
    enterpriseId,
    teamId,
    page = 1,
    limit = 10,
    shouldUpsertLatestService = false,
    search,
    status,
  }: {
    customerId: string;
    enterpriseId: string;
    teamId: string;
    page?: number;
    limit?: number;
    shouldUpsertLatestService?: boolean;
    search?: string;
    status?: string[];
  }) => ({
    payload: {
      customerId,
      enterpriseId,
      teamId,
      page,
      limit,
      shouldUpsertLatestService,
      search,
      status,
    },
  })
);

export const setCustomerServices = createAction(
  'services/setCustomerServices',
  (customerServices: any) => ({
    payload: { customerServices },
  })
);

export const setCustomerServicesLoading = createAction(
  'services/setCustomerServicesLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCustomerServicesError = createAction(
  'services/setCustomerServicesError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const clearCustomerServices = createAction(
  'services/clearCustomerServices',
  () => ({
    payload: {},
  })
);

// Customer Services Filters Actions
export const setCustomerServicesFilters = createAction(
  'services/setCustomerServicesFilters',
  ({ search, status }: { search?: string; status?: string[] }) => ({
    payload: { search, status },
  })
);

// Create Customer Service Actions
export const createCustomerService = createAction(
  'services/createCustomerService',
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
  'services/setCreateServiceLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCreateServiceError = createAction(
  'services/setCreateServiceError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setCreateServiceSuccess = createAction(
  'services/setCreateServiceSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);
