import { OnboardingStep } from '@/app/models/Onboarding';
import { CustomAgentConfigs } from '@/app/models/assistant/agent-configs';
import {
  AgentType,
  AgentTypeResponse,
} from '@/app/models/assistant/agent-type';
import { AIAssistant, AssistantSource } from '@/app/models/assistant/assistant';
import { CardColorTheme } from '@/app/models/workforce';

export const transformAgentTypeToAssistant = (
  agentType: AgentType
): AIAssistant => {
  return {
    id: agentType.agentTypeId,
    agentId: undefined,
    agentTypeId: agentType.agentTypeId,
    name: '',
    description: '',
    homepageUrl: agentType.homepageUrl,
    imageUrl: agentType.imageUrl,
    type: agentType.type,
    available: agentType.available,
    order: 0,
    areConfigsLoaded: false,
    colorTheme: CardColorTheme.VIOLET,
    assistantSource: agentType.assistantSource,
    faqs: [],
    isOnboarded: false,
    step: [],
    subStep: [],
  };
};

export const transformAgentTypeResponseToAgentType = (
  agent: AgentTypeResponse
): AgentType => {
  return {
    agentTypeId: agent.agentTypeId,
    type: agent.agentType,
    available: agent.frontendConfigs?.available,
    imageUrl: agent.frontendConfigs?.imageUrl,
    homepageUrl: agent.frontendConfigs?.homepageImage,
    avatars: agent.frontendConfigs?.avatars,
    assistantSource: AssistantSource.CUSTOM,
  };
};

export const calculateProgressForAssistant = (
  steps: OnboardingStep[]
): number => {
  const progress =
    steps.filter((step) => step !== OnboardingStep.COMPLETED).length ?? 0;
  if (progress <= 0) {
    return progress;
  }
  return progress - 1;
};

export const transformGenericAgentResponseToAssistant =
  () // agent: GenericAgentResponse
  : AIAssistant => {
    return {} as AIAssistant;
  };
