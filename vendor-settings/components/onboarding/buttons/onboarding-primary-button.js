import React from 'react';
import { IoArrowForward } from 'react-icons/io5';

const OnboardingPrimaryButton = ({
  children = 'Next',
  onClick,
  disabled = false,
  className = '',
  showIcon = true,
  type = 'button',
  ...props
}) => {
  return (
    <div className={`relative flex pb-1 ${className}`}>
      <div
        className="absolute bottom-0 left-0 h-[calc(100%-1px)] w-full rounded-xl"
        style={{
          background:
            'linear-gradient(to right, #8400FF 20%, #E100FF 40%, #32D6FF 60%, #90C2FF 75%, #FF4894 90%)',
        }}
      ></div>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-black px-12 py-3 text-lg font-semibold leading-7 text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(144,194,255,0.4)] active:scale-[0.98] disabled:cursor-not-allowed"
        {...props}
      >
        <span className="text-nowrap">{children}</span>
        {showIcon && <IoArrowForward className="h-7 w-7" />}
      </button>
    </div>
  );
};

export default OnboardingPrimaryButton;
