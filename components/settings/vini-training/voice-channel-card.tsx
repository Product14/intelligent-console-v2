'use client';

import { cn } from '@/lib/settings/cn';
import { Phone } from 'lucide-react';
import {
  formatResponseTime,
  pickPeerSource,
} from '@/lib/settings/vini-training-derivations';
import type {
  SourceId,
  SourceStatus,
  TopLineMetrics,
  VoiceChannel,
  VoiceSubBucket,
} from '@/lib/settings/vini-training-mock';
import { ConfidenceBuilderLine } from './confidence-builder-line';
import { CoverageHeatmap } from './coverage-heatmap';
import { InfoTip } from './info-tip';
import { LiveStatusBadge } from './live-status-badge';

interface Props {
  voice: VoiceChannel;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}

/** Sub-bucket → source ID mapping. */
const SUB_TO_SOURCE: Record<VoiceSubBucket['id'], SourceId> = {
  'after-hours':  'voice-after-hours',
  'overflow':     'voice-overflow',
  'office-hours': 'voice-office-hours',
};

export function VoiceChannelCard({ voice, sources, topLine }: Props) {
  return (
    <section className="rounded-xl border border-black/8 bg-white p-5">
      <header className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-blue-light" />
        <h3 className="text-sm font-semibold text-black-dark">Voice</h3>
        <InfoTip width={300}>
          Three voice scenarios for inbound calls. <b>After-hours</b> covers
          calls outside your stated hours. <b>Overflow</b> picks up calls when
          your BDC is on another line. <b>Office-hours</b> answers calls during
          your team's working hours. Each can be enabled independently.
        </InfoTip>
      </header>

      <div className="mt-3 grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">
          {voice.subBuckets.map((bucket) => (
            <SubBucketRow
              key={bucket.id}
              bucket={bucket}
              sources={sources}
              topLine={topLine}
            />
          ))}
        </div>
        <CoverageHeatmap cells={voice.heatmap} />
      </div>
    </section>
  );
}

function SubBucketRow({
  bucket,
  sources,
  topLine,
}: {
  bucket: VoiceSubBucket;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}) {
  const isLive = bucket.status === 'live';
  const sourceId = SUB_TO_SOURCE[bucket.id];

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        isLive
          ? 'border-green/20 bg-green-lighter/40'
          : 'border-black/8 bg-gray-light/30'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LiveStatusBadge status={bucket.status} />
          <span className="text-sm font-semibold text-black-dark">{bucket.label}</span>
        </div>
        {isLive ? (
          <div className="text-xs text-black-60">
            <span className="font-semibold text-black-dark tabular-nums">
              {bucket.callsHandled.toLocaleString()}
            </span>{' '}
            handled
            {bucket.callsMissed > 0 && (
              <>
                {' · '}
                <span className="text-orange tabular-nums">
                  {bucket.callsMissed} missed
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs">
            <span className="font-semibold text-orange tabular-nums">
              {bucket.callsMissed.toLocaleString()}
            </span>{' '}
            <span className="text-black-60">going to BDC</span>
          </div>
        )}
      </div>

      {!isLive && (
        <DisabledConfidenceLine
          disabledId={sourceId}
          sources={sources}
          topLine={topLine}
        />
      )}
    </div>
  );
}


/** Confidence-builder for disabled voice sub-buckets. Picks the best live
 *  peer source and renders a one-liner. */
function DisabledConfidenceLine({
  disabledId,
  sources,
  topLine,
}: {
  disabledId: SourceId;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}) {
  const peer = pickPeerSource(disabledId, sources);
  if (!peer) return null;
  const responseTime = formatResponseTime(topLine.responseTimeViniSec);
  return (
    <ConfidenceBuilderLine
      text={`Vini is already working ${peer.label.toLowerCase()} at ${responseTime} avg response.`}
    />
  );
}
