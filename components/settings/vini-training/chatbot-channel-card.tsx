'use client';

import { cn } from '@/lib/settings/cn';
import { MessageSquare } from 'lucide-react';
import {
  formatResponseTime,
  pickPeerSource,
} from '@/lib/settings/vini-training-derivations';
import type {
  ChatbotChannel,
  SourceStatus,
  TopLineMetrics,
} from '@/lib/settings/vini-training-mock';
import { ConfidenceBuilderLine } from './confidence-builder-line';
import { InfoTip } from './info-tip';
import { LiveStatusBadge } from './live-status-badge';

interface Props {
  chatbot: ChatbotChannel;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}

export function ChatbotChannelCard({ chatbot, sources, topLine }: Props) {
  const isLive = chatbot.status === 'live';
  const peer = !isLive ? pickPeerSource('chatbot', sources) : null;

  return (
    <section
      className={cn(
        'rounded-xl border p-5',
        isLive ? 'border-green/20 bg-white' : 'border-black/8 bg-white'
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-light" />
          <h3 className="text-sm font-semibold text-black-dark">Website Chatbot</h3>
          <InfoTip width={280}>
            Vini answers customer questions on your dealership website,
            qualifies the lead, and writes the contact directly into your CRM.
            Replaces "leave a message" forms that nobody picks up.
          </InfoTip>
        </div>
        <LiveStatusBadge status={chatbot.status} />
      </header>

      <dl className="mt-4 space-y-1.5">
        {isLive ? (
          <>
            <Row label="Handled" value={chatbot.sessionsHandled.toLocaleString()} />
            {chatbot.sessionsUnanswered > 0 && (
              <Row label="Unanswered" value={chatbot.sessionsUnanswered.toLocaleString()} highlight />
            )}
          </>
        ) : (
          <>
            <Row
              label="Sessions going unanswered"
              value={chatbot.sessionsUnanswered.toLocaleString()}
              highlight
            />
          </>
        )}
      </dl>

      {peer && (
        <ConfidenceBuilderLine
          text={`Vini is already working ${peer.label.toLowerCase()} at ${formatResponseTime(topLine.responseTimeViniSec)} avg response.`}
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

