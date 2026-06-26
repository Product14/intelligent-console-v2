// Per-step time tracking — captures when each onboarding step started and
// completed so OB-leadership can see how long each piece took.
//
// Two granularities:
//   - Rooftop-level steps (rooftop · departments · routing · users ·
//     integrations · billing) — keyed by step id.
//   - Per-agent steps — keyed by "{type}:{callType}", matching the agent
//     lifecycle key.
//
// Storage is keyed by enterprise scope, same pattern as the overrides and
// lifecycle slices.

export type RooftopStepId =
  | 'rooftop'
  | 'departments'
  | 'routing'
  | 'users'
  | 'integrations'
  | 'billing';

export interface StepTimingEntry {
  /** First time the step transitioned out of `not_started`. */
  startedAt?: string;
  /** First time the step reached `done`. */
  completedAt?: string;
}

export interface StepTimingsState {
  rooftop: Partial<Record<RooftopStepId, StepTimingEntry>>;
  /** Keyed by agent lifecycle key (`{type}:{callType}`). */
  agents: Record<string, StepTimingEntry>;
}

export const EMPTY_TIMINGS: StepTimingsState = {
  rooftop: {},
  agents: {},
};

const STORAGE_PREFIX = 'vini-status-step-timings';
const CHANGED_EVENT = 'vini-status-step-timings:changed';

function storageKey(scope: string): string {
  return `${STORAGE_PREFIX}:${scope}`;
}

export function readTimings(scope: string): StepTimingsState {
  if (typeof window === 'undefined') return EMPTY_TIMINGS;
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return EMPTY_TIMINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_TIMINGS;
    return {
      rooftop: parsed.rooftop ?? {},
      agents: parsed.agents ?? {},
    };
  } catch {
    return EMPTY_TIMINGS;
  }
}

function writeTimings(scope: string, state: StepTimingsState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: { scope } }));
  } catch {
    // silent
  }
}

export function updateTimings(
  scope: string,
  updater: (prev: StepTimingsState) => StepTimingsState
): void {
  const prev = readTimings(scope);
  const next = updater(prev);
  writeTimings(scope, next);
}

export function subscribeTimings(scope: string, listener: () => void): () => void {
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

export function clearTimings(scope: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(scope));
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: { scope } }));
}

// ---------------------------------------------------------------------------
// Idempotent setters. Never overwrite an existing timestamp — we want the
// FIRST start and FIRST completion, not the most recent.
// ---------------------------------------------------------------------------

export function markRooftopStepStarted(
  scope: string,
  step: RooftopStepId,
  at: string
): void {
  updateTimings(scope, (prev) => {
    const cur = prev.rooftop[step];
    if (cur?.startedAt) return prev;
    return {
      ...prev,
      rooftop: { ...prev.rooftop, [step]: { ...cur, startedAt: at } },
    };
  });
}

export function markRooftopStepCompleted(
  scope: string,
  step: RooftopStepId,
  at: string
): void {
  updateTimings(scope, (prev) => {
    const cur = prev.rooftop[step];
    if (cur?.completedAt) return prev;
    return {
      ...prev,
      rooftop: {
        ...prev.rooftop,
        [step]: { ...(cur ?? {}), startedAt: cur?.startedAt ?? at, completedAt: at },
      },
    };
  });
}

export function markAgentStepStarted(scope: string, agentKey: string, at: string): void {
  updateTimings(scope, (prev) => {
    const cur = prev.agents[agentKey];
    if (cur?.startedAt) return prev;
    return {
      ...prev,
      agents: { ...prev.agents, [agentKey]: { ...cur, startedAt: at } },
    };
  });
}

export function markAgentStepCompleted(scope: string, agentKey: string, at: string): void {
  updateTimings(scope, (prev) => {
    const cur = prev.agents[agentKey];
    if (cur?.completedAt) return prev;
    return {
      ...prev,
      agents: {
        ...prev.agents,
        [agentKey]: { ...(cur ?? {}), startedAt: cur?.startedAt ?? at, completedAt: at },
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Display helpers — relative-day formatters for the row subtitles.
// ---------------------------------------------------------------------------

export function elapsedDays(fromIso: string, toIso: string): number {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  const aDay = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bDay = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.max(0, Math.floor((bDay - aDay) / 86_400_000));
}

export function formatStartedAgo(startedAt: string, today: string): string {
  const days = elapsedDays(startedAt, today);
  if (days === 0) return 'Started today';
  if (days === 1) return 'Started 1 day ago';
  return `Started ${days} days ago`;
}

export function formatCompletedIn(
  startedAt: string,
  completedAt: string
): string {
  const days = elapsedDays(startedAt, completedAt);
  if (days === 0) return 'Completed same day';
  if (days === 1) return 'Completed in 1 day';
  return `Completed in ${days} days`;
}
