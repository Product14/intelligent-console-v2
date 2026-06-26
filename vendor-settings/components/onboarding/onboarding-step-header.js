import React from 'react';

const OnboardingStepHeader = ({
  title = '',
  description = '',
  avatarNode,
  className = '',
  children = null,
}) => {
  return (
    <div
      className={`flex w-full items-center justify-between ${className}`}
      data-testid="onboarding-step-header"
    >
      {/* DEALER-ONBOARDING FORK: compacted header for operator density / Pam-clean
          feel — avatar 96px→44px, title 28px→20px. */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-lighter">
          {avatarNode || (
            <img
              src="https://spyne-static.s3.us-east-1.amazonaws.com/spyne-logo-new.svg"
              alt="Step avatar"
              width={44}
              height={44}
              className="z-[5] h-7 w-7 object-contain"
            />
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-semibold leading-7 tracking-[-0.2px] text-[#111]">
            {title}
          </h2>
          {description && (
            <p className="text-sm font-normal leading-5 text-[#666]">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
};

export default OnboardingStepHeader;
