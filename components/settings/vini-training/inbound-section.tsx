'use client';

import { PhoneIncoming } from 'lucide-react';
import type {
  InboundSection as InboundSectionData,
  SourceStatus,
  TopLineMetrics,
} from '@/lib/settings/vini-training-mock';
import { VoiceChannelCard } from './voice-channel-card';
import { ChatbotChannelCard } from './chatbot-channel-card';
import { SpeedToLeadCard } from './speed-to-lead-card';
import { InboundOutcomesStrip } from './inbound-outcomes-strip';

interface Props {
  inbound: InboundSectionData;
  sources: SourceStatus[];
  topLine: TopLineMetrics;
}

export function InboundSection({ inbound, sources, topLine }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <PhoneIncoming className="h-4 w-4 text-black-60" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black-60">
          Inbound
        </h2>
      </div>

      <VoiceChannelCard
        voice={inbound.voice}
        sources={sources}
        topLine={topLine}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <ChatbotChannelCard
          chatbot={inbound.chatbot}
          sources={sources}
          topLine={topLine}
        />
        <SpeedToLeadCard
          speedToLead={inbound.speedToLead}
          sources={sources}
          topLine={topLine}
        />
      </div>

      <InboundOutcomesStrip outcomes={inbound.outcomes} />
    </section>
  );
}
