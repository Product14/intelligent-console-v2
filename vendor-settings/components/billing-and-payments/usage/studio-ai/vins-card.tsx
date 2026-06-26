import React from 'react';

import { VinUsageSummary } from '../utils';
import VinCardSkeleton from './vin-card-skeleton';

type VinSummaryCardProps = {
  readonly summary: VinUsageSummary;
  readonly isLoading: boolean;
};

export default function VinSummaryCard({
  summary,
  isLoading,
}: VinSummaryCardProps) {
  // if (isLoading) {
  //   return <VinCardSkeleton />;
  // }

  return (
    <div className="w-full rounded-2xl border border-black/10 bg-white p-5 shadow-[0px_1px_4px_0px_#0000000A]">
      <div className="text-sm font-normal text-black/60">
        VINs Processed ({summary.monthLabel})
      </div>
      {isLoading && summary.totalVins === 0 ? (
        <VinCardSkeleton />
      ) : (
        <div className="w-full">
          <div className="text-purpleGradient/85 mt-2 text-4xl font-semibold">
            {summary.totalVins.toLocaleString()}
          </div>
          <hr className="my-4 border-black/10" />

          <div className="flex w-full flex-col gap-1 space-y-3">
            <div className="flex items-center justify-between text-sm text-black/60">
              <span>With Images</span>
              <span className="text-base font-semibold text-black/80">
                {summary.withImages.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-black/60">
              <span>With Video Tours</span>
              <span className="text-base font-semibold text-black/80">
                {summary.withVideoTours.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-black/60">
              <span>With 360° Spins</span>
              <span className="text-base font-semibold text-black/80">
                {summary.withSpins.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
