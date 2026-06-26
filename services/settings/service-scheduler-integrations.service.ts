import {
  CrmProviderType,
  CrmRegistryProviderResponse,
  CrmRegistryResponse,
  FtpEntityConfig,
  IntegrationEntityResponse,
  Partner,
  SaveEntityRequest,
  SaveEntityResponse,
  ServiceSchedulerConfig,
} from '@/models/integrations.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

const BASE_URL = process.env.APP_BACKEND_BASEURL;

export async function fetchServiceSchedulerPartners(): Promise<Partner[]> {
  const response = await CentralAPIHandler.handleGetRequest(
    `${BASE_URL}/integrations/registry`,
    { providerType: 'service-scheduler' as CrmProviderType }
  );

  const providers = (response as CrmRegistryResponse) || [];
  return providers.map((provider: CrmRegistryProviderResponse) => ({
    id: provider._id || '',
    name: provider.providerName || '',
    icon: provider.logo || '',
  }));
}

export async function createServiceSchedulerIntegration(
  enterpriseId: string,
  enterpriseName: string,
  teamId: string,
  teamName: string,
  userId: string,
  data: FtpEntityConfig,
  serviceSchedulerConfig?: ServiceSchedulerConfig
): Promise<SaveEntityResponse> {
  const payload: SaveEntityRequest = {
    enterpriseId,
    enterpriseName,
    teamId,
    teamName,
    userId,
    domain: 'integration',
    entity: 'SERVICE_SCHEDULER',
    entityconfig: {
      api: data as any,
      ...(serviceSchedulerConfig && { serviceSchedulerConfig }),
    },
  };

  const response = await CentralAPIHandler.handlePostRequest(
    `${BASE_URL}/console/v1/product-onboarding/integration`,
    payload
  );

  return response as SaveEntityResponse;
}

export async function fetchServiceSchedulerEntityConfig(params: {
  enterpriseID: string;
  TeamId: string;
}): Promise<IntegrationEntityResponse | null> {
  const response = await CentralAPIHandler.handleGetRequest(
    `${BASE_URL}/central-config/v1/integration`,
    {
      enterpriseId: params.enterpriseID,
      teamId: params.TeamId,
      entity: 'SERVICE_SCHEDULER',
      domain: 'integration',
    }
  );

  return (response?.data as IntegrationEntityResponse) ?? null;
}

export function isServiceSchedulerIntegrationDone(
  response: IntegrationEntityResponse | null
): boolean {
  if (!response) return false;
  const api = response.entityconfig?.api as FtpEntityConfig | undefined;
  return !!(api?.partnerId || api?.partnerName);
}
