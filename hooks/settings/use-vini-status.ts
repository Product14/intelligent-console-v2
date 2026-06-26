'use client';

// Vini Status data hook — resolves the active fixture from the URL and
// simulates a brief load so the skeleton has something to mount against.
// When the analytics API ships, swap the body to a real fetch keyed by
// enterpriseId and the screen doesn't change.

import { useEffect, useState } from 'react';
import { resolveFixture, type FixtureKey } from '@/lib/settings/vini-status-fixtures';
import type { ViniStatusData } from '@/lib/settings/vini-status-mock';

export interface UseViniStatus {
  data: ViniStatusData | null;
  loading: boolean;
  error: Error | null;
}

export function useViniStatus(fixtureKey: FixtureKey, forceLoading: boolean): UseViniStatus {
  const [state, setState] = useState<UseViniStatus>({
    data: null,
    loading: true,
    error: null,
  });

  // Re-run on fixture change so the picker swaps data without a page reload.
  useEffect(() => {
    setState({ data: null, loading: true, error: null });
    const t = window.setTimeout(() => {
      setState({ data: resolveFixture(fixtureKey).data, loading: false, error: null });
    }, 80);
    return () => window.clearTimeout(t);
  }, [fixtureKey]);

  // ?loading=1 holds the skeleton open regardless of the natural load.
  if (forceLoading) {
    return { data: null, loading: true, error: null };
  }
  return state;
}
