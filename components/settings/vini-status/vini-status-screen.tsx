'use client';

import { useMemo, useState } from 'react';
import { useViniStatus } from '@/hooks/settings/use-vini-status';
import { useViniOverrides } from '@/hooks/settings/use-vini-overrides';
import { useViniLifecycle } from '@/hooks/settings/use-vini-lifecycle';
import { useViniStepTimings } from '@/hooks/settings/use-vini-step-timings';
import { useViniStatusUrl } from '@/hooks/settings/use-vini-status-url';
import { computeSummary } from '@/lib/settings/vini-status-rules';
import {
  agentStep,
  billingStep,
  departmentsStep,
  integrationsStep,
  rooftopStep,
  routingStep,
  usersStep,
} from '@/lib/settings/vini-status-step-state';
import { AGENT_SLOTS, getAgentSlot } from '@/lib/settings/vini-status-mock';
import { agentRowId } from '@/lib/settings/vini-status-overrides';
import {
  agentLifecycleKey,
  deriveAgentStage,
  deriveStageDistribution,
  earliestAcceptedAt,
  isHandoverFormValid,
  rooftopStepsUnlocked,
  type RejectionEntry,
} from '@/lib/settings/vini-status-lifecycle';
import { resolveFixture } from '@/lib/settings/vini-status-fixtures';
import { getConsoleContext } from '@/lib/settings/bridge/context-store';
import { Send } from 'lucide-react';
import { SummaryBanner } from './summary-banner';
import { StageBanner } from './stage-banner';
import { StepRow } from './step-row';
import { AgentCard } from './agent-card';
import { BillingTable } from './billing-table';
import { IntegrationsGrid } from './integrations-grid';
import { HandoverForm } from './handover-form';
import { TransferToObModal, type TransferTarget } from './transfer-to-ob-modal';
import { RejectModal } from './reject-modal';
import { LockedStepsOverlay } from './locked-steps-overlay';
import { StepTimeSubtitle } from './step-time-subtitle';
import { FixturePicker } from './fixture-picker';
import { ViniStatusSkeleton } from './vini-status-skeleton';

const SECTION_IDS = {
  rooftop: 'rooftop',
  departments: 'departments',
  routing: 'routing',
  users: 'users',
  integrations: 'integrations',
  billing: 'billing',
} as const;

const AGENT_ROUTE: Record<'sales' | 'service', string> = {
  sales: '/max-2/settings/vini/sales',
  service: '/max-2/settings/vini/service',
};

