'use client';

import { Zap } from 'lucide-react';
import { formatResponseTime } from '@/lib/settings/vini-training-derivations';
import type { TopLineMetrics } from '@/lib/settings/vini-training-mock';
import { InfoTip } from './info-tip';

interface Props {
  metrics: TopLineMetrics;
}

/** Top card #3 — First Response Time. Vini's superpower made visible. */
export function ResponseTimeCard({ metrics }: Props) {
  const factor = Math.round(metrics.responseTimeTeamSec / metrics.responseTimeViniSec);

  return (
    <section className="rounded-xl border border-black/8 bg-white p-5">
      <header className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-black-dark">First Response Time</h3>
          <InfoTip width={280}>
            Average time from a customer signal (call, chat, internet lead) to
            the first meaningful response. Industry studies show contact within
            5 minutes converts roughly 9× higher than later contact.
          </InfoTip>
        </div>
        <div className="flex items-baseline gap-1">
          <Zap className="h-4 w-4 text-blue-light" />
          <span className="text-2xl font-semibold tabular-nums text-black-dark">
            {formatResponseTime(metrics.responseTimeViniSec)}
          </span>
        </div>
      </header>
      <p className="mt-0.5 text-xs text-black-60">
        How fast Vini reaches a new lead
      </p>

      <div className="mt-4 space-y-2">
        <div className="rounded-md border border-blue-light/40 bg-blue-2 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-light">
            Vini
          </div>
          <div className="mt-0.5 text-base font-semibold tabular-nums text-black-dark">
            {formatResponseTime(metrics.responseTimeViniSec)}
          </div>
        </div>
        <div className="rounded-md border border-black/8 bg-gray-light/30 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-black-40">
            Your team
          </div>
          <div className="mt-0.5 text-base font-semibold tabular-nums text-black-60">
            {formatResponseTime(metrics.responseTimeTeamSec)}
          </div>
        </div>
        {factor >= 2 && (
          <p className="text-[11px] text-black-60">
            Vini is{' '}
            <span className="font-semibold text-black-dark">{factor}× faster</span>{' '}
            than your team on new leads.
          </p>
        )}
      </div>
    </section>
  );
}
