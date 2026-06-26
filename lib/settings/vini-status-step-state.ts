// Per-step state + one-line summary for the vertical stepper.
//
// The stepper node only needs three states (done / partial / not_started); the
// underlying readiness rules also have 'blocked' (override-driven) but that
// gets layered on top of the derived state in the renderer. Each step also
// emits a short text summary (e.g. "4 of 4 fields set") which the row shows
// next to the title — no field values, no implementation detail.

import type { AgentStatus, BillingMonth, ViniStatusData } from '@/lib/settings/vini-status-mock';
import {
  agentPhase,
  agentTrainingDay,
  TRAINING_DURATION_DAYS,
  departmentsReady,
  integrationsReady,
  rooftopReady,
  routingReady,
  usersReady,
} from '@/lib/settings/vini-status-rules';
import type { AgentLifecycleStage } from '@/lib/settings/vini-status-lifecycle';

export type StepState = 'not_started' | 'partial' | 'done';

export interface StepSummary {
  state: StepState;
  /** One-line description rendered next to the title, e.g.
   *  "Configured · 4 of 4 fields set", "1 of 3 departments configured". */
  summary: string;
}

const LABEL_BY_STATE: Record<StepState, string> = {
  done: 'Done',
  partial: 'Partially done',
  not_started: 'Not started',
};

export function stateLabel(state: StepState): string {
  return LABEL_BY_STATE[state];
}

// ---------------------------------------------------------------------------
// Setup steps (1–5)
// ---------------------------------------------------------------------------

export function rooftopStep(data: ViniStatusData['rooftop']): StepSummary {
  const filled = [data.name, data.website, data.address, data.timezone].filter(Boolean).length;
  const ready = rooftopReady(data);
  return {
    state: readyToState(ready),
    summary: `${filled} of 4 fields set`,
  };
}

export function departmentsStep(deps: ViniStatusData['departments']): StepSummary {
  const withHours = deps.filter((d) => d.hoursSummary).length;
  const ready = departmentsReady(deps);
  return {
    state: readyToState(ready),
    summary: `${withHours} ${pluralise(withHours, 'department', 'departments')} configured`,
  };
}

export function routingStep(r: ViniStatusData['routing']): StepSummary {
  const ready = routingReady(r);
  if (r.employeeCount === 0) {
    return { state: 'not_started', summary: 'No employees added' };
  }
  return {
    state: readyToState(ready),
    summary: `${r.employeeCount} employees · ${r.withPhoneCount} with phone · ${r.withTransferRouteCount} with transfer route`,
  };
}

export function usersStep(u: ViniStatusData['users']): StepSummary {
  const ready = usersReady(u);
  return {
    state: readyToState(ready),
    summary:
      u.nonSpyneCount === 0
        ? 'No non-Spyne users invited'
        : `${u.nonSpyneCount} non-Spyne ${pluralise(u.nonSpyneCount, 'user', 'users')} invited`,
  };
}

export function integrationsStep(i: ViniStatusData['integrations']): StepSummary {
  const active = [
    i.crm.status === 'active',
    i.ims.status === 'active',
    i.dms.status === 'active',
    i.carHistory.selected,
    i.serviceScheduler.status === 'active',
  ].filter(Boolean).length;
  const ready = integrationsReady(i);
  return {
    state: readyToState(ready),
    summary: `${active} of 5 integrations active`,
  };
}

// ---------------------------------------------------------------------------
// Agent steps (6–9)
// ---------------------------------------------------------------------------

/** An agent counts as "set up" once it has identity (name + phone). Until
 *  then the agent-customization + assign-number flows haven't been run, so
 *  there's nothing to display in the card body. */
export function isAgentConfigured(agent: AgentStatus): boolean {
  return !!agent.name && !!agent.phone;
}

export function agentStep(
  agent: AgentStatus | undefined,
  lifecycleStage: AgentLifecycleStage | null,
  today: string
): StepSummary {
  if (!agent || !agent.contracted) {
    return { state: 'not_started', summary: 'Not contracted' };
  }
  if (lifecycleStage === 'pre_handover') {
    return { state: 'not_started', summary: 'Awaiting Sales handover' };
  }
  if (lifecycleStage === 'pending_ob') {
    return { state: 'not_started', summary: 'Pending OB acceptance' };
  }
  if (!isAgentConfigured(agent)) {
    return { state: 'not_started', summary: 'Agent not set up' };
  }
  const phase = agentPhase(agent, today);
  if (phase === 'ob') {
    return { state: 'partial', summary: 'Configured · Training not started' };
  }
  if (phase === 'training') {
    const day = agentTrainingDay(agent, today);
    return {
      state: 'partial',
      summary: `In training · Day ${day} of ${TRAINING_DURATION_DAYS}`,
    };
  }
  return { state: 'done', summary: 'Post-training · in production' };
}

// ---------------------------------------------------------------------------
// Billing step (10)
// ---------------------------------------------------------------------------

export function billingStep(rows: BillingMonth[]): StepSummary {
  if (rows.length === 0) {
    return { state: 'not_started', summary: 'No invoices generated yet' };
  }
  const latest = rows[0];
  const state: StepState =
    latest.status === 'paid' ? 'done' : latest.status === 'pending' ? 'partial' : 'not_started';
  const label =
    latest.status === 'paid' ? 'Paid' : latest.status === 'pending' ? 'Pending' : 'Overdue';
  return { state, summary: `${latest.month} · ${label}` };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readyToState(state: ReturnType<typeof rooftopReady>): StepState {
  switch (state) {
    case 'ready': return 'done';
    case 'partial': return 'partial';
    default: return 'not_started';
  }
}

function pluralise(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}
