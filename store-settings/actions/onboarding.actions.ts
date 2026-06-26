import { OnboardingStep } from '@/app-models-settings/Onboarding';
import { CustomAgentConfigs } from '@/app-models-settings/assistant/agent-configs';
import { AgentType } from '@/app-models-settings/assistant/agent-type';
import { AIAssistant } from '@/app-models-settings/assistant/assistant';
import { Language, Voice } from '@/app-models-settings/linguistics';
import { createAction } from '@reduxjs/toolkit';

import { CustomAgentDetails } from '../reducers/onboarding.reducer';

export enum OnboardingActionTypes {
  FETCH_CUSTOMIZED_AGENT = 'onboarding/fetch-customized-agent',
  UPDATE_CUSTOMIZED_AGENT = 'onboarding/update-customized-agent',
  PATCH_CUSTOMIZED_AGENT = 'onboarding/patch-customized-agent',
  RESET_CUSTOMIZED_AGENT = 'onboarding/reset-customized-agent',
  FETCH_ONBOARDING_PROGRESS = 'onboarding/progress',
  UPDATE_ONBOARDING_PROGRESS = 'onboarding/updateProgress',
  LOAD_ONBOARDING_PROGRESS = 'onboarding/loadProgress',
  UPDATE_ONBOARDING_HISTORY = 'onboarding/modifyOnboardingHistory',
  SUBMIT_VOIP_DATA = 'onboarding/submitVoipData',
  LOAD_VOIP_SUBMISSION = 'onboarding/loadVoipSubmission',
  FETCH_VOIP_DATA = 'onboarding/fetchVoipData',
  LOAD_VOIP_DATA = 'onboarding/loadVoipData',
  GENERATE_MOBILE_NUMBER = 'onboarding/generateMobileNumber',
  LOAD_MOBILE_NUMBER = 'onboarding/loadMobileNumber',
  FETCH_AGENT_TYPES = 'onboarding/fetchAgentTypes',
  LOAD_AGENT_TYPES = 'onboarding/loadAgentTypes',
  // New actions for languages and voices
  FETCH_LANGUAGES = 'onboarding/fetchLanguages',
  LOAD_LANGUAGES = 'onboarding/loadLanguages',
  FETCH_VOICES = 'onboarding/fetchVoices',
  LOAD_VOICES = 'onboarding/loadVoices',

  //New action for timezone
  FETCH_TIMEZONE = 'onboarding/fetchTimezone',
  SET_TIMEZONE = 'onboarding/setTimezone',
}

export const resetCustomizedAgent = createAction(
  OnboardingActionTypes.RESET_CUSTOMIZED_AGENT,
  () => ({ payload: {} })
);

export const updateOnboardingHistory = createAction(
  OnboardingActionTypes.UPDATE_ONBOARDING_HISTORY,
  (payload: { onboardingHistoryStack: OnboardingStep[] }) => ({
    payload,
  })
);

export const updateCustomizedAgentDetails = createAction(
  OnboardingActionTypes.UPDATE_CUSTOMIZED_AGENT,
  (payload: Partial<CustomAgentConfigs>) => ({
    payload,
  })
);

export const fetchCustomizedAgentDetails = createAction(
  OnboardingActionTypes.FETCH_CUSTOMIZED_AGENT,
  (payload: {
    requestPayload: {
      enterpriseId: string;
      teamId: string;
      agentTypeId: string;
      agentId?: string;
    };
    patchPayload?: AIAssistant;
    forcePatch?: boolean;
  }) => ({
    payload,
  })
);

export const patchCustomizedAgentDetails = createAction(
  OnboardingActionTypes.PATCH_CUSTOMIZED_AGENT,
  (payload: {
    loading: boolean;
    loaded: boolean;
    customAgentDetails?: CustomAgentDetails;
    patchPayload?: AIAssistant;
    patchConfigs?: CustomAgentConfigs;
    shouldReset?: boolean;
  }) => ({
    payload,
  })
);

export const fetchOnboardingProgress = createAction(
  OnboardingActionTypes.FETCH_ONBOARDING_PROGRESS,
  (payload: { enterpriseId: string; teamId: string }) => ({
    payload,
  })
);

