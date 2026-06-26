import { OnboardingStep } from '@/app-models-settings/Onboarding';
import {
  CustomAgentConfigs,
  SubsequentOnboardingPayload,
} from '@/app-models-settings/assistant/agent-configs';
import { AIAssistant, AssistantGender } from '@/app-models-settings/assistant/assistant';
import { createAction } from '@reduxjs/toolkit';

// @ts-ignore
import { AgentCustomizationTabs } from '@/components/settings/onboarding/agent-customization/AgentCustomization';

import {
  CreateAssistantRecordEntryPayload,
  GenericAgentsPayload,
  LanguagesPayload,
  VoicesPayload,
} from '../reducers/assistant.reducer';

export interface FetchAssistantConfigsPayload {
  enterpriseId: string;
  teamId: string;
  agentId: string;
  customerDetails?: { [key: string]: any };
}

export interface LoadAssistantConfigsPayload
  extends FetchAssistantConfigsPayload {
  config?: any;
  assistantOverrides?: any;
  areConfigsLoaded?: boolean;
  areConfigsLoading?: boolean;
}

export interface CreateTeamAgentMappingPayload {
  enterpriseId: string;
  teamId: string;
  agentId: string;
  agentTypeId?: string;
  successPayload?: AIAssistant;
}

export enum AssistantActionTypes {
  SET_ACTIVE_ASSISTANT = 'assistant/setActiveAssistant',
  FETCH_ASSISTANTS = 'assistant/fetchAssistants',
  PATCH_ASSISTANTS = 'assistant/patchAssistants',
  FETCH_ASSISTANT_CONFIGS = 'assistant/fetchAssistantConfigs',
  LOAD_ASSISTANT_CONFIGS = 'assistant/loadAssistantConfigs',
  FETCH_GENERIC_AGENTS = 'assistant/fetchGenericAgents',
  PATCH_GENERIC_AGENTS = 'assistant/patchGenericAgents',
  FETCH_LANGUAGES = 'assistant/fetchLanguages',
  PATCH_LANGUAGES = 'assistant/patchLanguages',
  FETCH_VOICES = 'assistant/fetchVoices',
  PATCH_VOICES = 'assistant/patchVoices',
  CREATE_TEAM_AGENT_MAPPING = 'assistant/createTeamAgentMapping',
  CREATE_TEAM_AGENT_MAPPING_SUCCESS = 'assistant/createTeamAgentMappingSuccess',
  CREATE_TEAM_AGENT_MAPPING_FAILURE = 'assistant/createTeamAgentMappingFailure',
}

// Generic Agents Actions
interface GetGenericAgentsParams {
  voiceId?: string | null;
  languageId?: string | null;
  latest?: boolean | null;
  trending?: boolean | null;
  hotSelling?: boolean | null;
  agentGender?: AssistantGender;
}

export const setActiveAssistantId = createAction(
  AssistantActionTypes.SET_ACTIVE_ASSISTANT,
  (payload?: string) => ({
    payload,
  })
);

export const fetchAssistants = createAction(
  AssistantActionTypes.FETCH_ASSISTANTS,
  (payload: CreateAssistantRecordEntryPayload) => {
    return {
      payload,
    };
  }
);

export const patchAssistants = createAction(
  AssistantActionTypes.PATCH_ASSISTANTS,
  (payload: CreateAssistantRecordEntryPayload) => ({
    payload,
  })
);

export const fetchAssistantConfigs = createAction(
  AssistantActionTypes.FETCH_ASSISTANT_CONFIGS,
  (payload: FetchAssistantConfigsPayload) => ({
    payload,
  })
);

export const loadAssistantConfigs = createAction(
  AssistantActionTypes.LOAD_ASSISTANT_CONFIGS,
  (payload: LoadAssistantConfigsPayload) => ({
    payload,
  })
);

export const fetchGenericAgents = createAction(
  AssistantActionTypes.FETCH_GENERIC_AGENTS,
  (params?: GetGenericAgentsParams) => ({
    payload: { params },
  })
);

export const patchGenericAgents = createAction(
  AssistantActionTypes.PATCH_GENERIC_AGENTS,
  (payload: GenericAgentsPayload) => ({
    payload,
  })
);

export const fetchLanguages = createAction(
  AssistantActionTypes.FETCH_LANGUAGES,
  () => ({
    payload: {},
  })
);

export const patchLanguages = createAction(
  AssistantActionTypes.PATCH_LANGUAGES,
  (payload: LanguagesPayload) => ({
    payload,
  })
);

export const fetchVoices = createAction(
  AssistantActionTypes.FETCH_VOICES,
  () => ({
    payload: {},
  })
);

export const patchVoices = createAction(
  AssistantActionTypes.PATCH_VOICES,
  (payload: VoicesPayload) => ({
    payload,
  })
);

export const createTeamAgentMapping = createAction(
  AssistantActionTypes.CREATE_TEAM_AGENT_MAPPING,
  (payload: CreateTeamAgentMappingPayload) => ({
    payload,
  })
);

export const createTeamAgentMappingSuccess = createAction(
  AssistantActionTypes.CREATE_TEAM_AGENT_MAPPING_SUCCESS,
  (payload: CreateTeamAgentMappingPayload) => ({
    payload,
  })
);

export const createTeamAgentMappingFailure = createAction(
  AssistantActionTypes.CREATE_TEAM_AGENT_MAPPING_FAILURE,
  (payload: { error: string } & CreateTeamAgentMappingPayload) => ({
    payload,
  })
);
