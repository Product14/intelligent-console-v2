import React from 'react';

const AgentCardShimmer = () => {
  const cardStyle = { height: 343, width: 252 };

  return (
    <div
      className="relative animate-pulse overflow-hidden rounded-2xl bg-black/40"
      style={cardStyle}
    >
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-gray-600/20 via-gray-500/30 to-gray-600/20" />

      <div className="absolute bottom-0 left-0 h-[30%] w-full bg-gradient-to-b from-black/0 to-black" />

      <div className="relative flex h-full flex-col justify-between p-3 pb-4">
        <div className="flex items-center justify-end">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 animate-pulse rounded bg-white/20" />
            <div className="h-6 w-24 animate-pulse rounded bg-white/30" />
          </div>
          <div className="h-8 w-full animate-pulse rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  );
};

export default AgentCardShimmer;
