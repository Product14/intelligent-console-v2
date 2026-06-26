'use client';

import { cn } from '@/lib/settings/cn';
import { LineChart } from 'lucide-react';
import type { WindowState, WindowSummary } from '@/lib/settings/vini-training-mock';
import { InfoTip } from './info-tip';

interface Props {
  windows: WindowSummary[];
}

const WINDOW_LABELS: Record<WindowSummary['key'], { title: string; subtitle: string }> = {
  baseline: { title: 'Before Vini',    subtitle: 'Baseline (-30 → 0)' },
  w1:       { title: 'Day 1 – 30',     subtitle: 'First window' },
  w2:       { title: 'Day 31 – 60',    subtitle: 'Second window' },
  w3:       { title: 'Day 61 – 90',    subtitle: 'Third window' },
};

/** Horizontal strip showing 4 windows. Baseline + completed prior windows
 *  are populated comparison points; future windows are ghosted placeholders
 *  until they actually begin. No projections. No targets. */
export function WindowComparisonStrip({ windows }: Props) {
  return (
    <section className="rounded-xl border border-black/8 bg-white p-5">
      <header className="flex items-center gap-1.5">
        <LineChart className="h-4 w-4 text-blue-light" />
        <h3 className="text-sm font-semibold text-black-dark">
          Coverage over time
        </h3>
        <InfoTip side="top" width={320}>
          The 90 days are split into three 30-day windows. <b>Baseline</b> is
          your dealership's last 30 days before Vini, pulled from your CRM.
          Completed windows freeze as comparison points. Future windows are
          empty until they begin — no projections, no targets.
        </InfoTip>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
        {windows.map((w) => (
          <WindowColumn key={w.key} window={w} />
        ))}
      </div>
    </section>
  );
}

function WindowColumn({ window: w }: { window: WindowSummary }) {
  const labels = WINDOW_LABELS[w.key];
  const isNotStarted = w.state === 'not_started';
  const isCurrent = w.state === 'current';
  const isBaseline = w.state === 'baseline';

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        isCurrent && 'border-blue-light/40 bg-blue-2',
        isBaseline && 'border-black/10 bg-gray-light/40',
        w.state === 'completed' && 'border-green/20 bg-green-lighter/40',
        isNotStarted && 'border-dashed border-black/10 bg-gray-light/20'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wide',
            isCurrent && 'text-blue-light',
            isBaseline && 'text-black-60',
            w.state === 'completed' && 'text-green',
            isNotStarted && 'text-black-40'
          )}
        >
          {stateLabel(w.state)}
        </span>
      </div>

      <div
        className={cn(
          'mt-1 text-sm font-semibold',
          isNotStarted ? 'text-black-40' : 'text-black-dark'
        )}
      >
        {labels.title}
      </div>
      <div className="text-[11px] text-black-60">
        {w.dateRange ?? 'Not started yet'}
      </div>

      {!isNotStarted && (
        <dl className="mt-3 space-y-1.5">
          <Stat
            label="Coverage"
            value={w.leadCoveragePct !== null ? `${w.leadCoveragePct}%` : '—'}
          />
          <Stat
            label="Leads"
            value={
              w.leadsWorked !== null && w.leadsTotal !== null
                ? `${w.leadsWorked.toLocaleString()} / ${w.leadsTotal.toLocaleString()}`
                : '—'
            }
          />
          <Stat
            label="Sources live"
            value={w.sourcesLive !== null ? `${w.sourcesLive} of 8` : '—'}
          />
        </dl>
      )}
    </div>
  );
}

function stateLabel(state: WindowState): string {
  switch (state) {
    case 'baseline':    return 'Baseline';
    case 'completed':   return 'Completed';
    case 'current':     return 'Current';
    case 'not_started': return 'Not started';
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[11px] text-black-60">{label}</dt>
      <dd className="text-xs font-semibold tabular-nums text-black-dark">{value}</dd>
    </div>
  );
}
