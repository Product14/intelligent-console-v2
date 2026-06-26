'use client';

import { coveragePct } from '@/lib/settings/vini-training-derivations';
import type { TopLineMetrics } from '@/lib/settings/vini-training-mock';
import { InfoTip } from './info-tip';

interface Props {
  metrics: TopLineMetrics;
  /** Display string for the current window (e.g. "Day 1 – 15"). */
  windowLabel: string | null;
}

/** Top card #2 — Lead Coverage. Combines inbound conversation attempts +
 *  outbound campaign audiences. The factual gap is the headline action. */
export function LeadCoverageCard({ metrics, windowLabel }: Props) {
  const pct = coveragePct(metrics.leadsWorked, metrics.leadsTotal);
  return (
    <section className="rounded-xl border border-black/8 bg-white p-5">
      <header className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-black-dark">Lead Coverage</h3>
          <InfoTip width={280}>
            Of every reachable opportunity this window — inbound conversation
            attempts plus outbound campaign audiences — the share Vini actually
            worked. The remainder is your factual gap, in volume terms.
          </InfoTip>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums text-black-dark">
            {pct}%
          </span>
        </div>
      </header>
      <p className="mt-0.5 text-xs text-black-60">
        {windowLabel ? `${windowLabel} · ` : ''}Reachable leads Vini worked
      </p>

      <dl className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-xs text-black-60">Worked by Vini</dt>
          <dd className="text-sm font-semibold tabular-nums text-black-dark">
            {metrics.leadsWorked.toLocaleString()} of {metrics.leadsTotal.toLocaleString()}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2 rounded-md bg-orange-light px-2.5 py-1.5">
          <dt className="text-xs font-medium text-orange">Still unworked</dt>
          <dd className="text-sm font-semibold tabular-nums text-orange">
            {metrics.leadsGap.toLocaleString()} leads
          </dd>
        </div>
      </dl>
    </section>
  );
}
