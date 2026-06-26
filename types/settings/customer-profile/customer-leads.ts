// Customer Leads API Response Types

export interface AssignedTo {
  user_id: string;
  user_name: string;
  email_id: string;
  contact_no: string;
  isd_code: string;
}

export interface StageCount {
  NEW_LEAD: number;
  STORE_VISIT: number;
  ENGAGED: number;
  PROPOSAL: number;
  AI_LEAD: number;
}

export interface AdditionalDetails {
  year: string;
  make: string;
  model: string;
  stock_number: string;
  registration_number: string;
  vin: string;
  thumbnail_output_url: string;
  price: string;
  currency: string;
  currencySign: string;
  fuel: string;
  mileage: string;
  transmission_short: string;
}

export interface Entity {
  _id: string;
  entity_id: string;
  enterprise_id: string;
  team_id: string;
  is_available: boolean;
  type: string;
  description: string | null;
  images: string[];
  stage: string;
  stageCount: StageCount;
  createdAt: string;
  updatedAt: string;
  __v: number;
  external_id: string;
  additionalDetails: AdditionalDetails;
}

export interface CustomerLead {
  _id: string;
  customer_id: string;
  team_id: string;
  enterprise_id: string;
  lead_id: string;
  stage: string;
  source: string;
  is_deleted: boolean;
  created_by: string;
  lead_type: string;
  assigned_to: AssignedTo;
  createdAt: string;
  updatedAt: string;
  __v: number;
  service_type: string;
  budget: string[];
  entities: Entity[];
  lead_status: string;
}

export interface CustomerLeadsPagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CustomerLeadsFilters {
  customer_id: string;
  lead_type: string;
}

export interface CustomerLeadsData {
  leads: CustomerLead[];
  pagination: CustomerLeadsPagination;
  filters: CustomerLeadsFilters;
}

export interface CustomerLeadsApiResponse {
  success: boolean;
  message: string;
  data: CustomerLeadsData;
}

// User List API Response Types
export interface User {
  user_id: string;
  user_name: string;
  contact_no: string;
  email_id: string;
  enterprise_id: string;
  is_active: number;
  team_id: string;
  created_at: string;
  label: string;
  value: string;
}

export interface UserListData {
  activeUsers: Record<string, User>;
  inactiveUsers: Record<string, User>;
  pagination: {
    currentPage: number;
  };
  allUserIds: string[];
}

export interface UserListApiResponse {
  message: string;
  error: boolean;
  code: string;
  details: any;
  data: UserListData;
}

// Assignment API Types
export interface AssignmentPayload {
  lead_id: string;
  user_id?: string;
  action: 'assign' | 'unassign';
}
