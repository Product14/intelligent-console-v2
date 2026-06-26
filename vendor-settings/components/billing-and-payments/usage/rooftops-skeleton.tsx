import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function RooftopsSkeleton({
  className,
  rows = 6,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {[...Array(rows)].map((_, index) => (
        <div
          key={index}
          className="flex h-20 w-full items-center gap-3 border-t border-black/10 p-3"
        >
          <div className="h-9 w-9 animate-pulse rounded-md" />
          <div className="h-4 w-full animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
