import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import { RootState } from '@/types/settings/store';

import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { IntegrationsFlow } from '@spyne-console/components/onboarding/integrations';
import { SyncApprovalFlow } from '@spyne-console/components/onboarding/sync-approval';

import useAgentTypesRedux from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingProgressRedux } from '@/hooks/settings/use-onboarding-progress-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

enum IntegrationStep {
  INVENTORY = 'inventory',
  APPROVAL = 'approval',
}

const IntegrationWrapper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<IntegrationStep>(
    IntegrationStep.INVENTORY
  );
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
  const authReducer = useSelector((state: RootState) => state.authReducer);

  const enterpriseName =
    enterpriseTeamReducer?.enterprise?.enterprise_name ?? '';
  const teamName = enterpriseTeamReducer?.selectedTeam?.team_name ?? '';
  const userEmail = authReducer?.email ?? '';

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.IMS_INTEGRATION,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  const handleApprovalComplete = () => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.IMS_INTEGRATION,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      true
    );
    goToNextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case IntegrationStep.APPROVAL:
        return (
          <SyncApprovalFlow
            enterpriseId={enterpriseId ?? ''}
            enterpriseName={enterpriseName}
            teamId={teamId ?? ''}
            teamName={teamName}
            userId={userId ?? ''}
            productLineId={productLineId}
            imsOnly={true}
            onboardingCallbacks={{
              handleNextStep: handleApprovalComplete,
              handlePrevStep: () => setCurrentStep(IntegrationStep.INVENTORY),
              onboardingStartTime:
                onboardingProgressData?.onboardingStartTime ?? null,
            }}
          />
        );
      case IntegrationStep.INVENTORY:
      default:
        return (
          <IntegrationsFlow
            enterpriseId={enterpriseId ?? ''}
            enterpriseName={enterpriseName}
            teamId={teamId ?? ''}
            teamName={teamName}
            userId={userId ?? ''}
            userEmail={userEmail}
            inventoryOnly={true}
            onboardingCallbacks={{
              handleNextStep: () => setCurrentStep(IntegrationStep.APPROVAL),
              handlePrevStep: () => goToPrevStep(),
              handleSkipStep: () => goToNextStep(),
              onboardingStartTime:
                onboardingProgressData?.onboardingStartTime ?? null,
            }}
          />
        );
    }
  };

  return <div className="h-full w-full px-6">{renderStep()}</div>;
};

export default IntegrationWrapper;
