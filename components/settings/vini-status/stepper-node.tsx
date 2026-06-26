'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import type { StepState } from '@/lib/settings/vini-status-step-state';

/** A single node in the vertical stepper.
 *
 *  - The circle's color encodes the state (gray = not started, blue = partial,
 *    green = done). The step number sits inside; done steps show a check icon
 *    over the number.
 *  - A connecting line drops below the node toward the next row. Its color
 *    matches the current node's state — a green line under a done step, blue
 *    under a partial step, gray under a not-started one. The very last node
 *    in the stepper omits the line. */
export function StepperNode({
  index,
  state,
  isLast = false,
}: {
  index: number;
  state: StepState;
  isLast?: boolean;
}) {
  const tone = TONE[state];
  return (
    <div className="relative flex w-10 shrink-0 flex-col items-center">
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
          tone.circle
        )}
      >
        {state === 'done' ? <Check className="h-4 w-4" /> : index}
      </div>
      {!isLast && (
        <div className={cn('-mt-0.5 w-0.5 grow', tone.line)} aria-hidden="true" />
      )}
    </div>
  );
}

const TONE: Record<StepState, { circle: string; line: string }> = {
  done: {
    circle: 'border-green bg-green text-white',
    line: 'bg-green/40',
  },
  partial: {
    circle: 'border-blue-light bg-blue-light text-white',
    line: 'bg-blue-light/40',
  },
  not_started: {
    circle: 'border-black/15 bg-white text-black-40',
    line: 'bg-black/8',
  },
};
