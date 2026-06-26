import {
  ApiEntityConfig,
  CrmProviderType,
  CrmRegistryProviderResponse,
  CrmRegistryResponse,
  EntityConfig,
  FetchEntityParams,
  FtpEntityConfig,
  IntegrationEntityResponse,
  Partner,
  SaveEntityRequest,
  SaveEntityResponse,
} from '@/models/integrations.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

const BASE_URL = process.env.APP_BACKEND_BASEURL;

export async function fetchCrmRegistryPartners(
  providerType: CrmProviderType = 'crm'
): Promise<Partner[]> {
  const response = await CentralAPIHandler.handleGetRequest(
    `${BASE_URL}/integrations/registry`,
    { providerType }
  );

  const providers = (response as CrmRegistryResponse) || [];
  return providers.map((provider: CrmRegistryProviderResponse) => ({
    id: provider._id || '',
    name: provider.providerName || '',
    icon: provider.logo || '',
  }));
}

const getCreateCrmIntegrationError = (error: unknown) => {
  const apiData = (error as { response?: { data?: SaveEntityResponse } })
    ?.response?.data;

  if (apiData?.message || apiData?.error) {
    return {
      message: apiData.message || 'Failed to create integration configuration',
      error: apiData.error,
    };
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return {
      message: error.message,
      error: 'error' in error ? (error.error as string | undefined) : undefined,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return {
    message: 'Failed to create integration configuration',
  };
};

export async function createCrmIntegration(
  enterpriseId: string,
  enterpriseName: string,
  teamId: string,
  teamName: string,
  userId: string,
  data: FtpEntityConfig
): Promise<SaveEntityResponse> {
  const payload: SaveEntityRequest = {
    enterpriseId,
    enterpriseName,
    teamId,
    teamName,
    userId,
    domain: 'integration',
    entity: 'CRM',
    entityconfig: {
      api: data as any,
      partnerProviderTypes: ['CRM'],
    },
  };

  try {
    const response = (await CentralAPIHandler.handlePostRequest(
      `${BASE_URL}/console/v1/product-onboarding/integration`,
      payload
    )) as SaveEntityResponse;

    if (!response?.success) {
      throw {
        message:
          response?.message || 'Failed to create integration configuration',
        error: response?.error,
      };
    }

    return response;
  } catch (error) {
    throw getCreateCrmIntegrationError(error);
  }
}

export async function fetchEntityConfig(
  params: FetchEntityParams
): Promise<IntegrationEntityResponse> {
  const { enterpriseID, TeamId, entity } = params;
  const response = await CentralAPIHandler.handleGetRequest(
    `${BASE_URL}/central-config/v1/integration`,
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

  return !!(
    entityConfig.api && (entityConfig.api as FtpEntityConfig)?.partnerName
  );
}

export function isIntegrationDone(
  response: IntegrationEntityResponse | null
): boolean {
  if (!response) return false;
  return isEntityConfigured(response.entityconfig);
}
