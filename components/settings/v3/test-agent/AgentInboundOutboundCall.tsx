import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import CallAvatar from '@/components/call/CallAvatar';
import CallAvatarLabel from '@/components/call/CallAvatarLabel';

import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { cn } from '@/lib/settings/utils';

import AvatarGradient from '../common/AvatarGradient';
import DurationHolder from '../common/DurationHolder';

interface CallStatusResponse {
  status: CallStatus;
}

type CallStatus = 'in-progress' | 'ended' | null;

export const AgentInboundOutboundCall = ({
  goToFeedbacks,
  goToPreview,
}: {
  goToFeedbacks: () => void;
  goToPreview: () => void;
}) => {
  const { activeAgentId } = useActiveAgent();
  const previousCallStatus = useRef<Set<CallStatus>>(new Set<CallStatus>());
  const { availableAgents, isLoading } = useAgentsRedux({});
  const [callStatus, setCallStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enterpriseId, teamId } = useUserDetails();
  const isMounted = useRef(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const agent = availableAgents.find(
    (a) => a.teamAgentMappingId === activeAgentId
  );

  const fetchCallStatus = async (showLoading: boolean = false) => {
    if (!isMounted.current) return;

    setIsLoadingStatus(showLoading);
    setError(null);

    try {
      const response: CallStatusResponse =
        await CentralAPIHandler.handleGetRequest(
          `${process.env.APP_BACKEND_BASEURL}/conversation/call/status`,
          { enterpriseId, teamId }
        );

      if (isMounted.current) {
        setCallStatus(response.status);
        previousCallStatus.current.add(response.status);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error('Failed to fetch call status');
      }
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const label = useMemo(() => {
    if (callStatus === 'in-progress') return 'Active Call';
    if (callStatus === 'ended' && previousCallStatus.current.has('in-progress'))
      return 'Call Ended';
    return 'Call not initiated';
  }, [callStatus]);

  const getCallStatusColor = useMemo(() => {
    if (callStatus === 'in-progress')
      return 'text-green-800 bg-green-100 outline-green-800';
    if (callStatus === 'ended') return 'bg-white bg-[#C41919]';
    return 'text-gray-500 bg-[#f5f5f5] outline-gray-500';
  }, [callStatus]);

  useEffect(() => {
    if (!enterpriseId || !teamId) return;

    isMounted.current = true;

    fetchCallStatus(true);

    intervalId.current = setInterval(() => {
      fetchCallStatus(false);
    }, 5000);

    return () => {
      resetCall();
    };
  }, [enterpriseId, teamId]);

  useEffect(() => {
    return () => {
      resetCall();
    };
  }, []);

  const resetCall = () => {
    isMounted.current = false;
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
    setCallStatus(null);
    previousCallStatus.current.clear();
  };

  useEffect(() => {
    if (
      callStatus === 'ended' &&
      previousCallStatus.current.has('in-progress')
    ) {
      goToFeedbacks();
    }
  }, [callStatus]);

  if (!agent) {
    return null;
  }

  return (
    <div
      className="relative flex h-full w-full flex-col gap-8 overflow-hidden bg-cover bg-center py-8 pl-8 pr-12"
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
      <div className="flex h-full w-full flex-col items-center justify-between py-8">
        <div className="flex flex-col items-center justify-center gap-8">
          <CallAvatar agent={agent} avatarSize={300} />
          <CallAvatarLabel agent={agent} />
        </div>
        <div
          className={cn(
            'group relative flex h-14 min-w-[200px] cursor-pointer items-center justify-center gap-8 rounded-[100px] px-6 py-5 text-lg font-semibold leading-6 outline outline-2 outline-offset-[-2px] transition-all hover:bg-blue-600 hover:text-white hover:outline-blue-600',
            getCallStatusColor
          )}
          onClick={goToFeedbacks}
        >
          <span className="group-hover:hidden">{label}</span>
          <span className="hidden group-hover:inline">Skip</span>
        </div>
      </div>
    </div>
  );
};
