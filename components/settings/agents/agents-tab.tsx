'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { api } from '@/services/settings';
import type { AgentPersona, Avatar, Voice, PhoneAssignment } from '@/services/settings/types';
import type { AgentType, AgentVariant } from '@/lib/settings/onboarding-model';
import { AgentCard } from './agent-card';
import { AgentEdit } from './agent-edit';
import { getAgentSlots } from './types';

interface AgentState {
  persona: AgentPersona;
  phone: PhoneAssignment | null;
}

interface AgentsTabProps {
  agentType: AgentType;
  /** Tick the parent screen's Save button increments — passed through to the
   *  active AgentEdit so persona changes commit only on explicit save. */
  saveSignal?: number;
}

/**
 * Lists Inbound/Outbound agents for the given agent type. The card CTA is
 * pure navigation — it always opens the edit screen, where every configuration
 * concern (persona, voice, avatar, number issuance, live preview) lives.
 */
export function AgentsTab({ agentType, saveSignal = 0 }: AgentsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const slots = getAgentSlots(agentType);

  const editingVariant = params.get('agent') as AgentVariant | null;
  const editingSlot = slots.find((s) => s.variant === editingVariant) ?? null;

  const [byVariant, setByVariant] = useState<Record<string, AgentState | undefined>>({});
  const [voices, setVoices] = useState<Voice[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);

  useEffect(() => {
    Promise.all([api.agent.listVoices(), api.agent.listAvatars()]).then(([v, a]) => {
      setVoices(v);
      setAvatars(a);
    });
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all(
      slots.map(async (slot) => {
        const [persona, phone] = await Promise.all([
          api.agent.getPersona(slot.segment),
          api.phone.get(slot.segment),
        ]);
        return [slot.variant, { persona, phone }] as const;
      })
    ).then((entries) => {
      if (!active) return;
      setByVariant(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentType]);

  const setEditing = useCallback(
    (variant: AgentVariant | null) => {
      const next = new URLSearchParams(params.toString());
      if (variant) next.set('agent', variant);
      else next.delete('agent');
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const updateState = useCallback((variant: AgentVariant, patch: Partial<AgentState>) => {
    setByVariant((prev) => {
      const cur = prev[variant];
      return { ...prev, [variant]: { ...(cur as AgentState), ...patch } };
    });
  }, []);

  if (editingSlot) {
    const state = byVariant[editingSlot.variant];
    if (!state) return <div className="py-12 text-sm text-black-40">Loading…</div>;
    return (
      <AgentEdit
        slot={editingSlot}
        persona={state.persona}
        phone={state.phone}
        voices={voices}
        avatars={avatars}
        onPersonaChange={(next) => updateState(editingSlot.variant, { persona: next })}
        onPhoneChange={(next) => updateState(editingSlot.variant, { phone: next })}
        onBack={() => setEditing(null)}
        saveSignal={saveSignal}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {slots.map((slot) => {
        const state = byVariant[slot.variant];
        if (!state) {
          return (
            <div
              key={slot.variant}
              className="h-[220px] animate-pulse rounded-2xl border border-black/10 bg-black/[0.02]"
            />
          );
        }
        const voice = voices.find((v) => v.id === state.persona.voiceId);
        const avatar = avatars.find((a) => a.id === state.persona.avatarId);
        return (
          <AgentCard
            key={slot.variant}
            label={slot.label}
            variant={slot.variant}
            persona={state.persona}
            voice={voice}
            avatar={avatar}
            phone={state.phone}
            onPrimary={() => setEditing(slot.variant)}
          />
        );
      })}
    </div>
  );
}
