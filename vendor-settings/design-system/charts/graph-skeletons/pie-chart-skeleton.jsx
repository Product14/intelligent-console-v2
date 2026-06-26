'use client';

const PieChartSkeleton = () => {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-center md:h-[300px]">
        <div
          className="h-[210px] w-[210px] rounded-full"
          style={{
            background:
              'linear-gradient(0deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.20)), linear-gradient(90deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
      </div>
      {/* Legend Skeleton */}
      <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
        {[1, 2, 3].map((index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background:
                  'linear-gradient(0deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.20)), linear-gradient(90deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
              }}
            />
            <div
              className="h-4 w-16 rounded"
              style={{
                background:
                  'linear-gradient(0deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.20)), linear-gradient(90deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartSkeleton;
