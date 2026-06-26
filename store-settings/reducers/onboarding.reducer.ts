// @ts-nocheck
import { OnboardingStep } from '@/app-models-settings/Onboarding';
import { CustomAgentConfigs } from '@/app-models-settings/assistant/agent-configs';
import { AgentType } from '@/app-models-settings/assistant/agent-type';
import { AIAssistant } from '@/app-models-settings/assistant/assistant';
import { Language, Voice } from '@/app-models-settings/linguistics';
import { OnboardingActionTypes } from '@/store-settings/actions/onboarding.actions';

import { useSelector } from 'react-redux';

import { AgentCustomizationTabs } from '@/components/settings/onboarding/agent-customization/AgentCustomization';

import { useOnboardingProgress } from '@/hooks/settings/useOnboardingProgress';

import { patchCustomAgentDetails } from '@/helpers-settings/onboarding.helper';

import { RootState } from '../root-reducer';

interface VoipData {
  dealerId: string;
  phoneNumber: string;
  voipProvider: string;
}

export interface CustomAgentDetails {
  agent?: AIAssistant;
  subSteps?: AgentCustomizationTabs[];
  configs: CustomAgentConfigs;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  customAgentDetails: CustomAgentDetails | null;
  onboardingHistoryStack: OnboardingStep[];
  customAgentDetailsLoading: boolean;
  customAgentDetailsLoaded: boolean;
  firstOnboardingProgress: OnboardingStep[];
  hasEnterpriseOnboarded: boolean;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  voipSubmissionLoading: boolean;
  voipSubmissionLoaded: boolean;
  voipSubmissionError: boolean;
  voipData: VoipData | null;
  voipDataLoading: boolean;
  voipDataLoaded: boolean;
  voipDataError: boolean;
  mobileNumber: string | null;
  mobileNumberLoading: boolean;
  mobileNumberLoaded: boolean;
  mobileNumberError: boolean;
  agentTypes: AgentType[];
  agentTypesLoading: boolean;
  agentTypesLoaded: boolean;
  agentTypesError: boolean;
  languages: Language[];
  languagesLoading: boolean;
  languagesLoaded: boolean;
  languagesError: boolean;
  voices: Voice[];
  voicesLoading: boolean;
  voicesLoaded: boolean;
  voicesError: boolean;
  selectedLanguageId: string | null;
  timezone: string | null;
}

export interface UpdateOnboardingProgressPayload {
  currentStep?: OnboardingStep;
  firstOnboardingProgress?: OnboardingStep[];
  hasEnterpriseOnboarded?: boolean;
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
}

export interface VoipSubmissionPayload {
  voipSubmissionLoading?: boolean;
  voipSubmissionLoaded?: boolean;
  voipSubmissionError?: boolean;
}

export interface VoipDataPayload {
  voipData?: VoipData | null;
  voipDataLoading?: boolean;
  voipDataLoaded?: boolean;
  voipDataError?: boolean;
}

export interface MobileNumberPayload {
  mobileNumber?: string | null;
  mobileNumberLoading?: boolean;
  mobileNumberLoaded?: boolean;
  mobileNumberError?: boolean;
}

export interface AgentTypesPayload {
  agentTypes?: AgentType[];
  agentTypesLoading?: boolean;
  agentTypesLoaded?: boolean;
  agentTypesError?: boolean;
}

export interface LanguagesPayload {
  languages?: Language[];
  languagesLoading?: boolean;
  languagesLoaded?: boolean;
  languagesError?: boolean;
}

export interface VoicesPayload {
  voices?: Voice[];
  voicesLoading?: boolean;
  voicesLoaded?: boolean;
  voicesError?: boolean;
  languageId?: string;
}

export interface TimezonePayload {
  timezone?: string | null;
}

