'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '@/services/settings';
import type { AgentPersona, AgentTone, Voice } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { Input } from '@/components/settings/ds';
import { Textarea } from '@/components/settings/ui/textarea';
import { cn } from '@/lib/settings/cn';

// Section components no longer autosave on change. The parent screen owns the
// Save button; when it ticks `saveSignal` up, each mounted section persists
// its current draft state. saveSignal starts at 0 to skip first render.

const TONES: { id: AgentTone; title: string; desc: string }[] = [
  { id: 'professional', title: 'Professional & Concise', desc: 'Clear and efficient. Respects the caller’s time.' },
  { id: 'warm', title: 'Warm & Helpful', desc: 'Friendly and patient. Great for nervous first-time buyers.' },
  { id: 'energetic', title: 'Energetic & Persuasive', desc: 'Upbeat and proactive. Leans into the sale.' },
  { id: 'custom', title: 'Custom Prompt', desc: 'Write your own instructions for how the agent should sound.' },
];

export function PersonaVoice({
  subStepId,
  segment,
  saveSignal = 0,
}: {
  subStepId: string;
  segment: string;
  saveSignal?: number;
}) {
  const [persona, setPersona] = useState<AgentPersona | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const isValid = !!persona && persona.name.trim().length > 0;
  useSubStep(subStepId, isValid);

  // Mirror persona into a ref so the save effect reads the latest draft
  // without re-binding on every keystroke.
  const personaRef = useRef<AgentPersona | null>(persona);
  personaRef.current = persona;

  useEffect(() => {
    api.agent.getPersona(segment).then(setPersona);
    api.agent.listVoices().then(setVoices);
  }, [segment]);

  // Save when the parent screen increments saveSignal. Skip the 0 baseline.
  useEffect(() => {
    if (saveSignal > 0 && personaRef.current) {
      api.agent.savePersona(segment, personaRef.current);
    }
  }, [saveSignal, segment]);

  const update = (patch: Partial<AgentPersona>) => {
    setPersona((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  if (!persona) return <div className="py-12 text-sm text-black-40">Loading…</div>;

  return (
    <div>
      <SubStepHeader
        title="Agent Persona & Voice"
        description="Give your agent a name and choose how it should sound to callers."
      />
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <Input label="Agent Name" required value={persona.name} onChange={(v) => update({ name: v })} />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black-60">Languages</span>
          <div className="flex flex-wrap gap-2">
            {['English', 'Spanish', 'French'].map((lang) => {
              const on = persona.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() =>
                    update({
                      languages: on
                        ? persona.languages.filter((l) => l !== lang)
                        : [...persona.languages, lang],
                    })
                  }
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm',
                    on ? 'border-blue-light bg-blue-8 text-blue-light' : 'border-gray-40 text-black-60'
                  )}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3 text-sm font-medium text-black-60">Tone &amp; Sound</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {TONES.map((t) => {
            const on = persona.tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ tone: t.id })}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                  on ? 'border-blue-light bg-blue-2' : 'border-black/10 hover:border-blue-1'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                    on ? 'border-blue-light bg-blue-light text-white' : 'border-gray-40'
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-black-dark">{t.title}</span>
                  <span className="mt-0.5 block text-xs text-black-60">{t.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        {persona.tone === 'custom' && (
          <div className="mt-3">
            <Textarea
              label="Custom Prompt"
              placeholder="Describe exactly how your agent should speak and behave…"
              value={persona.customPrompt}
              onChange={(e) => update({ customPrompt: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="mt-7">
        <div className="mb-3 text-sm font-medium text-black-60">Select Voice</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {voices.map((voice) => {
            const on = persona.voiceId === voice.id;
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => update({ voiceId: voice.id })}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-4 text-left transition-colors',
                  on ? 'border-blue-light bg-blue-2' : 'border-black/10 hover:border-blue-1'
                )}
              >
                <span>
                  <span className="block text-sm font-semibold text-black-dark">{voice.name}</span>
                  <span className="mt-0.5 block text-xs text-black-60">{voice.descriptor}</span>
                </span>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    on ? 'border-blue-light bg-blue-light text-white' : 'border-gray-40'
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
