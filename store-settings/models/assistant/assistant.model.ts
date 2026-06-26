import { AIAssistant } from '@/app-models-settings/assistant/assistant';

import { Language } from './language.model';
import { Voice } from './voice.model';

export interface AssistantStoreInterface
  extends GenericAgentStoreInterface,
    LanguageStoreInterface,
    VoiceStoreInterface,
    CreateTeamAgentMappingStoreInterface {
  availableAssistants: AIAssistant[];
  activeAssistantId: string | null;
  availableAssistantsLoading: boolean;
  availableAssistantsLoaded: boolean;
  availableAssistantsError: boolean;
}

export interface GenericAgentStoreInterface {
  genericAgents: AIAssistant[];
  genericAgentsLoading: boolean;
  genericAgentsLoaded: boolean;
  genericAgentsError: boolean;
}

export interface LanguageStoreInterface {
  languages: Language[];
  languagesLoading: boolean;
  languagesLoaded: boolean;
  languagesError: boolean;
}

export interface VoiceStoreInterface {
  voices: Voice[];
  voicesLoading: boolean;
  voicesLoaded: boolean;
  voicesError: boolean;
}

export interface CreateTeamAgentMappingStoreInterface {
  createTeamAgentMappingLoading: boolean;
  createTeamAgentMappingSuccess: boolean;
  createTeamAgentMappingError: boolean;
}
