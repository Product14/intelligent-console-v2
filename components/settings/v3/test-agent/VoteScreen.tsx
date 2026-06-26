import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import {
  createViniConfigAPI,
  deployAgentAPI,
} from '@/services/settings/vini-config.service';
import { OnboardedAgent } from '@/store-settings/models/agents.model';

import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import AvatarGradient from '../common/AvatarGradient';
import DurationHolder from '../common/DurationHolder';

interface VoteScreenProps {
  agent: OnboardedAgent;
  onTestAgain?: () => void;
  onShareFeedback?: () => void;
}

const BackgroundGradient = ({ isSelected }: { isSelected: boolean }) => {
  return (
    <div
      className="absolute inset-0 rounded-xl"
      style={{
        background: isSelected
          ? 'linear-gradient(to right, #8400FF 20%, #E100FF 40%, #32D6FF 60%, #90C2FF 75%, #FF4894 90%)'
          : '#ECECEC',
      }}
    />
  );
};

const VoteScreen: React.FC<VoteScreenProps> = ({
  agent,
  onTestAgain,
  onShareFeedback,
}) => {
  const { productLineId } = useMainContext();
  const [isUpvoted, setUpvoted] = useState<boolean>(true);
  const { goToNextStep } = useOnboardingStepNavigation();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const [loading, setLoading] = useState<boolean>(false);
  const { enterpriseId, teamId, userId } = useUserDetails();
  const { setActiveAgentId, setActiveAgentTypeId, setActivePersonaId } =
    useActiveAgent();
  const router = useRouter();

  const completeFeedback = async () => {
    if (loading) return;
    setLoading(true);
    if (!enterpriseId || !teamId || !userId) {
      toast.error('Missing required data to deploy agent');
    }

    if (!isUpvoted) {
      goHome();
      return;
    }
    try {
      await updateTaskAndRefresh({
        productLineId: productLineId,
        taskName: OnboardingTaskName.AGENT_TESTING,
        agentType: agent.agentType,
        agentCallType: agent.agentCallType,
      });
      goToNextStep();
    } catch (error) {
      toast.error('Failed to deploy agent');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setActiveAgentId(null);
    setActiveAgentTypeId(null);
    setActivePersonaId(null);
    router.push(`/converse-ai?enterprise_id=${enterpriseId}&team_id=${teamId}`);
  };

  return (
    <div className="flex h-full w-full flex-col gap-[42px] overflow-y-auto p-8 pb-4">
      <OnboardingStepHeader
        title="Deploy your agent"
        description="Awesome. I am ready now"
        avatarNode={<AvatarGradient agentImage={agent.imageUrl} />}
      >
        <DurationHolder />
      </OnboardingStepHeader>

      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-[28px] font-bold leading-9 tracking-[-0.28px] text-[#111]">
          Is the agent ready to go live?
        </h2>

        <div className="flex h-[212px] gap-6">
          <div className="relative flex flex-1 p-[3px]">
            <BackgroundGradient isSelected={isUpvoted} />
            <button
              onClick={() => setUpvoted(true)}
              className="relative z-10 flex w-full flex-col items-center justify-end gap-8 rounded-[10px] bg-white p-5 shadow-[2px_2px_12px_0px_rgba(17,17,17,0.04)]"
            >
              <span className="text-[82.286px] leading-[1.35]">👍</span>
              <p className="text-xl font-semibold leading-7 text-[#111]">Yes</p>
            </button>
          </div>

          <div className="relative flex flex-1 p-[3px]">
            <BackgroundGradient isSelected={!isUpvoted} />
            <button
              onClick={() => setUpvoted(false)}
              className="relative z-10 flex w-full flex-col items-center justify-end gap-8 rounded-[10px] bg-white p-5 shadow-[2px_2px_12px_0px_rgba(17,17,17,0.04)]"
            >
              <span className="text-[82.286px] leading-[1.35]">👎</span>
              <p className="text-xl font-semibold leading-7 text-[#111]">No</p>
            </button>
          </div>
        </div>
      </div>

      <OnboardingFooter
        backLabel="Test Again"
        continueLabel={loading ? 'Deploying...' : 'Done'}
        className="border-t-0 px-0"
        onBack={onTestAgain}
        onContinue={completeFeedback}
        disableContinue={loading}
        disableBack={loading}
      />
    </div>
  );
};

export default VoteScreen;
