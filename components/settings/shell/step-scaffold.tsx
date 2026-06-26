'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// @ts-ignore - JS kit components
import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';
// @ts-ignore
import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import { useBridgeEmitter } from '@/lib/settings/bridge/console-bridge-provider';
import { setActiveSegment, setNavHandlers } from '@/lib/settings/bridge/context-store';
import { useContractedAgents } from '@/hooks/settings/use-contracted-agents';
import { resolveTopStep } from '@/lib/settings/resolve-onboarding';
import { NEW_TOP_STEP_ORDER, type ResolvedSubStep, type TopStepId } from '@/lib/settings/onboarding-model';

type SaveState = 'idle' | 'saving' | 'saved';

interface ScaffoldCtx {
  setValid: (key: string, valid: boolean) => void;
  setSaveState: (s: SaveState) => void;
}
const Ctx = createContext<ScaffoldCtx | null>(null);

/** Sub-steps call this to report validity (gates Continue) + autosave status. */
export function useSubStep(key: string, isValid: boolean) {
  const ctx = useContext(Ctx);
  useEffect(() => {
    ctx?.setValid(key, isValid);
  }, [ctx, key, isValid]);
  return {
    reportSaving: () => ctx?.setSaveState('saving'),
    reportSaved: () => ctx?.setSaveState('saved'),
  };
}

interface StepScaffoldProps {
  topStepId: TopStepId;
  renderSubStep: (subStep: ResolvedSubStep) => React.ReactNode;
  /** Sub-step ids that render their own footer (v3 pages) — scaffold hides its footer for these. */
  selfFooterIds?: string[];
}

export function StepScaffold({ topStepId, renderSubStep, selfFooterIds = [] }: StepScaffoldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emitter = useBridgeEmitter();
  const { agents } = useContractedAgents();

  const list = useMemo<ResolvedSubStep[]>(
    () => resolveTopStep(topStepId, agents)?.subSteps ?? [],
    [topStepId, agents]
  );

  const qs = searchParams.get('s');
  const initial = Math.max(0, list.findIndex((s) => s.key === qs));
  const [index, setIndex] = useState(initial === -1 ? 0 : initial);
  const [valid, setValidMap] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const active = list[index];

  const setValid = useCallback((key: string, v: boolean) => {
    setValidMap((prev) => (prev[key] === v ? prev : { ...prev, [key]: v }));
  }, []);
  const ctxValue = useMemo<ScaffoldCtx>(() => ({ setValid, setSaveState }), [setValid]);

  const goToIndex = useCallback(
    (i: number) => {
      const clamped = Math.min(Math.max(i, 0), list.length - 1);
      setIndex(clamped);
      const params = new URLSearchParams(searchParams.toString());
      params.set('s', list[clamped]?.key ?? '');
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [list, router, searchParams]
  );

  const goToKey = useCallback(
    (key: string) => {
      const i = list.findIndex((s) => s.key === key);
      if (i >= 0) goToIndex(i);
    },
    [list, goToIndex]
  );

  const isLast = index === list.length - 1;

  const goNext = useCallback(() => {
    if (active) {
      setCompleted((prev) => new Set(prev).add(active.key));
      if (active.task) emitter.stepComplete(`${topStepId}:${active.segment ?? 'common'}:${active.id}`);
    }
    if (!isLast) {
      goToIndex(index + 1);
      return;
    }
    emitter.stepComplete(topStepId);
    const next = NEW_TOP_STEP_ORDER[NEW_TOP_STEP_ORDER.indexOf(topStepId) + 1];
    // Skip top steps with no resolved sub-steps (uncontracted) — find next renderable.
    let target: TopStepId | undefined = next;
    while (target && (resolveTopStep(target, agents)?.subSteps.length ?? 0) === 0) {
      target = NEW_TOP_STEP_ORDER[NEW_TOP_STEP_ORDER.indexOf(target) + 1];
    }
    if (target) router.push(`/${target}`);
    else emitter.finished();
  }, [active, isLast, index, goToIndex, emitter, topStepId, router, agents]);

  const goPrev = useCallback(() => {
    if (index > 0) goToIndex(index - 1);
    else {
      const prev = NEW_TOP_STEP_ORDER[NEW_TOP_STEP_ORDER.indexOf(topStepId) - 1];
      if (prev && (resolveTopStep(prev, agents)?.subSteps.length ?? 0) > 0) router.push(`/${prev}`);
    }
  }, [index, goToIndex, topStepId, router, agents]);

  // Expose nav + active agent segment to the (vendored) v3 screens via the store.
  useEffect(() => {
    setNavHandlers({ goNext, goPrev });
  }, [goNext, goPrev]);
  useEffect(() => {
    setActiveSegment(active?.segment ?? null);
  }, [active?.segment]);

  // Sync active sub-step when the global sidebar changes ?s within this phase.
  useEffect(() => {
    const k = searchParams.get('s');
    if (!k) return;
    const i = list.findIndex((s) => s.key === k);
    if (i >= 0) setIndex(i);
  }, [searchParams, list]);

  // Progress to parent.
  useEffect(() => {
    if (!list.length) return;
    emitter.progress(`${topStepId}:${active?.id}`, Math.round(((index + 1) / list.length) * 100));
  }, [index, list.length, topStepId, active?.id, emitter]);

  const selfFooter = active ? selfFooterIds.includes(active.id) : false;
  const canContinue = active ? (valid[active.key] ?? !active.task) : false;
  const continueLabel = isLast
    ? topStepId === 'general'
      ? 'Send & Continue'
      : 'Deploy & Continue'
    : 'Continue';

  return (
    <Ctx.Provider value={ctxValue}>
      <div className="relative flex h-full min-h-[560px] flex-col">
        <div className="relative min-h-0 flex-1 overflow-y-auto px-10 py-8">
          <OnboardingBackgroundGrid height="200px" />
          <div className="mx-auto max-w-4xl">{active ? renderSubStep(active) : null}</div>
        </div>

        {!selfFooter && (
          <OnboardingFooter
            onBack={goPrev}
            onContinue={goNext}
            continueLabel={continueLabel}
            disableBack={index === 0 && NEW_TOP_STEP_ORDER.indexOf(topStepId) === 0}
            disableContinue={!canContinue}
          >
            <span
              className={
                saveState === 'saving'
                  ? 'text-xs text-black-40'
                  : saveState === 'saved'
                    ? 'text-xs text-green'
                    : 'hidden'
              }
            >
              {saveState === 'saving' ? 'Saving…' : 'Saved'}
            </span>
          </OnboardingFooter>
        )}
      </div>
    </Ctx.Provider>
  );
}
