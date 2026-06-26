// Pure derivations for the Vini Status page. No React, no globals — every
// input goes in as an argument so this is trivially unit-testable.

import type {
  AgentStatus,
  BillingMonth,
  DepartmentStatus,
  IntegrationsStatus,
  RooftopStatus,
  RoutingStatus,
  UsersStatus,
  ViniStatusData,
} from '@/lib/settings/vini-status-mock';

export type ReadyState = 'ready' | 'partial' | 'pending' | 'not_applicable';

export const TRAINING_DURATION_DAYS = 28;

// ---------------------------------------------------------------------------
// Per-section ready rules.
// ---------------------------------------------------------------------------

export function rooftopReady(r: RooftopStatus): ReadyState {
  const filled = [r.name, r.website, r.address, r.timezone].filter(Boolean).length;
  if (filled === 4) return 'ready';
  if (filled === 0) return 'pending';
  return 'partial';
}

/** Departments uses an absolute threshold rather than "all configured": a
 *  typical rooftop has 4+ named departments (Sales, Service, Parts, Body),
 *  and OB-leadership treats 4 as the "fully set up" baseline. */
export const DEPARTMENT_DONE_THRESHOLD = 4;

export function departmentsReady(deps: DepartmentStatus[]): ReadyState {
  const withHours = deps.filter((d) => d.hoursSummary).length;
  if (withHours === 0) return 'pending';
  if (withHours >= DEPARTMENT_DONE_THRESHOLD) return 'ready';
  return 'partial';
}

export function routingReady(r: RoutingStatus): ReadyState {
  if (r.employeeCount === 0) return 'pending';
  if (r.withPhoneCount > 0 && r.withTransferRouteCount > 0) return 'ready';
  return 'partial';
}

export function usersReady(u: UsersStatus): ReadyState {
  return u.nonSpyneCount >= 1 ? 'ready' : 'pending';
}

export function integrationsReady(i: IntegrationsStatus): ReadyState {
  const crmActive = i.crm.status === 'active';
  const imsActive = i.ims.status === 'active';
  if (crmActive && imsActive) {
    const restConnected =
      i.dms.status === 'active' &&
      i.carHistory.selected &&
      i.serviceScheduler.status === 'active';
    return restConnected ? 'ready' : 'partial';
  }
  if (!crmActive && !imsActive) return 'pending';
  return 'partial';
}

// ---------------------------------------------------------------------------
// Agent phase.
// ---------------------------------------------------------------------------

export type AgentPhase = 'ob' | 'training' | 'post_training';

/** Day-precision diff so we don't get bitten by time-of-day drift. Both
 *  inputs are treated as calendar dates in the same TZ; we strip time. */
function dayDiff(fromIso: string, toIso: string): number {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  const aDay = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bDay = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((bDay - aDay) / 86_400_000);
}

export function agentPhase(agent: AgentStatus, today: string): AgentPhase {
  if (!agent.trainingStartAt) return 'ob';
  const days = dayDiff(agent.trainingStartAt, today);
  if (days < 0) return 'ob';
  if (days < TRAINING_DURATION_DAYS) return 'training';
  return 'post_training';
}

/** Day-of-training for the badge ("Day 14 of 28"). Returns null when the
 *  agent isn't in the training phase. */
export function agentTrainingDay(agent: AgentStatus, today: string): number | null {
  if (!agent.trainingStartAt) return null;
  const days = dayDiff(agent.trainingStartAt, today);
  if (days < 0 || days >= TRAINING_DURATION_DAYS) return null;
  return days + 1;
}

// ---------------------------------------------------------------------------
// Summary banner counts.
// ---------------------------------------------------------------------------

export interface SummaryCounts {
  readyAreaCount: number;
  totalAreaCount: number;
  inTraining: number;
  postTraining: number;
  contractedAgentCount: number;
}

const SETUP_AREA_COUNT = 5; // rooftop · departments · routing · users · integrations

export function computeSummary(data: ViniStatusData, today: string): SummaryCounts {
  const setupStates: ReadyState[] = [
    rooftopReady(data.rooftop),
    departmentsReady(data.departments),
    routingReady(data.routing),
    usersReady(data.users),
    integrationsReady(data.integrations),
  ];
  const readyAreaCount = setupStates.filter((s) => s === 'ready').length;

  const contracted = data.agents.filter((a) => a.contracted);
  const inTraining = contracted.filter((a) => agentPhase(a, today) === 'training').length;
  const postTraining = contracted.filter((a) => agentPhase(a, today) === 'post_training').length;

  return {
    readyAreaCount,
    totalAreaCount: SETUP_AREA_COUNT,
    inTraining,
    postTraining,
    contractedAgentCount: contracted.length,
  };
}

// ---------------------------------------------------------------------------
// Billing helpers.
// ---------------------------------------------------------------------------

export function latestBillingStatus(rows: BillingMonth[]): BillingMonth | null {
  return rows[0] ?? null;
}
