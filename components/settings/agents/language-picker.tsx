'use client';

import { cn } from '@/lib/settings/cn';

export const AVAILABLE_LANGUAGES = ['English', 'Spanish', 'French'] as const;

interface LanguagePickerProps {
  value: string[];
  onChange(next: string[]): void;
}

export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  const toggle = (lang: string) => {
    onChange(value.includes(lang) ? value.filter((l) => l !== lang) : [...value, lang]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {AVAILABLE_LANGUAGES.map((lang) => {
        const on = value.includes(lang);
        return (
          <button
            key={lang}
            type="button"
            onClick={() => toggle(lang)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              on
                ? 'border-blue-light bg-blue-8 text-blue-light'
                : 'border-gray-40 text-black-60 hover:border-blue-1'
            )}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
