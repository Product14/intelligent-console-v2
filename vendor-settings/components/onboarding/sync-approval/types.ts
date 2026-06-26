/**
 * Types for Sync Approval step
 * This step handles approval for FTP integrations (both input and output)
 */

// ============================================
// Integration Types (from integrations module)
// ============================================

export type IntegrationEntity = 'IMS' | 'PHOTO' | 'CGI';

export interface FtpEntityConfig {
  partnerName: string;
  partnerId?: string;
  dealerId?: string;
  approved?: boolean;
  mailSent?: boolean;
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
}

export interface ApiEntityConfig {
  name: string;
  apiKey: string;
  dateCreated: string;
  createdBy: string;
}

export interface EntityConfig {
  ftp?: FtpEntityConfig;
  api?: ApiEntityConfig;
  app?: boolean;
  console?: boolean;
  partnerProviderTypes?: string[];
  mediaclone?: boolean;
}

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

// ============================================
// Publishing Types (subset needed for sync approval)
// ============================================

export type PublishingEntity =
  | 'FTP'
  | 'PARTNER'
  | 'SMARTVIEW'
  | 'SYNDICATION'
  | 'WEBHOOK'
  | 'API'
  | 'SPYNE_PLATFORM';

export type PublishingStepId =
  | 'inventory-provider'
  | 'smartview'
  | 'syndication'
  | 'webhook-api'
  | 'platforms';

export interface PublishingFtpConfig {
  partnerName: string;
  partnerId?: string;
  dealerId?: string;
  approved?: boolean;
  mailSent?: boolean;
  logo?: string;
  workflowId?: string;
  isActive?: boolean;
  poc_email?: string;
  poc_name?: string;
  poc_contact?: string;
}

export interface PublishingApiConfig {
  name: string;
  apiKey: string;
  dateCreated: string;
  createdBy: string;
}

export interface WebhookMediaEventConfig {
  qcDone?: boolean;
  processingDone?: boolean;
  failed?: boolean;
}

export interface WebhookEventsConfig {
  catalog?: WebhookMediaEventConfig;
  spin?: WebhookMediaEventConfig;
  featureVideo?: WebhookMediaEventConfig;
  assetUploadDone?: boolean;
  inventoryChange?: boolean;
}

export interface WebhookAdvancedConfig {
  timeoutSeconds?: number;
  maxRetries?: number;
  retryScheduleSeconds?: number[];
}

export interface WebhookHeadersConfig {
  [key: string]: string;
}

