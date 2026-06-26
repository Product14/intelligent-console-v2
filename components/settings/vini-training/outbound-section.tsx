'use client';

import { PhoneOutgoing } from 'lucide-react';
import type {
  OutboundSection as OutboundSectionData,
  SourceStatus,
  TopLineMetrics,
} from '@/lib/settings/vini-training-mock';
import { OutboundAggregate } from './outbound-aggregate';
import { CampaignCard } from './campaign-card';

interface Props {
  outbound: OutboundSectionData;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}

export function OutboundSection({ outbound, sources, topLine }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <PhoneOutgoing className="h-4 w-4 text-black-60" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black-60">
          Outbound
        </h2>
      </div>

      <OutboundAggregate aggregate={outbound.aggregate} />

      <div className="grid gap-3 md:grid-cols-3">
        {outbound.campaigns.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            sources={sources}
            topLine={topLine}
          />
        ))}
      </div>
    </section>
  );
}
