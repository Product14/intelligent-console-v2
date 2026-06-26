'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-left"
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
          checked ? 'border-blue-light bg-blue-light text-white' : 'border-gray-40 bg-white'
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="text-sm text-black-80">{label}</span>
    </button>
  );
}
