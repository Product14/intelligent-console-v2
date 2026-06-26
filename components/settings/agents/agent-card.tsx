'use client';

import { ArrowRight, Phone, PhoneIncoming, PhoneOutgoing, UserRound } from 'lucide-react';
import type { AgentPersona, Avatar, Voice, PhoneAssignment } from '@/services/settings/types';
import type { AgentVariant } from '@/lib/settings/onboarding-model';
import { cn } from '@/lib/settings/cn';

export interface AgentCardProps {
  label: string;
  variant: AgentVariant;
  persona: AgentPersona;
  voice?: Voice;
  avatar?: Avatar;
  phone: PhoneAssignment | null;
  onPrimary(): void;
}

function isConfigured(p: AgentPersona): boolean {
  return p.name.trim().length > 0 && !!p.voiceId;
}

function isComplete(p: AgentPersona, phone: PhoneAssignment | null): boolean {
  return isConfigured(p) && p.languages.length > 0 && !!p.avatarId && !!phone?.number;
}

function ctaLabel(p: AgentPersona, phone: PhoneAssignment | null): string {
  if (!isConfigured(p)) return 'Set up Agent';
  if (!isComplete(p, phone)) return 'Continue Setup';
  return 'Edit Agent';
}

/**
 * One canonical card layout for every state — the only thing that changes
 * across not_setup / configured-no-number / configured-with-number is what's
 * shown in the meta line and what the single bottom CTA says. The shape and
 * positions are identical.
 */
export function AgentCard({ label, variant, persona, voice, avatar, phone, onPrimary }: AgentCardProps) {
  const configured = isConfigured(persona);
  const hasNumber = !!phone?.number;
  const cta = ctaLabel(persona, phone);

  const isInbound = variant === 'inbound';
  const title = configured ? persona.name : label;
  const subtitle = configured
    ? label
    : isInbound
      ? 'Handles all incoming calls 24/7'
      : 'Reaches out to leads on your behalf';

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="relative flex min-h-[168px] gap-4 p-5">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-w-0 pr-12">
            <div className="truncate text-lg font-semibold text-black-dark">{title}</div>
            <div className="mt-0.5 truncate text-sm text-black-60">{subtitle}</div>
          </div>

          <div className="mt-3 min-h-[24px] text-sm">
            {configured && hasNumber && (
              <div className="inline-flex items-center gap-1.5 text-black-60">
                <Phone className="h-3.5 w-3.5 text-black-40" />
                <span className="font-medium text-black-dark">{phone!.number}</span>
              </div>
            )}
            {configured && !hasNumber && (
              <div className="text-xs text-black-40">No number assigned yet</div>
            )}
            {!configured && (
              <div className="text-xs text-black-40">Not set up yet</div>
            )}
          </div>

          {configured && (voice || persona.languages.length > 0) && (
            <div className="mt-auto pt-3 text-xs text-black-60">
              {voice && <span className="font-medium text-black-80">{voice.name}</span>}
              {voice && persona.languages.length > 0 && <span className="mx-1.5 text-black-20">·</span>}
              {persona.languages.length > 0 && <span>{persona.languages.join(', ')}</span>}
            </div>
          )}
        </div>

        <div className="relative shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-full border border-black/10 bg-gray-100">
            {avatar ? (
              <img src={avatar.imageUrl} alt={avatar.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-black-40">
                <UserRound className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>

        <span
          className={cn(
            'absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm',
            isInbound ? 'bg-green-darker' : 'bg-blue-light'
          )}
          title={isInbound ? 'Inbound' : 'Outbound'}
        >
          {isInbound ? <PhoneIncoming className="h-3.5 w-3.5" /> : <PhoneOutgoing className="h-3.5 w-3.5" />}
        </span>
      </div>

      <button
        type="button"
        onClick={onPrimary}
        className="group flex w-full items-center justify-center gap-2 border-t border-black/10 bg-white px-5 py-3.5 text-sm font-semibold text-black-dark transition-colors hover:bg-black/[0.03]"
      >
        <span>{cta}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
