'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import type { StepState } from '@/lib/settings/vini-status-step-state';

/** State-driven CTA. The verb maps directly to where the user is in the
 *  step's lifecycle: Setup if nothing's been done, Continue if mid-way,
 *  View once the step is complete. */
export function CtaButton({
  state,
  href,
  className,
}: {
  state: StepState;
  href: string;
  className?: string;
}) {
  const v = VARIANT[state];
  const Icon = state === 'done' ? ArrowUpRight : ArrowRight;
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
        v.cls,
        className
      )}
    >
      <span>{v.label}</span>
      <Icon className="h-3.5 w-3.5" />
    </Link>
  );
}

const VARIANT: Record<StepState, { label: string; cls: string }> = {
  not_started: {
    label: 'Setup',
    cls: 'bg-blue-light text-white hover:opacity-90',
  },
  partial: {
    label: 'Continue',
    cls: 'border border-blue-light text-blue-light hover:bg-blue-2',
  },
  done: {
    label: 'View',
    cls: 'border border-black/10 text-black-80 hover:bg-gray-8',
  },
};
