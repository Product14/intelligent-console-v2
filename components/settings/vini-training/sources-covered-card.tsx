'use client';

import { cn } from '@/lib/settings/cn';
import { Check, X } from 'lucide-react';
import {
  orderedSources,
  summarizeSources,
} from '@/lib/settings/vini-training-derivations';
import type { SourceStatus } from '@/lib/settings/vini-training-mock';
import { InfoTip } from './info-tip';

interface Props {
  sources: SourceStatus[];
}

/** Top card #1 — Demand Sources Covered. A persistent grid of all 8
 *  channels/programs the dealer can enable. Dark cells = enabled (Vini is
 *  working it). Light cells = still off (capacity left on the table). */
export function SourcesCoveredCard({ sources }: Props) {
  const ordered = orderedSources(sources);
  const summary = summarizeSources(sources);
  const inboundSources = ordered.filter((s) => s.category === 'inbound');
  const outboundSources = ordered.filter((s) => s.category === 'outbound');

  return (
    <section className="rounded-xl border border-black/8 bg-white p-5">
      <header className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-black-dark">Demand Sources Covered</h3>
          <InfoTip width={280}>
            Eight ways customers reach your dealership — five inbound (calls,
            chats, internet leads) and three outbound (campaigns to existing
            CRM contacts). Until all eight are enabled, Vini can't show its full
            impact on your funnel.
          </InfoTip>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums text-black-dark">
            {summary.liveCount}
          </span>
          <span className="text-sm text-black-60">of {summary.totalCount}</span>
        </div>
      </header>
      <p className="mt-0.5 text-xs text-black-60">
        Channels and campaigns enabled today
      </p>

      <div className="mt-4 space-y-3">
        <SourceGroup
          label="Inbound"
          counts={summary.byCategory.inbound}
          items={inboundSources}
        />
        <SourceGroup
          label="Outbound"
          counts={summary.byCategory.outbound}
          items={outboundSources}
        />
      </div>
    </section>
  );
}

function SourceGroup({
  label,
  counts,
  items,
}: {
  label: string;
  counts: { live: number; total: number };
  items: SourceStatus[];
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-black-40">
          {label}
        </span>
        <span className="text-[11px] tabular-nums text-black-60">
          {counts.live}/{counts.total}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <SourceChip key={s.id} source={s} />
        ))}
      </div>
    </div>
  );
}

function SourceChip({ source }: { source: SourceStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium',
        source.live
          ? 'border-green/30 bg-green/8 text-green'
          : 'border-black/10 bg-gray-light/40 text-black-40'
      )}
    >
      {source.live ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      {source.label}
    </span>
  );
}
