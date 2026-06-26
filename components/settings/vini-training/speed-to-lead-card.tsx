'use client';

import { cn } from '@/lib/settings/cn';
import { Timer } from 'lucide-react';
import {
  formatResponseTime,
  pickPeerSource,
} from '@/lib/settings/vini-training-derivations';
import type {
  SourceStatus,
  SpeedToLeadChannel,
  TopLineMetrics,
} from '@/lib/settings/vini-training-mock';
import { ConfidenceBuilderLine } from './confidence-builder-line';
import { InfoTip } from './info-tip';
import { LiveStatusBadge } from './live-status-badge';

interface Props {
  speedToLead: SpeedToLeadChannel;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}

export function SpeedToLeadCard({ speedToLead, sources, topLine }: Props) {
  const isLive = speedToLead.status === 'live';
  const peer = !isLive ? pickPeerSource('speed-to-lead', sources) : null;

  return (
    <section className="rounded-xl border border-black/8 bg-white p-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-blue-light" />
          <h3 className="text-sm font-semibold text-black-dark">Speed-to-Lead</h3>
          <InfoTip width={300}>
            New leads that arrive from AutoTrader, Cars.com, Facebook, OEM
            sites, and other third parties. Vini calls them within{' '}
            {speedToLead.slaWindowLabel} — well before the industry-standard
            window where lead-to-appointment conversion drops sharply.
          </InfoTip>
        </div>
        <LiveStatusBadge status={speedToLead.status} />
      </header>
      <p className="mt-0.5 text-xs text-black-60">
        Cross-channel leads called within {speedToLead.slaWindowLabel}
      </p>

      <dl className="mt-4 space-y-1.5">
        {isLive ? (
          <>
            <Row
              label="Reached in SLA"
              value={speedToLead.leadsReachedInSla.toLocaleString()}
            />
            {speedToLead.leadsLate > 0 && (
              <Row
                label="Called late or not called"
                value={speedToLead.leadsLate.toLocaleString()}
                highlight
              />
            )}
          </>
        ) : (
          <Row
            label="Leads not routed to Vini"
            value={speedToLead.leadsLate.toLocaleString()}
            highlight
          />
        )}
      </dl>

      {peer && (
        <ConfidenceBuilderLine
          text={`Vini is already working ${peer.label.toLowerCase()} at ${formatResponseTime(topLine.responseTimeViniSec)} avg response — well under your ${speedToLead.slaWindowLabel} SLA.`}
        />
      )}
    </section>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-2',
        highlight && 'rounded-md bg-orange-light px-2 py-1'
      )}
    >
      <dt className={cn('text-xs', highlight ? 'font-medium text-orange' : 'text-black-60')}>
        {label}
      </dt>
      <dd
        className={cn(
          'text-sm font-semibold tabular-nums',
          highlight ? 'text-orange' : 'text-black-dark'
        )}
      >
        {value}
      </dd>
    </div>
  );
}

