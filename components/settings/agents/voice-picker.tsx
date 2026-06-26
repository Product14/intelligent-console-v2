'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Play, Pause } from 'lucide-react';
import type { Voice } from '@/services/settings/types';
import { cn } from '@/lib/settings/cn';

interface VoicePickerProps {
  voices: Voice[];
  languages: string[];
  value: string;
  onChange(id: string): void;
}

/**
 * List of voices filtered to those that support at least one of the selected
 * languages. Each voice has an inline Play/Pause preview (uses Voice.previewUrl
 * when available; otherwise the preview button is shown as a no-op affordance).
 */
export function VoicePicker({ voices, languages, value, onChange }: VoicePickerProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const visible = languages.length === 0
    ? voices
    : voices.filter((v) => v.languages.some((l) => languages.includes(l)));

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePreview = (voice: Voice) => {
    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    if (voice.previewUrl) {
      const next = new Audio(voice.previewUrl);
      next.onended = () => setPlayingId(null);
      next.play().catch(() => setPlayingId(null));
      audioRef.current = next;
    }
    setPlayingId(voice.id);
  };

  if (visible.length === 0) {
    return <div className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black-60">No voices available for the selected languages.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {visible.map((voice) => {
        const on = voice.id === value;
        const playing = playingId === voice.id;
        return (
          <div
            key={voice.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 transition-colors',
              on ? 'border-blue-light bg-blue-2' : 'border-black/10 hover:border-blue-1'
            )}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePreview(voice); }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black-80 transition-colors hover:border-blue-light hover:text-blue-light"
              aria-label={playing ? `Pause ${voice.name} preview` : `Play ${voice.name} preview`}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => onChange(voice.id)}
              className="flex flex-1 items-center justify-between gap-2 text-left"
              aria-pressed={on}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-black-dark">{voice.name}</span>
                <span className="mt-0.5 block truncate text-xs text-black-60">{voice.descriptor}</span>
              </span>
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  on ? 'border-blue-light bg-blue-light text-white' : 'border-gray-40'
                )}
              >
                {on && <Check className="h-3 w-3" />}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
