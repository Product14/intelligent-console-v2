import { Agent } from '@/app-models-settings/assistant/agent';
import { FetchAssistantConfigsPayload } from '@/store-settings/actions/assistant.actions';
import {
  AgentLevelConfigs,
  CreateOrUpdateAgentMappingPayload,
  FetchAgentsParams,
  OnboardedAgent,
} from '@/store-settings/models/agents.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const fetchAgentsAPI = async ({
  enterpriseId,
  teamId,
}: FetchAgentsParams): Promise<Agent[]> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/agents/fetch-agent-list`;

  const response = await CentralAPIHandler.handleGetRequest(url, {
    enterpriseId,
    teamId,
  });

  return response || [];
};

export const fetchOnboardedAgentsAPI = async ({
  enterpriseId,
  teamId,
}: FetchAgentsParams): Promise<OnboardedAgent[]> => {
  if (!enterpriseId || !teamId) {
    return [];
  }

  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/agents/team/${teamId}/onboarded-agents`;

  const response = await CentralAPIHandler.handleGetRequest(url);

  return response || [];
};

export const fetchAgentConfigsAPI = async ({
  enterpriseId,
  teamId,
  agentId,
  customerDetails,
}: FetchAssistantConfigsPayload): Promise<{
  vapiAgentConfig: any;
  assistantOverrides: any;
}> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/agents/runtime-agent-customer`;

  const response = await CentralAPIHandler.handlePostRequest(url, {
    enterpriseId,
    teamId,
    agentId,
    customerDetails,
  });

  return response;
};

export const createOrUpdateAgentMappingAPI = async ({
  teamAgentMappingId,
  enterpriseId,
  teamId,
  templateId,
  agentTypeId,
  agentName,
  agentCallType,
  agentType,
}: CreateOrUpdateAgentMappingPayload): Promise<any> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/vini/create-team-agent-mapping`;

  const payload: any = {
    enterpriseId,
    teamId,
    domain: 'product',
    entity: `${agentType}_${agentCallType}`.toLowerCase(),
    agentName,
    templateId,
    agentTypeId,
    ...(teamAgentMappingId && { teamAgentMappingId }),
  };

  const response = await CentralAPIHandler.handlePostRequest(url, payload);

  return response;
};

export const updateAgentConfigsAPI = async ({
  teamAgentMappingId,
  configs,
}: {
  teamAgentMappingId: string;
  configs: {
    agentConfigs?: AgentLevelConfigs;
    firstMessage?: string;
    voicemailMessage?: string;
  };
}): Promise<AgentLevelConfigs> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/agent-onboarding/agent-mapping/${teamAgentMappingId}/configs`;

  const response = await CentralAPIHandler.handlePatchRequest(
    url,
    {},
    {},
    undefined,
    configs
  );

  return response;
};

export const fetchAgentMappingDetailAPI = async (
  teamAgentMappingId: string
): Promise<OnboardedAgent> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/agents/agent-mapping/${teamAgentMappingId}`;

  const response = await CentralAPIHandler.handleGetRequest(url);

  return response;
};

export const getTeamAgentConfigsAPI = async ({
  enterpriseId,
  teamId,
  domain,
  entity,
  isCommonNeeded,
  agentId,
}: {
  enterpriseId: string;
  teamId: string;
  domain: string;
  entity: string;
  isCommonNeeded: boolean;
  agentId: string;
}): Promise<any> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/vini/get-config`;

  const response = await CentralAPIHandler.handlePostRequest(url, {
    enterpriseId,
    teamId,
    domain,
    entity,
    isCommonNeeded,
    agentId,
  });

  return response;
};
