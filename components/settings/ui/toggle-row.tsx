'use client';

import { cn } from '@/lib/settings/cn';

/** Pam-style boolean row: title + description + Disabled/Enabled segmented control.
 *  Enabled rows are lightly tinted. Used for feature defaulting. */
export function ToggleRow({
  title,
  description,
  enabled,
  onChange,
  disabled,
}: {
  title: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-6 rounded-xl border p-4 transition-colors',
        enabled ? 'border-blue-light/30 bg-blue-2' : 'border-black/10 bg-white'
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-black-dark">{title}</div>
        {description && <div className="mt-0.5 text-xs text-black-40">{description}</div>}
      </div>
      <div className="flex shrink-0 overflow-hidden rounded-lg border border-black/10">
        {(['Disabled', 'Enabled'] as const).map((label, i) => {
          const isOn = i === 1;
          const active = enabled === isOn;
          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => onChange(isOn)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                active
                  ? isOn
                    ? 'bg-blue-light text-white'
                    : 'bg-gray-8 text-black-80'
                  : 'bg-white text-black-40 hover:bg-gray-8'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
