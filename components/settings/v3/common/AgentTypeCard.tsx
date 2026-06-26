import {
  OnboardingStep,
  StepStatus,
  getOnboardingStepByTaskName,
} from '@/app-models-settings/Onboarding';
import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useCallContext } from '@/contexts/settings/callContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { useOnboardingContext } from '@/contexts/settings/onboarding-context';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import { setActiveAssistantId } from '@/store-settings/actions/assistant.actions';
import { fetchPersonas } from '@/store-settings/actions/persona.actions';
import { AgentType } from '@/store-settings/models/agent-types.model';
import { OnboardedAgent } from '@/store-settings/models/agents.model';

import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { GoZap } from 'react-icons/go';
import { MdOutlineEdit, MdOutlinePhone } from 'react-icons/md';
import { PiUsers } from 'react-icons/pi';
import { SlCallIn, SlCallOut } from 'react-icons/sl';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/navigation';

import OnboardingPrimaryButton from '@spyne-console/components/onboarding/buttons/onboarding-primary-button';
import OnboardingSecondaryButton from '@spyne-console/components/onboarding/buttons/onboarding-secondary-button';

import useAgentsRedux from '@/hooks/settings/use-agents-redux';
import { useOnboardingProgress } from '@/hooks/settings/use-onboarding-progress';
import useOnboardingProgressRedux, {
  AgentProgressResult,
} from '@/hooks/settings/use-onboarding-progress-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { StringUtils } from '@/utils-settings/StringUtils';
import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { ProgressBadge } from './ProgressBadge';

interface AgentTypeCardProps {
  agentData: AgentType | OnboardedAgent;
  onClick?: () => void;
  className?: string;
  isAgentOnboarded?: boolean;
}

