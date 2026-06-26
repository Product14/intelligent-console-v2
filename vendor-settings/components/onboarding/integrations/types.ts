// Entity types for integrations
export type IntegrationEntity = 'IMS' | 'PHOTO' | 'CGI';

// Input types for providers
export type InputType = 'ftp' | 'app' | 'console' | 'api';

// FTP configuration structure from API
export interface FtpEntityConfig {
  partnerName: string;
  partnerId?: string;
  dealerId?: string;
  approved?: boolean;
  logo?: string;
  workflowId?: string;
  isActive?: boolean;
  poc_email?: string;
  poc_name?: string;
  poc_contact?: string;
  threshold?: {
    new?: number;
    preOwned?: number;
  };
  photoWorkflowId?: string;
}

// API configuration structure (for Public API integration)
export interface ApiEntityConfig {
  name: string;
  apiKey: string;
  dateCreated: string;
  createdBy: string;
}

// Entity configuration from API response
export interface EntityConfig {
  ftp?: FtpEntityConfig;
  api?: ApiEntityConfig;
  app?: boolean;
  console?: boolean;
  partnerProviderTypes?: string[];
  mediaclone?: boolean;
}

// API Response for GET entity data
export interface IntegrationEntityResponse {
  enterpriseName: string;
  TeamName: string;
  enterpriseID: string;
  userID: string;
  TeamId: string;
  domain: string;
  entity: IntegrationEntity;
  entityconfig: EntityConfig;
}

// Partner information from partners list API
export interface Partner {
  id: string;
  name: string;
  icon: string;
  description?: string;
  supportedInputTypes?: string[];
}

export interface PartnerResponse {
  _id: string;
  name: string;
  logo: string;
  description?: string;
}

// API Response for GET available partners
export interface PartnersListResponse {
  success: boolean;
  data: PartnerResponse[];
}

// Request payload for saving entity data
export interface SaveEntityRequest {
  enterpriseId: string;
  enterpriseName: string;
  teamId: string;
  teamName: string;
  userId: string;
  domain: string;
  entity: IntegrationEntity;
  entityconfig: EntityConfig;
}

// API Response for POST save entity
export interface SaveEntityResponse {
  success: boolean;
  message: string;
  errors?: Array<{ message?: string }>;
  data?: IntegrationEntityResponse;
}

// Fetch entity params
export interface FetchEntityParams {
  enterpriseID: string;
  TeamId: string;
  entity: IntegrationEntity;
}

// Fetch partners params
export interface FetchPartnersParams {
  enterpriseId?: string;
  entity?: IntegrationEntity;
}

/**
 * Onboarding callbacks interface - abstracts studio/vini specific navigation
 * These callbacks are passed from the top-level onboarding flow (studio or vini)
 */
export interface OnboardingCallbacks {
  handleNextStep: (options?: {
    skipCompletion?: boolean;
  }) => void | Promise<void>;
  handlePrevStep: () => void;
  handleSkipStep?: () => void;
  onboardingStartTime?: string | number | null;
}
