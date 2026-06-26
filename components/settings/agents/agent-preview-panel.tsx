'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  AlertCircle,
  Phone,
  UserRound,
  PhoneIncoming,
  PhoneOutgoing,
  Sparkles,
} from 'lucide-react';
import type { AgentPersona, Avatar, Voice, PhoneAssignment } from '@/services/settings/types';
import type { AgentVariant } from '@/lib/settings/onboarding-model';
import { cn } from '@/lib/settings/cn';

type CallStatus = 'idle' | 'connecting' | 'live' | 'denied' | 'unsupported';

interface AgentPreviewPanelProps {
  persona: AgentPersona;
  voice?: Voice;
  avatar?: Avatar;
  variant: AgentVariant;
  phone: PhoneAssignment | null;
}

/**
 * Standard agent preview on the edit screen — avatar, identity, persona/voice
 * details, and two CTAs:
 *   • Call          — inline web-mic live preview against the current draft.
 *   • Test agent    — opens the automated test-suite flow (stubbed for now).
 */
export function AgentPreviewPanel({ persona, voice, avatar, variant, phone }: AgentPreviewPanelProps) {
  const isInbound = variant === 'inbound';
  const ready = !!persona.name && !!persona.voiceId;
  const [inCall, setInCall] = useState(false);

  const toneLabel: Record<AgentPersona['tone'], string> = {
    professional: 'Professional & Concise',
    warm: 'Warm & Helpful',
    energetic: 'Energetic & Persuasive',
    custom: 'Custom',
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="relative flex flex-col items-center gap-3 px-5 pb-4 pt-7 text-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-black/10 bg-gray-100">
          {avatar ? (
            <img src={avatar.imageUrl} alt={avatar.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-black-40">
              <UserRound className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-black-dark">
            {persona.name || 'Unnamed agent'}
          </div>
          <div className="mt-0.5 truncate text-xs text-black-60">
            {isInbound ? 'Inbound' : 'Outbound'}
          </div>
        </div>

        <span
          className={cn(
            'absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-white',
            isInbound ? 'bg-green-darker' : 'bg-blue-light'
          )}
          title={isInbound ? 'Inbound' : 'Outbound'}
        >
          {isInbound ? <PhoneIncoming className="h-3 w-3" /> : <PhoneOutgoing className="h-3 w-3" />}
        </span>
      </div>

      <dl className="space-y-2.5 border-t border-black/5 px-5 py-4 text-xs">
        <DetailRow label="Voice" value={voice?.name || '—'} />
        <DetailRow
          label="Languages"
          value={persona.languages.length > 0 ? persona.languages.join(', ') : '—'}
        />
        <DetailRow label="Persona" value={toneLabel[persona.tone]} />
        {phone?.number && (
          <DetailRow
            label="Number"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-black-40" />
                {phone.number}
              </span>
            }
          />
        )}
      </dl>

      <div className="border-t border-black/5 p-3">
        {inCall ? (
          <CallPanel persona={persona} onEnd={() => setInCall(false)} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInCall(true)}
              disabled={!ready}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                ready
                  ? 'bg-blue-light text-white hover:opacity-90'
                  : 'bg-black/5 text-black-40'
              )}
            >
              <Phone className="h-4 w-4" />
              Call
            </button>
            <button
              type="button"
              onClick={() => {/* test suite flow lands later */}}
              disabled={!ready}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors',
                ready
                  ? 'border-black/15 text-black-dark hover:border-blue-light hover:text-blue-light'
                  : 'border-black/10 text-black-40'
              )}
            >
              <Sparkles className="h-4 w-4" />
              Test agent
            </button>
          </div>
        )}
        {!ready && (
          <div className="mt-2 text-center text-[11px] text-black-40">
            Set a name and pick a voice to enable preview.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-black-60">{label}</dt>
      <dd className="truncate text-right font-medium text-black-dark">{value}</dd>
    </div>
  );
}

// ---- Inline live preview (mic) ----

function CallPanel({ persona, onEnd }: { persona: AgentPersona; onEnd(): void }) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [muted, setMuted] = useState(false);
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevel(0);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        return;
      }
      setStatus('connecting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        audioCtxRef.current = ctx;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let max = 0;
          for (let i = 0; i < buf.length; i++) {
            const d = Math.abs(buf[i] - 128);
            if (d > max) max = d;
          }
          setLevel(muted ? 0 : Math.min(1, max / 64));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
        setStatus('live');
      } catch {
        setStatus('denied');
      }
    })();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-blue-2/30 p-4">
      <button
        type="button"
        onClick={status === 'live' ? toggleMute : undefined}
        disabled={status !== 'live'}
        className={cn(
          'group relative flex h-16 w-16 items-center justify-center rounded-full text-white transition-transform',
          status === 'live' && !muted && 'bg-blue-light shadow-[0_0_0_8px_rgba(70,0,242,0.12)]',
          status === 'live' && muted && 'bg-black-60',
          status === 'connecting' && 'bg-blue-light/80',
          (status === 'denied' || status === 'unsupported') && 'bg-unpaidMarkerText/80'
        )}
        style={
          status === 'live' && !muted ? { transform: `scale(${1 + level * 0.15})` } : undefined
        }
        aria-label={status === 'live' ? (muted ? 'Unmute' : 'Mute') : 'Live preview'}
      >
        {status === 'connecting' && <Loader2 className="h-6 w-6 animate-spin" />}
        {status === 'live' && (muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />)}
        {(status === 'denied' || status === 'unsupported') && <AlertCircle className="h-6 w-6" />}
      </button>

      <div className="text-center">
        {status === 'connecting' && <div className="text-xs font-medium text-black-dark">Connecting…</div>}
        {status === 'live' && (
          <div className="text-xs font-medium text-black-dark">{muted ? 'Muted' : 'Listening…'}</div>
        )}
        {status === 'denied' && (
          <div className="text-xs font-medium text-unpaidMarkerText">Mic permission denied</div>
        )}
        {status === 'unsupported' && (
          <div className="text-xs font-medium text-unpaidMarkerText">Mic not supported</div>
        )}
        {status === 'live' && persona.firstMessage && (
          <div className="mt-1.5 text-[11px] italic text-black-60">“{persona.firstMessage}”</div>
        )}
      </div>

      <button
        type="button"
        onClick={onEnd}
        className="inline-flex items-center gap-1.5 rounded-full bg-unpaidMarkerText px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
      >
        <PhoneOff className="h-3.5 w-3.5" />
        End call
      </button>
    </div>
  );
}
