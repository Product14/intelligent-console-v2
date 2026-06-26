import React from 'react';

const CommonIntegrationCardShimmer: React.FC = () => {
  return (
    <div
      className="relative rounded-xl p-[1px]"
      style={{ background: 'linear-gradient(to right, #ECECEC, #ECECEC)' }}
    >
      <div className="rounded-xl bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Icon placeholder */}
            <div className="h-[80px] w-[80px] flex-shrink-0 animate-pulse overflow-hidden rounded-xl bg-gray-100">
              <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
            </div>

            {/* Text placeholders */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                {/* Title */}
                <div className="h-6 w-40 animate-pulse overflow-hidden rounded-md">
                  <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
                </div>
                {/* Badge */}
                <div className="h-5 w-20 animate-pulse overflow-hidden rounded-2xl">
                  <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
                </div>
              </div>
              {/* Subtitle */}
              <div className="h-4 w-56 animate-pulse overflow-hidden rounded-md">
                <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
              </div>
            </div>
          </div>

          {/* Button placeholder */}
          <div className="h-[44px] w-28 flex-shrink-0 animate-pulse overflow-hidden rounded-lg">
            <div className="animate-shimmer h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonIntegrationCardShimmer;
