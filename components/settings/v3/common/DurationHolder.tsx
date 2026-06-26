import React, { useEffect, useState } from 'react';

import { useOnboardingProgressRedux } from '@/hooks/settings/use-onboarding-progress-redux';

const DurationHolder = () => {
  const { data } = useOnboardingProgressRedux({});
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  useEffect(() => {
    if (!data?.onboardingStartTime) {
      return;
    }

    const calculateElapsedTime = () => {
      const startTime = new Date(data.onboardingStartTime).getTime();
      const currentTime = new Date().getTime();
      const diffInSeconds = Math.floor((currentTime - startTime) / 1000);

      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setElapsedTime(formattedTime);
    };

    // Calculate immediately
    calculateElapsedTime();

    // Update every second
    const intervalId = setInterval(calculateElapsedTime, 1000);

    return () => clearInterval(intervalId);
  }, [data?.onboardingStartTime]);

  if (!data?.onboardingStartTime) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-col items-end justify-center gap-0.5 py-3">
      <p className="text-sm font-medium leading-5 text-black/40">Duration</p>
      <div className="flex items-center justify-center gap-2.5">
        <div className="h-2 w-2 rounded-full bg-[#FF0000]"></div>
        <p className="text-sm font-medium leading-6 text-black">
          {elapsedTime}
        </p>
      </div>
    </div>
  );
};

export default DurationHolder;
