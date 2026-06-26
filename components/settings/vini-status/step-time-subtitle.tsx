'use client';

import { Clock } from 'lucide-react';
import {
  formatCompletedIn,
  formatStartedAgo,
  type StepTimingEntry,
} from '@/lib/settings/vini-status-step-timings';

interface StepTimeSubtitleProps {
  entry: StepTimingEntry | undefined;
  today: string;
}

/** Small "Started N days ago" / "Completed in N days" line rendered below a
 *  step row's primary status line. Returns nothing when there's no timing
 *  data (step hasn't started yet, or rooftop is still pre-handover). */
export function StepTimeSubtitle({ entry, today }: StepTimeSubtitleProps) {
  if (!entry?.startedAt) return null;

  const text = entry.completedAt
    ? formatCompletedIn(entry.startedAt, entry.completedAt)
    : formatStartedAgo(entry.startedAt, today);

  return (
    <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-black-40">
      <Clock className="h-3 w-3" />
      {text}
    </div>
  );
}
