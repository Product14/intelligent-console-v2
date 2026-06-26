import React from 'react';

import { cn } from '../../utils/cn';
import PlanBadge from './plan-badge';

export interface StudioAiBadgeProps {
  plan:
    | 'PRO'
    | 'LITE'
    | 'Pro'
    | 'Lite'
    | 'Growth'
    | 'Essential'
    | 'Comprehensive';
  className?: string;
  labelClassName?: string;
  badgeClassName?: string;
  badgeTextClassName?: string;
  showLabel?: boolean;
  badgeIconClassName?: string;
}

const StudioAiBadge = ({
  plan,
  className,
  labelClassName,
  badgeClassName,
  showLabel = true,
  badgeTextClassName,
  badgeIconClassName,
}: StudioAiBadgeProps) => {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {showLabel && (
        <div
          className={cn(
            "justify-start text-center font-['Inter'] text-base font-normal leading-6 text-neutral-900",
            labelClassName
          )}
        >
          Your plan:
        </div>
      )}
      <div
        className={cn(
          'flex h-[37px] items-center gap-2 rounded-full px-3 py-[9px] pr-[14px]',
          plan === 'PRO' || plan === 'Pro'
            ? 'bg-gradient-to-r from-sky-600/10 to-violet-900/10'
            : 'bg-gradient-to-l from-zinc-400/10 to-neutral-600/10',
          badgeClassName
        )}
      >
        <span
          className={cn(
            "font-['Inter'] text-lg font-semibold leading-5",
            plan === 'PRO' || plan === 'Pro'
              ? 'text-[#2C5BEA]'
              : 'text-neutral-950',
            badgeTextClassName
          )}
        >
          Studio AI
        </span>{' '}
        <PlanBadge
          plan={
            plan as
              | 'PRO'
              | 'LITE'
              | 'Pro'
              | 'Lite'
              | 'Growth'
              | 'Essential'
              | 'Comprehensive'
          }
          textClassName={badgeIconClassName}
        />
      </div>
    </div>
  );
};

export default StudioAiBadge;
