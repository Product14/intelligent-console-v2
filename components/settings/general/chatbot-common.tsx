'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/settings/cn';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { useContractedAgents } from '@/hooks/settings/use-contracted-agents';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { DsToggle, Input } from '@/components/settings/ds';
import { Textarea } from '@/components/settings/ui/textarea';

function ChannelSettings({ label }: { label: string }) {
  const [urls, setUrls] = useState('');
  const [suggestions, setSuggestions] = useState('');
  return (
    <div className="rounded-2xl border border-black/10 p-5">
      <div className="mb-4 text-sm font-semibold text-black-dark">{label}</div>
      <div className="space-y-4">
        <Input
          label="Pages to show / hide the chatbot (URLs)"
          value={urls}
          onChange={setUrls}
          placeholder="e.g. /inventory/*, /service"
        />
        <Textarea
          label="Entry suggestions"
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          placeholder={'One per line, e.g.\nDo you have the 2024 RAV4 in stock?\nBook a test drive'}
        />
      </div>
    </div>
  );
}

export function ChatbotCommon({ subStepId }: { subStepId: string }) {
  const [enabled, setEnabled] = useState(true);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [entryPoint, setEntryPoint] = useState<'floating' | 'pinned'>('floating');
  useSubStep(subStepId, true);

  const { agents } = useContractedAgents();
  const hasSalesInbound = useMemo(
    () => agents.some((a) => a.agentType === 'sales' && a.agentCallType === 'inbound'),
    [agents]
  );
  const hasServiceInbound = useMemo(
    () => agents.some((a) => a.agentType === 'service' && a.agentCallType === 'inbound'),
    [agents]
  );

  return (
    <div>
      <SubStepHeader
        title="Website Chatbot"
        description="Let visitors chat with Vini on your website. Enable it once here; configure per-channel pages & suggestions below."
      />

      <div className="rounded-2xl border border-black/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-black-dark">Enable Website Chatbot</div>
            <div className="text-xs text-black-40">Master switch for the website chat widget.</div>
          </div>
          <DsToggle id="chatbot-enabled" toggle={enabled} toggleHandler={(e) => setEnabled(e.target.checked)} />
        </div>
      </div>

      {enabled && (
        <div className="mt-6 space-y-6">
          {/* Common appearance settings */}
          <div className="rounded-2xl border border-black/10 p-5">
            <div className="mb-4 text-sm font-semibold text-black-dark">Appearance (applies everywhere)</div>
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-medium text-black-60">Entry point</div>
                <div className="flex gap-2">
                  {(['floating', 'pinned'] as const).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setEntryPoint(o)}
                      className={cn(
                        'rounded-full border px-4 py-1.5 text-sm capitalize',
                        entryPoint === o ? 'border-blue-light bg-blue-8 text-blue-light' : 'border-gray-40 text-black-60'
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-black-60">Theme</div>
                <div className="flex gap-2">
                  {(['system', 'light', 'dark'] as const).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setTheme(o)}
                      className={cn(
                        'rounded-full border px-4 py-1.5 text-sm capitalize',
                        theme === o ? 'border-blue-light bg-blue-8 text-blue-light' : 'border-gray-40 text-black-60'
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Per-channel settings — only for contracted inbound agents */}
          {hasSalesInbound && <ChannelSettings label="Sales — pages & entry suggestions" />}
          {hasServiceInbound && <ChannelSettings label="Service — pages & entry suggestions" />}
          {!hasSalesInbound && !hasServiceInbound && (
            <p className="text-sm text-black-40">
              No inbound agents contracted — per-channel chatbot settings will appear when an inbound agent is added.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
