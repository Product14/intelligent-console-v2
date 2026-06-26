import { AIAssistant } from '@/app-models-settings/assistant/assistant';
import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { OnboardedAgent } from '@/store-settings/models/agents.model';
import { Spinner } from '@spyne-console/design-system';

import React, { useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { IoFemale, IoLanguage, IoMale } from 'react-icons/io5';

import OnboardingPrimaryButton from '@spyne-console/components/onboarding/buttons/onboarding-primary-button';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

// @ts-ignore
import { cn } from '@spyne-console/utils/cn';

import TalkToAgentModal from '@/components/settings/agents/talk-to-agent-modal';

import useAgentsRedux from '@/hooks/settings/use-agents-redux';

import { StringUtils } from '@/utils-settings/StringUtils';
import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import AvatarGradient from '../common/AvatarGradient';
import { Curve } from '../common/Curve';
import DurationHolder from '../common/DurationHolder';
import { CallOptionsModal } from './CallOptionsModal';

const mapOnboardedAgentToAIAssistant = (
  agent: OnboardedAgent
): AIAssistant => ({
  id: agent.teamAgentMappingId,
  name: agent.name,
  description: agent.agentUseCase ?? '',
  imageUrl: agent.imageUrl,
  homepageUrl: '',
  type: agent.agentType,
  agentCallType: agent.agentCallType as AIAssistant['agentCallType'],
  available: true,
  order: 0,
  isOnboarded: agent.isOnboarded,
  areConfigsLoaded: false,
});

export const STEP_CONNECTOR_CLASS =
  "relative before:absolute before:-top-6 before:left-12 before:z-[4] before:h-6 before:w-0.5 before:border-l-2 before:border-dashed before:border-black/10 before:content-['']";

export const TestAgentPreview: React.FC<{
  onPhoneCall: () => void;
  onWebCall: (customerDetails?: Record<string, any>) => void;
  onCallInitiated?: () => void;
}> = ({ onPhoneCall, onWebCall, onCallInitiated }) => {
  const { activeAgentId } = useActiveAgent();
  const { availableAgents, isLoading } = useAgentsRedux({});

  const agent = useMemo(() => {
    return availableAgents.find((a) => a.teamAgentMappingId === activeAgentId);
  }, [availableAgents, activeAgentId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCallFormOpen, setIsCallFormOpen] = useState(false);
  const [callFormMode, setCallFormMode] = useState<'phone' | 'web'>('phone');

  const isOutbound = agent?.agentCallType?.toLowerCase() === 'outbound';

  const handlePhoneCall = () => {
    setIsModalOpen(false);
    setCallFormMode('phone');
    setIsCallFormOpen(true);
  };

  const handleWebCall = () => {
    setIsModalOpen(false);
    if (isOutbound) {
      setCallFormMode('web');
      setIsCallFormOpen(true);
    } else {
      onWebCall();
    }
  };

  if (!agent) {
    return null;
  }

  return isLoading ? (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <>
      <div
        className="relative flex h-full w-full flex-col bg-cover bg-center pt-8"
        style={{
          backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
        }}
      >
        <div className="flex flex-col gap-6 px-8">
          <OnboardingStepHeader
            title="Test Agent"
            description="Awesome. I am ready now"
            avatarNode={<AvatarGradient agentImage={agent.imageUrl} />}
          >
            <DurationHolder />
          </OnboardingStepHeader>
          <div className="relative">
            <div className="absolute left-0 top-0 z-[4] flex w-[421px] flex-col gap-6">
              <div
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border-[0.8px] border-[#9328ff] bg-white px-3 py-2.5',
                  STEP_CONNECTOR_CLASS
                )}
              >
                <div className="flex w-full flex-col">
                  <h2 className="text-[28.8px] font-bold leading-[41.6px] tracking-[-0.288px] text-[#111]">
                    {agent.name}
                  </h2>
                  <p className="text-base font-normal capitalize leading-[25.6px] text-[#666]">
                    {StringUtils.toCapitalize(agent.agentType)}{' '}
                    {StringUtils.toCapitalize(agent.agentCallType)} Agent
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-[7.3px]">
                  <div className="flex h-[32.8px] items-center gap-2 rounded-full bg-black/[0.04] px-3 py-1.5">
                    <ReactCountryFlag
                      countryCode={agent.countryCode}
                      svg
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '2px',
                      }}
                    />
                    <span className="text-[12px] font-normal leading-5 text-black/90">
                      {agent.nationality} ({agent.city})
                    </span>
                  </div>

                  {agent.supportedLanguages.length > 0 && (
                    <div className="flex h-[32.8px] items-center gap-2 rounded-full bg-black/[0.04] px-3 py-1.5">
                      <IoLanguage className="size-4" />
                      <span className="text-[12px] font-normal leading-5 text-black/90">
                        Multilingual
                      </span>
                    </div>
                  )}

                  <div className="flex size-[32.8px] items-center justify-center rounded-full bg-black/[0.04]">
                    {agent.gender === 'male' ? (
                      <IoMale className="size-4" />
                    ) : (
                      <IoFemale className="size-4" />
                    )}
                  </div>
                </div>
              </div>

              {agent?.capabilities?.length > 0 && (
                <div className={STEP_CONNECTOR_CLASS}>
                  <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-4 pr-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium leading-5 text-black/60">
                        What can I do?
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2">
                      {(agent?.capabilities ?? []).map(
                        (capability: string, index: number) => (
                          <div key={index} className="flex items-start gap-2.5">
                            <span className="shrink-0 text-[22.4px] leading-[22.747px]">
                              {(index + 1) % 2 === 0 ? '⚡️' : '💬'}
                            </span>
                            <p className="text-sm font-medium capitalize leading-6 text-black">
                              {capability}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <img
              src={getSafeStaticAssetUrl(agent.imageUrl)}
              alt={agent.name}
              className="absolute left-1/2 top-0 h-full w-auto -translate-x-1/2 object-cover"
            />
          </div>

          <div className="absolute bottom-0 left-0 z-[3] flex w-full flex-col items-center">
            <Curve>
              <OnboardingPrimaryButton
                className="w-fit"
                onClick={() => setIsModalOpen(true)}
              >
                Talk to me
              </OnboardingPrimaryButton>
            </Curve>
            <div className="flex h-[50px] w-full bg-white pb-11 pt-3" />
          </div>
        </div>
      </div>

      <CallOptionsModal
        agent={agent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPhoneCall={() => handlePhoneCall()}
        onInboundCall={() => onCallInitiated?.()}
        onWebCall={() => handleWebCall()}
      />
      {isCallFormOpen && (
        <TalkToAgentModal
          agent={mapOnboardedAgentToAIAssistant(agent)}
          isOpen={isCallFormOpen}
          onClose={() => setIsCallFormOpen(false)}
          onTalkToAgent={(customerDetails) => {
            setIsCallFormOpen(false);
            onWebCall(customerDetails);
          }}
          onOnboardingOutboundCallInitiated={() => {
            onCallInitiated?.();
            setIsCallFormOpen(false);
          }}
          hideCallTypeSelector={true}
          defaultCallType={callFormMode}
        />
      )}
    </>
  );
};
