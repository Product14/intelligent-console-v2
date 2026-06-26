'use client';

import { cn } from '@/lib/settings/cn';
import { AlertCircle, MoonStar, Heart, KeyRound } from 'lucide-react';
import {
  formatResponseTime,
  pickPeerSource,
} from '@/lib/settings/vini-training-derivations';
import type {
  CampaignCard as CampaignCardData,
  SourceId,
  SourceStatus,
  TopLineMetrics,
} from '@/lib/settings/vini-training-mock';
import { ConfidenceBuilderLine } from './confidence-builder-line';
import { InfoTip } from './info-tip';
import { LiveStatusBadge } from './live-status-badge';

interface Props {
  campaign: CampaignCardData;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}

const ICONS: Record<CampaignCardData['id'], typeof MoonStar> = {
  'dormant':        MoonStar,
  'prior-interest': Heart,
  'lease-expiry':   KeyRound,
};

const CAMPAIGN_TO_SOURCE: Record<CampaignCardData['id'], SourceId> = {
  'dormant':        'campaign-dormant',
  'prior-interest': 'campaign-prior-interest',
  'lease-expiry':   'campaign-lease-expiry',
};

const CAMPAIGN_DESCRIPTIONS: Record<CampaignCardData['id'], string> = {
  'dormant':        'CRM contacts your team hasn\'t reached in 60+ days. Vini re-engages them with a contextual outreach to surface whoever is still in-market.',
  'prior-interest': 'Past leads who showed interest in a specific vehicle or trim but didn\'t buy. Vini reaches out with current availability or comparable inventory.',
  'lease-expiry':   'Customers whose lease ends in the next 90 days. Vini offers a renewal conversation before they shop elsewhere.',
};

export function CampaignCard({ campaign, sources, topLine }: Props) {
  const isLive = campaign.status === 'live';
  const Icon = ICONS[campaign.id];
  const peer = !isLive ? pickPeerSource(CAMPAIGN_TO_SOURCE[campaign.id], sources) : null;

  return (
    <section
      className={cn(
        'rounded-xl border bg-white p-4',
        isLive ? 'border-black/8' : 'border-black/8'
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-blue-light" />
          <h3 className="text-sm font-semibold text-black-dark">{campaign.label}</h3>
          <InfoTip width={280}>{CAMPAIGN_DESCRIPTIONS[campaign.id]}</InfoTip>
        </div>
        <LiveStatusBadge status={campaign.status} />
      </header>
      <p className="mt-0.5 text-[11px] text-black-60">
        Audience: {campaign.audienceSize.toLocaleString()} leads
      </p>

      {isLive ? (
        <>
          <dl className="mt-3 space-y-1.5">
            <Row label="Touches" value={campaign.touches.toLocaleString()} />
            <Row
              label="Positive responses"
              value={campaign.positiveResponses.toLocaleString()}
            />
          </dl>

          {campaign.unactionedPositives > 0 && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-orange-light px-2.5 py-1.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange" />
              <p className="text-[11px] text-orange">
                <span className="font-semibold">
                  {campaign.unactionedPositives} positive responses
                </span>{' '}
                waiting for your team to act on.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-3">
          <div className="rounded-md bg-orange-light px-2.5 py-1.5">
            <p className="text-[11px] text-orange">
              <span className="font-semibold tabular-nums">
                {campaign.audienceSize.toLocaleString()} leads
              </span>{' '}
              not being worked.
            </p>
          </div>
          {peer && (
            <ConfidenceBuilderLine
              text={`Vini is already running ${peer.label.toLowerCase()} at ${formatResponseTime(topLine.responseTimeViniSec)} avg response.`}
            />
          )}
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-xs text-black-60">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-black-dark">{value}</dd>
    </div>
  );
}

