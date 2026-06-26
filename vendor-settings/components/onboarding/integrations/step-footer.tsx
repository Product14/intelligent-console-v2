import React from 'react';

import OnboardingSecondaryButton from '@spyne-console/components/onboarding/buttons/onboarding-secondary-button';
import OnboardingStartButton from '@spyne-console/components/onboarding/buttons/onboarding-start-button';

interface StepFooterProps {
  handleNextStep: () => void;
  isLastStep: boolean;
  buttonLabel: string;
  secondaryButtonLabel?: string;
  secondaryButtonOnClick?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
}

const StepFooter = ({
  handleNextStep,
  isLastStep,
  buttonLabel,
  secondaryButtonLabel,
  secondaryButtonOnClick,
  isNextDisabled = false,
  isBackDisabled = false,
  onSkip,
  skipLabel = 'Skip',
}: StepFooterProps) => {
  return (
    <div className="sticky bottom-0 z-10 flex justify-between border-t border-gray-200 bg-transparent bg-white py-3">
      {secondaryButtonLabel ? (
        <OnboardingSecondaryButton
          onClick={secondaryButtonOnClick}
          disabled={isBackDisabled}
          className="z-[2] h-[52px] px-7 font-['Inter'] text-lg font-semibold leading-7 text-neutral-900"
        >
          {secondaryButtonLabel}
        </OnboardingSecondaryButton>
      ) : (
        <div></div>
      )}
      <div className="flex items-center gap-4">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mr-4 font-medium leading-7 text-neutral-500 underline-offset-2 transition-colors duration-200 hover:text-neutral-700 hover:underline"
          >
            {skipLabel}
          </button>
        )}
        <OnboardingStartButton
          onClick={handleNextStep}
          disabled={isNextDisabled}
          className="h-[52px]"
          buttonClassName="h-[52px]"
        >
          {buttonLabel}
        </OnboardingStartButton>
      </div>
    </div>
  );
};

export default StepFooter;
