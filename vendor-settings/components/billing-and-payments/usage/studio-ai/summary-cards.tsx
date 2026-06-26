import React from 'react';

type SummaryCardsProps = {
  totalVins: number;
  withImages: number;
  withVideoTours: number;
  withSpins: number;
};

export default function SummaryCards({
  totalVins,
  withImages,
  withVideoTours,
  withSpins,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-black/40">
          VINs Processed (Current Month)
        </p>
        <p className="mt-4 text-4xl font-semibold text-purple-600">
          {totalVins.toLocaleString()}
        </p>
        <div className="mt-6 space-y-3 text-sm text-black/70">
          <div className="flex items-center justify-between">
            <span>With Images</span>
            <span className="font-medium">{withImages.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>With Video Tours</span>
            <span className="font-medium">
              {withVideoTours.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>With 360° Spins</span>
            <span className="font-medium">{withSpins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-black/40">
            VINs Processed (Past 6 months)
          </p>
        </div>
        <div className="mt-4 h-48">
          {/* Graph slot: pass your existing BarGraph component here from parent */}
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-black/10 text-xs text-black/40">
            Bar graph goes here
          </div>
        </div>
      </div>
    </div>
  );
}
