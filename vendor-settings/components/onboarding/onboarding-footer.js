import React from 'react';

import { cn } from '@spyne-console/utils/cn';

import OnboardingPrimaryButton from './buttons/onboarding-primary-button';
import OnboardingSecondaryButton from './buttons/onboarding-secondary-button';

const OnboardingFooter = ({
  onBack,
  onContinue,
  onSkip,
  backLabel = 'Back',
  continueLabel = 'Continue',
  skipLabel = 'Skip',
  showBackButton = true,
  showContinueButton = true,
  disableBack = false,
  disableContinue = false,
  className = '',
  children,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-[#f0f0f0] bg-white px-[66px] py-3 backdrop-blur-[22px]',
        className
      )}
      data-testid="onboarding-footer"
    >
      <div className="flex items-center">
        {showBackButton && (
          <OnboardingSecondaryButton onClick={onBack} disabled={disableBack}>
            {backLabel}
          </OnboardingSecondaryButton>
        )}
      </div>

      {children && <div className="flex items-center">{children}</div>}

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
        {showContinueButton && (
          <OnboardingPrimaryButton
            onClick={onContinue}
            disabled={disableContinue}
            showIcon={false}
          >
            {continueLabel}
          </OnboardingPrimaryButton>
        )}
      </div>
    </div>
  );
};

export default OnboardingFooter;
