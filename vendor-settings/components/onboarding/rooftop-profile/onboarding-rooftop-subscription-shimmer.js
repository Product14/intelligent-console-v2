import React from 'react';

const OnboardingRooftopSubscriptionShimmer = ({ className }) => {
  return (
    <div
      className={`flex w-full max-w-[300px] flex-col items-center gap-6 overflow-hidden rounded-2xl bg-[#f9fafb] px-5 py-3 ${className || ''}`}
      data-testid="onboarding-rooftop-subscription-shimmer"
    >
      <div className="flex w-full flex-col gap-6">
        {/* Header Section */}
        <div className="flex w-full items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-300" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-300" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Details Section */}
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-300" />
            <div className="h-7 w-20 animate-pulse rounded-2xl bg-gray-300" />
          </div>

          <div className="flex w-full items-center justify-between gap-2">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-300" />
            <div className="h-7 w-28 animate-pulse rounded-2xl bg-gray-300" />
          </div>

          <div className="flex w-full items-center justify-between gap-2">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-300" />
            <div className="h-7 w-20 animate-pulse rounded-2xl bg-gray-300" />
          </div>
        </div>
      </div>

      {/* Contract Card Section */}
      <div className="flex max-h-[calc(100%-208px)] w-full flex-1 flex-col gap-4 rounded-xl bg-white p-3 shadow-[0px_0px_4px_0px_#0000001a]">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="h-6 w-28 animate-pulse rounded bg-gray-300" />
          <div className="h-6 w-20 animate-pulse rounded-2xl bg-gray-300" />
        </div>

        <div className="flex min-h-0 w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-300" />
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="h-5 w-28 animate-pulse self-end rounded bg-gray-300" />
      </div>
    </div>
  );
};

export default OnboardingRooftopSubscriptionShimmer;
