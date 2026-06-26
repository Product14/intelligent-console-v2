'use client';

import { Check } from 'lucide-react';
import type { Avatar } from '@/services/settings/types';
import { cn } from '@/lib/settings/cn';

interface AvatarPickerProps {
  avatars: Avatar[];
  languages: string[];
  value: string;
  onChange(id: string): void;
}

/**
 * Grid of avatars filtered to those tagged with at least one of the selected
 * languages. When no languages are selected, shows all avatars.
 */
export function AvatarPicker({ avatars, languages, value, onChange }: AvatarPickerProps) {
  const visible = languages.length === 0
    ? avatars
    : avatars.filter((a) => a.languages.some((l) => languages.includes(l)));

  if (visible.length === 0) {
    return <div className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black-60">No avatars available for the selected languages.</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-7">
      {visible.map((avatar) => {
        const on = avatar.id === value;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            className={cn(
              'group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors',
              on ? 'border-blue-light bg-blue-2' : 'border-black/10 hover:border-blue-1'
            )}
            aria-pressed={on}
          >
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="h-14 w-14 rounded-full border border-black/10 bg-gray-100"
            />
            <span className="text-[11px] font-medium text-black-80">{avatar.name}</span>
            {on && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-light text-white">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
