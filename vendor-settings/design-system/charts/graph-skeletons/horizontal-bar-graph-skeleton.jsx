'use client';

import React from 'react';

const BAR_COUNT = 6;

const VerticalBarGraphSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="flex h-[300px] w-full flex-row items-stretch justify-between gap-4 px-4">
        {/* Placeholder for Y-Axis */}
        <div className="flex w-16 flex-col justify-between py-4">
          {[...Array(BAR_COUNT)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-full rounded"
              style={{
                opacity: 0.8,
                background:
                  'linear-gradient(90deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.20)), linear-gradient(0deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
              }}
            />
          ))}
        </div>

        {/* Graph Bars */}
        <div className="flex flex-1 flex-col justify-between gap-4 py-4">
          {[...Array(BAR_COUNT)].map((_, i) => (
            <div
              key={i}
              className="rounded-r-lg"
              style={{
                width: `${30 + Math.random() * 70}%`,
                height: 28,
                background:
                  'linear-gradient(90deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.20)), linear-gradient(0deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Placeholder for X-Axis */}
      <div className="mt-4 flex justify-center">
        <div
          className="h-4 w-3/4 rounded"
          style={{
            opacity: 0.8,
            background:
              'linear-gradient(90deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.20)), linear-gradient(0deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
      </div>
    </div>
  );
};

export default VerticalBarGraphSkeleton;
