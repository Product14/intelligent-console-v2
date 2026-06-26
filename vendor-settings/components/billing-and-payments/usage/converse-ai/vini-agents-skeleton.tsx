import React from 'react';

type ViniAgentsSkeletonProps = {
  readonly cards?: number;
};

export default function ViniAgentsSkeleton({
  cards = 4,
}: ViniAgentsSkeletonProps) {
  return (
    <div className="my-3 grid w-full grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: cards }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={index}
          className="w-full rounded-xl border border-black/10 bg-white p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-black/5" />
          </div>
          <div className="mb-2 h-3 w-40 animate-pulse rounded bg-black/5" />
          <div className="h-1.5 w-full animate-pulse rounded-full bg-black/5" />
        </div>
      ))}
    </div>
  );
}
