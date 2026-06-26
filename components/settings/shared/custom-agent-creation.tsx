import { OnboardingStep } from '@/app-models-settings/Onboarding';
import { loadOnboardingProgress } from '@/store-settings/actions/onboarding.actions';

import React from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import classNames from 'classnames';

import Button from '@spyne-console/design-system/button';

import { useQueryParams } from '@/hooks/settings/useQueryParams';

import { SvgRenderer } from './RenderSvg/SvgRenderer';

export interface CustomAgentCreationProps {
  agentCardContainerWidth?: number;
  isHiringClosed?: boolean;
}

const customAgentCreation = ({
  agentCardContainerWidth,
  isHiringClosed = false,
}: CustomAgentCreationProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getQueryParamsString } = useQueryParams();
  const handleGetStarted = () => {
    if (isHiringClosed) {
      toast.info('Only single agent can be hired at a time');
      return;
    }
    // dispatch(
    //   loadOnboardingProgress({
    //     currentStep: OnboardingStep.AGENT_CUSTOMIZATION,
    //   })
    // );
    router.push(`/converse-ai/onboarding?${getQueryParamsString()}`);
  };

  return (
    <div
      className="relative rounded-2xl border border-black/10"
      style={{
        width: agentCardContainerWidth
          ? (agentCardContainerWidth - 72) / 4
          : 252,
        aspectRatio: 256 / 348,
        height: 'auto',
        background:
          'radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 100%), linear-gradient(180deg, rgba(37, 122, 187, 0.30) 0%, rgba(45, 118, 195, 0.30) 100%), #FFF',
      }}
    >
      <div className="relative left-0 top-0">
        <div className="absolute -left-3 top-6 z-10 flex flex-col">
          <SvgRenderer fileName="recommended" />
          <SvgRenderer fileName="corner" />
        </div>
      </div>
      <div
        className={
          'relative flex h-full flex-col items-center justify-between p-3 pb-4 transition-all duration-300'
        }
      >
        <div></div>

        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <SvgRenderer fileName="huge-ai-voice" />
          <h3 className="font-inter text-[16.76px] font-semibold uppercase leading-[20.3px] tracking-[1.006px] text-black/40">
            Create Your Own
          </h3>
          <h3 className="font-inter text-[24.5px] font-semibold leading-[30.6px] tracking-[1.006px] text-black/80">
            AI Voice Agent
          </h3>
        </div>

        <Button
          label="Get Started"
          type="primary"
          className={classNames(
            'w-full rounded-[101.053px] border border-black/20 bg-white px-2 font-semibold text-black/80',
            isHiringClosed && 'cursor-not-allowed opacity-70'
          )}
          onClick={handleGetStarted}
        />
      </div>
    </div>
  );
};

export default customAgentCreation;
