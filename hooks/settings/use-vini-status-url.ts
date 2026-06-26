'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import {
  DEFAULT_FIXTURE,
  FIXTURES,
  type FixtureKey,
} from '@/lib/settings/vini-status-fixtures';

export interface ViniStatusUrlState {
  fixtureKey: FixtureKey;
  /** When true, force the skeleton (overrides the hook's natural loading). */
  forceLoading: boolean;
  /** ISO date used for phase derivations. When the URL omits ?today, it's
   *  the value provided as `fallbackToday`. */
  today: string;
}

/** Read fixture/loading/today from the URL. The picker writes back to these
 *  same params via router.replace so the round-trip is shareable. */
export function useViniStatusUrl(fallbackToday: string): ViniStatusUrlState {
  const params = useSearchParams();

  return useMemo(() => {
    const raw = params?.get('fixture') ?? '';
    const fixtureKey: FixtureKey =
      raw && raw in FIXTURES ? (raw as FixtureKey) : DEFAULT_FIXTURE;
    const forceLoading = params?.get('loading') === '1';
    const todayRaw = params?.get('today');
    const today = isValidIsoDay(todayRaw) ? `${todayRaw}T12:00:00Z` : fallbackToday;
    return { fixtureKey, forceLoading, today };
  }, [params, fallbackToday]);
}

function isValidIsoDay(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
