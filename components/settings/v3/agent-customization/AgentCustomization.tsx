import {
  DEAFULT_DEALERSHIP_CUSTOMIZATION,
  DealershipCustomizationFormValues,
} from '@/app-models-settings/onboarding/AgentCustomizationConfig';
import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { fetchOnboardedAgentsAPI } from '@/services/settings/agents.service';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import {
  ViniConfigResponse,
  createViniConfigAPI,
  fetchViniConfigAPI,
} from '@/services/settings/vini-config.service';
import { setAvailableAgents } from '@/store-settings/reducers/agents.reducer';
// @ts-ignore
import { Spinner } from '@spyne-console/design-system';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';
import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import useAgentsRedux from '@/hooks/settings/use-agents-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { buildAgentCustomizationPayloadFromForm } from '@/helpers-settings/vini-config-builder';

import AvatarGradient from '../common/AvatarGradient';
import DurationHolder from '../common/DurationHolder';
import MessageField from './MessageField';
import PreferredAreaCode from './PreferredAreaCode';
import {
  transformApiToFormFormat,
  transformFormToApiFormat,
} from './agent-customization-transformers';
import {
  AgentCustomizationValidationErrors,
  validateAgentCustomizationForm,
} from './agent-customization-validators';

const STEP_CONNECTOR_CLASS =
  "relative before:absolute before:-top-6 before:left-12 before:z-[4] before:h-6 before:w-0.5 before:border-l-2 before:border-dashed before:border-black/10 before:content-['']";

