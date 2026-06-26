import React from 'react';

import { cn } from '@spyne-console/utils/cn';

import PartnerIconWithFallback from './partner-icon-with-fallback';

interface PartnerCardProps {
  id: string;
  name: string;
  icon: string;
  isSelected?: boolean;
  onClick: (id: string) => void;
  disabled?: boolean;
}

const PartnerCard: React.FC<PartnerCardProps> = ({
  id,
  name,
  icon,
  isSelected = false,
  onClick,
  disabled = false,
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
        onClick={() => !disabled && onClick(id)}
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
          {/* Provider icon or first letter fallback */}
          <div className="relative z-10">
            <PartnerIconWithFallback
              icon={icon}
              name={name}
              size={40}
              rounded="rounded-[8px]"
            />
          </div>
        </div>

        {/* Provider name */}
        <span className="line-clamp-2 flex-1 text-lg font-semibold leading-7 text-[#111]">
          {name}
        </span>
      </button>
    </div>
  );
};

export default PartnerCard;
