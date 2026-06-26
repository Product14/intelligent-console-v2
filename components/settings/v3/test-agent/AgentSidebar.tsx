import { OnboardedAgent } from '@/store-settings/models/agents.model';
import { FeedbackIssue } from '@/types/settings/feedback';

import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { IoArrowForward, IoFemale, IoLanguage, IoMale } from 'react-icons/io5';

import OnboardingSecondaryButton from '@spyne-console/components/onboarding/buttons/onboarding-secondary-button';

import { cn } from '@spyne-console/utils/cn';

import { StringUtils } from '@/utils-settings/StringUtils';
import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { Curve } from '../common/Curve';
import { STEP_CONNECTOR_CLASS } from '../test-agent/TestAgentPreview';
import FeedbackRow from './feedback-row';

interface AgentSidebarProps {
  agent: OnboardedAgent;
  onTestAgain?: () => void;
  className?: string;
  feedbackIssues?: FeedbackIssue[];
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  agent,
  onTestAgain,
  className,
  feedbackIssues = [],
}) => {
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-cover bg-center pb-0 pt-6 before:absolute before:inset-0 before:-z-10 before:-scale-x-100 before:rounded-3xl before:bg-[image:var(--sidebar-bg)] before:bg-cover before:bg-center',
        className
      )}
      style={
        {
          backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
          '--sidebar-bg': `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
        } as React.CSSProperties
      }
    >
      <div className="ml-4 mr-16 flex flex-col gap-6">
        <div
          className={cn(
            'flex flex-col gap-8 rounded-xl bg-white p-3',
            STEP_CONNECTOR_CLASS
          )}
        >
          <div className="flex w-full flex-col gap-1.5">
            <h2 className="text-[40px] font-bold leading-[56px] tracking-[-0.4px] text-[#111]">
              {agent.name}
            </h2>
            <p className="text-2xl font-normal leading-[33.6px] text-[#666]">
              {StringUtils.toCapitalize(agent.agentCallType)}{' '}
              {StringUtils.toCapitalize(agent.agentType)} Agent
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-[9.12px]">
            <div className="flex h-[41px] items-center gap-[10px] rounded-full bg-white px-[15px] py-[7.5px]">
              <ReactCountryFlag
                countryCode={agent.countryCode}
                svg
                style={{
                  width: '32.62px',
                  height: '22.58px',
                  borderRadius: '4.52px',
                }}
              />
              <span className="text-[15px] font-normal leading-[25px] text-black/90">
                {agent.nationality} ({agent.city})
              </span>
            </div>

            {agent.supportedLanguages.length > 0 && (
              <div className="flex h-[41px] items-center gap-[10px] rounded-full bg-white px-[15px] py-[7.5px]">
                <IoLanguage className="size-5" />
                <span className="text-[15px] font-normal leading-[25px] text-black/90">
                  {agent.supportedLanguages.length > 1
                    ? 'Multilingual'
                    : agent.supportedLanguages[0].languageName}
                </span>
              </div>
            )}

            <div className="flex size-[41px] items-center justify-center rounded-full bg-white">
              {agent.gender === 'male' ? (
                <IoMale className="size-5" />
              ) : (
                <IoFemale className="size-5" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[2] flex h-full w-full items-center justify-center pb-[52px]">
        <div className="absolute bottom-0 left-1/2 h-3/4 w-full -translate-x-1/2 translate-y-[-40%]">
          <img
            src={getSafeStaticAssetUrl(agent.imageUrl)}
            alt={agent.name}
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="absolute bottom-0 left-0 z-[3] flex w-full flex-col items-center">
          <Curve>
            <></>
            {/* <OnboardingSecondaryButton className="w-fit" onClick={onTestAgain}>
              <span className="flex items-center gap-3">
                Test Again
                <IoArrowForward className="size-7" />
              </span>
            </OnboardingSecondaryButton> */}
          </Curve>
          <div className="flex h-[50px] w-full bg-white pb-11 pt-3" />
        </div>
      </div>
    </div>
  );
};
