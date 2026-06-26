import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import { RootState } from '@/types/settings/store';

import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { SmartViewFlow } from '@spyne-console/components/onboarding/smartview';

import useAgentTypesRedux from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingProgressRedux } from '@/hooks/settings/use-onboarding-progress-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

interface SmartViewWrapperProps {
  onNext?: () => void;
  onBack?: () => void;
  isEditMode?: boolean;
}

const SmartViewWrapper: React.FC<SmartViewWrapperProps> = ({
  onNext,
  onBack,
  isEditMode = false,
}) => {
  const { goToNextStep, goToPrevStep } = useOnboardingStepNavigation();
  const { enterpriseId, teamId, userId } = useUserDetails();
  const { data: onboardingProgressData } = useOnboardingProgressRedux({});
  const { productLineId } = useMainContext();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const { activeAgentTypeId } = useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});

  const agentTypeData = useMemo(() => {
    return agentTypes.find((agent) => agent.agentTypeId === activeAgentTypeId);
  }, [agentTypes, activeAgentTypeId]);

  const enterpriseTeamReducer = useSelector(
    (state: RootState) => state.enterpriseTeamReducer
  );

  const enterpriseName =
    enterpriseTeamReducer?.enterprise?.enterprise_name ?? '';
  const teamName = enterpriseTeamReducer?.selectedTeam?.team_name ?? '';

  useEffect(() => {
    if (isEditMode) return;
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.SMART_VIEW_SETUP,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  const handleComplete = () => {
    if (!isEditMode) {
      updateTaskAndRefresh(
        {
          productLineId: productLineId,
          taskName: OnboardingTaskName.SMART_VIEW_SETUP,
          agentType: agentTypeData?.agentType ?? '',
          agentCallType: agentTypeData?.agentCallType ?? '',
        },
        true
      );
    }
    onNext ? onNext() : goToNextStep();
  };

  return (
    <div className="h-full w-full px-6">
      <SmartViewFlow
        enterpriseId={enterpriseId ?? ''}
        enterpriseName={enterpriseName}
        teamId={teamId ?? ''}
        teamName={teamName}
        userId={userId ?? ''}
        product="vini"
        onShowError={(msg) => {
          toast.error(msg);
        }}
        onShowSuccess={(msg) => {
          toast.success(msg);
        }}
        onboardingCallbacks={{
          handleNextStep: handleComplete,
          handlePrevStep: onBack ?? (() => goToPrevStep()),
          onboardingStartTime:
            onboardingProgressData?.onboardingStartTime ?? null,
        }}
        onGoBack={onBack ?? (() => goToPrevStep())}
      />
    </div>
  );
};

export default SmartViewWrapper;
