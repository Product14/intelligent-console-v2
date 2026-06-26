'use client';

import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import { createTwilioSubaccountAPI } from '@/services/settings/twilio.service';
import { updateRooftopConfigAPI } from '@/services/settings/vini-config.service';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';
import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { buildRooftopProfilePayloadFromForm } from '@/helpers-settings/vini-config-builder';

import RooftopProfile from './RooftopProfile';

export default function RooftopDetails() {
  const router = useRouter();
  const { enterpriseId, teamId, userId } = useUserDetails();
  const { activeAgentTypeId } = useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});
  const [formData, setFormData] = useState<any>(null);
  const [errors, setErrors] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setActiveAgentTypeId, setActiveAgentId } = useActiveAgent();
  const rooftopProfileRef = useRef<any>(null);
  const { productLineId } = useMainContext();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const { goToNextStep } = useOnboardingStepNavigation();

  // Get agent type data for filtering progress
  const agentTypeData = (agentTypes ?? []).find(
    (agent) => agent.agentTypeId === activeAgentTypeId
  );

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.ROOFTOP_SETUP,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  const handleContinue = async () => {
    if (errors?.hasErrors && !errors?.isValid) {
      rooftopProfileRef.current?.showAllErrors();
      Object.values(errors.errors)
        .filter((error: any) => error !== '')
        .forEach((error: any) => {
          toast.error(error);
        });
      return;
    }

    const agentTypeData = (agentTypes ?? []).find(
      (agent) => agent.agentTypeId === activeAgentTypeId
    );

    if (
      !enterpriseId ||
      !teamId ||
      !userId ||
      !agentTypeData?.agentType ||
      !agentTypeData?.agentCallType
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = buildRooftopProfilePayloadFromForm(
      formData,
      enterpriseId,
      teamId,
      userId,
      agentTypeData?.agentType,
      agentTypeData?.agentCallType
    );

    setIsLoading(true);
    try {
      await Promise.all([
        updateRooftopConfigAPI(payload),
        createTwilioSubaccountAPI(enterpriseId),
      ]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Error updating rooftop configuration'
      );
      setIsLoading(false);
      return;
    }

    try {
      await updateTaskAndRefresh(
        {
          productLineId: productLineId,
          taskName: OnboardingTaskName.ROOFTOP_SETUP,
          agentType: agentTypeData?.agentType ?? '',
          agentCallType: agentTypeData?.agentCallType ?? '',
        },
        true
      );
      toast.success('Rooftop configuration updated successfully');
      goToNextStep();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Error completing onboarding step'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative flex h-full overflow-hidden pl-8">
        <OnboardingBackgroundGrid fadeRight={true} width="50%" />

        {/* Main content */}
        <div className="h-full flex-1 overflow-hidden">
          <RooftopProfile
            ref={rooftopProfileRef}
            onFormChange={(data) => {
              setFormData(data);
            }}
            onErrorsChange={(data) => {
              setErrors(data);
            }}
          />
        </div>
      </div>

      <OnboardingFooter
        onBack={() => {
          setActiveAgentTypeId(null);
          setActiveAgentId(null);
          router.push(
            `/converse-ai?enterprise_id=${enterpriseId}&team_id=${teamId}`
          );
        }}
        onContinue={handleContinue}
        showBackButton={true}
        disableBack={false}
        disableContinue={isLoading}
        backLabel="Back"
        continueLabel={isLoading ? 'Saving...' : 'Next'}
      />
    </div>
  );
}
