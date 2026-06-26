// Customer Details API Response Types

export interface CustomerData {
  name: string;
  mobile_number: string;
  emails: string[];
  extracted_name: string | null;
  address: {
    _id: string;
  };
  created_date: string;
}

export interface LeadInfo {
  stage: string;
  source: string;
  lead_type: string;
  assigned_to: string;
  budget: string[];
  created_by: string;
  created_date: string;
  vehicle_interested_details: any | null;
  ai_score: any | null;
}

export interface CustomerDetailsData {
  customer_id: string;
  lead_id: string;
  enterprise_id: string;
  team_id: string;
  customer_data: CustomerData;
  lead_info: LeadInfo;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetailsApiResponse {
  message: string;
  data: CustomerDetailsData;
  error: boolean;
}

// Transformed data for RecordDetails component
export interface RecordDetailsData {
  phone: string;
  email: string;
  address: string;
  lastContact: string;
  id: string;
}
