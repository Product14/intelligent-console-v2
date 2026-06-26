/**
 * Common Integration Card
 * title, subtitle, icon, mandatory or not, disabled or not, onClick, button label, done or not
 * if its status is done, then in place of button show added icon and link to change-> goes to same onClick as button
 * description node is optional-> will show only if its provided and done is true
 */
import React from 'react';
import { FaCheck } from 'react-icons/fa6';
import { FaArrowRight } from 'react-icons/fa6';
import { IoArrowForward } from 'react-icons/io5';

import { cn } from '@spyne-console/utils/cn';

import PartnerIconWithFallback from './partner-icon-with-fallback';

interface CommonIntegrationCardProps {
  title: string;
  subtitle: string;
  iconUrl: string;
  mandatory?: boolean;
  disabled?: boolean;
  onClick: () => void;
  buttonLabel?: string;
  done?: boolean;
  description?: React.ReactNode;
  className?: string;
  isIntegrationFlow?: boolean;
}

const CommonIntegrationCard: React.FC<CommonIntegrationCardProps> = ({
  title,
  subtitle,
  iconUrl,
  mandatory = false,
  disabled = false,
  onClick,
  buttonLabel = 'Add now',
  done = false,
  description,
  className,
  isIntegrationFlow = false,
}) => {
  return (
    <div
      className={cn(
        'group relative rounded-xl bg-white p-[1px] transition-all duration-300',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      style={{
        background: 'linear-gradient(to right, #ECECEC, #ECECEC)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background =
            'linear-gradient(to right, rgba(144, 194, 255, 1), rgba(132, 0, 255, 1), rgba(225, 0, 255, 1), rgba(50, 214, 255, 1), rgba(255, 72, 148, 1))';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          'linear-gradient(to right, #ECECEC, #ECECEC)';
      }}
    >
      <div className="rounded-xl bg-white p-4">
        {/* Top row: Icon, Title, Subtitle, and Action */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Icon container */}
            <div className="flex h-[80px] w-[80px] flex-shrink-0 items-center justify-center rounded-xl bg-gray-50">
              <PartnerIconWithFallback
                icon={iconUrl}
                name={title}
                size={80}
                rounded="rounded-xl"
              />
            </div>

            {/* Text content */}
            <div className="flex flex-col items-start justify-center gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
                  {title}
                </h3>
                {mandatory ? (
                  <div className="inline-flex items-center justify-center gap-1 rounded-2xl bg-[#FFF5D6] px-2 py-0.5 outline outline-1 outline-offset-[-1px] outline-[#8668001A]">
                    <div className="justify-start text-center font-['Inter'] text-xs font-medium uppercase leading-4 text-[#866800]">
                      Mandatory
                    </div>
                  </div>
                ) : isIntegrationFlow ? (
                  <div className="inline-flex items-center justify-center gap-1 rounded-2xl bg-zinc-100 px-2 py-0.5 outline outline-1 outline-offset-[-1px] outline-indigo-900/10">
                    <div className="justify-start text-center font-['Inter'] text-xs font-medium uppercase leading-4 text-indigo-900">
                      OPTIONAL
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right side - Button or Done state */}
          <div className="flex-shrink-0">
            {done ? (
              /* Done state - Show added icon and change link */
              <div className="inline-flex items-center justify-center gap-4 rounded-full px-3 py-1.5 outline outline-1 outline-offset-[-1px] outline-emerald-700/10">
                <div className="flex items-center gap-[6px]">
                  <FaCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="font-['Inter'] text-sm font-semibold leading-6 text-emerald-700">
                    Added
                  </span>
                </div>

                <button
                  onClick={onClick}
                  disabled={disabled}
                  className={cn(
                    "rounded-full font-['Inter'] text-sm font-semibold leading-5 text-violet-700 hover:underline",
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  Change
                </button>
              </div>
            ) : (
              /* Not done - Show plain button by default, OnboardingStartButton on hover */
              <div className="relative">
                {/* Default plain button - visible when not hovering */}
                <button
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className={cn(
                    "flex h-[44px] items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2 font-['Inter'] text-sm font-semibold leading-7 text-neutral-900 transition-all group-hover:invisible group-hover:opacity-0",
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  <span className="capitalize">{buttonLabel}</span>
                  <IoArrowForward className="h-4 w-4" />
                </button>

                {/* OnboardingStartButton style - visible on hover */}
                <div className="invisible absolute right-0 top-0 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="relative inline-flex overflow-hidden rounded-lg">
                    <button
                      type="button"
                      onClick={onClick}
                      disabled={disabled}
                      className={cn(
                        'relative flex items-center gap-1.5 rounded-lg border border-black/10 bg-[radial-gradient(ellipse_57.50%_40.00%_at_12.92%_100.00%,_#0048FF_0%,_black_100%)] px-6 py-2.5 transition-opacity hover:opacity-90',
                        disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <span className="whitespace-nowrap text-center font-['Inter'] text-sm font-semibold capitalize leading-6 text-white">
                        {buttonLabel}
                      </span>
                      <div className="relative h-5 w-5 overflow-hidden">
                        <FaArrowRight className="h-5 w-5 text-white" />
                      </div>
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
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Description - only show when done and description is provided */}
        {done && description && (
          <div className="pl-[104px] text-sm text-black/50">{description}</div>
        )}
      </div>
    </div>
  );
};

export default CommonIntegrationCard;
