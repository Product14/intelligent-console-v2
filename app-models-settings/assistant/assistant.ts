import { OnboardingStep } from '../Onboarding';
import { CardColorTheme } from '../workforce';

export type AssistantGender = 'male' | 'female';

export enum AssistantSource {
  GENERIC = 'generic',
  CUSTOM = 'custom',
  LIVE = 'live',
}

export type AgentCallType = 'inbound' | 'outbound';

export interface AIAssistant {
  id: string;
  agentId?: string;
  agentTypeId?: string;
  agentSource?: string;
  name: string;
  description: string;
  homepageUrl: string;
  imageUrl: string;
  type: string;
  colorTheme?: CardColorTheme;
  available: boolean;
  squadId?: string;
  order: number;
  faqs?: string[];
  vapiId?: string;
  gender?: AssistantGender;
  audioUrl?: string;
  agentCardText?: string;
  language?: string;
  languageName?: string;
  languageCode?: string;
  areConfigsLoading?: boolean;
  areConfigsLoaded: boolean;
  config?: any;
  assistantOverrides?: any;
  age?: string;
  assistantSource?: AssistantSource;
  languageId?: string;
  voiceId?: string;
  actionItems?: string[];
  agentDescription?: string;
  agentCallType?: AgentCallType;
  progress?: number;

  isOnboarded: boolean;
  step?: OnboardingStep[];
  subStep?: string[];
  lastCallDate?: string;
  city?: string;
  totalCalls?: number;
}

export interface GenericAgentResponse {
  agentId: string;
  agentTypeId: string;
  agentType: string;
  agentName: string;
  agentDescription: string;
  // agentCallType: AgentCallType;
  // agentCallType: AgentCallType;
}
