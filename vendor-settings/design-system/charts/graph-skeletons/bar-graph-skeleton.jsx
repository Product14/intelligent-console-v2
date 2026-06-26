'use client';

import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const BAR_COUNT = 6;

const BarGraphSkeleton = ({ className }) => {
  return (
    <div
      className={cn(
        'mx-auto flex h-[250px] w-full max-w-[440px] animate-pulse flex-col items-stretch justify-end gap-2 md:h-[300px]',
        className
      )}
    >
      {/* Placeholder for Y-Axis */}

      {/* Graph Bars */}
      <div className="tb:gap-8 flex h-full flex-row items-end gap-4 px-4 pb-2">
        {[...Array(BAR_COUNT)].map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-lg"
            style={{
              height: `${50 + Math.random() * 120}px`,
              minWidth: 32,
              background:
                'linear-gradient(0deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.20)), linear-gradient(90deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
            }}
          />
        ))}
      </div>

      {/* Placeholder for X-Axis */}
      <div className="tb:gap-8 flex justify-between gap-4 px-4 pb-2">
        {[...Array(BAR_COUNT)].map((_, i) => (
          <div
            key={i}
            className="h-4 w-full rounded bg-gray-100"
            style={{ opacity: 0.8 }}
          />
        ))}
      </div>

      {/* Placeholder for Y-Axis label */}
      <div className="mx-auto mt-2 h-4 w-3/4 rounded bg-gray-100" />
    </div>
  );
};

export default BarGraphSkeleton;
