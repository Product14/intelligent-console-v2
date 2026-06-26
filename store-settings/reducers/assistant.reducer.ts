import { OnboardingStep } from '@/app-models-settings/Onboarding';
import { AIAssistant } from '@/app-models-settings/assistant/assistant';

import { Lexend_Tera } from 'next/font/google';

// @ts-ignore
import { AgentCustomizationTabs } from '@/components/settings/onboarding/agent-customization/AgentCustomization';

import { sortOnboardingSteps } from '@/helpers-settings/onboarding.helper';

import {
  AssistantActionTypes,
  CreateTeamAgentMappingPayload,
  LoadAssistantConfigsPayload,
} from '../actions/assistant.actions';
import { AssistantStoreInterface } from '../models/assistant/assistant.model';
import { Language } from '../models/assistant/language.model';
import { Voice } from '../models/assistant/voice.model';

export const FETCH_ASSISTANTS = 'assistant/fetchAssistants';

export interface CreateAssistantRecordEntryPayload {
  assistants?: AIAssistant[];
  enterpriseId: string;
  teamId: string;
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
}

export interface GenericAgentsPayload {
  genericAgents?: AIAssistant[];
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
}

export interface LanguagesPayload {
  languages?: Language[];
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
}

export interface VoicesPayload {
  voices?: Voice[];
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
}

const initialState: AssistantStoreInterface = {
  availableAssistants: [],
  activeAssistantId: null,
  availableAssistantsLoading: false,
  availableAssistantsLoaded: false,
  availableAssistantsError: false,
  genericAgents: [],
  genericAgentsLoading: false,
  genericAgentsLoaded: false,
  genericAgentsError: false,
  languages: [],
  languagesLoading: false,
  languagesLoaded: false,
  languagesError: false,
  voices: [],
  voicesLoading: false,
  voicesLoaded: false,
  voicesError: false,
  createTeamAgentMappingLoading: false,
  createTeamAgentMappingSuccess: false,
  createTeamAgentMappingError: false,
};

const assistantReducer = (
  state = initialState,
  action: {
    type: AssistantActionTypes;
    payload:
      | CreateAssistantRecordEntryPayload
      | LoadAssistantConfigsPayload
      | GenericAgentsPayload
      | LanguagesPayload
      | VoicesPayload
      | ({ error: string } & CreateTeamAgentMappingPayload);
  }
) => {
  // Only check for payload if it's not the SET_ACTIVE_ASSISTANT action
  if (
    !action.payload &&
    action.type !== AssistantActionTypes.SET_ACTIVE_ASSISTANT
  ) {
    return state;
  }

  switch (action.type) {
    case AssistantActionTypes.SET_ACTIVE_ASSISTANT: {
      return {
        ...state,
        activeAssistantId: action.payload,
      };
    }
    case AssistantActionTypes.PATCH_ASSISTANTS: {
      const { assistants, loaded, loading } =
        action.payload as CreateAssistantRecordEntryPayload;
      let addFromLeft = true;
      const sortedAssistants = assistants?.sort((a, b) => a.order - b.order);
      const arrangedAssistants = sortedAssistants?.reduce((acc, assistant) => {
        if (addFromLeft) {
          acc.unshift({ ...assistant, faqs: [], areConfigsLoaded: false });
        } else {
          acc.push({ ...assistant, faqs: [], areConfigsLoaded: false });
        }
        addFromLeft = !addFromLeft;
        return acc;
      }, [] as AIAssistant[]);
      return {
        ...state,
        availableAssistantsLoaded: loaded,
        availableAssistantsLoading: loading,
        availableAssistants: arrangedAssistants ?? [],
      };
    }
    case AssistantActionTypes.LOAD_ASSISTANT_CONFIGS: {
      const {
        config,
        agentId,
        areConfigsLoaded,
        areConfigsLoading,
        assistantOverrides,
      } = action.payload as LoadAssistantConfigsPayload;
      return {
        ...state,
        activeAssistantId: agentId,
        availableAssistants: state.availableAssistants.map((assistant) =>
          assistant.id === agentId
            ? {
                ...assistant,
                config: config,
                assistantOverrides: assistantOverrides,
                areConfigsLoading: areConfigsLoading,
                areConfigsLoaded: areConfigsLoaded,
              }
            : assistant
        ),
      };
    }

    case AssistantActionTypes.PATCH_GENERIC_AGENTS: {
      const { genericAgents, loading, loaded, error } =
        action.payload as GenericAgentsPayload;
      return {
        ...state,
        genericAgents: genericAgents || state.genericAgents,
        genericAgentsLoading:
          loading !== undefined ? loading : state.genericAgentsLoading,
        genericAgentsLoaded:
          loaded !== undefined ? loaded : state.genericAgentsLoaded,
        genericAgentsError:
          error !== undefined ? error : state.genericAgentsError,
      };
    }

    case AssistantActionTypes.PATCH_LANGUAGES: {
      const { languages, loading, loaded, error } =
        action.payload as LanguagesPayload;
      return {
        ...state,
        languages: languages || state.languages,
        languagesLoading:
          loading !== undefined ? loading : state.languagesLoading,
        languagesLoaded: loaded !== undefined ? loaded : state.languagesLoaded,
        languagesError: error !== undefined ? error : state.languagesError,
      };
    }

    case AssistantActionTypes.PATCH_VOICES: {
      const { voices, loading, loaded, error } =
        action.payload as VoicesPayload;
      return {
        ...state,
        voices: voices || state.voices,
        voicesLoading: loading !== undefined ? loading : state.voicesLoading,
        voicesLoaded: loaded !== undefined ? loaded : state.voicesLoaded,
        voicesError: error !== undefined ? error : state.voicesError,
      };
    }

    case AssistantActionTypes.CREATE_TEAM_AGENT_MAPPING: {
      return {
        ...state,
        createTeamAgentMappingLoading: true,
        createTeamAgentMappingSuccess: false,
        createTeamAgentMappingError: false,
      };
    }

    case AssistantActionTypes.CREATE_TEAM_AGENT_MAPPING_SUCCESS: {
      const { successPayload } =
        action.payload as CreateTeamAgentMappingPayload;
      return {
        ...state,
        availableAssistants: !!successPayload
          ? [...state.availableAssistants, successPayload]
          : state.availableAssistants,
        createTeamAgentMappingLoading: false,
        createTeamAgentMappingSuccess: true,
        createTeamAgentMappingError: false,
      };
    }

    case AssistantActionTypes.CREATE_TEAM_AGENT_MAPPING_FAILURE: {
      return {
        ...state,
        createTeamAgentMappingLoading: false,
        createTeamAgentMappingSuccess: false,
        createTeamAgentMappingError: true,
      };
    }

    default:
      return state;
  }
};

export default assistantReducer;
