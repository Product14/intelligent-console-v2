import { OnboardingStep } from '@/app-models-settings/Onboarding';
import { Agent } from '@/app-models-settings/assistant/agent';

import { Persona } from './persona.model';

export interface OnboardedAgent extends Persona {
  teamAgentMappingId: string;
  agentTypeId: string;
  agentType: string;
  agentUseCase: string;
  agentCallType: string;
  nationality: string;

  onboardingProgress: string[];
  isOnboarded: boolean;
  phoneNumber: string;
  agentConfigs?: AgentLevelConfigs;
  capabilities?: string[];
}

export interface AgentsStoreInterface {
  availableAgents: OnboardedAgent[];
  availableAgentsLoading: boolean;
  availableAgentsLoaded: boolean;
}

export interface FetchAgentsParams {
  enterpriseId: string;
  teamId: string;
  forceRefresh?: boolean;
}

export interface FetchAgentsPayload {
  agents?: Agent[];
  enterpriseId?: string;
  teamId?: string;
  loading?: boolean;
  loaded?: boolean;
}
export interface CreateOrUpdateAgentMappingPayload {
  teamAgentMappingId?: string;
  templateId: string;
  enterpriseId: string;
  teamId: string;
  agentCallType: string;
  agentType: string;
  agentName: string;
  agentTypeId: string;
}

export interface AgentLevelConfigs {
  firstMessage?: string;
  voicemailMessage?: string;
  facilities: {
    pickAndDropoff: boolean;
    loaner: boolean;
    shuttle: boolean;
    hasOptedPartsTransfer: boolean;
    hasOptedServiceTransfer: boolean;
    hasOptedManagerEscalation: boolean;
  };
  slaRules: {
    diagnostics: string;
    recall: string;
    loanerBookings: string;
    pickupAndDropoffBookings: string;
  };
  areaCode: string;
  contacts: {
    pickupAndDropoffContact: AutoFillContactField;
    loanerBookingsContact: AutoFillContactField;
    shuttleContact: AutoFillContactField;
    partsContact: AutoFillContactField;
    serviceContact: AutoFillContactField;
    managerEscalationContact: AutoFillContactField;
  };
}
