import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';

import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import LiveCall from '@/components/call/LiveCall';
import CallSidebar from '@/components/call/call-sidebar/CallSidebar';

import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import AvatarGradient from '../common/AvatarGradient';
import DurationHolder from '../common/DurationHolder';

export const AgentCall = ({
  goToFeedbacks,
  goToPreview,
  customerDetails,
}: {
  goToFeedbacks: () => void;
  goToPreview: () => void;
  customerDetails?: Record<string, any>;
}) => {
  const { activeAgentId } = useActiveAgent();
  const { availableAgents, isLoading } = useAgentsRedux({});
  const agent = availableAgents.find(
    (a) => a.teamAgentMappingId === activeAgentId
  );
  if (!agent) {
    return null;
  }

  return (
    <div
      className="relative flex h-full w-full flex-col gap-8 overflow-hidden bg-cover bg-center px-8 py-8"
      style={{
        backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
      }}
    >
      <OnboardingStepHeader
        title="Test your agent"
        description="Awesome. I am ready now"
        avatarNode={<AvatarGradient agentImage={agent.imageUrl} />}
      >
        <DurationHolder />
      </OnboardingStepHeader>
      <div className="grid h-0 min-h-0 w-full flex-1 grid-cols-[60%_40%] gap-8 pr-8">
        <LiveCall
          goToFeedbacks={goToFeedbacks}
          onTryAgain={goToPreview}
          customerDetails={customerDetails}
        />
        <CallSidebar />
      </div>
    </div>
  );
};
