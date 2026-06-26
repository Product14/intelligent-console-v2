import { AgentType } from '@/store-settings/models/agent-types.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const fetchAgentTypesAPI = async (
  enterpriseId: string,
  teamId: string
): Promise<{
  contractedAgents: AgentType[];
  contractLink?: string;
}> => {
  if (!teamId) {
    return { contractedAgents: [], contractLink: '' };
  }

  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/vini/get-contracted-agents/teams/${teamId}/enterpriseId/${enterpriseId}`;

  const response = await CentralAPIHandler.handleGetRequest(url);

  return response || { contractedAgents: [], contractLink: '' };
};
