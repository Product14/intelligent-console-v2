import {
  AgentCustomizationPage,
  AgentCustomizationTabs,
  // @ts-ignore
} from '@/components/onboarding/agent-customization/AgentCustomization';

import { OnboardingStep } from '../Onboarding';
import { AgentTypeAvatar } from './agent-type';
import { AIAssistant } from './assistant';

export interface SubsequentOnboardingPayload {
  id?: string;
  agentId?: string;
  agentTypeId: string;
  enterpriseId: string;
  teamId: string;
  type?: string;
  subStep?: AgentCustomizationTabs | AgentCustomizationPage;
  step?: OnboardingStep[];
}

export interface CustomAgentIdentity {
  id?: string;
  agentId?: string;
  agentTypeId: string;
  enterpriseId: string;
  teamId: string;
  type?: string;
  subStep?: AgentCustomizationTabs | AgentCustomizationPage;
  step?: OnboardingStep;
}

export interface CustomAgentBasicDetails {
  name?: string;
  avatar?: AgentTypeAvatar;
}

export interface CustomAgentVoiceSettings {
  languageId?: string;
  voiceId?: string;
  backgroundSound?: string;
  voiceConfig?: VoiceConfigPayload;
}

export interface CustomAgentPersonality {
  greeting?: string;
  voiceConfig?: VoiceConfigPayload;
}

export interface CustomAgentDetails {
  agent?: Partial<AIAssistant>;
  subSteps?: AgentCustomizationTabs[];
  configs: CustomAgentConfigs;
}

export interface CustomAgentConfigs
  extends CustomAgentBasicDetails,
    CustomAgentVoiceSettings,
    CustomAgentPersonality,
    CustomAgentIdentity {}

export interface CustomAgentBasicDetailsPayload
  extends CustomAgentBasicDetails,
    Omit<CustomAgentIdentity, 'type'> {}

export interface CustomAgentVoiceSettingsPayload
  extends CustomAgentVoiceSettings,
    Omit<CustomAgentIdentity, 'type'> {}

export interface CustomAgentPersonalityPayload
  extends CustomAgentPersonality,
    Omit<CustomAgentIdentity, 'type'> {}

export interface VoiceConfigPayload {
  [key: string]: number;
}
