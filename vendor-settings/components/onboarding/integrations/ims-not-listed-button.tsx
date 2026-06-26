import React from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

import { cn } from '@spyne-console/utils/cn';

interface ImsNotListedButtonProps {
  isSelected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  providerName: string;
}

const ImsNotListedButton: React.FC<ImsNotListedButtonProps> = ({
  isSelected = false,
  onClick,
  disabled = false,
  providerName,
}) => {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-[12px] p-[2px] transition-all duration-200',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      style={
        isSelected
          ? {
              background:
                'linear-gradient(135deg, #8514FF 0%, #3ECEF9 33%, #C901FF 66%, #FF4894 100%)',
            }
          : undefined
      }
    >
      <button
        type="button"
        onClick={() => !disabled && onClick()}
        disabled={disabled}
        className={cn(
          'flex items-center gap-4 rounded-[10px] bg-white p-4 transition-all duration-200',
          'h-[92px] w-full text-left',
          !isSelected &&
            'rounded-[12px] border border-[#ececec] hover:border-gray-300',
          disabled && 'cursor-not-allowed'
        )}
      >
        {/* Icon container with dotted background */}
        <div className="relative flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[#f5f7f9]">
          {/* Dotted pattern overlay */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
              backgroundSize: '11.25px 11.25px',
            }}
          />
          {/* Help icon */}
          <AiOutlineQuestionCircle className="relative z-10 h-8 w-8 text-[#9ca3af]" />
        </div>

        {/* Text */}
        <span className="line-clamp-2 flex-1 text-base font-medium leading-7 text-[rgba(17,17,17,0.6)]">
          My {providerName} is not listed here
        </span>
      </button>
    </div>
  );
};

export default ImsNotListedButton;
