'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { api } from '@/services/settings';
import type { AgentPersona, Avatar, Voice, PhoneAssignment } from '@/services/settings/types';
import type { AgentTone } from '@/services/settings/types';
import { Input, DsButton } from '@/components/settings/ds';
import { Textarea } from '@/components/settings/ui/textarea';
import { cn } from '@/lib/settings/cn';
import { LanguagePicker } from './language-picker';
import { AvatarPicker } from './avatar-picker';
import { VoicePicker } from './voice-picker';
import { AgentPreviewPanel } from './agent-preview-panel';
import type { AgentSlot } from './types';

const TONES: { id: AgentTone; title: string; desc: string }[] = [
  { id: 'professional', title: 'Professional & Concise', desc: 'Clear and efficient. Respects the caller’s time.' },
  { id: 'warm', title: 'Warm & Helpful', desc: 'Friendly and patient. Great for nervous first-time buyers.' },
  { id: 'energetic', title: 'Energetic & Persuasive', desc: 'Upbeat and proactive. Leans into the sale.' },
  { id: 'custom', title: 'Custom Prompt', desc: 'Write your own instructions for how the agent should sound.' },
];

interface AgentEditProps {
  slot: AgentSlot;
  persona: AgentPersona;
  phone: PhoneAssignment | null;
  voices: Voice[];
  avatars: Avatar[];
  onPersonaChange(next: AgentPersona): void;
  onPhoneChange(next: PhoneAssignment): void;
  onBack(): void;
  /** Incremented by the parent screen on Save click. Triggers persist. */
  saveSignal?: number;
}

export function AgentEdit({
  slot,
  persona,
  phone,
  voices,
  avatars,
  onPersonaChange,
  onPhoneChange,
  onBack,
  saveSignal = 0,
}: AgentEditProps) {
  // No autosave — update only mutates draft state via onPersonaChange. The
  // parent screen's Save button increments saveSignal to commit.
  const update = (patch: Partial<AgentPersona>) => {
    const next: AgentPersona = { ...persona, ...patch };

    // If languages changed, drop voice/avatar selections that no longer match.
    if (patch.languages) {
      const langs = patch.languages;
      const currentVoice = voices.find((v) => v.id === next.voiceId);
      if (langs.length > 0 && currentVoice && !currentVoice.languages.some((l) => langs.includes(l))) {
        next.voiceId = '';
      }
      const currentAvatar = avatars.find((a) => a.id === next.avatarId);
      if (langs.length > 0 && currentAvatar && !currentAvatar.languages.some((l) => langs.includes(l))) {
        next.avatarId = '';
      }
    }

    onPersonaChange(next);
  };

  // Keep latest persona accessible to the save effect without re-binding on
  // every keystroke.
  const personaRef = useRef(persona);
  personaRef.current = persona;

  useEffect(() => {
    if (saveSignal <= 0) return;
    let cancelled = false;
    (async () => {
      await api.agent.savePersona(slot.segment, personaRef.current);
      // Backend issues a phone number when an area code is set; refresh local
      // phone state so the right-side panel and card show it.
      const refreshed = await api.phone.get(slot.segment);
      if (!cancelled) onPhoneChange(refreshed);
    })();
    return () => {
      cancelled = true;
    };
  }, [saveSignal, slot.segment, onPhoneChange]);

  const heading = useMemo(
    () => (persona.name ? `Edit ${persona.name}` : `Set up ${slot.label}`),
    [persona.name, slot.label]
  );

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-black-60 hover:text-blue-light"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Sales
        </button>
        <span className="text-black-20">/</span>
        <span className="text-black-dark">{slot.label}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          <header>
            <h2 className="text-xl font-semibold text-black-dark">{heading}</h2>
            <p className="mt-1 text-sm text-black-60">
              Configure how this agent sounds, looks, and introduces itself on calls.
            </p>
          </header>

          <section>
            <SectionLabel title="Identity" hint="Your agent's phone number is issued on save using the area code you provide." />
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <Input
                label="Agent name"
                required
                value={persona.name}
                onChange={(v) => update({ name: v })}
              />
              <Input
                label="Area code"
                placeholder="510"
                value={persona.areaCode}
                onChange={(v) => update({ areaCode: v })}
              />
            </div>
          </section>

          <section>
            <SectionLabel title="Languages" hint="Pick one or more. Voices and avatars below are filtered to your selection." />
            <LanguagePicker value={persona.languages} onChange={(v) => update({ languages: v })} />
          </section>

          <section>
            <SectionLabel title="Avatar" hint="Choose how your agent appears." />
            <AvatarPicker
              avatars={avatars}
              languages={persona.languages}
              value={persona.avatarId}
              onChange={(id) => update({ avatarId: id })}
            />
          </section>

          <section>
            <SectionLabel title="Voice" hint="Use the play button to preview each voice." />
            <VoicePicker
              voices={voices}
              languages={persona.languages}
              value={persona.voiceId}
              onChange={(id) => update({ voiceId: id })}
            />
          </section>

          <section>
            <SectionLabel title="Persona" hint="How your agent should sound to callers." />
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
                  label="Custom prompt"
                  placeholder="Describe exactly how your agent should speak and behave…"
                  value={persona.customPrompt}
                  onChange={(e) => update({ customPrompt: e.target.value })}
                />
              </div>
            )}
          </section>

          <section>
            <SectionLabel title="First message & voicemail" />
            <div className="space-y-5">
              <Textarea
                label="First message"
                value={persona.firstMessage}
                onChange={(e) => update({ firstMessage: e.target.value })}
                hint="Spoken as soon as the agent answers."
              />
              <Textarea
                label="Voicemail message"
                value={persona.voicemail}
                onChange={(e) => update({ voicemail: e.target.value })}
              />
            </div>
          </section>

          <div className="flex items-center gap-3 border-t border-black/5 pt-6">
            <DsButton label="Done" onClick={onBack} />
            <span className="text-xs text-black-40">Changes save automatically.</span>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <AgentPreviewPanel
            persona={persona}
            voice={voices.find((v) => v.id === persona.voiceId)}
            avatar={avatars.find((a) => a.id === persona.avatarId)}
            variant={slot.variant}
            phone={phone}
          />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <div className="text-sm font-semibold text-black-80">{title}</div>
      {hint && <div className="mt-0.5 text-xs text-black-60">{hint}</div>}
    </div>
  );
}
