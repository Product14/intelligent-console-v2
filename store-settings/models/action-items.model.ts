export interface ActionItem {
  _id: string;
  id?: string; // For backward compatibility with existing UI
  enterprise_id: string;
  team_id: string;
  lead_id: string;
  assigned_to: string;
  description: string;
  due_date: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
  added_by: string;
  is_completed: boolean;
  meta: {
    customer_id: string;
    vehicle_details?: any;
    attemptsRemaining?: number;
    callSid?: string;
    isConversational?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  customer: {
    customer_id: string;
    name: string;
    mobile: string;
    emails: string[];
  };
  // Additional fields that might be present
  intent?: string;
  leadEntityMappings?: any[];
  entity?: any;
  // Computed fields for UI compatibility
  title?: string; // Will be mapped from description
  vehicleInfo?: string;
  customerName?: string; // Will be mapped from customer.name
  customerPhone?: string; // Will be mapped from customer.mobile
  customerEmail?: string;
  tagText?: string;
  assignee?: {
    id?: string;
    name: string;
    avatar?: string;
  };
  completed?: boolean; // Will be mapped from is_completed
  date?: string; // Will be mapped from due_date
}

// Interface for grouped customer data
export interface GroupedCustomerData {
  _id: string; // customer_id
  customer: {
    customer_id: string;
    name: string;
    mobile: string;
    emails: string[];
  };
  actionItems: ActionItem[];
  count: number;
}

// Regular response (when groupByCustomer=false)
export interface ActionItemsResponse {
  data: ActionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalCounts?: {
    total: number;
    completed: number;
    incomplete: number;
  };
}

// Grouped response (when groupByCustomer=true)
export interface GroupedActionItemsResponse {
  data: GroupedCustomerData[];
  grouped: boolean;
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalCounts?: {
    total: number;
    completed: number;
    incomplete: number;
  };
}

export interface FetchActionItemsParams {
  enterpriseId: string;
  teamId: string;
  isCompleted?: boolean;
  groupByCustomer?: boolean; // Add the new parameter
  startDate?: string; // ISO date string for filtering start date
  endDate?: string; // ISO date string for filtering end date
  page?: number; // Page number for pagination
  limit?: number; // Number of items per page
  sortBy?: 'createdAt' | 'dueDate' | 'customerName'; // Add sort field parameter
  sortOrder?: 'asc' | 'desc'; // Add sort order parameter
  intent?: string; // Add intent parameter for filtering by intent (comma-separated for multiple)
  search?: string; // Add search parameter for keyword searching
  serviceType?: string; // Add serviceType parameter for service filtering
  customerId?: string; // Add customerId parameter for customer filtering
  createdAtStart?: string; // ISO date string for filtering by createdAt start
  createdAtEnd?: string; // ISO date string for filtering by createdAt end
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Add resolution steps interface
export interface ResolutionSteps {
  actionItemId: string;
  resolutionSteps: string;
  generatedAt: string;
}

export interface ActionItemsStoreInterface {
  actionItems: ActionItem[];
  actionItemsLoading: boolean;
  actionItemsLoaded: boolean;
  actionItemsError: boolean;
  selectedActionItem: ActionItem | null;
  pagination: PaginationMeta | null;
  // Add total counts from API
  totalCounts: {
    total: number;
    completed: number;
    incomplete: number;
  } | null;
  // Add resolution steps state
  resolutionSteps: { [actionItemId: string]: ResolutionSteps } | null;
  resolutionStepsLoading: boolean;
  resolutionStepsError: boolean;
}