const initialState: OnboardingState = {
  currentStep: OnboardingStep.NOT_STARTED,
  onboardingHistoryStack: [],
  customAgentDetails: null,
  customAgentDetailsLoading: false,
  customAgentDetailsLoaded: false,
  firstOnboardingProgress: [OnboardingStep.NOT_STARTED],
  hasEnterpriseOnboarded: false,
  loading: false,
  loaded: false,
  error: false,
  voipSubmissionLoading: false,
  voipSubmissionLoaded: false,
  voipSubmissionError: false,
  voipData: null,
  voipDataLoading: false,
  voipDataLoaded: false,
  voipDataError: false,
  mobileNumber: null,
  mobileNumberLoading: false,
  mobileNumberLoaded: false,
  mobileNumberError: false,
  agentTypes: [],
  agentTypesLoading: false,
  agentTypesLoaded: false,
  agentTypesError: false,
  languages: [],
  languagesLoading: false,
  languagesLoaded: false,
  languagesError: false,
  voices: [],
  voicesLoading: false,
  voicesLoaded: false,
  voicesError: false,
  selectedLanguageId: null,
  timezone: null,
};

const onboardingReducer = (
  state = initialState,
  action: {
    type: OnboardingActionTypes;
    payload:
      | UpdateOnboardingProgressPayload
      | VoipSubmissionPayload
      | VoipDataPayload
      | MobileNumberPayload
      | AgentTypesPayload
      | LanguagesPayload
      | VoicesPayload;
  }
) => {
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case OnboardingActionTypes.RESET_CUSTOMIZED_AGENT: {
      return {
        ...state,
        customAgentDetails: null,
        customAgentDetailsLoading: false,
        customAgentDetailsLoaded: false,
      };
    }
    case OnboardingActionTypes.UPDATE_ONBOARDING_HISTORY: {
      const { onboardingHistoryStack } = action.payload as {
        onboardingHistoryStack: OnboardingStep[];
      };
      return { ...state, onboardingHistoryStack };
    }
    case OnboardingActionTypes.PATCH_CUSTOMIZED_AGENT: {
      const {
        customAgentDetails,
        loading,
        loaded,
        shouldReset,
        patchPayload,
        patchedConfigs,
      } = action.payload as any;
      return {
        ...state,
        customAgentDetails: shouldReset
          ? undefined
          : patchCustomAgentDetails(
              customAgentDetails,
              !!state.customAgentDetails ? state.customAgentDetails : undefined,
              patchPayload,
              patchedConfigs
            ),
        customAgentDetailsLoading: loading,
        customAgentDetailsLoaded: loaded,
      };
    }
    case OnboardingActionTypes.LOAD_ONBOARDING_PROGRESS: {
      const {
        currentStep,
        firstOnboardingProgress,
        hasEnterpriseOnboarded,
        loading,
        loaded,
        error,
      } = action.payload as UpdateOnboardingProgressPayload;
      return {
        ...state,
        currentStep: currentStep ?? state.currentStep,
        firstOnboardingProgress: firstOnboardingProgress?.length
          ? firstOnboardingProgress
          : state.firstOnboardingProgress,
        hasEnterpriseOnboarded:
          hasEnterpriseOnboarded ?? state.hasEnterpriseOnboarded,
        loading: loading ?? state.loading,
        loaded: loaded ?? state.loaded,
        error: error ?? state.error,
      };
    }
    case OnboardingActionTypes.LOAD_VOIP_SUBMISSION: {
      const {
        voipSubmissionLoading,
        voipSubmissionLoaded,
        voipSubmissionError,
      } = action.payload as VoipSubmissionPayload;
      return {
        ...state,
        voipSubmissionLoading:
          voipSubmissionLoading ?? state.voipSubmissionLoading,
        voipSubmissionLoaded:
          voipSubmissionLoaded ?? state.voipSubmissionLoaded,
        voipSubmissionError: voipSubmissionError ?? state.voipSubmissionError,
      };
    }
    case OnboardingActionTypes.LOAD_VOIP_DATA: {
      const { voipData, voipDataLoading, voipDataLoaded, voipDataError } =
        action.payload as VoipDataPayload;
      return {
        ...state,
        voipData: voipData !== undefined ? voipData : state.voipData,
        voipDataLoading: voipDataLoading ?? state.voipDataLoading,
        voipDataLoaded: voipDataLoaded ?? state.voipDataLoaded,
        voipDataError: voipDataError ?? state.voipDataError,
      };
    }
    case OnboardingActionTypes.LOAD_MOBILE_NUMBER: {
      const {
        mobileNumber,
        mobileNumberLoading,
        mobileNumberLoaded,
        mobileNumberError,
      } = action.payload as MobileNumberPayload;
      return {
        ...state,
        mobileNumber:
          mobileNumber !== undefined ? mobileNumber : state.mobileNumber,
        mobileNumberLoading: mobileNumberLoading ?? state.mobileNumberLoading,
        mobileNumberLoaded: mobileNumberLoaded ?? state.mobileNumberLoaded,
        mobileNumberError: mobileNumberError ?? state.mobileNumberError,
      };
    }
    case OnboardingActionTypes.LOAD_AGENT_TYPES: {
      const {
        agentTypes,
        agentTypesLoading,
        agentTypesLoaded,
        agentTypesError,
      } = action.payload as AgentTypesPayload;
      return {
        ...state,
        agentTypes: agentTypes !== undefined ? agentTypes : state.agentTypes,
        agentTypesLoading: agentTypesLoading ?? state.agentTypesLoading,
        agentTypesLoaded: agentTypesLoaded ?? state.agentTypesLoaded,
        agentTypesError: agentTypesError ?? state.agentTypesError,
      };
    }
    case OnboardingActionTypes.LOAD_LANGUAGES: {
      const { languages, languagesLoading, languagesLoaded, languagesError } =
        action.payload as LanguagesPayload;
      return {
        ...state,
        languages: languages !== undefined ? languages : state.languages,
        languagesLoading: languagesLoading ?? state.languagesLoading,
        languagesLoaded: languagesLoaded ?? state.languagesLoaded,
        languagesError: languagesError ?? state.languagesError,
      };
    }
    case OnboardingActionTypes.LOAD_VOICES: {
      const { voices, voicesLoading, voicesLoaded, voicesError, languageId } =
        action.payload as VoicesPayload;
      return {
        ...state,
        voices: voices !== undefined ? voices : state.voices,
        voicesLoading: voicesLoading ?? state.voicesLoading,
        voicesLoaded: voicesLoaded ?? state.voicesLoaded,
        voicesError: voicesError ?? state.voicesError,
        selectedLanguageId:
          languageId !== undefined ? languageId : state.selectedLanguageId,
      };
    }
    case OnboardingActionTypes.SET_TIMEZONE: {
      const { timezone } = action.payload as TimezonePayload;
      return {
        ...state,
        timezone: timezone ?? state.timezone,
      };
    }
    default:
      return state;
  }
};