const AgentCustomization: React.FC<{
  isEditMode?: boolean;
  goBack?: () => void;
}> = ({ isEditMode = false, goBack }) => {
  const { goToNextStep, goToPrevStep } = useOnboardingStepNavigation();
  const { activeAgentId } = useActiveAgent();
  const { availableAgents } = useAgentsRedux({});
  const { enterpriseId, teamId, userId } = useUserDetails();
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viniConfig, setViniConfig] = useState<ViniConfigResponse | null>(null);
  const [isAreaCodeFromApi, setIsAreaCodeFromApi] = useState(false);
  const { productLineId } = useMainContext();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const { agentTypes } = useAgentTypesRedux({});
  const agent = useMemo(() => {
    return availableAgents.find((a) => a.teamAgentMappingId === activeAgentId);
  }, [availableAgents, activeAgentId]);

  const agentType = useMemo(() => {
    return agentTypes.find((a) => a.agentTypeId === agent?.agentTypeId);
  }, [agentTypes, agent?.agentTypeId]);

  const dispatch = useDispatch();

  const initialValues = useMemo(() => {
    return {
      ...DEAFULT_DEALERSHIP_CUSTOMIZATION,
      firstMessage: agentType?.firstMessage ?? '',
      voicemailMessage: agentType?.voicemailMessage ?? '',
    };
  }, [agentType]);

  const validateForm = (): {
    isValid: boolean;
    errors: AgentCustomizationValidationErrors;
  } => {
    const { errors, isValid } =
      validateAgentCustomizationForm(customizationValues);

    setValidationErrors(errors);
    return { isValid, errors };
  };

  const handleContinue = async () => {
    if (
      !enterpriseId ||
      !teamId ||
      !userId ||
      !agent?.agentType ||
      !agent?.agentCallType ||
      !agent?.teamAgentMappingId
    ) {
      toast.error('Missing required information to submit configuration');
      return;
    }

    // Validate form before submission
    const { isValid, errors } = validateForm();
    if (!isValid) {
      toast.error('Please fix the validation errors before continuing');
      // Scroll to the first error
      scrollToFirstError(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform the form values to the format expected by the builder,
      // only including fields that are visible for this agent type
      const transformedFormData = transformFormToApiFormat(
        customizationValues,
        {
          isOutboundAgent,
          hasPhoneNumber: Boolean(agent.phoneNumber),
        }
      );

      // Build the payload using the builder function
      const payload = buildAgentCustomizationPayloadFromForm(
        transformedFormData,
        agent.teamAgentMappingId,
        enterpriseId,
        teamId,
        userId,
        agent.agentType,
        agent.agentCallType,
        true
      );
      await createViniConfigAPI(payload);
      const agents = await fetchOnboardedAgentsAPI({
        enterpriseId,
        teamId,
        forceRefresh: true,
      });
      dispatch(setAvailableAgents({ agents }));
      toast.success('Agent customization saved successfully');
      if (!isEditMode) {
        await updateTaskAndRefresh(
          {
            productLineId: productLineId,
            taskName: OnboardingTaskName.AGENT_CUSTOMIZATION,
            agentType: agent.agentType,
            agentCallType: agent.agentCallType,
          },
          true
        );
        goToNextStep();
      } else if (!!goBack) {
        goBack?.();
      }
    } catch (error: any) {
      toast.error(`${error.response.data.error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [customizationValues, setCustomizationValues] =
    useState<DealershipCustomizationFormValues>(initialValues);

  // Validation errors state
  const [validationErrors, setValidationErrors] =
    useState<AgentCustomizationValidationErrors>({});

  // Refs for scrolling to error sections
  const preferredAreaCodeRef = useRef<HTMLDivElement>(null);

  // Determine agent type flags
  const isOutboundAgent = useMemo(
    () => agent?.agentCallType.toLowerCase() === 'outbound',
    [agent?.agentCallType]
  );

  // Handler functions
  const handleFirstMessageChange = (value: string) => {
    setCustomizationValues((prev) => ({
      ...prev,
      firstMessage: value,
    }));
  };

  const handleVoicemailMessageChange = (value: string) => {
    setCustomizationValues((prev) => ({
      ...prev,
      voicemailMessage: value,
    }));
  };

  const handlePreferredAreaCodeChange = (value: string) => {
    setCustomizationValues((prev) => ({
      ...prev,
      preferredAreaCode: value,
    }));

    // Clear error when user starts typing
    if (validationErrors.preferredAreaCode) {
      setValidationErrors((prev) => ({
        ...prev,
        preferredAreaCode: undefined,
      }));
    }
  };

  // Function to scroll to the first error
  const scrollToFirstError = (errors: AgentCustomizationValidationErrors) => {
    if (errors.preferredAreaCode && preferredAreaCodeRef.current) {
      preferredAreaCodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Fetch Vini Config
  useEffect(() => {
    const fetchConfig = async () => {
      if (
        !enterpriseId ||
        !teamId ||
        !agent?.agentType ||
        !agent?.agentCallType ||
        !activeAgentId
      ) {
        return;
      }

      setIsLoadingConfig(true);
      try {
        const config = await fetchViniConfigAPI({
          enterpriseId,
          teamId,
          agentType: agent.agentType,
          agentCallType: agent.agentCallType,
          isCommonNeeded: true,
          agentId: activeAgentId,
        });

        setViniConfig(config);

        // Check if area code exists in API response
        const hasAreaCodeFromApi = Boolean(config.agents?.areaCode);
        setIsAreaCodeFromApi(hasAreaCodeFromApi);

        const updatedValues = transformApiToFormFormat(config, initialValues);

        setCustomizationValues(updatedValues);

        toast.success('Agent configuration loaded successfully');
      } catch (error: any) {
        toast.error(`Failed to load agent configuration: ${error.error}`);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [
    enterpriseId,
    teamId,
    agent?.agentType,
    agent?.agentCallType,
    activeAgentId,
  ]);

  return isLoadingConfig ? (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative flex h-full overflow-hidden">
        <OnboardingBackgroundGrid fadeRight={true} width="50%" />

        <div className="flex h-full w-full flex-col gap-6 p-8 pb-0">
          <OnboardingStepHeader
            title="Agent Customization"
            description="Control how will I handled customer queries"
            avatarNode={<AvatarGradient agentImage={agent?.imageUrl || ''} />}
          >
            <DurationHolder />
          </OnboardingStepHeader>

          <div className="flex flex-col gap-6 overflow-y-scroll pb-8 pr-2">
            {!isOutboundAgent && (
              <div className={STEP_CONNECTOR_CLASS}>
                <MessageField
                  title="First Message"
                  description="Your agent will say this message to start every conversation.."
                  placeholder="Example: Hey Thank you for calling [xxx]. I'm [xxx]! How may I be of assistance today?"
                  value={customizationValues.firstMessage}
                  onChange={handleFirstMessageChange}
                  showRestoreDefault={true}
                  onRestoreDefault={() =>
                    handleFirstMessageChange(initialValues.firstMessage)
                  }
                />
              </div>
            )}
            {isOutboundAgent && (
              <div className={STEP_CONNECTOR_CLASS}>
                <MessageField
                  title="Voicemail Message"
                  description="Your agent will say this message in voicemail"
                  placeholder="Example: Hey Thank you for calling [xxx]. I'm [xxx]! How may I be of assistance today?"
                  value={customizationValues.voicemailMessage}
                  onChange={handleVoicemailMessageChange}
                />
              </div>
            )}
            {!agent?.phoneNumber && (
              <div className={STEP_CONNECTOR_CLASS} ref={preferredAreaCodeRef}>
                <PreferredAreaCode
                  value={customizationValues.preferredAreaCode}
                  onChange={handlePreferredAreaCodeChange}
                  errors={{
                    preferredAreaCode: validationErrors.preferredAreaCode,
                  }}
                  disabled={isAreaCodeFromApi}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <OnboardingFooter
        onBack={() => (isEditMode && !!goBack ? goBack?.() : goToPrevStep)}
        onContinue={handleContinue}
        showBackButton={isEditMode && !!goBack}
        disableBack={isSubmitting}
        disableContinue={isSubmitting}
        backLabel="Back"
        continueLabel={
          isSubmitting ? 'Saving...' : isEditMode ? 'Save' : 'Next'
        }
      />
    </div>
  );
};

export default AgentCustomization;
