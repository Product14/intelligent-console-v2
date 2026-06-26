'use client';

import { GraduationCap } from 'lucide-react';
import { lifecyclePhase, trainingDay } from '@/lib/settings/vini-training-windows';

interface Props {
  trainingStartAt: string;
  today: string;
}

/** Small page-header indicator. Visible only while training mode is active.
 *  Slot this into any settings page chrome adjacent to the title. */
export function TrainingModePill({ trainingStartAt, today }: Props) {
  const phase = lifecyclePhase(trainingStartAt, today);
  if (phase !== 'training') return null;

  const day = trainingDay(trainingStartAt, today);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-2 px-2.5 py-1 text-[11px] font-semibold text-blue-light">
      <GraduationCap className="h-3 w-3" />
      Training · Day {day} of 90
    </span>
  );
}
