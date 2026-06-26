import React from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';

import { cn } from '@spyne-console/utils/cn';

interface ImsAlternativeOptionProps {
  id: string;
  title: string;
  description: string;
  externalLink?: string;
  isSelected?: boolean;
  onClick: (id: string) => void;
  disabled?: boolean;
}

const ImsAlternativeOption: React.FC<ImsAlternativeOptionProps> = ({
  id,
  title,
  description,
  externalLink,
  isSelected = false,
  onClick,
  disabled = false,
}) => {
  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div
      className={cn(
        'relative rounded-xl p-[2px] transition-all duration-200',
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
          'flex w-full items-center gap-3 rounded-[10px] bg-white p-4 text-left transition-all duration-200',
          !isSelected &&
            'rounded-xl border border-[rgba(0,0,0,0.1)] hover:border-gray-300',
          disabled && 'cursor-not-allowed'
        )}
      >
        {/* Radio-style circle */}
        <div
          className={cn(
            'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-[1.333px] transition-all duration-200',
            isSelected
              ? 'border-blue-light bg-white'
              : 'border-[#e5e5e5] bg-white'
          )}
        >
          {isSelected && (
            <div className="bg-blue-light h-2.5 w-2.5 rounded-full" />
          )}
        </div>

        {/* Text content */}
        <div className="flex flex-1 items-center gap-3">
          <p className="text-lg leading-6">
            <span className="font-semibold text-[#111]">{title}</span>
            <span className="font-normal text-[#111]">{description}</span>
          </p>
          {externalLink && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleExternalLinkClick}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                handleExternalLinkClick(e as unknown as React.MouseEvent)
              }
              className="cursor-pointer transition-colors hover:text-blue-600"
            >
              <HiOutlineExternalLink className="h-5 w-5 flex-shrink-0 text-gray-600 hover:text-blue-600" />
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default ImsAlternativeOption;
