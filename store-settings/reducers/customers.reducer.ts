import { LeadType } from '@/models/lead-type.enum';
import { SortOrder } from '@/models/pagination.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface CustomersFiltersState {
  enterprise_id: string;
  team_id: string;
  stage?: string;
  lead_type?: LeadType;
  search?: string;
  sort_by?: string | null;
  sort_order?: SortOrder | null;
  start_date?: string;
  end_date?: string;
  assigned_to?: string;
}

export interface CustomersPaginationState {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface CustomersState {
  items: any[];
  loading: boolean;
  error: string | null;
  filters: CustomersFiltersState;
  pagination: CustomersPaginationState;
  // Customer creation states
  creationLoading: boolean;
  creationError: string | null;
  creationSuccess: any | null;
}

const initialState: CustomersState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    enterprise_id: '',
    team_id: '',
    stage: undefined,
    lead_type: undefined,
    search: undefined,
    sort_by: null,
    sort_order: null,
    start_date: undefined,
    end_date: undefined,
    assigned_to: undefined,
  },
  pagination: {
    page: 1,
    page_size: 10,
    total_count: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
  // Customer creation initial states
  creationLoading: false,
  creationError: null,
  creationSuccess: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomersDashboard(
      state,
      action: PayloadAction<{
        data: any[];
        pagination?: {
          current_page?: number;
          total_pages?: number;
          total_count?: number;
          has_next?: boolean;
          has_prev?: boolean;
          limit?: number;
        };
      }>
    ) {
      const { data, pagination } = action.payload;
      state.items = data || [];

      if (pagination) {
        state.pagination.total_pages =
          pagination.total_pages ?? state.pagination.total_pages;
        state.pagination.total_count =
          pagination.total_count ?? state.pagination.total_count;
        state.pagination.has_next =
          pagination.has_next ?? state.pagination.has_next;
        state.pagination.has_prev =
          pagination.has_prev ?? state.pagination.has_prev;
        if (typeof pagination.current_page === 'number') {
          state.pagination.page = pagination.current_page;
        }
        if (typeof pagination.limit === 'number') {
          state.pagination.page_size = pagination.limit;
        }
      }
      state.loading = false;
      state.error = null;
    },
    setCustomersLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCustomersError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    setCustomerFilters(
      state,
      action: PayloadAction<Partial<CustomersFiltersState>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCustomerPagination(
      state,
      action: PayloadAction<{ page?: number; page_size?: number }>
    ) {
      if (typeof action.payload.page === 'number')
        state.pagination.page = action.payload.page;
      if (typeof action.payload.page_size === 'number')
        state.pagination.page_size = action.payload.page_size;
    },
    // Customer creation reducers
    setCustomerCreationLoading(state, action: PayloadAction<boolean>) {
      state.creationLoading = action.payload;
      if (action.payload) {
        state.creationError = null;
        state.creationSuccess = null;
      }
    },
    setCustomerCreationSuccess(state, action: PayloadAction<any>) {
      state.creationSuccess = action.payload;
      state.creationLoading = false;
      state.creationError = null;
    },
    setCustomerCreationError(state, action: PayloadAction<string | null>) {
      state.creationError = action.payload;
      state.creationLoading = false;
      state.creationSuccess = null;
    },
  },
});

export const {
  setCustomersDashboard,
  setCustomersLoading,
  setCustomersError,
  setCustomerFilters,
  setCustomerPagination,
  setCustomerCreationLoading,
  setCustomerCreationSuccess,
  setCustomerCreationError,
} = customersSlice.actions;

export default customersSlice.reducer;
