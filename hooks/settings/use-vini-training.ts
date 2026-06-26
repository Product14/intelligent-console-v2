'use client';

// Vini Training data hook — resolves the active fixture from the URL and
// simulates a brief load so the skeleton has something to mount against.
// When the analytics API ships, swap the body to a real fetch keyed by
// enterpriseId and the screen doesn't change.

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  DEFAULT_FIXTURE,
  FIXTURES,
  resolveFixture,
  type FixtureKey,
} from '@/lib/settings/vini-training-fixtures';
import type { ViniTrainingData } from '@/lib/settings/vini-training-mock';

export interface UseViniTraining {
  data: ViniTrainingData | null;
  fixtureKey: FixtureKey;
  /** ISO date string used as "today" for derivations. */
  today: string;
  loading: boolean;
  error: Error | null;
}

interface UrlState {
  fixtureKey: FixtureKey;
  forceLoading: boolean;
  today: string;
}

function parseUrl(params: URLSearchParams | null, fallbackToday: string): UrlState {
  const raw = params?.get('fixture') ?? '';
  const fixtureKey: FixtureKey =
    raw && raw in FIXTURES ? (raw as FixtureKey) : DEFAULT_FIXTURE;
  const forceLoading = params?.get('loading') === '1';
  const todayRaw = params?.get('today');
  const today = isValidIsoDay(todayRaw) ? `${todayRaw}T12:00:00Z` : fallbackToday;
  return { fixtureKey, forceLoading, today };
}

function isValidIsoDay(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function useViniTraining(): UseViniTraining {
  // fallbackToday is captured once at hook init so re-renders don't drift the clock.
  const [fallbackToday] = useState(() => new Date().toISOString());
  const params = useSearchParams();
  const url = useMemo(() => parseUrl(params, fallbackToday), [params, fallbackToday]);

  const [state, setState] = useState<{ data: ViniTrainingData | null; loading: boolean; error: Error | null }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState({ data: null, loading: true, error: null });
    const t = window.setTimeout(() => {
      setState({ data: resolveFixture(url.fixtureKey).data, loading: false, error: null });
    }, 80);
    return () => window.clearTimeout(t);
  }, [url.fixtureKey]);

  if (url.forceLoading) {
    return {
      data: null,
      fixtureKey: url.fixtureKey,
      today: url.today,
      loading: true,
      error: null,
    };
  }

  return {
    data: state.data,
    fixtureKey: url.fixtureKey,
    today: url.today,
    loading: state.loading,
    error: state.error,
  };
}