export interface WebhookEntityConfig {
  id?: string;
  name?: string;
  isActive?: boolean;
  url: string;
  method?: 'POST' | 'GET' | 'PUT' | 'PATCH';
  headers?: WebhookHeadersConfig;
  webhookEvents?: WebhookEventsConfig;
  advancedConfig?: WebhookAdvancedConfig;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SmartViewEntityConfig {
  website_url?: string;
  website_provider?: string;
  vehicle_id_through?: 'VIN' | 'STOCK_NUMBER';
  vehichle_id_xpath?: string;
  vehichle_id_xpath_mobile?: string;
  div_path?: string;
  div_path_mobile?: string;
  integration_button?: boolean;
  integration_page_loader?: boolean;
  version?: 't1' | 't2';
  button_text?: string;
  button_size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  button_color_type?: 'purple' | 'white' | 'custom';
  button_color_hex?: string;
  delivery_config_spin?: string;
  delivery_config_image?: string;
  delivery_config_video?: string;
  script_url?: string;
  script_id?: string;
}

export interface BaseEntityConfig {
  ftp?: PublishingFtpConfig;
  api?: PublishingApiConfig;
  app?: boolean;
  console?: boolean;
  partnerProviderTypes?: string[];
  mediaclone?: boolean;
}

export type PublishingEntityConfig =
  | BaseEntityConfig
  | WebhookEntityConfig
  | SmartViewEntityConfig;

// Type guards
export function isWebhookConfig(
  config: PublishingEntityConfig
): config is WebhookEntityConfig {
  return (
    'url' in config &&
    ('webhookEvents' in config || 'method' in config || 'headers' in config)
  );
}

export function isSmartViewConfig(
  config: PublishingEntityConfig
): config is SmartViewEntityConfig {
  return (
    'website_url' in config ||
    'vehichle_id_xpath' in config ||
    'script_url' in config ||
    'integration_button' in config ||
    'integration_page_loader' in config
  );
}

export function isBaseEntityConfig(
  config: PublishingEntityConfig
): config is BaseEntityConfig {
  return !isWebhookConfig(config) && !isSmartViewConfig(config);
}

export interface PublishingEntityResponse {
  enterpriseName: string;
  TeamName: string;
  enterpriseID: string;
  userID: string;
  TeamId: string;
  domain: string;
  entity: PublishingEntity;
  entityconfig: PublishingEntityConfig | WebhookEntityConfig[];
}

// ============================================
// Sync Approval Types
// ============================================

/** Approval status for integrations */
export type ApprovalStatus = 'pending' | 'mail sent' | 'approved' | 'skipped';

/** FTP configuration structure for approval cards */
export interface ApprovalFTPConfig {
  partnerName: string;
  partnerId: string;
  partnerIcon: string;
  dealerId: string;
  approved?: boolean;
}

/** Approval data for each integration */
export interface ApprovalData {
  required: boolean;
  status: ApprovalStatus;
}

/** Input type structure for approval cards (FTP only - used for approval logic) */
export interface ApprovalInputType {
  FTP: ApprovalFTPConfig;
}

/** Integration item for approval cards */
export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  type: 'Input' | 'Output';
  approvalData: ApprovalData;
  /** Whether data has been added/configured for this integration or publishing step */
  isDataAdded: boolean;
  inputType?: ApprovalInputType;
  outputType?: ApprovalInputType;
  /** Original entity config for saving and badge display */
  originalEntityConfig?:
    | EntityConfig
    | PublishingEntityConfig
    | WebhookEntityConfig[]
    | null;
  /** Entity type for API calls */
  entity?: string;
}

/** Current view/screen state for sync-approval step */
export type SyncApprovalView = 'main' | 'email-form';

/** Approval substep - tracks which integration(s) are being approved */
export interface ApprovalSubstep {
  /** Integration IDs being approved (can be group approval or single approval) */
  integrationIds: string[];
  partnerName: string;
  partnerId: string;
  dealerId: string;
  isInput: boolean;
  isGrouped: boolean;
  /** Current status of these integrations */
  currentStatus: ApprovalStatus;
}

/** Email form data structure */
export interface EmailFormData {
  toEmail: string;
  ccSpynePoc: string;
  ccDealershipEmail: string;
  dealerId: string;
  subject: string;
  message: string;
}

/** Grouped integration by FTP partner */
export interface GroupedIntegration {
  partnerId: string;
  partnerName: string;
  partnerIcon: string;
  inputIntegrations: IntegrationItem[];
  outputIntegrations: IntegrationItem[];
  status: ApprovalStatus;
  firstInputIndex: number;
}

/** All integrations data for sync approval */
export interface SyncApprovalData {
  inputIntegrations: IntegrationItem[];
  outputIntegrations: IntegrationItem[];
}

/** Input integrations data from API (raw) */
export interface InputIntegrationsRawData {
  inventory: IntegrationEntityResponse | null;
  photo: IntegrationEntityResponse | null;
  cgi: IntegrationEntityResponse | null;
}

/** Output integrations data from API (raw) */
export interface OutputIntegrationsRawData {
  FTP: PublishingEntityResponse | null;
  SYNDICATION: PublishingEntityResponse | null;
  WEBHOOK: PublishingEntityResponse | null;
  API: PublishingEntityResponse | null;
  SMARTVIEW: PublishingEntityResponse | null;
  SPYNE_PLATFORM: PublishingEntityResponse | null;
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
  onboardingStartTime?: string | number | null;
}