export const AgentTypeCard: React.FC<AgentTypeCardProps> = ({
  agentData,
  onClick,
  className = '',
  isAgentOnboarded = false,
}) => {
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [progress, setProgress] = useState<AgentProgressResult>(null);
  const { getAgentProgressByType } = useOnboardingProgressRedux({});
  const { enterpriseId, teamId } = useUserDetails();
  const router = useRouter();
  const { setActiveAgentTypeId, setActiveAgentId, setActivePersonaId } =
    useActiveAgent();
  const { availableAgents } = useAgentsRedux({});
  const dispatch = useDispatch();
  const { setActiveStep } = useOnboardingContext();
  const { setShouldInitiateCallOnRedirect } = useCallContext();
  const { onboardingStage } = useMainContext();

  const hasStartedOnboarding = useMemo(() => {
    return completionPercentage > 0 && completionPercentage < 100;
  }, [completionPercentage]);

  useEffect(() => {
    const progress = getAgentProgressByType(
      agentData.agentType,
      agentData.agentCallType
    );
    setProgress(progress);
    setCompletionPercentage(progress.completionPercentage);
  }, [agentData, isAgentOnboarded, getAgentProgressByType]);

  const handleSetupAgent = async () => {
    if (!enterpriseId || !teamId) return;
    setActiveAgentTypeId(agentData.agentTypeId);
    dispatch(fetchPersonas({ agentTypeId: agentData.agentTypeId }));
    setActiveStep(getOnboardingStepByTaskName(pendingStep));
    router.push(
      `/converse-ai/onboarding?enterprise_id=${enterpriseId}&team_id=${teamId}`
    );
  };

  const buttonLabel = useMemo(() => {
    if (completionPercentage === 0) {
      return 'Setup Agent';
    }
    return 'Continue Onboarding';
  }, [completionPercentage]);

  const pendingStep = useMemo(() => {
    return (
      (progress?.progressSteps.find((step) => step.status !== 'COMPLETED')
        ?.taskName as OnboardingTaskName) ?? OnboardingTaskName.ROOFTOP_SETUP
    );
  }, [progress]);

  const handleContinueOnboarding = async () => {
    if (!enterpriseId || !teamId) return;
    const agent = agentData as OnboardedAgent;
    if (agent.teamAgentMappingId) {
      setActiveAgentId(agent.teamAgentMappingId);
    }
    const teamAgent = availableAgents.find(
      (a) => a.teamAgentMappingId === agent.teamAgentMappingId
    );

    if (!teamAgent) {
      dispatch(fetchPersonas({ agentTypeId: agentData.agentTypeId }));
    }

    setActiveAgentTypeId(teamAgent?.agentTypeId || agentData.agentTypeId);
    teamAgent && setActivePersonaId(teamAgent.templateId);

    setActiveStep(getOnboardingStepByTaskName(pendingStep));
    let navigationUrl = `/converse-ai/onboarding?enterprise_id=${enterpriseId}&team_id=${teamId}`;

    if (agent.teamAgentMappingId) {
      navigationUrl += `&teamAgentMappingId=${agent.teamAgentMappingId}`;
    }
    router.push(navigationUrl);
  };

  const handleEditAgent = () => {
    if (!enterpriseId || !teamId) return;
    router.push(
      `/converse-ai/agents/${(agentData as OnboardedAgent).teamAgentMappingId}?enterprise_id=${enterpriseId}&team_id=${teamId}`
    );
  };

  const handleCTAClick = () => {
    if (completionPercentage > 0) {
      handleContinueOnboarding();
    } else {
      handleSetupAgent();
    }
  };

  const agentName = useMemo(() => {
    if (!(agentData as OnboardedAgent).teamAgentMappingId) return '';
    const agentName = agentData.name?.split(' ').filter(Boolean);
    return agentName[0];
  }, [agentData.name]);

  const handleCallAgent = () => {
    if (!enterpriseId || !teamId) return;
    dispatch(
      setActiveAssistantId((agentData as OnboardedAgent).teamAgentMappingId)
    );
    setShouldInitiateCallOnRedirect(true);
    router.push(
      `/converse-ai/agents?enterprise_id=${enterpriseId}&team_id=${teamId}&agentId=${(agentData as OnboardedAgent).teamAgentMappingId}&start=1`
    );
  };

  return (
    <div
      className={`flex h-[332px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-black/20 bg-white ${className}`}
    >
      <div className="relative flex h-full w-full justify-between overflow-hidden">
        {agentData.imageUrl && (
          <img
            src={getSafeStaticAssetUrl(agentData.imageUrl)}
            alt="Agent"
            className="absolute right-2 top-0 h-[400px] w-auto object-contain"
          />
        )}
        <div className="relative flex w-full flex-col items-center gap-4 px-5 py-6">
          <div className="z-2 relative flex w-full items-center gap-4">
            {!agentName ? (
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-xl font-semibold leading-7 text-[#111]">
                  {`${StringUtils.toCapitalize(agentData.agentType)} ${StringUtils.toCapitalize(agentData.agentCallType)} Agent`}
                </h3>
                <p className="text-sm font-normal leading-5 text-[#666]">
                  {StringUtils.toReadableString(
                    agentData?.description || 'No description available'
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-3">
                <div className="text-5xl font-semibold text-black">
                  {agentName || ''}
                </div>
                <div className="text-xl font-semibold leading-7 text-neutral-900">{`${StringUtils.toCapitalize(agentData.agentType)} ${StringUtils.toCapitalize(agentData.agentCallType)} Agent`}</div>
              </div>
            )}

            <div
              className={`flex items-center justify-center rounded-full p-3 ${agentData.agentCallType === 'inbound' ? 'bg-[#009D22]' : 'bg-[#FF2946]'}`}
            >
              {agentData.agentCallType === 'inbound' ? (
                <SlCallIn className="h-6 w-6 text-white" />
              ) : (
                <SlCallOut className="h-6 w-6 text-white" />
              )}
            </div>
          </div>

          {!(agentData as OnboardedAgent)?.phoneNumber && (
            <div className="z-2 relative flex w-full gap-2">
              <div className="flex h-6 items-center justify-center gap-1 rounded-full border border-[#ececec] bg-white px-2 py-0.5 text-center text-xs font-medium capitalize leading-4 text-[#111]">
                <GoZap className="h-4 w-4" />
                Quick
              </div>
              {agentData.agentUseCase && (
                <div className="flex h-6 items-center justify-center gap-1 rounded-full border border-[#ececec] bg-white px-2 py-0.5 text-center text-xs font-medium capitalize leading-4 text-[#111]">
                  <PiUsers className="h-4 w-4" />
                  {StringUtils.toReadableString(agentData.agentUseCase)}
                </div>
              )}
            </div>
          )}
          {hasStartedOnboarding ? (
            <div className="flex w-full justify-start">
              <ProgressBadge
                percentage={completionPercentage}
                className="w-fit"
              />
            </div>
          ) : (agentData as OnboardedAgent)?.phoneNumber ? (
            <div className="flex w-full justify-start gap-2">
              <MdOutlinePhone className="h-5 w-5" />
              <p className="text-base font-medium leading-6">
                {StringUtils.formatPhoneNumber(
                  (agentData as OnboardedAgent)?.phoneNumber
                )}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex w-full flex-col items-start border-t border-black/20 px-5 py-4">
        {isAgentOnboarded ? (
          <div className="flex w-full items-center justify-between gap-2">
            <OnboardingPrimaryButton
              onClick={handleCallAgent}
              className="w-full"
            >
              Call
            </OnboardingPrimaryButton>
            <OnboardingSecondaryButton
              onClick={handleEditAgent}
              className="h-[50px] w-[50px]"
            >
              <MdOutlineEdit className="h-6 w-6" />
            </OnboardingSecondaryButton>
          </div>
        ) : (
          onboardingStage === 'onboarding' &&
          progress?.progressSteps?.length > 0 && (
            <button
              onClick={handleCTAClick}
              className="flex h-[58px] w-full items-center justify-center gap-1 rounded-xl border border-[#111] bg-white px-2 py-0.5 shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)] transition-all duration-200 hover:bg-[#111] hover:text-white"
            >
              <span className="text-lg font-semibold leading-[26px]">
                {buttonLabel}
              </span>
              <FaArrowRight className="h-5 w-5" />
            </button>
          )
        )}
      </div>
    </div>
  );
};
