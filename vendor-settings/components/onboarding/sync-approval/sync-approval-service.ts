/**
 * Sync Approval Service
 * Handles API calls for integration fetching, publishing fetching, approval saving, etc.
 * Consolidates integrations-service and publishing-service functions needed for sync approval.
 */
import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import type {
  BaseEntityConfig,
  EntityConfig,
  IntegrationEntity,
  IntegrationEntityResponse,
  PublishingEntity,
  PublishingEntityConfig,
  PublishingEntityResponse,
  PublishingStepId,
  SmartViewEntityConfig,
  WebhookEntityConfig,
} from './types';
import {
  isBaseEntityConfig,
  isSmartViewConfig,
  isWebhookConfig,
} from './types';

const BASE_URL = process.env.APP_BACKEND_BASEURL;

// API endpoints
const ENDPOINTS = {
  getEntityConfig: `${BASE_URL}/central-config/v1/integration`,
  saveEntity: `${BASE_URL}/central-config/v1/integration`,
  sendApprovalEmail: `${BASE_URL}/console/v1/product-onboarding/email-integration-request-approval`,
  scheduleMeeting: `${BASE_URL}/console/v1/product-onboarding/schedule-onboarding-meeting`,
  getPocAndCustomerEmail: `${BASE_URL}/user-management/v1/product-line/get-poc-and-customer-email`,
};

// ============================================
// Integration Step Mappings
// ============================================

type IntegrationStepId =
  | 'inventory-provider'
  | 'photo-provider'
  | 'cgi-provider';

const INTEGRATION_STEP_TO_ENTITY: Record<IntegrationStepId, IntegrationEntity> =
  {
    'inventory-provider': 'IMS',
    'photo-provider': 'PHOTO',
    'cgi-provider': 'CGI',
  };

const PUBLISHING_STEP_TO_ENTITY: Record<PublishingStepId, PublishingEntity> = {
  'inventory-provider': 'FTP',
  smartview: 'SMARTVIEW',
  syndication: 'SYNDICATION',
  'webhook-api': 'WEBHOOK',
  platforms: 'SPYNE_PLATFORM',
};

// ============================================
// Integration Data Types
// ============================================

export interface AllIntegrationsData {
  inventory: IntegrationEntityResponse | null;
  photo: IntegrationEntityResponse | null;
  cgi: IntegrationEntityResponse | null;
}

export interface AllPublishingData {
  FTP: PublishingEntityResponse | null;
  SYNDICATION: PublishingEntityResponse | null;
  WEBHOOK: PublishingEntityResponse | null;
  API: PublishingEntityResponse | null;
  SMARTVIEW: PublishingEntityResponse | null;
  SPYNE_PLATFORM: PublishingEntityResponse | null;
}

export interface SaveEntityResponse {
  success: boolean;
  message: string;
  data?: IntegrationEntityResponse;
}

export interface SavePublishingEntityResponse {
  success: boolean;
  message: string;
  data?: PublishingEntityResponse;
}

// ============================================
// Integration Fetch Functions
// ============================================

/** Fetch a single integration entity configuration */
async function fetchIntegrationEntityConfig(
  enterpriseId: string,
  teamId: string,
  entity: IntegrationEntity
): Promise<IntegrationEntityResponse> {
  const response = await CentralAPIHandler.handleGetRequest(
    ENDPOINTS.getEntityConfig,
    {
      enterpriseId,
      teamId,
      entity,
      domain: 'integration',
    }
  );
  return response?.data as IntegrationEntityResponse;
}

/** Fetch all integration entity configurations (inventory, photo, cgi) */
export async function fetchAllEntityConfigs(
  enterpriseId: string,
  teamId: string
): Promise<AllIntegrationsData> {
  const results = await Promise.allSettled([
    fetchIntegrationEntityConfig(enterpriseId, teamId, 'IMS'),
    fetchIntegrationEntityConfig(enterpriseId, teamId, 'PHOTO'),
    fetchIntegrationEntityConfig(enterpriseId, teamId, 'CGI'),
  ]);

  return {
    inventory: results[0].status === 'fulfilled' ? results[0].value : null,
    photo: results[1].status === 'fulfilled' ? results[1].value : null,
    cgi: results[2].status === 'fulfilled' ? results[2].value : null,
  };
}

/** Fetch only IMS integration entity configuration */
export async function fetchImsEntityConfig(
  enterpriseId: string,
  teamId: string
): Promise<AllIntegrationsData> {
  try {
    const result = await fetchIntegrationEntityConfig(
      enterpriseId,
      teamId,
      'IMS'
    );
    return { inventory: result, photo: null, cgi: null };
  } catch {
    return { inventory: null, photo: null, cgi: null };
  }
}

