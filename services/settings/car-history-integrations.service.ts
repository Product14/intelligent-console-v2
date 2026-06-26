import {
  EntityConfig,
  FtpEntityConfig,
  IntegrationEntityResponse,
  Partner,
  SaveEntityResponse,
} from '@/models/integrations.model';

import {
  fetchEntityConfig,
  fetchPartners,
  saveEntityConfig,
} from './integrations.service';

export async function fetchCarHistoryPartners(): Promise<Partner[]> {
  return fetchPartners({ entity: 'CarHistory' });
}

export async function createCarHistoryIntegration(
  enterpriseId: string,
  enterpriseName: string,
  teamId: string,
  teamName: string,
  userId: string,
  data: Pick<
    FtpEntityConfig,
    | 'partnerId'
    | 'partnerName'
    | 'logo'
    | 'approved'
    | 'poc_name'
    | 'poc_email'
    | 'poc_contact'
  >
): Promise<SaveEntityResponse> {
  return saveEntityConfig({
    enterpriseId,
    enterpriseName,
    teamId,
    teamName,
    userId,
    domain: 'integration',
    entity: 'CAR_HISTORY' as any,
    entityconfig: data as unknown as EntityConfig,
  });
}

export async function fetchCarHistoryEntityConfig(params: {
  enterpriseID: string;
  TeamId: string;
}): Promise<IntegrationEntityResponse | null> {
  try {
    return await fetchEntityConfig({
      enterpriseID: params.enterpriseID,
      TeamId: params.TeamId,
      entity: 'CAR_HISTORY' as any,
    });
  } catch {
    return null;
  }
}

export function isCarHistoryIntegrationDone(
  response: IntegrationEntityResponse | null
): boolean {
  if (!response) return false;
  const ftp = response.entityconfig as any;
  return !!(ftp?.partnerId || ftp?.partnerName);
}
