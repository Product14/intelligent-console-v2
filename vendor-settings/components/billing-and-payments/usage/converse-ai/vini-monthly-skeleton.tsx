import React from 'react';

type ViniMonthlySkeletonProps = {
  readonly rows?: number;
};

export default function ViniMonthlySkeleton({
  rows = 3,
}: ViniMonthlySkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 shadow-[0px_1px_4px_0px_#0000000A]"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-black/5" />
              <div className="h-3 w-40 animate-pulse rounded bg-black/5" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-4 w-28 animate-pulse rounded bg-black/5" />
              <div className="h-3 w-32 animate-pulse rounded bg-black/5" />
            </div>
          </div>
          <div className="mt-3 border-t border-black/10 pt-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, innerIndex) => (
                // eslint-disable-next-line react/no-array-index-key
                <div
                  key={innerIndex}
                  className="rounded-xl border border-black/10 bg-white p-4"
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
          </div>
          <div className="mt-3 flex w-full items-center justify-between border-t border-black/5 pt-3">
            <div className="h-3 w-20 animate-pulse rounded bg-black/5" />
            <div className="h-4 w-4 animate-pulse rounded-full bg-black/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
