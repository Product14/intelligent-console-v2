import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import {
  OnboardingTaskName,
  updateOnboardingTaskAPI,
} from '@/services/settings/onboarding.service';
import { useSelector } from '@spyne-console/store';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

// @ts-expect-error - Type declarations not generated for this component
import InviteUser from '@spyne-console/components/onboarding/invite-user/index';
import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';
import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import { useQueryParams } from '@/hooks/settings/useQueryParams';
import useUserDetails from '@/hooks/settings/useUserDetails';

import DurationHolder from '../common/DurationHolder';

export default function UserManagement() {
  const { goToNextStep } = useOnboardingStepNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { productLineId } = useMainContext();
  const { activeAgentTypeId } = useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const agentTypeData = useMemo(() => {
    return agentTypes.find((agent) => agent.agentTypeId === activeAgentTypeId);
  }, [agentTypes, activeAgentTypeId]);
  const { enterpriseId: enterpriseIdFromReducer, teamId: teamIdFromReducer } =
    useUserDetails();
  const teamName = useSelector(
    (state: any) => state.enterpriseTeamReducer.selectedTeam?.team_name
  );
  const { getQueryParam } = useQueryParams();
  const enterpriseIdQuery = getQueryParam('enterprise_id');
  const teamIdQuery = useMemo(() => {
    const raw = getQueryParam('team_id');
    if (!raw) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed[0] : String(parsed);
    } catch {
      return raw.replace(/^\[|\]$/g, '');
    }
  }, [getQueryParam('team_id')]);

  const enterpriseId = !!enterpriseIdFromReducer?.trim()
    ? enterpriseIdFromReducer
    : enterpriseIdQuery;
  const teamId = !!teamIdFromReducer?.trim() ? teamIdFromReducer : teamIdQuery;

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.USER_SETUP,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await updateTaskAndRefresh(
        {
          productLineId: productLineId,
          taskName: OnboardingTaskName.USER_SETUP,
          agentType: agentTypeData?.agentType ?? '',
          agentCallType: agentTypeData?.agentCallType ?? '',
        },
        true
      );
      goToNextStep();
    } catch (error) {
      toast.error('Error updating onboarding task');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative flex h-full overflow-hidden pl-8">
        <OnboardingBackgroundGrid fadeRight={true} width="50%" />
        {/* Main content */}
        <div className="mr-12 flex h-full flex-1 flex-col gap-6 overflow-hidden py-8">
          <OnboardingStepHeader
            title="Who all are in your Rooftops?"
            description="Manage your user across rooftop"
          >
            <DurationHolder />
          </OnboardingStepHeader>
          <div className="flex min-h-0 w-full flex-1 overflow-y-auto">
            <InviteUser
              enterpriseId={enterpriseId}
              teamId={teamId}
              teamName={teamName}
              showDepartment={true}
            />
          </div>
        </div>
      </div>

      <OnboardingFooter
        onContinue={handleContinue}
        showBackButton={false}
        disableContinue={isLoading}
        continueLabel={isLoading ? 'Saving...' : 'Next'}
      />
    </div>
  );
}
