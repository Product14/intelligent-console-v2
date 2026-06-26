'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services/settings';
import { hydrateServicePolicies } from '@/lib/settings/service-policies-defaults';
import type { ServicePolicies } from '@/types/settings/service-policies';

interface UseServicePoliciesResult {
  policies: Required<ServicePolicies>;
  loading: boolean;
  setSection: <K extends keyof ServicePolicies>(
    section: K,
    value: NonNullable<ServicePolicies[K]>
  ) => void;
}

/** Loads service policies, hydrates against defaults, flushes a save when
 *  `saveSignal` ticks up — mirrors useSalesPolicies. */
export function useServicePolicies(saveSignal: number = 0): UseServicePoliciesResult {
  const [policies, setPolicies] = useState<Required<ServicePolicies>>(() =>
    hydrateServicePolicies(null)
  );
  const [loading, setLoading] = useState(true);
  const policiesRef = useRef(policies);
  policiesRef.current = policies;

  useEffect(() => {
    let active = true;
    api.servicePolicies.get().then((stored) => {
      if (!active) return;
      setPolicies(hydrateServicePolicies(stored));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (saveSignal > 0 && !loading) {
      api.servicePolicies.save(policiesRef.current);
    }
  }, [saveSignal, loading]);

  const setSection = useCallback(
    <K extends keyof ServicePolicies>(
      section: K,
      value: NonNullable<ServicePolicies[K]>
    ) => {
      setPolicies((prev) => ({ ...prev, [section]: value }));
    },
    []
  );

  return { policies, loading, setSection };
}
