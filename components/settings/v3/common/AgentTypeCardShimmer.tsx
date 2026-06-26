import React from 'react';

interface AgentTypeCardShimmerProps {
  className?: string;
}

export const AgentTypeCardShimmer: React.FC<AgentTypeCardShimmerProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`flex h-[332px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-black/20 bg-white ${className}`}
    >
      <div className="relative flex h-full w-full justify-between overflow-hidden">
        {/* Shimmer Image Placeholder */}
        <div className="absolute right-2 top-0 h-[400px] w-48 animate-pulse overflow-hidden">
          <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
        </div>

        <div className="relative flex w-full flex-col items-center gap-4 px-5 py-6">
          <div className="relative z-10 flex w-full items-center gap-4">
            <div className="flex flex-1 flex-col gap-1">
              {/* Title Shimmer */}
              <div className="h-7 w-3/4 animate-pulse overflow-hidden rounded-md">
                <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
              </div>

              {/* Description Shimmer */}
              <div className="mt-2 flex flex-col gap-2">
                <div className="h-5 w-full animate-pulse overflow-hidden rounded-md">
                  <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
                </div>
                <div className="h-5 w-4/5 animate-pulse overflow-hidden rounded-md">
                  <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Badges Shimmer */}
          <div className="relative z-10 flex w-full gap-2">
            <div className="h-6 w-20 animate-pulse overflow-hidden rounded-full">
              <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
            </div>
            <div className="h-6 w-24 animate-pulse overflow-hidden rounded-full">
              <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button Shimmer */}
      <div className="flex w-full flex-col items-start border-t border-black/20 px-5 py-4">
        <div className="h-[58px] w-full animate-pulse overflow-hidden rounded-xl border border-[#ececec]">
          <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
};
