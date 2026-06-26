'use client';

import { cn } from '@/lib/settings/cn';
import type { SummaryCounts } from '@/lib/settings/vini-status-rules';

export function SummaryBanner({
  counts,
  extraLine,
}: {
  counts: SummaryCounts;
  /** Optional rooftop-lifecycle status line — "Implementation: Day 7" /
   *  "Awaiting OB acceptance" / "Awaiting Sales handover". */
  extraLine?: string | null;
}) {
  const progressPct = (counts.readyAreaCount / counts.totalAreaCount) * 100;

  return (
    <div className="sticky top-0 z-30 -mx-6 border-b border-black/8 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-black-dark">Vini Status</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-black-60">
            <span>Source of truth for go-live readiness and agent scale-up.</span>
            {extraLine && (
              <>
                <span className="text-black-40">·</span>
                <span className="font-semibold text-blue-light">{extraLine}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <SummaryChip
            primary={`${counts.readyAreaCount} of ${counts.totalAreaCount}`}
            label="setup areas ready"
          />
          <SummaryChip primary={`${counts.inTraining}`} label="agents in training" />
          <SummaryChip primary={`${counts.postTraining}`} label="agents post-training" />
        </div>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-8">
        <div
          className={cn('h-full rounded-full transition-all', progressPct === 100 ? 'bg-green' : 'bg-blue-light')}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

function SummaryChip({ primary, label }: { primary: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-base font-semibold text-black-dark">{primary}</span>
      <span className="text-xs text-black-60">{label}</span>
    </div>
  );
}
