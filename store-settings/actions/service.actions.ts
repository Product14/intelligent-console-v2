import { createAction } from '@reduxjs/toolkit';

// Fetch Customer Services Actions
export const fetchCustomerServices = createAction(
  'service/fetchCustomerServices',
  ({
    customerId,
    enterpriseId,
    teamId,
  }: {
    customerId: string;
    enterpriseId: string;
    teamId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
  }) => ({
    payload: { customerId, enterpriseId, teamId },
  })
);

export const setCustomerServices = createAction(
  'service/setCustomerServices',
  (services: any) => ({
    payload: { services },
  })
);

export const setCustomerServicesLoading = createAction(
  'service/setCustomerServicesLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCustomerServicesError = createAction(
  'service/setCustomerServicesError',
  (error: string | null) => ({
    payload: { error },
  })
);

// Create Customer Service Actions
export const createCustomerService = createAction(
  'service/createCustomerService',
  (serviceData: {
    customerId: string;
    enterpriseId: string;
    teamId: string;
    serviceTypes: string[];
    vehicleInformation: {
      vin: string;
      year?: string;
      make?: string;
      model?: string;
      trim?: string;
      registrationNumber?: string;
    };
    serviceDescription?: string;
    serviceDate?: string;
    estimatedCost?: number;
    stage?: string;
    assignedTo?: string;
    notes?: string;
  }) => ({
    payload: serviceData,
  })
);

export const setCreateServiceLoading = createAction(
  'service/setCreateServiceLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCreateServiceError = createAction(
  'service/setCreateServiceError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setCreateServiceSuccess = createAction(
  'service/setCreateServiceSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);

export const clearCreateServiceState = createAction(
  'service/clearCreateServiceState',
  () => ({
    payload: {},
  })
);

// Update Customer Service Actions
export const updateCustomerService = createAction(
  'service/updateCustomerService',
  (serviceData: {
    leadId: string;
    customerId: string;
    enterpriseId: string;
    teamId: string;
    serviceTypes: string[];
    vehicleInformation: {
      vin: string;
      year: string;
      make: string;
      model: string;
      trim: string;
      registrationNumber?: string;
    };
    serviceDescription?: string;
    serviceDate?: string;
    estimatedCost?: number;
    stage?: string;
    assignedTo?: string;
  }) => ({
    payload: serviceData,
  })
);

export const setUpdateServiceLoading = createAction(
  'service/setUpdateServiceLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setUpdateServiceError = createAction(
  'service/setUpdateServiceError',
  (error: string | null) => ({
    payload: { error },
  })
);

export const setUpdateServiceSuccess = createAction(
  'service/setUpdateServiceSuccess',
  (success: boolean) => ({
    payload: { success },
  })
);

export const clearUpdateServiceState = createAction(
  'service/clearUpdateServiceState',
  () => ({
    payload: {},
  })
);

// Customer Vehicles Actions
export const fetchCustomerVehicles = createAction(
  'service/fetchCustomerVehicles',
  ({
    customerId,
    page,
    pageSize,
  }: {
    customerId: string;
    page?: number;
    pageSize?: number;
  }) => ({
    payload: { customerId, page, pageSize },
  })
);

export const setCustomerVehicles = createAction(
  'service/setCustomerVehicles',
  (vehicles: any) => ({
    payload: { vehicles },
  })
);

export const setCustomerVehiclesLoading = createAction(
  'service/setCustomerVehiclesLoading',
  (loading: boolean) => ({
    payload: { loading },
  })
);

export const setCustomerVehiclesError = createAction(
  'service/setCustomerVehiclesError',
  (error: string | null) => ({
    payload: { error },
  })
);
