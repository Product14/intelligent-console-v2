import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import type {
  EntityConfig,
  FetchEntityParams,
  FetchPartnersParams,
  IntegrationEntity,
  IntegrationEntityResponse,
  Partner,
  PartnerResponse,
  PartnersListResponse,
  SaveEntityRequest,
  SaveEntityResponse,
} from './types';

const BASE_URL = process.env.APP_BACKEND_BASEURL;

// API endpoints
const ENDPOINTS = {
  getEntityConfig: `${BASE_URL}/central-config/v1/integration`,
  getPartners: `${BASE_URL}/partner/category`,
  saveEntity: `${BASE_URL}/central-config/v1/integration`,
};

// Step ID type used in the integrations context
export type IntegrationStepId =
  | 'inventory-provider'
  | 'photo-provider'
  | 'cgi-provider';

// Mapping from step ID to API entity type
const STEP_TO_ENTITY_MAP: Record<IntegrationStepId, IntegrationEntity> = {
  'inventory-provider': 'IMS',
  'photo-provider': 'PHOTO',
  'cgi-provider': 'CGI',
};

// All integrations data result type
export interface AllIntegrationsData {
  inventory: IntegrationEntityResponse | null;
  photo: IntegrationEntityResponse | null;
  cgi: IntegrationEntityResponse | null;
}

/**
 * Fetch integration entity configuration
 */
export async function fetchEntityConfig(
  params: FetchEntityParams
): Promise<IntegrationEntityResponse> {
  const { enterpriseID, TeamId, entity } = params;
  const response = await CentralAPIHandler.handleGetRequest(
    ENDPOINTS.getEntityConfig,
    {
      enterpriseId: enterpriseID,
      teamId: TeamId,
      entity,
      domain: 'integration',
    }
  );

  return response?.data as IntegrationEntityResponse;
}

/**
 * Check if an entity configuration indicates the integration is "done"
 */
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

/**
 * Check if an integration response indicates the integration is "done"
 */
export function isIntegrationDone(
  response: IntegrationEntityResponse | null
): boolean {
  if (!response) return false;
  return isEntityConfigured(response.entityconfig);
}

/**
 * Fetch all entity configurations (inventory, photo, cgi)
 */
export async function fetchAllEntityConfigs(
  enterpriseID: string,
  TeamId: string
): Promise<AllIntegrationsData> {
  const results = await Promise.allSettled([
    fetchEntityConfig({ enterpriseID, TeamId, entity: 'IMS' }),
    fetchEntityConfig({ enterpriseID, TeamId, entity: 'PHOTO' }),
    fetchEntityConfig({ enterpriseID, TeamId, entity: 'CGI' }),
  ]);

  return {
    inventory: results[0].status === 'fulfilled' ? results[0].value : null,
    photo: results[1].status === 'fulfilled' ? results[1].value : null,
    cgi: results[2].status === 'fulfilled' ? results[2].value : null,
  };
}

/**
 * Get the API entity type for a given step ID
 */
export function getEntityForStep(stepId: IntegrationStepId): IntegrationEntity {
  return STEP_TO_ENTITY_MAP[stepId];
}

/**
 * Fetch available partners list
 */
export async function fetchPartners(
  params?: FetchPartnersParams
): Promise<Partner[]> {
  const category = params?.entity || 'IMS';

  const response = await CentralAPIHandler.handleGetRequest(
    ENDPOINTS.getPartners,
    {
      category,
    }
  );

  const partnersResponse = response as PartnersListResponse;
  return (
    partnersResponse?.data?.map((partner: PartnerResponse) => ({
      id: partner?.['_id'] || '',
      name: partner?.name || '',
      icon: partner?.logo || '',
      description: partner?.description || '',
    })) || []
  );
}

/**
 * Save entity configuration
 */
export async function saveEntityConfig(
  payload: SaveEntityRequest
): Promise<SaveEntityResponse> {
  const response = await CentralAPIHandler.handlePostRequest(
    ENDPOINTS.saveEntity,
    payload
  );
  return response as SaveEntityResponse;
}

/**
 * Save configuration for a specific step by step ID
 */
export async function saveStepConfig(
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
  const entity = STEP_TO_ENTITY_MAP[stepId];

  return saveEntityConfig({
    enterpriseId: params.enterpriseId,
    enterpriseName: params.enterpriseName,
    teamId: params.teamId,
    teamName: params.teamName,
    userId: params.userId,
    domain: 'integration',
    entity,
    entityconfig,
  });
}

// Export all service functions as a named object
const integrationsService = {
  fetchEntityConfig,
  fetchAllEntityConfigs,
  fetchPartners,
  saveEntityConfig,
  saveStepConfig,
  isEntityConfigured,
  isIntegrationDone,
  getEntityForStep,
};

export default integrationsService;
