'use client';

import { Check, CircleDashed, GitCommitHorizontal, Play, Radio, Send } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import type { AgentLifecycleStage } from '@/lib/settings/vini-status-lifecycle';
import type { StageDistribution } from '@/lib/settings/vini-status-lifecycle';

interface StageBannerProps {
  distribution: StageDistribution;
}

const STAGE_ORDER: Array<{
  key: AgentLifecycleStage;
  label: string;
  Icon: typeof Check;
}> = [
  { key: 'pre_handover',   label: 'Pre-handover',   Icon: CircleDashed },
  { key: 'pending_ob',     label: 'Pending OB',     Icon: Send },
  { key: 'implementation', label: 'Implementation', Icon: GitCommitHorizontal },
  { key: 'training',       label: 'Training',       Icon: Play },
  { key: 'live',           label: 'Live',           Icon: Radio },
];

/** Top-of-page banner showing how the rooftop's contracted agents are
 *  distributed across the 5 lifecycle stages. Plus a short action line
 *  underneath that surfaces the two stages that need someone's action. */
export function StageBanner({ distribution }: StageBannerProps) {
  const actionLine = formatActionLine(distribution);

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="grid grid-cols-5 divide-x divide-black/8">
        {STAGE_ORDER.map(({ key, label, Icon }) => {
          const count = distribution[key];
          const active = count > 0;
          return (
            <div
              key={key}
              className={cn(
                'flex flex-col items-start gap-1 px-3 py-3 transition-colors',
                active ? 'bg-blue-2' : 'bg-white'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={cn('h-3.5 w-3.5', active ? 'text-blue-light' : 'text-black-40')} />
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wide',
                    active ? 'text-blue-light' : 'text-black-40'
                  )}
                >
                  {label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    'text-xl font-semibold',
                    active ? 'text-black-dark' : 'text-black-40'
                  )}
                >
                  {count}
                </span>
                <span className="text-[10px] text-black-40">agent{count === 1 ? '' : 's'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {actionLine && (
        <div className="border-t border-black/8 bg-gray-light/40 px-4 py-2 text-[11px] text-black-60">
          {actionLine}
        </div>
      )}
    </div>
  );
}

function formatActionLine(d: StageDistribution): string | null {
  const parts: string[] = [];
  if (d.pre_handover > 0) {
    parts.push(
      `${d.pre_handover} agent${d.pre_handover === 1 ? '' : 's'} awaiting Sales handover`
    );
  }
  if (d.pending_ob > 0) {
    parts.push(
      `${d.pending_ob} agent${d.pending_ob === 1 ? '' : 's'} need${d.pending_ob === 1 ? 's' : ''} OB action`
    );
  }
  const active = d.implementation + d.training + d.live;
  if (active > 0 && parts.length === 0) {
    parts.push(`${active} agent${active === 1 ? '' : 's'} in active work`);
  }
  if (d.total === 0) return 'No agents contracted for this rooftop.';
  return parts.join(' · ') || null;
}
