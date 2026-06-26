import { OnboardingStep, OnboardingStepOrder } from '@/app/models/Onboarding';
import {
  CustomAgentConfigs,
  CustomAgentDetails,
} from '@/app/models/assistant/agent-configs';
import { AIAssistant } from '@/app/models/assistant/assistant';
import { CustomAgentResponse } from '@/app/models/onboarding/CustomAgentResponse';

export const mapCustomAgentResponseToCustomAgentDetails = (
  enterpriseId: string,
  teamId: string,
  agentTypeId: string,
  agentId: string,
  responsePayload?: CustomAgentResponse,
  patchPayload?: AIAssistant
): CustomAgentDetails => {
  const agent = responsePayload?.agent;
  const agentMapping = responsePayload?.agentMapping;
  return {
    agent: {
      id: agentMapping?.id || patchPayload?.id,
      agentId: agent?.agentId || agentId || patchPayload?.agentId,
      agentTypeId:
        agent?.agentTypeId || agentTypeId || patchPayload?.agentTypeId,
      name: agent?.agentName || patchPayload?.name || '',
      description: patchPayload?.description || '',
      homepageUrl:
        agent?.frontendConfigs?.homepageImage ||
        patchPayload?.homepageUrl ||
        '',
      imageUrl:
        agent?.frontendConfigs?.imageUrl || patchPayload?.imageUrl || '',
      type: agent?.agentType || patchPayload?.type || '',
      assistantSource: patchPayload?.assistantSource || undefined,
      available:
        agent?.frontendConfigs?.available || patchPayload?.available || true,
      order: agent?.order ?? 0,
      areConfigsLoaded: false,
      areConfigsLoading: false,
    },
    configs: {
      enterpriseId: agentMapping?.enterpriseId || enterpriseId,
      teamId: agentMapping?.teamId || teamId,
      agentId: agent?.agentId || agentId,
      agentTypeId: agent?.agentTypeId || agentTypeId,
      name: agent?.agentName || patchPayload?.name || '',
      backgroundSound: agent?.callConfigs?.backgroundSound ?? '',
      languageId: agent?.callConfigs?.languageId ?? '',
      voiceConfig: agent?.callConfigs?.voiceConfig ?? {},
      avatar: {
        imageUrl:
          agent?.frontendConfigs?.imageUrl || patchPayload?.imageUrl || '',
        homepageUrl:
          agent?.frontendConfigs?.homepageImage ||
          patchPayload?.homepageUrl ||
          '',
        gender: patchPayload?.gender || '',
        agentId: agent?.agentId || agentId || patchPayload?.agentId || '',
      },
      voiceId: agent?.voiceId ?? '',
      greeting: agentMapping?.firstMessage || '',
      id: agentMapping?.id || patchPayload?.id || '',
    },
  };
};

export const patchCustomAgentDetails = (
  newDetails: CustomAgentDetails,
  previousState?: CustomAgentDetails,
  patchAssistant?: AIAssistant,
  patchConfigs?: CustomAgentConfigs
): CustomAgentDetails => {
  const newAgent = newDetails?.agent;
  const newConfigs = newDetails?.configs;
  const previousAgent = previousState?.agent;
  const previousConfigs = previousState?.configs;
  return {
    agent: {
      id: newAgent?.id || patchAssistant?.id || previousAgent?.id || '',
      agentId:
        newAgent?.agentId ||
        patchAssistant?.agentId ||
        previousAgent?.agentId ||
        '',
      agentTypeId:
        newAgent?.agentTypeId ||
        patchAssistant?.agentTypeId ||
        previousAgent?.agentTypeId ||
        '',
      name: newAgent?.name || patchAssistant?.name || previousAgent?.name || '',
      description:
        newAgent?.description ||
        patchAssistant?.description ||
        previousAgent?.description,
      homepageUrl:
        newAgent?.homepageUrl ||
        patchAssistant?.homepageUrl ||
        patchConfigs?.avatar?.homepageUrl ||
        previousAgent?.homepageUrl,
      imageUrl:
        newAgent?.imageUrl ||
        patchConfigs?.avatar?.imageUrl ||
        previousAgent?.imageUrl,
      type: newAgent?.type || patchAssistant?.type || previousAgent?.type,
      assistantSource:
        patchAssistant?.assistantSource ||
        previousAgent?.assistantSource ||
        undefined,
      available:
        newAgent?.available ||
        patchAssistant?.available ||
        previousAgent?.available ||
        true,
      order:
        newAgent?.order || patchAssistant?.order || previousAgent?.order || 0,
      areConfigsLoaded: false,
      areConfigsLoading: false,
    },
    configs: {
      enterpriseId:
        newConfigs?.enterpriseId ||
        patchConfigs?.enterpriseId ||
        previousConfigs?.enterpriseId ||
        '',
      teamId:
        newConfigs?.teamId ||
        patchConfigs?.teamId ||
        previousConfigs?.teamId ||
        '',
      agentId:
        newConfigs?.agentId ||
        patchConfigs?.agentId ||
        previousConfigs?.agentId ||
        '',
      agentTypeId:
        newConfigs?.agentTypeId ||
        patchConfigs?.agentTypeId ||
        previousConfigs?.agentTypeId ||
        '',
      name:
        newConfigs?.name || patchConfigs?.name || previousConfigs?.name || '',
      backgroundSound:
        newConfigs?.backgroundSound ||
        patchConfigs?.backgroundSound ||
        previousConfigs?.backgroundSound ||
        '',
      languageId:
        newConfigs?.languageId ||
        patchConfigs?.languageId ||
        previousConfigs?.languageId ||
        '',
      voiceConfig: {
        ...(previousConfigs?.voiceConfig ?? {}),
        ...(newConfigs?.voiceConfig ?? {}),
        ...(patchConfigs?.voiceConfig ?? {}),
      },
      avatar: {
        imageUrl:
          newConfigs?.avatar?.imageUrl ||
          patchConfigs?.avatar?.imageUrl ||
          previousConfigs?.avatar?.imageUrl ||
          '',
        homepageUrl:
          newConfigs?.avatar?.homepageUrl ||
          patchConfigs?.avatar?.homepageUrl ||
          previousConfigs?.avatar?.homepageUrl ||
          '',
        gender:
          newConfigs?.avatar?.gender ||
          patchConfigs?.avatar?.gender ||
          previousConfigs?.avatar?.gender ||
          '',
        agentId:
          newConfigs?.avatar?.agentId ||
          patchConfigs?.avatar?.agentId ||
          previousConfigs?.avatar?.agentId ||
          '',
      },
      voiceId:
        newConfigs?.voiceId ||
        patchConfigs?.voiceId ||
        previousConfigs?.voiceId ||
        '',
      greeting:
        newConfigs?.greeting ||
        patchConfigs?.greeting ||
        previousConfigs?.greeting ||
        '',
      id: newConfigs?.id || patchConfigs?.id || previousConfigs?.id || '',
    },
  };
};

export const sortOnboardingSteps = (
  steps: OnboardingStep[]
): OnboardingStep[] => {
  const newHistory = new Set(steps);
  return Array.from(newHistory)
    .slice()
    .sort((a, b) => OnboardingStepOrder[a] - OnboardingStepOrder[b]);
};