/** Check if an integration entity is configured */
export function isEntityConfigured(
  entityConfig: EntityConfig | null | undefined
): boolean {
  if (!entityConfig) return false;
  const hasFtp = !!(
    entityConfig.ftp &&
    (entityConfig.ftp.partnerId || entityConfig.ftp.partnerName)
  );
  const hasApi = !!(entityConfig.api && entityConfig.api.apiKey);
  const hasApp = entityConfig.app === true;
  const hasConsole = entityConfig.console === true;
  const hasMediaClone = entityConfig.mediaclone === true;
  return hasFtp || hasApi || hasApp || hasConsole || hasMediaClone;
}

/** Check if an integration response is done */
export function isIntegrationDone(
  response: IntegrationEntityResponse | null
): boolean {
  if (!response) return false;
  return isEntityConfigured(response.entityconfig);
}

// ============================================
// Publishing Fetch Functions
// ============================================

/** Fetch a single publishing entity configuration */
async function fetchPublishingEntityConfig(
  enterpriseId: string,
  teamId: string,
  entity: PublishingEntity
): Promise<PublishingEntityResponse> {
  const response = await CentralAPIHandler.handleGetRequest(
    ENDPOINTS.getEntityConfig,
    {
      enterpriseId,
      teamId,
      domain: 'publish',
      entity,
    }
  );
  return response?.data as PublishingEntityResponse;
}

/** Fetch all publishing entity configurations */
export async function fetchAllPublishingConfigs(
  enterpriseId: string,
  teamId: string
): Promise<AllPublishingData> {
  const results = await Promise.allSettled([
    fetchPublishingEntityConfig(enterpriseId, teamId, 'FTP'),
    fetchPublishingEntityConfig(enterpriseId, teamId, 'SYNDICATION'),
    fetchPublishingEntityConfig(enterpriseId, teamId, 'WEBHOOK'),
    fetchPublishingEntityConfig(enterpriseId, teamId, 'API'),
    fetchPublishingEntityConfig(enterpriseId, teamId, 'SMARTVIEW'),
    fetchPublishingEntityConfig(enterpriseId, teamId, 'SPYNE_PLATFORM'),
  ]);

  return {
    FTP: results[0].status === 'fulfilled' ? results[0].value : null,
    SYNDICATION: results[1].status === 'fulfilled' ? results[1].value : null,
    WEBHOOK: results[2].status === 'fulfilled' ? results[2].value : null,
    API: results[3].status === 'fulfilled' ? results[3].value : null,
    SMARTVIEW: results[4].status === 'fulfilled' ? results[4].value : null,
    SPYNE_PLATFORM: results[5].status === 'fulfilled' ? results[5].value : null,
  };
}

/** Check if a base entity config (inventory-provider, syndication, spyne-platforms) is configured */
function isBaseConfigured(config: BaseEntityConfig): boolean {
  const hasFtp = !!(
    config.ftp &&
    (config.ftp.partnerId || config.ftp.partnerName)
  );
  const hasApi = !!(config.api && config.api.apiKey);
  const hasApp = config.app === true;
  const hasConsole = config.console === true;
  const hasMediaClone = config.mediaclone === true;
  return hasFtp || hasApi || hasApp || hasConsole || hasMediaClone;
}

/** Check if a webhook entity config is configured */
function isWebhookEntityConfigured(config: WebhookEntityConfig): boolean {
  return !!(config.url && config.url.trim() !== '');
}

/** Check if a smartview entity config is configured */
function isSmartViewEntityConfigured(config: SmartViewEntityConfig): boolean {
  return !!(config.website_url && config.website_url.trim() !== '');
}

/** Check if publishing step is configured */
export function isPublishingStepConfigured(
  entityConfig:
    | PublishingEntityConfig
    | WebhookEntityConfig[]
    | null
    | undefined,
  stepId: PublishingStepId
): boolean {
  if (!entityConfig) return false;

  switch (stepId) {
    case 'inventory-provider':
    case 'syndication':
    case 'platforms':
      if (!Array.isArray(entityConfig) && isBaseEntityConfig(entityConfig)) {
        return isBaseConfigured(entityConfig);
      }
      return false;

    case 'smartview':
      if (!Array.isArray(entityConfig) && isSmartViewConfig(entityConfig)) {
        return isSmartViewEntityConfigured(entityConfig);
      }
      return false;

    case 'webhook-api':
      if (Array.isArray(entityConfig)) {
        return entityConfig.some((webhook) =>
          isWebhookEntityConfigured(webhook)
        );
      }
      if (isWebhookConfig(entityConfig)) {
        return isWebhookEntityConfigured(entityConfig);
      }
      if (isBaseEntityConfig(entityConfig)) {
        return !!(entityConfig.api && entityConfig.api.apiKey);
      }
      return false;

    default:
      return false;
  }
}

