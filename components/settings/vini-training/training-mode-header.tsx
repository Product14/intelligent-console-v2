'use client';

import { cn } from '@/lib/settings/cn';
import {
  formatLongDay,
  lifecyclePhase,
  trainingDay,
  trainingEndDate,
  trainingProgress,
} from '@/lib/settings/vini-training-windows';
import { InfoTip } from './info-tip';

interface Props {
  trainingStartAt: string;
  today: string;
}

/** Training Period strip — a full-width banner with a pulsing live indicator
 *  while training is active. Greens read as "live and on-pace." Switches to
 *  a static completed banner once Day 90 has passed. Retires entirely past
 *  Day 90 + 2 weeks. */
export function TrainingModeHeader({ trainingStartAt, today }: Props) {
  const phase = lifecyclePhase(trainingStartAt, today);
  if (phase === 'post_training') return null;

  const day = trainingDay(trainingStartAt, today);
  const endDate = trainingEndDate(trainingStartAt);
  const progress = trainingProgress(trainingStartAt, today);
  const progressPct = Math.round(progress * 100);
  const isCompleted = phase === 'just_completed';

  return (
    <div
      className={cn(
        '-mx-6 border-b border-l-[3px] px-6 py-4',
        isCompleted
          ? 'border-b-black/8 border-l-green/60 bg-green-lighter/30'
          : 'border-b-black/8 border-l-green bg-green-lighter/40'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <LiveDot active={!isCompleted} />
            <h2 className="text-base font-semibold text-black-dark">
              Training Period
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-green">
              · {isCompleted ? 'Completed' : 'Active'}
            </span>
            <InfoTip width={280}>
              Vini can handle 100% of your inbound calls, chats, and CRM leads
              from Day 1. The 90-day training period is a controlled rollout —
              you enable Vini on one source at a time and use this dashboard
              to confirm it's working before turning on the next.
            </InfoTip>
          </div>
          <p className="mt-0.5 max-w-2xl text-xs text-black-60">
            {isCompleted
              ? 'Vini\'s controlled rollout has completed. The comparison strip below shows how coverage grew across the period.'
              : 'Vini\'s controlled rollout. Turn on one source at a time, confirm it works, then expand at your own pace.'}
          </p>
        </div>

        <div className="text-right">
          {isCompleted ? (
            <div className="text-base font-semibold tabular-nums text-black-dark">
              90 <span className="font-normal text-black-40">of 90 days</span>
            </div>
          ) : (
            <div className="text-base font-semibold tabular-nums text-black-dark">
              Day {day}{' '}
              <span className="font-normal text-black-40">of 90</span>
            </div>
          )}
          <p className="mt-0.5 text-xs tabular-nums text-black-60">
            {formatLongDay(trainingStartAt)} <span className="text-black-40">→</span>{' '}
            {formatLongDay(endDate)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/8">
          <div
            className="h-full rounded-full bg-green transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-black-60">
          {progressPct}%
        </span>
      </div>
    </div>
  );
}

/** Pulsing "live" dot — solid centre with a fading ping ripple. Static when
 *  the training period has completed. */
function LiveDot({ active }: { active: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
    </span>
  );
}
