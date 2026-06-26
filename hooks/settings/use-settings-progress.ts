'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  getScreenState,
  isAllComplete,
  resolveSettingsScreens,
  type ScreenProgress,
  type ProgressState,
  type SettingsProgressInput,
} from '@/lib/settings/settings-progress';
import type { ContractedAgent } from '@/lib/settings/resolve-onboarding';
import type { SettingsScreen, SettingsScreenId } from '@/lib/settings/onboarding-model';
import { useBridgeEmitter } from '@/lib/settings/bridge/console-bridge-provider';

export function useSettingsProgress(agents: ContractedAgent[]): {
  progress: ScreenProgress;
  screens: SettingsScreen[];
  allComplete: boolean;
  isLoading: boolean;
} {
  // TODO (subsequent tasks): wire to live data — rooftop, team, departments,
  // integrations, telephony, agents, chatbot. For now mock mode returns an
  // empty input so every screen reads as `pending`.
  const input: SettingsProgressInput = useMemo(() => ({}), []);
  const progress = useMemo(() => getScreenState(input), [input]);
  const screens = useMemo(() => resolveSettingsScreens(agents), [agents]);
  const allComplete = useMemo(
    () => isAllComplete(progress, screens),
    [progress, screens]
  );

  // Emit screen-complete events upstream when state transitions. On first
  // mount, fires once per visible screen with its initial state so Console's
  // sidebar can paint chips immediately. Subsequent transitions fire only
  // when a screen's state actually changes.
  const { screenComplete } = useBridgeEmitter();
  const lastProgressRef = useRef<ScreenProgress | null>(null);

  useEffect(() => {
    const last = lastProgressRef.current;
    const entries = Object.entries(progress) as Array<
      [SettingsScreenId, ProgressState]
    >;
    for (const [id, state] of entries) {
      if (!last || last[id] !== state) {
        screenComplete(id, state);
      }
    }
    lastProgressRef.current = progress;
  }, [progress, screenComplete]);

  return { progress, screens, allComplete, isLoading: false };
}