/** Check if publishing is done */
export function isPublishingDone(
  response: PublishingEntityResponse | null,
  stepId: PublishingStepId
): boolean {
  if (!response) return false;
  return isPublishingStepConfigured(response.entityconfig, stepId);
}

/** Check if webhook-api step is done (checks both WEBHOOK and API entities) */
export function isWebhookApiStepDone(
  webhookResponse: PublishingEntityResponse | null,
  apiResponse: PublishingEntityResponse | null
): boolean {
  const webhookDone = isPublishingDone(webhookResponse, 'webhook-api');
  const apiDone =
    apiResponse?.entityconfig &&
    !Array.isArray(apiResponse.entityconfig) &&
    isBaseEntityConfig(apiResponse.entityconfig)
      ? !!(apiResponse.entityconfig.api && apiResponse.entityconfig.api.apiKey)
      : false;
  return webhookDone || apiDone;
}

// ============================================
// Save Functions
// ============================================

/** Save integration entity config */
export async function saveIntegrationStepConfig(
  stepId: IntegrationStepId,
  params: {
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
  },
  entityconfig: EntityConfig
): Promise<SaveEntityResponse> {
  const entity = INTEGRATION_STEP_TO_ENTITY[stepId];
  const response = await CentralAPIHandler.handlePostRequest(
    ENDPOINTS.saveEntity,
    {
      enterpriseId: params.enterpriseId,
      enterpriseName: params.enterpriseName,
      teamId: params.teamId,
      teamName: params.teamName,
      userId: params.userId,
      domain: 'integration',
      entity,
      entityconfig,
    }
  );
  return response as SaveEntityResponse;
}

/** Save publishing entity config */
export async function savePublishingStepConfig(
  stepId: 'inventory-provider' | 'syndication',
  params: {
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
  },
  entityconfig: PublishingEntityConfig
): Promise<SavePublishingEntityResponse> {
  const entity = PUBLISHING_STEP_TO_ENTITY[stepId];
  const response = await CentralAPIHandler.handlePostRequest(
    ENDPOINTS.saveEntity,
    {
      enterpriseId: params.enterpriseId,
      enterpriseName: params.enterpriseName,
      teamId: params.teamId,
      teamName: params.teamName,
      userId: params.userId,
      domain: 'publish',
      entity,
      entityconfig,
    }
  );
  return response as SavePublishingEntityResponse;
}

// ============================================
// Email / Meeting Functions
// ============================================

/** Send approval email */
export async function sendApprovalEmail(payload: {
  to: string[];
  cc: string[];
  bcc: string[];
  from: string;
  subject: string;
  template: string;
  templateData: {
    partnerName: string;
    dealerId: string;
    description: string;
  };
}): Promise<void> {
  await CentralAPIHandler.handlePostRequest(
    ENDPOINTS.sendApprovalEmail,
    payload
  );
}

/** Schedule onboarding meeting */
export async function scheduleMeeting(payload: {
  startTime: string;
  endTime: string;
  timeZone: string;
  attendees: string[];
  summary: string;
}): Promise<void> {
  await CentralAPIHandler.handlePostRequest(ENDPOINTS.scheduleMeeting, payload);
}

/** Fetch POC and customer emails for prefilling */
export async function fetchPocAndCustomerEmail(
  productLineId: string,
  enterpriseId: string
): Promise<{ pocEmail: string; dealerEmail: string }> {
  const response = await CentralAPIHandler.handleGetRequest(
    ENDPOINTS.getPocAndCustomerEmail,
    { productLineId, enterpriseId }
  );
  const data = response?.data;
  return {
    pocEmail: data?.obPocEmail || '',
    dealerEmail: data?.dealearEmail || '',
  };
}

/** Fetch partner email by partner ID */
export async function fetchPartnerEmail(partnerId: string): Promise<string> {
  if (!partnerId) return '';
  try {
    const response = await CentralAPIHandler.handleGetRequest(
      `${BASE_URL}/partner/${partnerId}`
    );
    return response?.data?.email || '';
  } catch (error) {
    console.error('Failed to fetch partner email:', error);
    return '';
  }
}

// Export service as named object
const syncApprovalService = {
  fetchAllEntityConfigs,
  fetchImsEntityConfig,
  fetchAllPublishingConfigs,
  isEntityConfigured,
  isIntegrationDone,
  isPublishingStepConfigured,
  isPublishingDone,
  isWebhookApiStepDone,
  saveIntegrationStepConfig,
  savePublishingStepConfig,
  sendApprovalEmail,
  scheduleMeeting,
  fetchPocAndCustomerEmail,
  fetchPartnerEmail,
};

export default syncApprovalService;
