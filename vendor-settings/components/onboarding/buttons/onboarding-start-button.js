import React from 'react';
import { FaArrowRight } from 'react-icons/fa6';

const OnboardingStartButton = ({
  children = 'Start Onboarding',
  onClick,
  disabled = false,
  className = '',
  showIcon = true,
  type = 'button',
  labelClassName = '',
  buttonClassName = '',
  ...props
}) => {
  const defaultButtonStyles =
    'relative flex items-center gap-1.5 rounded-lg border border-black/10 bg-[radial-gradient(ellipse_57.50%_40.00%_at_12.92%_100.00%,_#0048FF_0%,_black_100%)] px-12 py-4 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div
      className={`relative inline-flex overflow-hidden rounded-lg ${className}`}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${defaultButtonStyles} ${buttonClassName}`}
        {...props}
      >
        <span
          className={`whitespace-nowrap text-center font-['Inter'] text-base font-semibold leading-6 text-white ${labelClassName}`}
        >
          {children}
        </span>
        {showIcon && (
          <div className="relative h-6 w-6 overflow-hidden">
            <FaArrowRight className="h-6 w-6 text-white" />
          </div>
        )}
        {/* Diamond gradient bottom border */}
        <div
          className="absolute -bottom-[0.8px] left-0 right-0 h-[3px] rounded-b-lg"
          style={{
            background:
              'linear-gradient(to right, rgba(144, 194, 255, 1), rgba(132, 0, 255, 1), rgba(225, 0, 255, 1), rgba(50, 214, 255, 1), rgba(255, 72, 148, 1))',
          }}
        />
      </button>
    </div>
  );
};

export default OnboardingStartButton;
