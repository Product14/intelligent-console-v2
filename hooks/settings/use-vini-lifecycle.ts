'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EMPTY_LIFECYCLE,
  agentLifecycleKey,
  readLifecycle,
  subscribeLifecycle,
  updateLifecycle,
  type AgentLifecycle,
  type HandoverFormData,
  type LifecycleState,
} from '@/lib/settings/vini-status-lifecycle';

export interface UseViniLifecycle {
  /** Effective lifecycle = fallback overlaid by localStorage. */
  lifecycle: LifecycleState;
  saveHandoverDraft: (handover: HandoverFormData) => void;
  /** Mark each of the given agent keys as transferred (sets transferredAt). */
  transferAgents: (agentKeys: string[]) => void;
  acceptAgent: (type: string, callType: string) => void;
  rejectAgent: (type: string, callType: string, reason: string) => void;
}

/** Returns the merged effective lifecycle (localStorage on top of fixture
 *  fallback) plus transition actions. Transitions always read the effective
 *  state, apply their change, then write the entire result to localStorage
 *  — that way the first transition on a fixture-seeded state doesn't drop
 *  the seed. */
export function useViniLifecycle(
  scope: string,
  fallback: LifecycleState = EMPTY_LIFECYCLE
): UseViniLifecycle {
  const [stored, setStored] = useState<LifecycleState | null>(null);

  useEffect(() => {
    const cur = readLifecycle(scope);
    setStored(hasStoredData(cur) ? cur : null);
    return subscribeLifecycle(scope, () => {
      const next = readLifecycle(scope);
      setStored(hasStoredData(next) ? next : null);
    });
  }, [scope]);

  const lifecycle = useMemo<LifecycleState>(() => stored ?? fallback, [stored, fallback]);

  // Read the current effective state inside the updater so we don't capture
  // stale values across renders. Each mutation writes the full merged state.
  const mutate = useCallback(
    (mutator: (prev: LifecycleState) => LifecycleState) => {
      updateLifecycle(scope, (storedPrev) => {
        const effective = hasStoredData(storedPrev) ? storedPrev : fallback;
        return mutator(effective);
      });
    },
    [scope, fallback]
  );

  const saveHandoverDraft = useCallback<UseViniLifecycle['saveHandoverDraft']>(
    (handover) => mutate((prev) => ({ ...prev, handover })),
    [mutate]
  );

  const transferAgents = useCallback<UseViniLifecycle['transferAgents']>(
    (agentKeys) => {
      if (agentKeys.length === 0) return;
      const now = new Date().toISOString();
      mutate((prev) => {
        const agents = { ...prev.agents };
        for (const key of agentKeys) {
          const cur: AgentLifecycle = agents[key] ?? { rejectionHistory: [] };
          agents[key] = { ...cur, transferredAt: now };
        }
        return { ...prev, agents };
      });
    },
    [mutate]
  );

  const acceptAgent = useCallback<UseViniLifecycle['acceptAgent']>(
    (type, callType) => {
      const key = agentLifecycleKey(type, callType);
      const now = new Date().toISOString();
      mutate((prev) => {
        const cur: AgentLifecycle = prev.agents[key] ?? { rejectionHistory: [] };
        return {
          ...prev,
          agents: { ...prev.agents, [key]: { ...cur, acceptedAt: now } },
        };
      });
    },
    [mutate]
  );

  const rejectAgent = useCallback<UseViniLifecycle['rejectAgent']>(
    (type, callType, reason) => {
      const key = agentLifecycleKey(type, callType);
      const now = new Date().toISOString();
      mutate((prev) => {
        const cur: AgentLifecycle = prev.agents[key] ?? { rejectionHistory: [] };
        return {
          ...prev,
          agents: {
            ...prev.agents,
            [key]: {
              ...cur,
              transferredAt: undefined,
              acceptedAt: undefined,
              rejectionHistory: [...cur.rejectionHistory, { at: now, reason }],
            },
          },
        };
      });
    },
    [mutate]
  );

  return { lifecycle, saveHandoverDraft, transferAgents, acceptAgent, rejectAgent };
}

/** localStorage may hold the wrapper's defaults from a previous session.
 *  We treat "looks empty" (no agent entries, empty dealer name) as no data
 *  so the fallback wins. */
function hasStoredData(state: LifecycleState): boolean {
  if (Object.keys(state.agents).length > 0) return true;
  if (state.handover.dealerName.trim().length > 0) return true;
  return false;
}
