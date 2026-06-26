'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services/settings';
import { hydrateViniGeneralConfig } from '@/lib/settings/vini-general-defaults';
import type { ViniGeneralConfig } from '@/types/settings/vini-general-config';

interface UseViniGeneralResult {
  config: ViniGeneralConfig;
  loading: boolean;
  patch: (updater: (prev: ViniGeneralConfig) => ViniGeneralConfig) => void;
}

export function useViniGeneralConfig(saveSignal: number = 0): UseViniGeneralResult {
  const [config, setConfig] = useState<ViniGeneralConfig>(() =>
    hydrateViniGeneralConfig(null)
  );
  const [loading, setLoading] = useState(true);
  const ref = useRef(config);
  ref.current = config;

  useEffect(() => {
    let active = true;
    api.viniGeneral.get().then((stored) => {
      if (!active) return;
      setConfig(hydrateViniGeneralConfig(stored));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (saveSignal > 0 && !loading) {
      api.viniGeneral.save(ref.current);
    }
  }, [saveSignal, loading]);

  const patch = useCallback(
    (updater: (prev: ViniGeneralConfig) => ViniGeneralConfig) => {
      setConfig((prev) => updater(prev));
    },
    []
  );

  return { config, loading, patch };
}
