import React from 'react';

const VoiceCardShimmer = () => {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar shimmer */}
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200"></div>

          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="flex items-center space-x-4">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
              <div className="w-18 h-3 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Duration and copy button shimmer */}
        <div className="flex items-center space-x-2">
          <div className="h-3 w-8 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="mx-6 mt-8 border-b border-gray-200"></div>
    </div>
  );
};

export default VoiceCardShimmer;
