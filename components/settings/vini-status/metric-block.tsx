'use client';

import { cn } from '@/lib/settings/cn';
import type { AgentCallType, PeriodMetrics } from '@/lib/settings/vini-status-mock';
import type { AgentPhase } from '@/lib/settings/vini-status-rules';

interface Props {
  callType: AgentCallType;
  ob: PeriodMetrics;
  training: PeriodMetrics;
  postTraining: PeriodMetrics;
  activePhase: AgentPhase;
}

const PHASE_LABELS: Record<'ob' | 'training' | 'post_training', string> = {
  ob: 'During OB',
  training: 'During Training',
  post_training: 'Post Training',
};

/** Three-column metric block. The active phase is visually emphasised so a
 *  reader's eye lands on "what's happening now." */
export function MetricBlock({ callType, ob, training, postTraining, activePhase }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Column callType={callType} phase="ob"           metrics={ob}           active={activePhase === 'ob'} />
      <Column callType={callType} phase="training"     metrics={training}     active={activePhase === 'training'} />
      <Column callType={callType} phase="post_training" metrics={postTraining} active={activePhase === 'post_training'} />
    </div>
  );
}

function Column({
  callType,
  phase,
  metrics,
  active,
}: {
  callType: AgentCallType;
  phase: 'ob' | 'training' | 'post_training';
  metrics: PeriodMetrics;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2.5 transition-colors',
        active
          ? 'border-blue-light/40 bg-blue-2'
          : 'border-black/8 bg-gray-light/30'
      )}
    >
      <div
        className={cn(
          'text-[10px] font-semibold uppercase tracking-wide',
          active ? 'text-blue-light' : 'text-black-40'
        )}
      >
        {PHASE_LABELS[phase]}
      </div>
      <div className="mt-0.5 text-[11px] text-black-40">{metrics.dateRange ?? '—'}</div>

      <dl className="mt-2 space-y-1.5">
        <MetricLine label="Conversations" value={formatCount(metrics.conversations)} />
        {callType === 'inbound' && (
          <MetricLine label="TOFU opened" value={formatPct(metrics.tofuPct)} />
        )}
        {callType === 'outbound' && (
          <>
            <MetricLine label="Leads reached" value={formatCount(metrics.leadsReached)} />
            <MetricLine label="ABR" value={formatPct(metrics.abrPct)} />
          </>
        )}
      </dl>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[11px] text-black-60">{label}</dt>
      <dd className="text-sm font-semibold text-black-dark">{value}</dd>
    </div>
  );
}

function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString();
}

function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return `${n}%`;
}
