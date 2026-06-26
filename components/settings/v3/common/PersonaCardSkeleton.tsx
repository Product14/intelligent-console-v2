import React from 'react';

export const PersonaCardSkeleton: React.FC = () => {
  return (
    <div className="relative flex h-fit w-full flex-col gap-5 rounded-xl bg-white p-4">
      {/* Border effect */}
      <div className="absolute left-[-2px] top-[-2px] z-[-1] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-xl bg-[#ECECEC]" />

      <div className="flex w-full flex-col gap-3">
        {/* Image placeholder */}
        <div className="relative h-[328px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200">
          <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent bg-[length:200%_100%]" />
        </div>

        {/* Name and details section */}
        <div className="flex w-full items-center justify-between bg-white">
          <div className="flex flex-1 flex-col items-start justify-center gap-1">
            {/* Name shimmer */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Language/nationality/gender shimmer */}
            <div className="flex items-center justify-center gap-1">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="ml-1 h-6 w-6 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>

          {/* Audio player button shimmer */}
          <div className="h-10 w-20 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>

      {/* CTA button shimmer */}
      <div className="h-12 w-full animate-pulse rounded-full bg-gray-200" />
    </div>
  );
};