export const updateOnboardingProgress = createAction(
  OnboardingActionTypes.UPDATE_ONBOARDING_PROGRESS,
  (payload: {
    enterpriseId: string;
    teamId: string;
    currentStep: OnboardingStep;
  }) => ({ payload })
);

export const loadOnboardingProgress = createAction(
  OnboardingActionTypes.LOAD_ONBOARDING_PROGRESS,
  (payload: {
    currentStep?: OnboardingStep;
    firstOnboardingProgress?: OnboardingStep[];
    hasEnterpriseOnboarded?: boolean;
    loading?: boolean;
    loaded?: boolean;
    error?: boolean;
  }) => ({
    payload,
  })
);

export const submitVoipData = createAction(
  OnboardingActionTypes.SUBMIT_VOIP_DATA,
  (payload: {
    enterpriseId: string;
    teamId: string;
    dealerId: string;
    phoneNumber: string;
    voipProvider: string;
  }) => ({ payload })
);

export const loadVoipSubmission = createAction(
  OnboardingActionTypes.LOAD_VOIP_SUBMISSION,
  (payload: {
    voipSubmissionLoading?: boolean;
    voipSubmissionLoaded?: boolean;
    voipSubmissionError?: boolean;
  }) => ({
    payload,
  })
);

export const fetchVoipData = createAction(
  OnboardingActionTypes.FETCH_VOIP_DATA,
  (payload: { enterpriseId: string; teamId: string }) => ({
    payload,
  })
);

export const loadVoipData = createAction(
  OnboardingActionTypes.LOAD_VOIP_DATA,
  (payload: {
    voipData?: {
      dealerId: string;
      phoneNumber: string;
      voipProvider: string;
    } | null;
    voipDataLoading?: boolean;
    voipDataLoaded?: boolean;
    voipDataError?: boolean;
  }) => ({
    payload,
  })
);

export const generateMobileNumber = createAction(
  OnboardingActionTypes.GENERATE_MOBILE_NUMBER,
  (payload: { enterpriseId: string; teamId: string }) => ({
    payload,
  })
);

export const loadMobileNumber = createAction(
  OnboardingActionTypes.LOAD_MOBILE_NUMBER,
  (payload: {
    mobileNumber?: string | null;
    mobileNumberLoading?: boolean;
    mobileNumberLoaded?: boolean;
    mobileNumberError?: boolean;
  }) => ({
    payload,
  })
);

export const fetchAgentTypes = createAction(
  OnboardingActionTypes.FETCH_AGENT_TYPES,
  (payload: { enterpriseId: string; teamId: string }) => ({
    payload,
  })
);

export const loadAgentTypes = createAction(
  OnboardingActionTypes.LOAD_AGENT_TYPES,
  (payload: {
    agentTypes?: AgentType[];
    agentTypesLoading?: boolean;
    agentTypesLoaded?: boolean;
    agentTypesError?: boolean;
  }) => ({
    payload,
  })
);

// New actions for languages and voices
export const fetchLanguages = createAction(
  OnboardingActionTypes.FETCH_LANGUAGES,
  () => ({ payload: {} })
);

export const loadLanguages = createAction(
  OnboardingActionTypes.LOAD_LANGUAGES,
  (payload: {
    languages?: Language[];
    languagesLoading?: boolean;
    languagesLoaded?: boolean;
    languagesError?: boolean;
  }) => ({
    payload,
  })
);

export const fetchVoices = createAction(
  OnboardingActionTypes.FETCH_VOICES,
  (payload: { languageId: string }) => ({
    payload,
  })
);

export const loadVoices = createAction(
  OnboardingActionTypes.LOAD_VOICES,
  (payload: {
    voices?: Voice[];
    voicesLoading?: boolean;
    voicesLoaded?: boolean;
    voicesError?: boolean;
    languageId?: string;
  }) => ({
    payload,
  })
);

export const fetchTimezone = createAction(
  OnboardingActionTypes.FETCH_TIMEZONE,
  (payload: { teamId: string }) => ({
    payload,
  })
);

export const setTimezone = createAction(
  OnboardingActionTypes.SET_TIMEZONE,
  (payload: { timezone: string }) => ({
    payload,
  })
);
