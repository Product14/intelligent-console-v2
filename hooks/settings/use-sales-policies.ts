'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services/settings';
import { hydrateSalesPolicies } from '@/lib/settings/sales-policies-defaults';
import type { SalesPolicies } from '@/types/settings/sales-policies';

interface UseSalesPoliciesResult {
  policies: Required<SalesPolicies>;
  setPolicies: (updater: (prev: Required<SalesPolicies>) => Required<SalesPolicies>) => void;
  loading: boolean;
  /** Patch a single section while preserving the others. */
  patchSection: <K extends keyof SalesPolicies>(
    section: K,
    patch: Partial<NonNullable<SalesPolicies[K]>>
  ) => void;
  /** Replace a section wholesale (used by tri-state reset on opt_out). */
  setSection: <K extends keyof SalesPolicies>(
    section: K,
    value: NonNullable<SalesPolicies[K]>
  ) => void;
}

/** Loads sales policies on mount, hydrates against safest defaults, and
 *  fires a save when `saveSignal` ticks up (same fire-and-forget pattern as
 *  SpeedToLeadForm / AgentEdit). */
export function useSalesPolicies(saveSignal: number = 0): UseSalesPoliciesResult {
  const [policies, setPoliciesState] = useState<Required<SalesPolicies>>(() =>
    hydrateSalesPolicies(null)
  );
  const [loading, setLoading] = useState(true);
  const policiesRef = useRef(policies);
  policiesRef.current = policies;

  useEffect(() => {
    let active = true;
    api.salesPolicies.get().then((stored) => {
      if (!active) return;
      setPoliciesState(hydrateSalesPolicies(stored));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (saveSignal > 0 && !loading) {
      api.salesPolicies.save(policiesRef.current);
    }
  }, [saveSignal, loading]);

  const setPolicies = useCallback(
    (updater: (prev: Required<SalesPolicies>) => Required<SalesPolicies>) => {
      setPoliciesState((prev) => updater(prev));
    },
    []
  );

  const patchSection = useCallback(
    <K extends keyof SalesPolicies>(
      section: K,
      patch: Partial<NonNullable<SalesPolicies[K]>>
    ) => {
      setPoliciesState((prev) => ({
        ...prev,
        [section]: { ...(prev[section] as object), ...(patch as object) },
      }));
    },
    []
  );

  const setSection = useCallback(
    <K extends keyof SalesPolicies>(section: K, value: NonNullable<SalesPolicies[K]>) => {
      setPoliciesState((prev) => ({ ...prev, [section]: value }));
    },
    []
  );

  return { policies, setPolicies, loading, patchSection, setSection };
}