export function ViniStatusScreen() {
  const [fallbackToday] = useState(() => new Date().toISOString());
  const { fixtureKey, forceLoading, today } = useViniStatusUrl(fallbackToday);
  const { data, loading } = useViniStatus(fixtureKey, forceLoading);

  // Fixture-namespaced scope in standalone mode so QA can switch fixtures
  // without spillover; production (Console) uses one scope per enterprise.
  const scope = useMemo(() => {
    const ctx = getConsoleContext();
    if (ctx?.enterpriseId) return `enterprise:${ctx.enterpriseId}`;
    return `standalone:${fixtureKey}`;
  }, [fixtureKey]);

  const fixtureMeta = useMemo(() => resolveFixture(fixtureKey), [fixtureKey]);
  const lifecycleFallback = fixtureMeta.lifecycle;
  const timingsFallback = fixtureMeta.stepTimings;

  const { overrides, set, clear } = useViniOverrides(scope);
  const { lifecycle, saveHandoverDraft, transferAgents, acceptAgent, rejectAgent } =
    useViniLifecycle(scope, lifecycleFallback);
  const { timings } = useViniStepTimings(scope, timingsFallback);

  // Local UI state for the two modals.
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState<{
    type: string;
    callType: string;
    label: string;
  } | null>(null);

  if (loading || !data) {
    return (
      <>
        <ViniStatusSkeleton />
        <FixturePicker />
      </>
    );
  }

  const summary = computeSummary(data, today);
  const distribution = deriveStageDistribution(lifecycle, data.agents, today);
  const stepsUnlocked = rooftopStepsUnlocked(distribution);
  const acceptedFirst = earliestAcceptedAt(lifecycle);

  const rooftop = rooftopStep(data.rooftop);
  const departments = departmentsStep(data.departments);
  const routing = routingStep(data.routing);
  const users = usersStep(data.users);
  const integrations = integrationsStep(data.integrations);
  const billing = billingStep(data.billing);

  // Pre-handover agents — drive Transfer to OB CTA visibility + modal contents.
  const preHandoverTargets: TransferTarget[] = AGENT_SLOTS.flatMap((slot) => {
    const agent = getAgentSlot(data.agents, slot.type, slot.callType);
    if (!agent?.contracted) return [];
    const key = agentLifecycleKey(slot.type, slot.callType);
    const stage = deriveAgentStage(lifecycle.agents[key], agent, today);
    return stage === 'pre_handover'
      ? [{ key, label: slot.label }]
      : [];
  });

  // Handover form is editable while any agent is still pre-handover.
  const handoverEditable = preHandoverTargets.length > 0;

  // Most-recent rejection across all agents — surfaced as a callout on top
  // of the handover form when the form is editable (Sales needs to see it).
  const mostRecentRejection = findMostRecentRejection(lifecycle.agents);

  const rooftopLifecycleLine = formatLifecycleLine({
    distribution,
    acceptedFirst,
    today,
  });

  return (
    <div className="pb-16">
      <div className="-mx-6 border-b border-black/8 bg-white px-6 py-4">
        <StageBanner distribution={distribution} />
      </div>

      <SummaryBanner counts={summary} extraLine={rooftopLifecycleLine} />

      <div className="mt-6 space-y-6">
        {/* Handover form — always rendered. Editable in pre-handover, read-only
            otherwise. Skipped entirely when no agents are contracted at all. */}
        {distribution.total > 0 && (
          <div>
            <HandoverForm
              value={lifecycle.handover}
              editable={handoverEditable}
              onChange={saveHandoverDraft}
              rejectionCallout={
                handoverEditable && mostRecentRejection
                  ? { reason: mostRecentRejection.reason, at: mostRecentRejection.at }
                  : null
              }
            />

            {/* Transfer to OB CTA — only shown when there are pre_handover
                agents. Disabled until form fields are valid. */}
            {handoverEditable && (
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <div className="text-xs text-black-60">
                  {preHandoverTargets.length} agent{preHandoverTargets.length === 1 ? '' : 's'} waiting to be transferred to OB
                </div>
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(true)}
                  disabled={!isHandoverFormValid(lifecycle.handover)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-light px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Transfer to OB
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rooftop-level steps (1-5) — locked behind an overlay while no agent
            has been accepted. */}
        <ConditionalLock locked={!stepsUnlocked && distribution.total > 0}>
          <StepRow
            index={1}
            title="Rooftop Details"
            derivedState={rooftop.state}
            summary={rooftop.summary}
            href="/max-2/settings/rooftop"
            override={overrides[SECTION_IDS.rooftop] ?? null}
            onOverride={(p) => set(SECTION_IDS.rooftop, p)}
            onClearOverride={() => clear(SECTION_IDS.rooftop)}
            suppressActions={!stepsUnlocked && distribution.total > 0}
            timeSubtitle={<StepTimeSubtitle entry={timings.rooftop.rooftop} today={today} />}
          />
          <StepRow
            index={2}
            title="Department Details & Hours"
            derivedState={departments.state}
            summary={departments.summary}
            href="/max-2/settings/departments"
            override={overrides[SECTION_IDS.departments] ?? null}
            onOverride={(p) => set(SECTION_IDS.departments, p)}
            onClearOverride={() => clear(SECTION_IDS.departments)}
            suppressActions={!stepsUnlocked && distribution.total > 0}
            timeSubtitle={<StepTimeSubtitle entry={timings.rooftop.departments} today={today} />}
          />
          <StepRow
            index={3}
            title="Routing Directory"
            derivedState={routing.state}
            summary={routing.summary}
            href="/max-2/settings/team"
            override={overrides[SECTION_IDS.routing] ?? null}
            onOverride={(p) => set(SECTION_IDS.routing, p)}
            onClearOverride={() => clear(SECTION_IDS.routing)}
            suppressActions={!stepsUnlocked && distribution.total > 0}
            timeSubtitle={<StepTimeSubtitle entry={timings.rooftop.routing} today={today} />}
          />
          <StepRow
            index={4}
            title="Users"
            derivedState={users.state}
            summary={users.summary}
            href="/max-2/settings/team"
            override={overrides[SECTION_IDS.users] ?? null}
            onOverride={(p) => set(SECTION_IDS.users, p)}
            onClearOverride={() => clear(SECTION_IDS.users)}
            suppressActions={!stepsUnlocked && distribution.total > 0}
            timeSubtitle={<StepTimeSubtitle entry={timings.rooftop.users} today={today} />}
          />
          <StepRow
            index={5}
            title="Integrations"
            derivedState={integrations.state}
            summary={integrations.summary}
            href="/max-2/settings/integrations/vini"
            override={overrides[SECTION_IDS.integrations] ?? null}
            onOverride={(p) => set(SECTION_IDS.integrations, p)}
            onClearOverride={() => clear(SECTION_IDS.integrations)}
            suppressActions={!stepsUnlocked && distribution.total > 0}
            timeSubtitle={<StepTimeSubtitle entry={timings.rooftop.integrations} today={today} />}
          >
            <IntegrationsGrid integrations={data.integrations} />
          </StepRow>
        </ConditionalLock>

        {/* Agent steps (6-9) — bodies vary per agent's lifecycle stage. */}
        <div>
          {AGENT_SLOTS.map((slot, slotIdx) => {
            const agent = getAgentSlot(data.agents, slot.type, slot.callType);
            const key = agentLifecycleKey(slot.type, slot.callType);
            const stage = agent?.contracted
              ? deriveAgentStage(lifecycle.agents[key], agent, today)
              : null;
            const step = agentStep(agent, stage, today);
            const rowId = agentRowId(slot.type, slot.callType);
            const agentLifecycle = lifecycle.agents[key];
            const lastRej = agentLifecycle?.rejectionHistory.length
              ? agentLifecycle.rejectionHistory[agentLifecycle.rejectionHistory.length - 1]
              : null;

            return (
              <StepRow
                key={rowId}
                index={6 + slotIdx}
                title={`Agent · ${slot.label}`}
                derivedState={step.state}
                summary={step.summary}
                // Suppress CTA + override on lifecycle-incomplete stages so the
                // body's Accept/Reject buttons are the only call to action.
                href={stage === 'implementation' || stage === 'training' || stage === 'live' ? AGENT_ROUTE[slot.type] : null}
                override={overrides[rowId] ?? null}
                onOverride={(p) => set(rowId, p)}
                onClearOverride={() => clear(rowId)}
                timeSubtitle={
                  <StepTimeSubtitle entry={timings.agents[key]} today={today} />
                }
              >
                <AgentCard
                  agent={agent}
                  today={today}
                  stage={stage}
                  transferredAt={agentLifecycle?.transferredAt}
                  lastRejection={lastRej}
                  onAccept={() => acceptAgent(slot.type, slot.callType)}
                  onReject={() =>
                    setRejectModal({ type: slot.type, callType: slot.callType, label: slot.label })
                  }
                />
              </StepRow>
            );
          })}
        </div>

        {/* Billing step (10) — same lock as rooftop steps. */}
        <ConditionalLock locked={!stepsUnlocked && distribution.total > 0}>
          <StepRow
            index={10}
            title="Billing"
            derivedState={billing.state}
            summary={billing.summary}
            href={null}
            override={overrides[SECTION_IDS.billing] ?? null}
            onOverride={(p) => set(SECTION_IDS.billing, p)}
            onClearOverride={() => clear(SECTION_IDS.billing)}
            isLast
            suppressActions={!stepsUnlocked && distribution.total > 0}
            timeSubtitle={<StepTimeSubtitle entry={timings.rooftop.billing} today={today} />}
          >
            <BillingTable rows={data.billing} />
          </StepRow>
        </ConditionalLock>
      </div>

      <TransferToObModal
        open={transferModalOpen}
        targets={preHandoverTargets}
        onConfirm={(keys) => transferAgents(keys)}
        onClose={() => setTransferModalOpen(false)}
      />

      {rejectModal && (
        <RejectModal
          open={true}
          agentLabel={rejectModal.label}
          onConfirm={(reason) => rejectAgent(rejectModal.type, rejectModal.callType, reason)}
          onClose={() => setRejectModal(null)}
        />
      )}

      <FixturePicker />
    </div>
  );
}

function ConditionalLock({ locked, children }: { locked: boolean; children: React.ReactNode }) {
  if (!locked) return <>{children}</>;
  return <LockedStepsOverlay>{children}</LockedStepsOverlay>;
}

function findMostRecentRejection(
  agents: Record<string, { rejectionHistory: RejectionEntry[] }>
): RejectionEntry | null {
  let latest: RejectionEntry | null = null;
  for (const key of Object.keys(agents)) {
    const history = agents[key]?.rejectionHistory ?? [];
    for (const entry of history) {
      if (!latest || entry.at > latest.at) latest = entry;
    }
  }
  return latest;
}

function formatLifecycleLine(args: {
  distribution: { pre_handover: number; pending_ob: number; total: number };
  acceptedFirst: string | null;
  today: string;
}): string | null {
  const { distribution, acceptedFirst, today } = args;
  if (distribution.total === 0) return null;
  if (acceptedFirst) {
    const days = elapsed(acceptedFirst, today);
    if (days === 0) return 'Implementation: Day 0';
    return `Implementation: Day ${days}`;
  }
  if (distribution.pending_ob > 0) return 'Awaiting OB acceptance';
  if (distribution.pre_handover > 0) return 'Awaiting Sales handover';
  return null;
}

function elapsed(fromIso: string, toIso: string): number {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  const aDay = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bDay = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.max(0, Math.floor((bDay - aDay) / 86_400_000));
}

