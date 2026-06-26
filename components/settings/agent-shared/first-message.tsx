'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/services/settings';
import type { AgentPersona } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { Textarea } from '@/components/settings/ui/textarea';

// No autosave — saves when the parent screen ticks `saveSignal`.
export function FirstMessage({
  subStepId,
  segment,
  saveSignal = 0,
}: {
  subStepId: string;
  segment: string;
  saveSignal?: number;
}) {
  const [persona, setPersona] = useState<AgentPersona | null>(null);
  const isValid = !!persona && persona.firstMessage.trim().length > 0;
  useSubStep(subStepId, isValid);

  const personaRef = useRef<AgentPersona | null>(persona);
  personaRef.current = persona;

  useEffect(() => {
    api.agent.getPersona(segment).then(setPersona);
  }, [segment]);

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
        title="First Message & Voicemail"
        description="What your agent says when it picks up, and the message left when no one is available."
      />
      <div className="space-y-6">
        <Textarea
          label="First Message"
          value={persona.firstMessage}
          onChange={(e) => update({ firstMessage: e.target.value })}
          hint="Spoken as soon as the agent answers."
        />
        <Textarea
          label="Voicemail Message"
          value={persona.voicemail}
          onChange={(e) => update({ voicemail: e.target.value })}
        />
      </div>
    </div>
  );
}
