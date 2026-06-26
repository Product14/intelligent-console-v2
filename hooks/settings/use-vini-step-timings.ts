'use client';

import { useEffect, useState } from 'react';
import {
  EMPTY_TIMINGS,
  markAgentStepCompleted,
  markAgentStepStarted,
  markRooftopStepCompleted,
  markRooftopStepStarted,
  readTimings,
  subscribeTimings,
  type RooftopStepId,
  type StepTimingsState,
} from '@/lib/settings/vini-status-step-timings';

export interface UseViniStepTimings {
  timings: StepTimingsState;
  markRooftopStarted: (step: RooftopStepId) => void;
  markRooftopCompleted: (step: RooftopStepId) => void;
  markAgentStarted: (agentKey: string) => void;
  markAgentCompleted: (agentKey: string) => void;
}

/** Hook returns the current timings + idempotent setters. Capture decisions
 *  (when to call which setter) live in the screen — this hook just exposes
 *  the levers and re-renders on storage changes.
 *
 *  Accepts a `fallback` for fixture seed data; localStorage overlays it. */
export function useViniStepTimings(
  scope: string,
  fallback: StepTimingsState = EMPTY_TIMINGS
): UseViniStepTimings {
  const [stored, setStored] = useState<StepTimingsState | null>(null);

  useEffect(() => {
    const cur = readTimings(scope);
    setStored(hasStoredData(cur) ? cur : null);
    return subscribeTimings(scope, () => {
      const next = readTimings(scope);
      setStored(hasStoredData(next) ? next : null);
    });
  }, [scope]);

  const timings = stored ?? fallback;

  return {
    timings,
    markRooftopStarted: (step) =>
      markRooftopStepStarted(scope, step, new Date().toISOString()),
    markRooftopCompleted: (step) =>
      markRooftopStepCompleted(scope, step, new Date().toISOString()),
    markAgentStarted: (agentKey) =>
      markAgentStepStarted(scope, agentKey, new Date().toISOString()),
    markAgentCompleted: (agentKey) =>
      markAgentStepCompleted(scope, agentKey, new Date().toISOString()),
  };
}

function hasStoredData(state: StepTimingsState): boolean {
  return (
    Object.keys(state.rooftop).length > 0 || Object.keys(state.agents).length > 0
  );
}
