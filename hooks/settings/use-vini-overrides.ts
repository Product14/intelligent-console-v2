'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearOverride,
  getAllOverrides,
  setOverride,
  subscribeOverrides,
  type OverrideKind,
  type OverrideRowId,
  type ViniStatusOverride,
} from '@/lib/settings/vini-status-overrides';

export interface UseViniOverrides {
  overrides: Record<OverrideRowId, ViniStatusOverride>;
  set: (rowId: OverrideRowId, patch: { kind?: OverrideKind | null; note?: string | null }) => void;
  clear: (rowId: OverrideRowId) => void;
}

export function useViniOverrides(scope: string): UseViniOverrides {
  const [overrides, setOverrides] = useState<Record<OverrideRowId, ViniStatusOverride>>({});

  // Hydrate on mount (and whenever scope changes) — first paint can return
  // an empty map, then we fill from storage. The flicker is sub-frame and
  // not worth a synchronous useState initializer (which would force every
  // consumer to be marked 'use client' just to satisfy SSR).
  useEffect(() => {
    setOverrides(getAllOverrides(scope));
    return subscribeOverrides(scope, () => setOverrides(getAllOverrides(scope)));
  }, [scope]);

  const set = useCallback<UseViniOverrides['set']>(
    (rowId, patch) => setOverride(scope, rowId, patch),
    [scope]
  );

  const clear = useCallback<UseViniOverrides['clear']>(
    (rowId) => clearOverride(scope, rowId),
    [scope]
  );

  return { overrides, set, clear };
}
