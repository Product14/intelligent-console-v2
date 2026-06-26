import { LeadType } from '@/models/lead-type.enum';
import { SortOrder } from '@/models/pagination.model';
import { createAction } from '@reduxjs/toolkit';

export const fetchCustomersDashboard = createAction(
  'customers/fetchCustomersDashboard',
  (payload: {
    enterprise_id: string;
    team_id: string;
    stage?: string;
    lead_type?: string;
    service_type?: string;
    search?: string;
    sort_by?: string;
    start_date?: string;
    end_date?: string;
    assigned_to?: string;
    sort_order?: SortOrder;
    page?: number;
    page_size?: number;
    customer_id?: string;
  }) => ({ payload })
);

export const setCustomersDashboard = createAction(
  'customers/setCustomersDashboard',
  (payload: {
    data: any[];
    pagination?: {
      current_page?: number;
      total_pages?: number;
      total_count?: number;
      has_next?: boolean;
      has_prev?: boolean;
      limit?: number;
    };
  }) => ({ payload })
);

export const setCustomersLoading = createAction(
  'customers/setCustomersLoading',
  (payload: boolean) => ({ payload })
);

export const setCustomersError = createAction(
  'customers/setCustomersError',
  (payload: string | null) => ({ payload })
);

export const setCustomerFilters = createAction(
  'customers/setCustomerFilters',
  (
    payload: Partial<{
      enterprise_id: string;
      team_id: string;
      stage: string;
      lead_type: LeadType;
      search: string;
      sort_by: string;
      sort_order: SortOrder;
      start_date: string;
      end_date: string;
      assigned_to: string;
    }>
  ) => ({ payload })
);

export const setCustomerPagination = createAction(
  'customers/setCustomerPagination',
  (payload: { page?: number; page_size?: number }) => ({ payload })
);

// Customer creation actions
export const createCustomer = createAction(
  'customers/createCustomer',
  (payload: {
    enterprise_id: string;
    team_id: string;
    assigned_to?: string;
    source: string;
    stage: string;
    service_type?: string;
    customer: {
      name: string;
      mobile_number: string;
      email?: string;
    };
  }) => ({ payload })
);

export const setCustomerCreationLoading = createAction(
  'customers/setCustomerCreationLoading',
  (payload: boolean) => ({ payload })
);

export const setCustomerCreationSuccess = createAction(
  'customers/setCustomerCreationSuccess',
  (payload: any) => ({ payload })
);

export const setCustomerCreationError = createAction(
  'customers/setCustomerCreationError',
  (payload: string | null) => ({ payload })
);
