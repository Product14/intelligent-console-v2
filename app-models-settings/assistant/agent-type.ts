import { OnboardingStep } from '../Onboarding';
import { AssistantSource } from './assistant';

export interface AgentTypeAvatar {
  agentId?: string;
  imageUrl: string;
  homepageUrl: string;
  gender: string;
}

export interface AgentTypeResponse {
  _id: string;
  agentTypeId: string;
  agentType: string;
  frontendConfigs: {
    available: boolean;
    imageUrl: string;
    colorTheme: string;
    avatars: AgentTypeAvatar[];
    homepageImage: string;
  };
  subStep: OnboardingStep;
}

export interface AgentType {
  agentTypeId: string;
  type: string;
  available: boolean;
  imageUrl: string;
  homepageUrl: string;
  avatars: AgentTypeAvatar[];
  assistantSource?: AssistantSource;
}
