import React from 'react';

import { cn } from '../../utils/cn';

export interface PlanBadgeProps {
  plan:
    | 'PRO'
    | 'LITE'
    | 'Pro'
    | 'Lite'
    | 'Growth'
    | 'Essential'
    | 'Comprehensive';
  textClassName?: string;
}

const PlanBadge = ({ plan, textClassName }: PlanBadgeProps) => {
  // Plan details matching header config styles
  const planDetails = {
    Essential: {
      icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ESSENTIALS.svg',
      class: 'bg-[#F2F4F7] text-[#344054]',
      color: 'text-[#344054]',
    },
    Growth: {
      icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/GROWTH.svg',
      class: 'bg-[#F2F4F7] text-[#344054]',
      color: 'text-[#344054]',
    },
    Comprehensive: {
      icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/COMPREHENSIVE.svg',
      class: 'bg-[#F2F4F7] text-[#344054]',
      color: 'text-[#344054]',
    },
  };

  const normalizedPlan =
    plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  const isProOrLite =
    plan === 'PRO' || plan === 'Pro' || plan === 'LITE' || plan === 'Lite';

  // Handle PRO/LITE with skewed background style
  if (isProOrLite) {
    return (
      <div className="relative flex items-center justify-center px-2 py-[0.1px] !pt-[0.2px]">
        <div
          className={`absolute !top-0 bottom-0 left-0 right-0 rounded-sm ${plan === 'PRO' || plan === 'Pro' ? 'bg-gradient-to-r from-sky-600 to-purple-600' : 'bg-black'}`}
          style={{
            transform: 'skewX(-10deg)',
            WebkitTransform: 'skewX(-10deg)',
            MozTransform: 'skewX(-10deg)',
            msTransform: 'skewX(-10deg)',
          }}
        ></div>
        <span
          className={cn(
            "relative inline-block font-['Inter'] text-[13.89px] font-black uppercase italic text-white",
            textClassName
          )}
        >
          {plan.toUpperCase()}
        </span>
      </div>
    );
  }

  // Handle Growth, Essential, Comprehensive with header config styles
  if (
    normalizedPlan === 'Growth' ||
    normalizedPlan === 'Essential' ||
    normalizedPlan === 'Comprehensive'
  ) {
    const details = planDetails[normalizedPlan];
    return (
      <div
        className={cn(
          'flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1',
          details.class,
          textClassName
        )}
      >
        <img
          src={details.icon}
          alt={normalizedPlan}
          className="pointer-events-none h-4 w-4"
        />
        <span
          className={cn(
            'pointer-events-none text-sm font-semibold leading-none',
            details.color
          )}
        >
          {normalizedPlan}
        </span>
      </div>
    );
  }

  // Fallback for any other plan types
  return <div className="text-sm text-gray-500">{plan}</div>;
};

export default PlanBadge;
