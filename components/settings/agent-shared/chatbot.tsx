'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/settings';
import type { ChatbotConfig } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { DsToggle } from '@/components/settings/ds';
import { cn } from '@/lib/settings/cn';

export function Chatbot({ subStepId, segment }: { subStepId: string; segment: string }) {
  const [cfg, setCfg] = useState<ChatbotConfig | null>(null);
  useSubStep(subStepId, true);

  useEffect(() => {
    api.chatbot.get(segment).then(setCfg);
  }, [segment]);

  const update = (patch: Partial<ChatbotConfig>) => {
    setCfg((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      api.chatbot.save(segment, next);
      return next;
    });
  };

  if (!cfg) return <div className="py-12 text-sm text-black-40">Loading…</div>;

  return (
    <div>
      <SubStepHeader
        title="Website Chatbot"
        description="Let visitors chat with your agent directly on your website."
      />
      <div className="rounded-xl border border-black/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-black-dark">Enable Website Chatbot</div>
            <div className="text-xs text-black-40">Show the Vini chat widget on your site.</div>
          </div>
          <DsToggle id="chatbot-enabled" toggle={cfg.enabled} toggleHandler={(e) => update({ enabled: e.target.checked })} />
        </div>
      </div>

      {cfg.enabled && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium text-black-60">Pages to show the chatbot on</div>
          <div className="flex gap-2">
            {[
              { id: 'entire', label: 'Entire Website' },
              { id: 'selected', label: 'Selected Pages' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => update({ visibility: o.id as ChatbotConfig['visibility'] })}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm',
                  cfg.visibility === o.id
                    ? 'border-blue-light bg-blue-8 text-blue-light'
                    : 'border-gray-40 text-black-60'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
