import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
// @ts-ignore
import { Spinner } from '@spyne-console/design-system';

import { useEffect, useState } from 'react';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { cn } from '@/lib/settings/utils';

import { AgentCall } from './AgentCall';
import { AgentInboundOutboundCall } from './AgentInboundOutboundCall';
import { TestAgentFeedback } from './TestAgentFeedback';
import { TestAgentPreview } from './TestAgentPreview';

export enum TestAgentStages {
  PREVIEW = 'preview',
  CALL = 'call',
  INBOUND_OUTBOUND_CALL = 'inbound-outbound-call',
  FEEDBACK = 'feedback',
}

export const TestAgent = () => {
  const { activeAgentId } = useActiveAgent();
  const [step, setStep] = useState<TestAgentStages>(TestAgentStages.PREVIEW);
  const [webCallCustomerDetails, setWebCallCustomerDetails] = useState<
    Record<string, any> | undefined
  >(undefined);
  const { availableAgents, isLoading } = useAgentsRedux({});
  const { teamId } = useUserDetails();
  const { productLineId } = useMainContext();
  const { activeAgentTypeId } = useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();

  const agent = availableAgents.find(
    (a) => a.teamAgentMappingId === activeAgentId
  );

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.AGENT_TESTING,
        agentType: agent?.agentType ?? '',
        agentCallType: agent?.agentCallType ?? '',
      },
      false
    );
  }, []);

  if (!agent) {
    return null;
  }

  const handlePhoneCall = () => {
    setStep(TestAgentStages.CALL);
  };

  const handleWebCall = (customerDetails?: Record<string, any>) => {
    setWebCallCustomerDetails(customerDetails);
    setStep(TestAgentStages.CALL);
  };

  const renderStep = () => {
    switch (step) {
      case TestAgentStages.PREVIEW:
        return (
          <TestAgentPreview
            onPhoneCall={() => {}}
            onWebCall={handleWebCall}
            onCallInitiated={() => {
              setStep(TestAgentStages.INBOUND_OUTBOUND_CALL);
            }}
          />
        );
      case TestAgentStages.CALL:
        return (
          <AgentCall
            goToFeedbacks={() => setStep(TestAgentStages.FEEDBACK)}
            goToPreview={() => {
              setWebCallCustomerDetails(undefined);
              setStep(TestAgentStages.PREVIEW);
            }}
            customerDetails={webCallCustomerDetails}
          />
        );
      case TestAgentStages.INBOUND_OUTBOUND_CALL:
        return (
          <AgentInboundOutboundCall
            goToFeedbacks={() => setStep(TestAgentStages.FEEDBACK)}
            goToPreview={() => setStep(TestAgentStages.PREVIEW)}
          />
        );
      case TestAgentStages.FEEDBACK:
        return (
          <TestAgentFeedback
            onTestAgain={() => setStep(TestAgentStages.PREVIEW)}
          />
        );
    }
  };

  return isLoading ? (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <div
      className={cn(
        'relative flex h-full w-full',
        step === TestAgentStages.FEEDBACK ? 'bg-white' : 'bg-[#F8F9FA]'
      )}
    >
      <div className="relative flex h-full w-full flex-col">{renderStep()}</div>
    </div>
  );
};
