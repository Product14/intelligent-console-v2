import React, { useCallback, useEffect, useState } from 'react';

import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import StepFooter from './step-footer';

export interface StepWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  // Footer props
  onNext: () => void;
  secondaryButtonOnClick?: () => void;
  nextLabel?: string;
  secondaryButtonLabel?: string;
  isLastStep?: boolean;
  hideFooter?: boolean;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  hideHeader?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
  /** Onboarding start time (ISO string or timestamp) to calculate duration timer */
  onboardingStartTime?: string | number | null;
}

/**
 * Formats duration in seconds to HH:MM:SS format
 */
const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Duration Timer Component - Shows elapsed time since onboarding started
 */
const DurationTimer = ({ startTime }: { startTime: string | number }) => {
  const [duration, setDuration] = useState<string>('00:00:00');

  const calculateDuration = useCallback(() => {
    const start =
      typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;
    const now = Date.now();
    const diffInSeconds = Math.max(0, Math.floor((now - start) / 1000));
    return formatDuration(diffInSeconds);
  }, [startTime]);

  useEffect(() => {
    setDuration(calculateDuration());
    const interval = setInterval(() => {
      setDuration(calculateDuration());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateDuration]);

  return (
    <div className="flex flex-col items-end py-3">
      <span className="mb-0.5 font-['Inter'] text-sm font-medium leading-5 text-black/40">
        Duration
      </span>
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-base font-medium leading-7 text-black">
          {duration}
        </span>
      </div>
    </div>
  );
};

const StepWrapper = ({
  title,
  subtitle,
  children,
  onNext,
  secondaryButtonOnClick,
  nextLabel = 'Continue',
  secondaryButtonLabel,
  isLastStep = false,
  hideFooter = false,
  isNextDisabled = false,
  isBackDisabled = false,
  hideHeader = false,
  onSkip,
  skipLabel = 'Skip',
  onboardingStartTime = null,
}: StepWrapperProps) => {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden">
      {/* Header - fixed at top */}
      {!hideHeader && (
        <div className="z-10 flex-shrink-0 pb-4 pt-8">
          <div className="flex items-start justify-between">
            <OnboardingStepHeader title={title} description={subtitle} />
            {onboardingStartTime && (
              <DurationTimer startTime={onboardingStartTime} />
            )}
          </div>
        </div>
      )}

      {/* Content - scrollable area */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-auto">
        {children}
      </div>

      {/* Footer - fixed at bottom */}
      {!hideFooter && (
        <div className="flex-shrink-0">
          <StepFooter
            handleNextStep={onNext}
            isLastStep={isLastStep}
            buttonLabel={isLastStep ? 'Complete' : nextLabel}
            secondaryButtonLabel={secondaryButtonLabel}
            secondaryButtonOnClick={secondaryButtonOnClick || (() => {})}
            isNextDisabled={isNextDisabled}
            isBackDisabled={isBackDisabled}
            onSkip={onSkip}
            skipLabel={skipLabel}
          />
        </div>
      )}
    </div>
  );
};

export default StepWrapper;
