import React from 'react';

import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

interface SetupCampaignProps {
  onSetupNextAgent?: () => void;
  onSetup?: () => void;
  agentLogoUrl?: string;
}

const CampaignAvatar: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => {
  return (
    <div className="flex size-[301px] items-center justify-center overflow-hidden rounded-full bg-white">
      <img
        src={getSafeStaticAssetUrl(
          logoUrl ||
            'https://spyne-static.s3.us-east-1.amazonaws.com/spyne-shimmer.png'
        )}
        alt="Campaign avatar"
        className="z-[5] size-full object-cover"
      />
    </div>
  );
};

const SetupCampaign: React.FC<SetupCampaignProps> = ({
  onSetupNextAgent,
  onSetup,
  agentLogoUrl,
}) => {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-8 bg-cover bg-center"
      style={{
        backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
      }}
    >
      <div className="flex flex-col items-center justify-center gap-8">
        <CampaignAvatar logoUrl={agentLogoUrl} />

        <h1 className="text-center text-[44px] font-[650] leading-[64px] tracking-[-1.76px] text-[#0a0a0a]">
          Let&apos;s setup your first campaign
        </h1>
      </div>

      <OnboardingFooter
        onBack={onSetupNextAgent}
        onContinue={onSetup}
        backLabel="Setup next Agent"
        continueLabel="Setup"
        className="flex w-full shrink-0 items-center justify-center gap-8 border-0 bg-transparent pb-8"
      />
    </div>
  );
};

export default SetupCampaign;
