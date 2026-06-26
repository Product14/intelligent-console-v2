'use client';

import { TrendingUp, ThumbsUp, Clock3 } from 'lucide-react';
import type { OutboundAggregate as OutboundAggregateData } from '@/lib/settings/vini-training-mock';
import { InfoTip } from './info-tip';

interface Props {
  aggregate: OutboundAggregateData;
}

export function OutboundAggregate({ aggregate }: Props) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Tile
        Icon={TrendingUp}
        label="Leads engaged"
        value={aggregate.leadsEngaged.toLocaleString()}
        tip="Unique CRM contacts Vini reached out to this window across all active campaigns. Counts the contact once regardless of how many touches it took."
      />
      <Tile
        Icon={ThumbsUp}
        label="Positive responses"
        value={aggregate.positiveResponses.toLocaleString()}
        tip="Leads who responded with interest — asked a question, agreed to a callback, or accepted an appointment offer. Excludes neutral or negative replies."
      />
      <Tile
        Icon={Clock3}
        label="BDC hours saved"
        value={formatHours(aggregate.bdcHoursEquivalent)}
        sublabel="Talk + chat time absorbed"
        tip="Cumulative voice and chat time Vini handled. Equivalent to that many hours of BDC staff time you didn't have to spend on outbound work."
      />
    </section>
  );
}

function Tile({
  Icon,
  label,
  value,
  sublabel,
  tip,
}: {
  Icon: typeof TrendingUp;
  label: string;
  value: string;
  sublabel?: string;
  tip?: string;
}) {
  return (
    <div className="rounded-xl border border-black/8 bg-white p-4">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-blue-light" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-black-40">
          {label}
        </span>
        {tip && <InfoTip width={260}>{tip}</InfoTip>}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-black-dark">{value}</div>
      {sublabel && <p className="mt-0.5 text-[11px] text-black-60">{sublabel}</p>}
    </div>
  );
}

function formatHours(h: number): string {
  if (h < 10) return `${h.toFixed(1)}h`;
  return `${Math.round(h)}h`;
}
