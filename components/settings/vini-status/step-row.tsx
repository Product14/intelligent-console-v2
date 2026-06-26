'use client';

import { cn } from '@/lib/settings/cn';
import { StepperNode } from './stepper-node';
import { CtaButton } from './cta-button';
import { OverrideMenu } from './override-menu';
import type { StepState } from '@/lib/settings/vini-status-step-state';
import { stateLabel } from '@/lib/settings/vini-status-step-state';
import type { OverrideKind, ViniStatusOverride } from '@/lib/settings/vini-status-overrides';

interface StepRowProps {
  index: number;
  title: string;
  derivedState: StepState;
  /** Description rendered next to the title — "Done · 4 of 4 fields set". */
  summary: string;
  /** Where the CTA links. Pass null to suppress the CTA (e.g. Billing). */
  href: string | null;
  override: ViniStatusOverride | null;
  onOverride: (patch: { kind?: OverrideKind | null; note?: string | null }) => void;
  onClearOverride: () => void;
  isLast?: boolean;
  /** Optional time tracking subtitle rendered below the status line. */
  timeSubtitle?: React.ReactNode;
  /** Suppress the CTA + override menu (used when the row is locked behind a
   *  pre-handover gate — the lock overlay communicates "no action here"). */
  suppressActions?: boolean;
  /** Optional richer body rendered below the title (agent card, billing table). */
  children?: React.ReactNode;
}

/** One row in the stepper: numbered node on the left + content area on the
 *  right (title + status line + override + CTA, with an optional richer body
 *  below for agent / billing steps). */
export function StepRow({
  index,
  title,
  derivedState,
  summary,
  href,
  override,
  onOverride,
  onClearOverride,
  isLast,
  timeSubtitle,
  suppressActions,
  children,
}: StepRowProps) {
  // Manual override outranks the derived state. We translate "blocked" to
  // not_started so the node visual still reads as red-adjacent (handled in
  // the status text via the override badge below).
  const effectiveState: StepState = override?.kind
    ? override.kind === 'ready'
      ? 'done'
      : 'not_started'
    : derivedState;

  return (
    <div className="flex items-stretch gap-4">
      <StepperNode index={index} state={effectiveState} isLast={isLast} />

      <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-5')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-black-dark">
                {index}. {title}
              </h3>
              {override?.kind && (
                <span
                  className={cn(
                    'inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    override.kind === 'ready'
                      ? 'bg-green-lighter text-green-darker'
                      : 'bg-red-lightest text-red-warningRed'
                  )}
                >
                  {override.kind === 'ready' ? 'Marked ready' : 'Flagged blocked'}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-black-60">
              <span className={cn('font-medium', SUMMARY_TONE[effectiveState])}>
                {stateLabel(effectiveState)}
              </span>
              {summary && (
                <>
                  <span className="mx-1 text-black-40">·</span>
                  <span>{summary}</span>
                </>
              )}
            </p>
            {timeSubtitle}
          </div>

          {!suppressActions && (
            <div className="flex items-center gap-1">
              {href && <CtaButton state={effectiveState} href={href} />}
              <OverrideMenu
                current={override}
                onSet={onOverride}
                onClear={onClearOverride}
              />
            </div>
          )}
        </div>

        {override?.note && (
          <p className="mt-2 rounded-md border border-blue-light/20 bg-blue-2 px-3 py-1.5 text-xs italic text-black-60">
            “{override.note}”
          </p>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

const SUMMARY_TONE: Record<StepState, string> = {
  done: 'text-green-darker',
  partial: 'text-blue-light',
  not_started: 'text-black-60',
};
