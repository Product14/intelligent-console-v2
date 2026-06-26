import {
  ApiEntityConfig,
  EntityConfig,
  FetchEntityParams,
  FetchPartnersParams,
  FtpEntityConfig,
  IntegrationEntity,
  IntegrationEntityResponse,
  Partner,
  PartnerResponse,
  PartnersListResponse,
  SaveEntityRequest,
  SaveEntityResponse,
} from '@/models/integrations.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

const BASE_URL = process.env.APP_BACKEND_BASEURL;

// API endpoints
const ENDPOINTS = {
  getEntityConfig: `${BASE_URL}/central-config/v1/integration`,
  getPartners: `${BASE_URL}/partner/category`,
  saveEntity: `${BASE_URL}/console/v1/product-onboarding/integration`,
};

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
export function isEntityConfigured(
  entityConfig: EntityConfig | null | undefined
): boolean {
  if (!entityConfig) return false;
  const hasFtp = !!(
    entityConfig.ftp &&
    (entityConfig.ftp.partnerId || entityConfig.ftp.partnerName)
  );
  const hasApi = !!(
    entityConfig.api &&
    ((entityConfig.api as ApiEntityConfig).apiKey ||
      (entityConfig.api as FtpEntityConfig).partnerName)
  );
  const hasApp = entityConfig.app === true;
  const hasConsole = entityConfig.console === true;
  const hasMediaClone = entityConfig.mediaclone === true;

  return hasFtp || hasApi || hasApp || hasConsole || hasMediaClone;
}

export function isIntegrationDone(
  response: IntegrationEntityResponse | null
): boolean {
  if (!response) return false;
  return isEntityConfigured(response.entityconfig);
}

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

export async function saveEntityConfig(
  payload: SaveEntityRequest
): Promise<SaveEntityResponse> {
  const response = await CentralAPIHandler.handlePostRequest(
    ENDPOINTS.saveEntity,
    payload
  );
  return response as SaveEntityResponse;
}

// Export all service functions as a named object for convenience
const integrationsService = {
  fetchEntityConfig,
  isIntegrationDone,
};

export default integrationsService;
