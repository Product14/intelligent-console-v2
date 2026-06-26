import React, { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useOnboardingProgressRedux } from '@/hooks/settings/use-onboarding-progress-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

const OnboardingCompletion: React.FC = () => {
  const router = useRouter();
  const { enterpriseId, teamId } = useUserDetails();
  const { data } = useOnboardingProgressRedux({});
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  useEffect(() => {
    if (!data?.onboardingStartTime) return;

    const calculateElapsed = () => {
      const startTime = new Date(data.onboardingStartTime).getTime();
      const now = Date.now();
      const diffInSeconds = Math.floor((now - startTime) / 1000);

      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    setElapsedTime(calculateElapsed());
  }, [data?.onboardingStartTime]);

  const handleGetStarted = () => {
    router.push(`/converse-ai?enterprise_id=${enterpriseId}&team_id=${teamId}`);
  };

  return (
    <div
      className="relative flex h-[90vh] w-[80vw] flex-col overflow-hidden overflow-y-auto rounded-[24px] border border-[rgba(70,0,242,0.2)] bg-white bg-cover bg-center shadow-[4px_4px_24px_5px_rgba(0,0,0,0.05)]"
      style={{
        backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
      }}
    >
      {/* Time to completion badge at top */}
      <div className="absolute left-1/2 top-[19px] z-10 flex -translate-x-1/2 flex-col items-center justify-center gap-[2px] py-3">
        <p className="text-center text-sm font-medium leading-5 text-black/40">
          Time to completion
        </p>
        <p className="font-['DM_Mono',monospace] text-lg leading-6 text-black">
          {elapsedTime}
        </p>
      </div>

      {/* Main content */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-8">
        {/* Decorative Spyne logo cards */}
        <div className="relative mb-8 flex h-[180px] items-center justify-center">
          <Image
            src={getSafeStaticAssetUrl(
              'https://spyne-static.s3.us-east-1.amazonaws.com/landing-pages/conversational-ai/Conversational+AI+Retail+Suite+(2).png'
            )}
            alt="arrow up"
            height={70}
            width={268}
            className="mt-[90px]"
          />
        </div>

        {/* Heading and description */}
        <div className="flex w-full max-w-[795px] flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-3">
            {/* Main heading */}
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-[64px] font-bold leading-[76.8px] tracking-[-2px] text-[#14161b]">
                Setup Complete!
              </h1>
              <h1
                className="bg-clip-text text-[64px] font-bold leading-[76.8px] tracking-[-2px] text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(256.768deg, rgb(135, 196, 243) 2.04%, rgb(147, 168, 239) 20.95%, rgb(167, 158, 236) 41.16%, rgb(199, 168, 234) 61.38%, rgb(223, 178, 232) 100%)',
                }}
              >
                Welcome to ConverseAI.
              </h1>
            </div>

            {/* Description */}
            <div className="max-w-[746px] text-center">
              <p className="text-base font-medium leading-6 text-black/60">
                Deploy agents. Track conversations. Drive revenue from one
                central hub.
                <br />
                Your complete AI dashboard is ready for action.
              </p>
            </div>
          </div>

          {/* Get Started button */}
          <button
            onClick={handleGetStarted}
            className="flex h-[54px] w-[300px] items-center justify-center rounded-[52.5px] bg-[#4600f2] px-8 py-3 transition-all hover:bg-[#3800c2] active:scale-95"
          >
            <span className="text-lg font-semibold leading-[30px] text-white">
              Get Started
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompletion;
