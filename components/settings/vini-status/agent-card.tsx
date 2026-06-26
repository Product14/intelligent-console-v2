'use client';

import { CircleSlash, Inbox, Mail, Phone, Send, UserCircle } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { ChannelDeploymentStrip } from './channel-deployment-strip';
import { MetricBlock } from './metric-block';
import type { AgentStatus } from '@/lib/settings/vini-status-mock';
import { agentPhase } from '@/lib/settings/vini-status-rules';
import { isAgentConfigured } from '@/lib/settings/vini-status-step-state';
import type {
  AgentLifecycleStage,
  RejectionEntry,
} from '@/lib/settings/vini-status-lifecycle';
import { formatStartedAgo } from '@/lib/settings/vini-status-step-timings';

interface AgentCardProps {
  agent: AgentStatus | undefined;
  today: string;
  /** Lifecycle stage for this specific agent. `null` when not contracted. */
  stage: AgentLifecycleStage | null;
  /** Sales clicked Transfer to OB at this time — drives the "submitted N
   *  days ago" line in pending_ob. */
  transferredAt?: string;
  /** Most recent rejection — surfaced inline on the pre_handover body. */
  lastRejection?: RejectionEntry | null;
  /** Called when OB clicks Accept on the pending_ob body. */
  onAccept?: () => void;
  /** Called when OB clicks Reject — should open the reject modal. */
  onReject?: () => void;
}

/** Body of an agent step row. The StepRow above owns title + status line +
 *  override menu — this component renders only what's specific to the agent
 *  AND its current lifecycle stage. Returns nothing for uncontracted agents
 *  (the row title + summary covers it). */
export function AgentCard({
  agent,
  today,
  stage,
  transferredAt,
  lastRejection,
  onAccept,
  onReject,
}: AgentCardProps) {
  if (!agent || !agent.contracted || stage === null) return null;

  if (stage === 'pre_handover') {
    return <PreHandoverBody lastRejection={lastRejection} />;
  }

  if (stage === 'pending_ob') {
    return (
      <PendingObBody
        transferredAt={transferredAt}
        today={today}
        lastRejection={lastRejection}
        onAccept={onAccept}
        onReject={onReject}
      />
    );
  }

  // Implementation / training / live — but only if the agent identity
  // (name + phone) is actually set. Otherwise show "not configured yet".
  if (!isAgentConfigured(agent)) {
    return <NotConfiguredBody />;
  }

  return <ImplementationBody agent={agent} today={today} />;
}

// ---------------------------------------------------------------------------
// Per-stage bodies.
// ---------------------------------------------------------------------------

function PreHandoverBody({ lastRejection }: { lastRejection?: RejectionEntry | null }) {
  return (
    <article
      className={cn(
        'rounded-xl border border-dashed border-black/15 bg-gray-light/40 px-4 py-4'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-8">
          <Inbox className="h-4 w-4 text-black-40" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-black-60">Awaiting Sales handover</div>
          <div className="mt-0.5 text-xs text-black-40">
            Sales will fill the handover form and transfer this agent to OB.
          </div>
        </div>
      </div>
      {lastRejection && (
        <div className="mt-3 rounded-md border border-red-warningRed/20 bg-red-lightest px-3 py-2 text-[11px] text-red-warningRed">
          <div className="font-semibold">Last rejected by OB</div>
          <p className="mt-0.5 italic">{lastRejection.reason}</p>
          <div className="mt-1 opacity-70">{new Date(lastRejection.at).toLocaleString()}</div>
        </div>
      )}
    </article>
  );
}

function PendingObBody({
  transferredAt,
  today,
  lastRejection,
  onAccept,
  onReject,
}: {
  transferredAt?: string;
  today: string;
  lastRejection?: RejectionEntry | null;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-blue-light/30 bg-blue-2 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-8">
            <Send className="h-4 w-4 text-blue-light" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-blue-light">Pending OB acceptance</div>
            <div className="mt-0.5 text-xs text-blue-light/80">
              {transferredAt
                ? `Submitted ${formatStartedAgo(transferredAt, today).replace(/^Started /, '')}`
                : 'Submitted just now'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center gap-1 rounded-lg border border-red-warningRed bg-white px-3 py-1.5 text-xs font-semibold text-red-warningRed transition-colors hover:bg-red-lightest"
          >
            <CircleSlash className="h-3.5 w-3.5" />
            Reject
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-light px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
          >
            <Mail className="h-3.5 w-3.5" />
            Accept
          </button>
        </div>
      </div>
      {lastRejection && (
        <div className="mt-3 rounded-md border border-red-warningRed/20 bg-red-lightest px-3 py-2 text-[11px] text-red-warningRed">
          <div className="font-semibold">Previously rejected</div>
          <p className="mt-0.5 italic">{lastRejection.reason}</p>
        </div>
      )}
    </article>
  );
}

function NotConfiguredBody() {
  return (
    <article className="rounded-xl border border-dashed border-reddish_orange/40 bg-reddish_orange-lightest px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
          <UserCircle className="h-4 w-4 text-reddish_orange" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-reddish_orange">Agent not configured</div>
          <div className="mt-0.5 text-xs text-reddish_orange">
            OB has accepted but hasn't run the agent-customization + assign-number flows yet.
          </div>
        </div>
      </div>
    </article>
  );
}

function ImplementationBody({ agent, today }: { agent: AgentStatus; today: string }) {
  const phase = agentPhase(agent, today);

  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-black/8 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-8 text-blue-light">
            <UserCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-black-dark">{agent.name}</div>
            {agent.phone && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-black-60">
                <Phone className="h-3 w-3 text-black-40" />
                {agent.phone}
              </div>
            )}
          </div>
        </div>
        {agent.trainingStartAt && (
          <div className="text-[11px] text-black-40">
            Training start: {formatStartDate(agent.trainingStartAt)}
          </div>
        )}
      </header>

      <div className="space-y-2.5 px-4 py-3">
        {agent.callType === 'inbound' && agent.channels && (
          <ChannelDeploymentStrip channels={agent.channels} />
        )}

        <MetricBlock
          callType={agent.callType}
          ob={agent.metrics.ob}
          training={agent.metrics.training}
          postTraining={agent.metrics.postTraining}
          activePhase={phase}
        />
      </div>
    </article>
  );
}

function formatStartDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
