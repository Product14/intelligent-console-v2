import React from 'react';

export default function PlanVisibilityBadgeCard({ data, openPricingModal }) {
  const isProPlan = data?.overall_stage === 'Pro';
  const planName = data?.overall_stage;

  const badgeClassName = isProPlan
    ? 'bg-gradient-to-r from-sky-600 to-purple-600'
    : 'bg-black';

  return (
    <div className="bg-gray-light flex items-center gap-2 rounded-full border border-black/5 py-1 pl-4 pr-1 text-xs font-medium">
      <span className="text-sm font-bold leading-8 text-black/90">
        Studio AI
      </span>

      <div className={`flex items-center ${isProPlan ? 'gap-3' : 'gap-5'}`}>
        <div
          className={`relative flex skew-x-[-12deg] items-center justify-center rounded-[3px] p-1 pb-0.5 ${badgeClassName}`}
        >
          <span className="relative inline-block text-xs font-black uppercase text-white">
            {planName}
          </span>
        </div>
        {!isProPlan && (
          <button
            onClick={openPricingModal}
            className="h-full rounded-full bg-[linear-gradient(94.71deg,#0070E1_5.38%,#FF19FF_94.16%)] px-4 py-2 text-xs font-semibold text-white"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
}
