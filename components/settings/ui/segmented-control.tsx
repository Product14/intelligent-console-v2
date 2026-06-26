'use client';

import { cn } from '@/lib/settings/cn';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange(value: T): void;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

/**
 * Generic horizontal pill-segmented selector. The selected segment fills
 * with a tinted background; others read as quiet labels. Used for
 * SMS/Call/None style choices.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
  className,
  disabled,
}: SegmentedControlProps<T>) {
  const pad = size === 'sm' ? 'px-3 py-1' : 'px-5 py-1.5';
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-black/10 bg-white p-1',
        disabled && 'opacity-60',
        className
      )}
      role="radiogroup"
      aria-disabled={disabled}
    >
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md text-sm font-medium transition-colors',
              pad,
              on
                ? 'bg-blue-2 text-blue-light'
                : 'text-black-60 hover:text-black-80',
              disabled && 'cursor-not-allowed hover:text-black-60'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
