// Vini Status onboarding lifecycle — types + storage + pure stage derivation.
//
// The rooftop carries one shared handover form (filled by Sales once,
// reused across multiple handover batches). Each contracted agent has its
// own lifecycle stage. The stage is never stored as an enum; it's derived
// every render from the timestamps stored here plus the agent's
// trainingStartAt (which lives on the analytics data, not here).

import type { AgentStatus } from '@/lib/settings/vini-status-mock';

export type AgentLifecycleStage =
  | 'pre_handover'
  | 'pending_ob'
  | 'implementation'
  | 'training'
  | 'live';

export const TRAINING_DURATION_DAYS = 28;

export interface HandoverContact {
  name: string;
  role?: string;
  email: string;
  phone?: string;
}

export interface HandoverFormData {
  dealerName: string;
  website: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  primaryContact: HandoverContact;
  /** Optional second contact — all sub-fields optional too. */
  secondaryContact?: Partial<HandoverContact>;
  /** Free-text per capability — "VinSolutions", "vAuto", etc. The structured
   *  integration data on the status page is separate and authoritative once
   *  the integrations are configured; this is just what Sales captured
   *  during handover. */
  currentIntegrations: {
    crm?: string;
    ims?: string;
    dms?: string;
    carHistory?: string;
    serviceScheduler?: string;
  };
  notesForOb?: string;
}

export const EMPTY_HANDOVER: HandoverFormData = {
  dealerName: '',
  website: '',
  addressLine1: '',
  addressLine2: undefined,
  city: '',
  state: '',
  zip: '',
  primaryContact: { name: '', role: undefined, email: '', phone: undefined },
  secondaryContact: undefined,
  currentIntegrations: {},
  notesForOb: undefined,
};

export interface RejectionEntry {
  at: string;
  reason: string;
}

export interface AgentLifecycle {
  /** Sales included this agent in a Transfer to OB batch at this time. */
  transferredAt?: string;
  /** OB clicked Accept at this time. */
  acceptedAt?: string;
  /** OB has rejected this agent these many times. The most recent entry
   *  drives the inline callout in the pre_handover body. */
  rejectionHistory: RejectionEntry[];
}

/** Key shape `{type}:{callType}` — matches the agentRowId() from
 *  vini-status-overrides so override + lifecycle keys align. */
export type AgentLifecycleKey = string;

export interface LifecycleState {
  handover: HandoverFormData;
  agents: Record<AgentLifecycleKey, AgentLifecycle>;
}

export const EMPTY_LIFECYCLE: LifecycleState = {
  handover: EMPTY_HANDOVER,
  agents: {},
};

export function agentLifecycleKey(type: string, callType: string): AgentLifecycleKey {
  return `${type}:${callType}`;
}

// ---------------------------------------------------------------------------
// Derivations — pure, no React.
// ---------------------------------------------------------------------------

export function deriveAgentStage(
  lifecycle: AgentLifecycle | undefined,
  agent: AgentStatus | undefined,
  today: string
): AgentLifecycleStage {
  if (!lifecycle?.transferredAt) return 'pre_handover';
  if (!lifecycle.acceptedAt) return 'pending_ob';
  if (!agent?.trainingStartAt) return 'implementation';
  const days = dayDiff(agent.trainingStartAt, today);
  if (days < 0) return 'implementation';
  if (days < TRAINING_DURATION_DAYS) return 'training';
  return 'live';
}

export interface StageDistribution {
  pre_handover: number;
  pending_ob: number;
  implementation: number;
  training: number;
  live: number;
  /** Number of *contracted* agents factored into the distribution. */
  total: number;
}

export function deriveStageDistribution(
  lifecycle: LifecycleState,
  agents: AgentStatus[],
  today: string
): StageDistribution {
  const dist: StageDistribution = {
    pre_handover: 0,
    pending_ob: 0,
    implementation: 0,
    training: 0,
    live: 0,
    total: 0,
  };
  for (const a of agents) {
    if (!a.contracted) continue;
    const key = agentLifecycleKey(a.type, a.callType);
    const stage = deriveAgentStage(lifecycle.agents[key], a, today);
    dist[stage] += 1;
    dist.total += 1;
  }
  return dist;
}

/** Rooftop steps (setup + billing) unlock as soon as any contracted agent
 *  has been accepted. Once unlocked, they stay unlocked — the rooftop data
 *  is shared and doesn't relock if an agent regresses. */
export function rooftopStepsUnlocked(dist: StageDistribution): boolean {
  return dist.implementation + dist.training + dist.live > 0;
}

/** Earliest acceptedAt across all agents — drives "Day N of implementation"
 *  in the summary banner. Returns null if no agent has been accepted yet. */
export function earliestAcceptedAt(lifecycle: LifecycleState): string | null {
  let earliest: string | null = null;
  for (const key of Object.keys(lifecycle.agents)) {
    const acceptedAt = lifecycle.agents[key]?.acceptedAt;
    if (!acceptedAt) continue;
    if (!earliest || acceptedAt < earliest) earliest = acceptedAt;
  }
  return earliest;
}

function dayDiff(fromIso: string, toIso: string): number {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  const aDay = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bDay = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((bDay - aDay) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Validation — used by the form's Save / Transfer CTAs.
// ---------------------------------------------------------------------------

export function handoverFormErrors(form: HandoverFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.dealerName.trim()) errors.dealerName = 'Dealer name is required';
  if (!form.website.trim()) errors.website = 'Website is required';
  else if (!/^https?:\/\//.test(form.website)) errors.website = 'Website must start with http:// or https://';
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Street address is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';
  if (!form.zip.trim()) errors.zip = 'ZIP is required';
  if (!form.primaryContact.name.trim()) errors['primaryContact.name'] = 'Primary contact name is required';
  if (!form.primaryContact.email.trim()) errors['primaryContact.email'] = 'Primary contact email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryContact.email)) {
    errors['primaryContact.email'] = 'Enter a valid email address';
  }
  return errors;
}

export function isHandoverFormValid(form: HandoverFormData): boolean {
  return Object.keys(handoverFormErrors(form)).length === 0;
}

// ---------------------------------------------------------------------------
// localStorage wrapper. Mirrors the pattern from vini-status-overrides.ts.
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = 'vini-status-lifecycle';
const CHANGED_EVENT = 'vini-status-lifecycle:changed';

function storageKey(scope: string): string {
  return `${STORAGE_PREFIX}:${scope}`;
}

export function readLifecycle(scope: string): LifecycleState {
  if (typeof window === 'undefined') return EMPTY_LIFECYCLE;
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return EMPTY_LIFECYCLE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_LIFECYCLE;
    return {
      handover: { ...EMPTY_HANDOVER, ...(parsed.handover ?? {}) },
      agents: parsed.agents ?? {},
    };
  } catch {
    return EMPTY_LIFECYCLE;
  }
}

function writeLifecycle(scope: string, state: LifecycleState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: { scope } }));
  } catch {
    // Quota or disabled storage — silent no-op.
  }
}

export function updateLifecycle(
  scope: string,
  updater: (prev: LifecycleState) => LifecycleState
): void {
  const prev = readLifecycle(scope);
  const next = updater(prev);
  writeLifecycle(scope, next);
}

export function subscribeLifecycle(scope: string, listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey(scope)) listener();
  };
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || detail.scope === scope) listener();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGED_EVENT, onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGED_EVENT, onCustom);
  };
}

export function clearLifecycle(scope: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(scope));
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: { scope } }));
}
