'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

export type PolicyCardStatus =
  | 'defaults'        // safest defaults applied
  | 'all_off'         // feature-gated section is fully off
  | 'required'        // blocker awaiting an explicit answer
  | 'enabled'         // feature on / opted in
  | 'opted_out'       // blocker explicitly disabled
  | 'off';            // generic off (Informativ payments)

interface PolicyCardProps {
  title: string;
  description?: string;
  status: PolicyCardStatus;
  /** When true, render the warning dot + "Required" treatment for blocker
   *  sections that haven't been answered yet. */
  blockerPending?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

const STATUS_LABEL: Record<PolicyCardStatus, string> = {
  defaults: 'Defaults applied',
  all_off: 'All off',
  required: 'Required',
  enabled: 'Enabled',
  opted_out: 'Opted out',
  off: 'Off',
};

const STATUS_TONE: Record<PolicyCardStatus, string> = {
  defaults: 'bg-gray-8 text-black-60',
  all_off: 'bg-gray-8 text-black-60',
  required: 'bg-unpaidMarkerBg text-unpaidMarkerText',
  enabled: 'bg-green-lighter text-green-darker',
  opted_out: 'bg-gray-8 text-black-60',
  off: 'bg-gray-8 text-black-60',
};

/**
 * Collapsed/expanded shell for a sales policy section. Collapsed view shows
 * title, status badge, and one-line subtitle — never the configured values.
 * Expanding reveals the form body.
 */
export function PolicyCard({
  title,
  description,
  status,
  blockerPending,
  defaultOpen = false,
  children,
}: PolicyCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border bg-white transition-colors',
        blockerPending ? 'border-unpaidMarkerText/40' : 'border-black/10'
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {blockerPending && (
              <AlertCircle className="h-4 w-4 shrink-0 text-unpaidMarkerText" aria-hidden />
            )}
            <h3 className="truncate text-sm font-semibold text-black-dark">{title}</h3>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                STATUS_TONE[status]
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
          {description && (
            <p className="mt-1 text-xs text-black-60">{description}</p>
          )}
        </div>
        <span
          className={cn(
            'mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-light'
          )}
        >
          {open ? 'Collapse' : 'Edit'}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-black/5 px-5 py-5">{children}</div>
      )}
    </section>
  );
}
