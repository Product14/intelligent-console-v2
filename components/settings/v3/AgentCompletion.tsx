import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { OnboardingProgressStoreInterface } from '@/store-settings/reducers/onboarding-progress.reducer';
import { RootState } from '@/store-settings/root-reducer';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { IoCopyOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import OnboardingPrimaryButton from '@spyne-console/components/onboarding/buttons/onboarding-primary-button';

import { cn } from '@spyne-console/utils/cn';

import Modals from '@/components/settings/shared/modals/Modals';

import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { StringUtils } from '@/utils-settings/StringUtils';
import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import OnboardingCompletion from '../v3/OnboardingCompletion';
import AvatarGradient from './common/AvatarGradient';

const AgentCompletion: React.FC = () => {
  const {
    activeAgentId,
    setActiveAgentId,
    setActiveAgentTypeId,
    setActivePersonaId,
  } = useActiveAgent();
  const { availableAgents, isLoading: agentsLoading } = useAgentsRedux({});
  const agent = useMemo(
    () => availableAgents.find((a) => a.teamAgentMappingId === activeAgentId),
    [availableAgents, activeAgentId]
  );
  const { enterpriseId, teamId } = useUserDetails();
  const router = useRouter();
  const {
    data,
    loading: onboardingProgressLoading,
    loaded: onboardingProgressLoaded,
  } = useSelector(
    (state: RootState) =>
      state.onboardingProgress as OnboardingProgressStoreInterface
  );
  const [showOnboardingCompletionModal, setShowOnboardingCompletionModal] =
    useState(false);

  useEffect(() => {
    return () => {
      setActiveAgentId(null);
      setActiveAgentTypeId(null);
      setActivePersonaId(null);
    };
  }, []);

  const goHome = () => {
    router.push(`/converse-ai?enterprise_id=${enterpriseId}&team_id=${teamId}`);
  };

  const handlePrimaryButtonClick = () => {
    if (data?.percentageCompletion === 100) {
      setShowOnboardingCompletionModal(true);
      return;
    }
    goHome();
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(agent.phoneNumber);
      toast.success('Phone number copied to clipboard');
    } catch (error) {
      toast.error('Error copying phone number');
    }
  };

  const hasMoreAgentsLeftToOnboard = useMemo(() => {
    return (data?.percentageCompletion ?? 0) < 100;
  }, [data.percentageCompletion]);

  const isComputationsComplete = useMemo(() => {
    return (
      !agentsLoading &&
      !onboardingProgressLoading &&
      onboardingProgressLoaded &&
      agent !== undefined
    );
  }, [
    agentsLoading,
    onboardingProgressLoading,
    onboardingProgressLoaded,
    agent,
  ]);

  if (!agent) {
    return null;
  }

  return (
    <div
      className="relative flex h-full w-full flex-col bg-cover bg-center"
      style={{
        backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="relative flex items-end justify-end">
          <AvatarGradient agentImage={agent.imageUrl} />
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-center text-base font-medium leading-6 text-black">
              Your{' '}
              {`${StringUtils.toCapitalize(agent.agentType)} ${StringUtils.toCapitalize(agent.agentCallType)}`}{' '}
              Agent
            </p>
            <div className="flex items-center justify-center gap-4 text-center text-[100px] font-bold leading-[100px] tracking-[-2px]">
              <p className="main-grad-bg bg-clip-text text-transparent">
                {agent.name.split(' ')[0]}
              </p>
              <p className="text-[#111]">is now live</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-3">
            <div className="flex h-[54px] items-center justify-center gap-[18px] rounded-[6.61px] border border-black/10 bg-white px-3.5 py-2 shadow-sm">
              <ReactCountryFlag
                countryCode={agent.countryCode}
                svg
                style={{
                  width: '32px',
                  height: '22px',
                  borderRadius: '4.4px',
                }}
              />
              <p className="text-nowrap text-[28px] font-normal leading-[32px] text-black/90">
                {StringUtils.formatPhoneNumber(agent.phoneNumber)}
              </p>
            </div>
            <button
              onClick={handleCopyPhone}
              className="flex size-6 items-center justify-center transition-colors hover:text-black/60"
              aria-label="Copy phone number"
            >
              <IoCopyOutline className="size-6 text-black/60" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex w-full shrink-0 items-center justify-center gap-8 border-0 bg-transparent pb-8',
          !isComputationsComplete && 'invisible'
        )}
      >
        <OnboardingPrimaryButton
          onClick={handlePrimaryButtonClick}
          showIcon={false}
        >
          {hasMoreAgentsLeftToOnboard ? 'Setup next Agent' : 'Continue'}
        </OnboardingPrimaryButton>
      </div>

      {/* Onboarding Completion Modal */}
      {showOnboardingCompletionModal && (
        <Modals
          isOpen={true}
          onClose={() => {}}
          displayClass="flex items-center justify-center bg-black/60 p-8"
        >
          <OnboardingCompletion />
        </Modals>
      )}
    </div>
  );
};

export default AgentCompletion;