export default onboardingReducer;

export const getStepLoadingStatus = () => {
  return useSelector((state: RootState) => state.onboarding);
};

export const shouldEnableStepUpdate = (step: OnboardingStep) => {
  const { currentProgress } = useOnboardingProgress();
  const isLastStepOfFinalProgress =
    currentProgress[currentProgress.length - 1] === step;
  return !currentProgress.includes(step) || isLastStepOfFinalProgress;
};

export const getLanguagesState = () => {
  return useSelector((state: RootState) => ({
    languages: state.onboarding.languages,
    languagesLoading: state.onboarding.languagesLoading,
    languagesLoaded: state.onboarding.languagesLoaded,
    languagesError: state.onboarding.languagesError,
  }));
};

export const getVoicesState = () => {
  return useSelector((state: RootState) => ({
    voices: state.onboarding.voices,
    voicesLoading: state.onboarding.voicesLoading,
    voicesLoaded: state.onboarding.voicesLoaded,
    voicesError: state.onboarding.voicesError,
    selectedLanguageId: state.onboarding.selectedLanguageId,
  }));
};

export const getLanguageOptions = () => {
  return useSelector((state: RootState) =>
    state.onboarding.languages.map((lang) => ({
      value: lang.languageId,
      label: lang.languageName,
      code: lang.languageCode,
      countryCode: lang.countryCode,
    }))
  );
};

export const getVoiceOptions = () => {
  return useSelector((state: RootState) =>
    state.onboarding.voices.map((voice) => ({
      value: voice.voiceId,
      label: voice.voiceName,
      provider: voice.provider,
      languageId: voice.languageId,
      config: voice.voiceConfig,
    }))
  );
};
