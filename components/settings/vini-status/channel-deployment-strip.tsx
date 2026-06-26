'use client';

import { Check, MinusCircle, RadioTower } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import type { ChannelDeployment, ChannelStatus } from '@/lib/settings/vini-status-mock';

const CHANNEL_LABELS: Array<{ key: keyof ChannelDeployment; label: string }> = [
  { key: 'phone',   label: 'Phone' },
  { key: 'chatbot', label: 'Chatbot' },
  { key: 'sms',     label: 'SMS' },
];

/** Inbound-only — shows which top-of-funnel taps are open. The aggregated
 *  TOFU% number lives in the metrics block below; this strip explains it. */
export function ChannelDeploymentStrip({ channels }: { channels: ChannelDeployment }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-light/40 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-black-40">
        Channels
      </div>
      {CHANNEL_LABELS.map(({ key, label }) => (
        <ChannelChip key={key} label={label} row={channels[key]} />
      ))}
    </div>
  );
}

function ChannelChip({
  label,
  row,
}: {
  label: string;
  row: { status: ChannelStatus; routedPct: number };
}) {
  const tone = TONE[row.status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone.cls
      )}
      title={`${label} · ${LABEL[row.status]} · ${row.routedPct}% routed`}
    >
      <tone.Icon className="h-3 w-3" />
      <span>{label}</span>
      <span className="opacity-70">·</span>
      <span>{LABEL[row.status]}</span>
      {row.status !== 'not_deployed' && (
        <>
          <span className="opacity-70">·</span>
          <span>{row.routedPct}%</span>
        </>
      )}
    </span>
  );
}

const TONE: Record<ChannelStatus, { cls: string; Icon: typeof Check }> = {
  live:         { cls: 'bg-green-lighter text-green-darker', Icon: Check },
  partial:      { cls: 'bg-blue-8 text-blue-light',          Icon: RadioTower },
  not_deployed: { cls: 'bg-gray-8 text-black-40',            Icon: MinusCircle },
};

const LABEL: Record<ChannelStatus, string> = {
  live:         'Live',
  partial:      'Partial',
  not_deployed: 'Not deployed',
};
