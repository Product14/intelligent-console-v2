import React from 'react';

export default function VinCardSkeleton() {
  return (
    <div className="">
      {/* Title */}

      {/* Big number */}
      <div className="mt-4 h-10 w-24 animate-pulse rounded" />

      {/* Divider */}
      <div className="mt-6 h-px w-full animate-pulse" />

      {/* Rows */}
      <div className="mt-4 space-y-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center justify-between gap-4">
            <div className="h-4 w-28 animate-pulse rounded" />
            <div className="h-4 w-10 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
