import React from 'react';

const OnboardingSecondaryButton = ({
  children = 'Back',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center rounded-lg border border-[#111] bg-white px-12 py-3 text-lg font-semibold leading-7 text-black shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)] transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <span className="text-nowrap">{children}</span>
    </button>
  );
};

export default OnboardingSecondaryButton;
