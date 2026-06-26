import { OnboardingStep } from '@/app-models-settings/Onboarding';
import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { useOnboardingContext } from '@/contexts/settings/onboarding-context';
import { fetchOnboardedAgentsAPI } from '@/services/settings/agents.service';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import { deployAgentAPI } from '@/services/settings/vini-config.service';
import { setAvailableAgents } from '@/store-settings/reducers/agents.reducer';

import React, { useEffect, useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { MdCheck, MdContentCopy } from 'react-icons/md';
import { PiCarSimple } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import useAgentsRedux from '@/hooks/settings/use-agents-redux';
import { useOnboardingProgressRedux } from '@/hooks/settings/use-onboarding-progress-redux';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { StringUtils } from '@/utils-settings/StringUtils';

import AvatarGradient from '../common/AvatarGradient';
import DurationHolder from '../common/DurationHolder';

const DeployAgent = () => {
  const { productLineId } = useMainContext();
  const { availableAgents } = useAgentsRedux({});
  const [voipEnabled, setVoipEnabled] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { enterpriseId, teamId, userId } = useUserDetails();
  const { setActiveStep } = useOnboardingContext();
  const router = useRouter();
  const { agentTypes } = useAgentTypesRedux({});
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const { getAgentProgressByType } = useOnboardingProgressRedux({});
  const {
    activeAgentId,
    setActiveAgentId,
    setActiveAgentTypeId,
    setActivePersonaId,
  } = useActiveAgent();
  const dispatch = useDispatch();

  const agent = useMemo(() => {
    return availableAgents.find(
      (agent) => agent.teamAgentMappingId === activeAgentId
    );
  }, [availableAgents, activeAgentId]);

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.DEPLOY_AGENT,
        agentType: agent?.agentType ?? '',
        agentCallType: agent?.agentCallType ?? '',
      },
      false
    );
  }, []);

  const handleCopyInput = async () => {
    if (!agent?.phoneNumber) {
      toast.error('No phone number to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(agent?.phoneNumber);
      toast.success('Phone number copied to clipboard');
    } catch (error) {
      toast.error('Error copying phone number');
    }
  };

  const goHome = () => {
    setActiveAgentId(null);
    setActiveAgentTypeId(null);
    setActivePersonaId(null);
    router.push(`/converse-ai?enterprise_id=${enterpriseId}&team_id=${teamId}`);
  };

  const onComplete = async () => {
    if (loading) return;
    setLoading(true);
    if (!enterpriseId || !teamId || !userId) {
      toast.error('Missing required data to deploy agent');
      throw new Error('Missing required data to deploy agent');
    }
    try {
      const progressData = await updateTaskAndRefresh(
        {
          productLineId: productLineId,
          taskName: OnboardingTaskName.DEPLOY_AGENT,
          agentType: agent.agentType,
          agentCallType: agent.agentCallType,
        },
        true
      );
      const { completionPercentage } = getAgentProgressByType(
        agent.agentType,
        agent.agentCallType,
        progressData ?? undefined
      );
      if (completionPercentage === 100) {
        await deployAgentAPI(
          enterpriseId,
          teamId,
          userId,
          agent.agentType,
          agent.agentCallType,
          agent.teamAgentMappingId
        );
        const agents = await fetchOnboardedAgentsAPI({
          enterpriseId,
          teamId,
          forceRefresh: true,
        });
        dispatch(setAvailableAgents({ agents }));
        setActiveStep(OnboardingStep.COMPLETED);
      } else {
        goHome();
      }
    } catch (error) {
      toast.error('Failed to deploy agent');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex h-full w-full flex-col gap-8 pr-8 pt-8">
          <OnboardingStepHeader
            title="Deploy your agent"
            description="Awesome. I am ready now"
            avatarNode={<AvatarGradient agentImage={agent?.imageUrl ?? ''} />}
          >
            <DurationHolder />
          </OnboardingStepHeader>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex w-full flex-col gap-6 rounded-xl border border-[#ececec] bg-white p-4">
              <div className="flex w-full items-center justify-center">
                <div className="flex flex-1 items-center gap-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F5F7F9] p-0 px-0 py-8">
                    <PiCarSimple className="h-[60px] w-[60px] text-black" />
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-xl font-semibold leading-7 text-[#111]">
                      VOIP
                    </p>
                    <p className="text-sm font-normal leading-5 text-[#666]">
                      Share the below number with your IT team to setup
                      redirection and see your agent in action
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full items-center gap-3">
                  {(!!agent?.phoneNumber || !!agent?.countryCode) && (
                    <div className="flex flex-1 items-center justify-center gap-[18.5px] overflow-hidden rounded-[6.61px] border border-black/10 bg-white py-2 pl-2.5 pr-3.5">
                      <ReactCountryFlag
                        countryCode={agent?.countryCode}
                        svg
                        style={{
                          width: '32px',
                          height: '22px',
                          borderRadius: '4.4px',
                        }}
                      />
                      <div className="flex items-center gap-2.5 text-[27.77px] font-normal leading-[32.4px] text-black/90">
                        {StringUtils.formatPhoneNumber(agent?.phoneNumber)}
                      </div>
                    </div>
                  )}

                  <button onClick={handleCopyInput} className="shrink-0">
                    <MdContentCopy className="h-6 w-6 text-black/20" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OnboardingFooter
        onContinue={onComplete}
        continueLabel={loading ? 'Saving...' : 'Finish'}
        className="relative overflow-hidden rounded-bl-xl border-t border-black/10"
      />
    </div>
  );
};

export default DeployAgent;
