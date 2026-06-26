'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  ConsoleContext,
  OutboundMessage,
  ScreenCompletionState,
} from './bridge-types';
import { isInboundMessage } from './bridge-types';
import type { SettingsScreenId } from '@/lib/settings/onboarding-model';
import {
  emitToParent,
  setConsoleContext,
  setTargetOrigin,
} from './context-store';
import { getParentOrigins } from '@/lib/settings/runtime-config';

type BridgeStatus = 'waiting' | 'ready' | 'stub';

interface BridgeValue {
  context: ConsoleContext | null;
  status: BridgeStatus;
  emit: (message: OutboundMessage) => void;
}

const BridgeContext = createContext<BridgeValue | null>(null);

// Origin allow-list now comes from runtime /config.json (loaded async). The
// previous build-time env var (NEXT_PUBLIC_PARENT_ORIGINS) is no longer used —
// it suffered the same Buffer-polyfill substitution issue as the API base URL
// (see lib/runtime-config.ts for the full story).

/** Synthetic context so the app boots standalone in dev (no parent frame). */
const STUB_CONTEXT: ConsoleContext = {
  authKey: 'fed5a4d4-b77c-4451-84ea-2d99366de78b',
  deviceId: '5cb8aaa36db2cda7b9dce89ef58d22f7',
  enterpriseId: '72bb92735',
  teamId: '8cc4c88c71',
  productLineId: 'demo-vini-product-line',
  agentType: 'sales',
  agentCallType: 'inbound',
  locale: 'en',
  // Local-dev fallback for the Maps key. In production this comes via
  // postMessage from Console; runtime config.json is also accepted.
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
};

/** Tenancy + segment params the parent (or local dev) can pass via the URL.
 *  Read once on mount and merged on top of STUB_CONTEXT (standalone) or the
 *  postMessage payload (embedded) — URL wins because it's the most explicit
 *  signal the parent had. */
function readUrlOverrides(): Partial<ConsoleContext> | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const keys: Array<keyof ConsoleContext> = [
    'enterpriseId',
    'teamId',
    'authKey',
    'deviceId',
    'productLineId',
    'agentType',
    'agentCallType',
    'resumeStep',
    'locale',
    'googleMapsApiKey',
  ];
  const out: Partial<ConsoleContext> = {};
  for (const key of keys) {
    const value = params.get(key);
    if (value) (out as Record<string, string>)[key] = value;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Synchronously compute the initial bridge context (and push it into the
 *  module-level store) so child components reading `getConsoleContext()` in
 *  their first useEffect — which fires BEFORE this provider's useEffect —
 *  see a populated context. Without this, every consumer would race the
 *  bridge handshake and see `null` on the first render. */
function computeInitialContext(): ConsoleContext | null {
  if (typeof window === 'undefined') return null;
  const embedded = window.parent !== window;
  const urlOverrides = readUrlOverrides();

  if (!embedded) {
    // Standalone: URL params override stub defaults.
    const ctx = { ...STUB_CONTEXT, ...(urlOverrides ?? {}) };
    setConsoleContext(ctx);
    return ctx;
  }

  // Embedded with URL tenancy: hydrate now; postMessage will fill the rest.
  if (urlOverrides?.enterpriseId && urlOverrides?.teamId) {
    const ctx = {
      authKey: '',
      deviceId: '',
      productLineId: '',
      agentType: '',
      agentCallType: '',
      ...urlOverrides,
    } as ConsoleContext;
    setConsoleContext(ctx);
    return ctx;
  }

  return null;
}

export function ConsoleBridgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContext] = useState<ConsoleContext | null>(computeInitialContext);
  const [status, setStatus] = useState<BridgeStatus>(() =>
    // If context was hydrated synchronously and we're standalone, mark stub
    // immediately so dev banners (etc.) don't show a "waiting" state.
    typeof window !== 'undefined' && window.parent === window && computeInitialContext()
      ? 'stub'
      : 'waiting'
  );
  const lastHeight = useRef(0);

  const applyContext = useCallback((ctx: ConsoleContext) => {
    setContext(ctx);
    setConsoleContext(ctx);
  }, []);

  useEffect(() => {
    // Embedded (inside an <iframe>) => always perform the real postMessage
    // handshake. Standalone (top-level window) => already hydrated above.
    const embedded = typeof window !== 'undefined' && window.parent !== window;
    const stubMode = !embedded;
    const urlOverrides = readUrlOverrides();

    if (stubMode) {
      // Already hydrated synchronously via computeInitialContext; nothing
      // more to do beyond ensuring the status reflects stub mode.
      setStatus('stub');
      // eslint-disable-next-line no-console
      console.info(
        '[bridge] running in stub mode — synthesized console context',
        urlOverrides ? { urlOverrides } : ''
      );
      return;
    }

    let cancelled = false;
    let allowed: string[] = [];

    // Diagnostic helper — masks credential values (length-only) so we can log
    // the shape of the payload without leaking secrets to anyone with DevTools.
    const summarize = (payload: Record<string, unknown>) => {
      const out: Record<string, unknown> = {};
      const sensitive = new Set(['authKey', 'deviceId', 'googleMapsApiKey']);
      for (const [key, value] of Object.entries(payload)) {
        if (typeof value === 'string' && sensitive.has(key)) {
          out[key] = value === '' ? '(empty)' : `(${value.length} chars)`;
        } else {
          out[key] = value;
        }
      }
      return out;
    };

    const onMessage = (event: MessageEvent) => {
      // Log every inbound postMessage so iframe handshake issues are
      // diagnosable from DevTools without needing to patch code. Logged at
      // info level; credential values are masked by `summarize` below.
      const dataPreview =
        event.data && typeof event.data === 'object' && 'type' in event.data
          ? { type: (event.data as { type: unknown }).type }
          : { dataType: typeof event.data };
      // eslint-disable-next-line no-console
      console.info('[bridge] inbound message', {
        origin: event.origin,
        ...dataPreview,
      });

      // Origin allow-list: never trust inbound messages from unknown origins.
      if (!allowed.includes(event.origin)) {
        // eslint-disable-next-line no-console
        console.warn(
          '[bridge] rejected — origin not in allow-list',
          { received: event.origin, allowed }
        );
        return;
      }
      if (!isInboundMessage(event.data)) {
        // eslint-disable-next-line no-console
        console.warn(
          '[bridge] rejected — message shape did not match InboundMessage',
          { data: event.data }
        );
        return;
      }

      setTargetOrigin(event.origin);

      if (event.data.type === 'console:init') {
        const payload = event.data.payload as unknown as Record<string, unknown>;
        // eslint-disable-next-line no-console
        console.info('[bridge] applying console:init', summarize(payload));
        if (!payload.authKey || !payload.deviceId) {
          // eslint-disable-next-line no-console
          console.error(
            '[bridge] console:init payload missing authKey or deviceId — ' +
              'API calls will 401. Check Console-side localStorage key names.',
            { authKeyPresent: Boolean(payload.authKey), deviceIdPresent: Boolean(payload.deviceId) }
          );
        }
        // URL params still win on conflict — the parent told us via two
        // channels and the URL is the more deliberate one.
        applyContext({ ...event.data.payload, ...(urlOverrides ?? {}) });
        setStatus('ready');
      } else if (event.data.type === 'console:token-refresh') {
        const payload = event.data.payload as unknown as Record<string, unknown>;
        // eslint-disable-next-line no-console
        console.info('[bridge] applying console:token-refresh', summarize(payload));
        setContext((prev) => {
          if (!prev) return prev;
          const next = { ...prev, ...event.data.payload };
          setConsoleContext(next);
          return next;
        });
      }
    };

    // Load the origin allow-list from runtime config, THEN register the
    // listener, THEN announce readiness. The order matters: if we emit
    // `onboarding:ready` before the listener is wired, Console's `console:init`
    // reply could race in before we're ready to receive it.
    getParentOrigins().then((origins) => {
      if (cancelled) return;
      allowed = origins;
      window.addEventListener('message', onMessage);
      // eslint-disable-next-line no-console
      console.info('[bridge] postMessage listener ready', { allowed });
      // Announce readiness so the parent posts console:init.
      emitToParent({ type: 'onboarding:ready' });
    });

    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
    };
  }, [applyContext]);

  // Auto-grow: report content height so the Console can size the iframe.
  useEffect(() => {
    if (typeof window === 'undefined' || window.parent === window) return;
    const report = () => {
      const height = document.documentElement.scrollHeight;
      if (Math.abs(height - lastHeight.current) > 4) {
        lastHeight.current = height;
        emitToParent({ type: 'onboarding:resize', payload: { height } });
      }
    };
    const ro = new ResizeObserver(report);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  const emit = useCallback((message: OutboundMessage) => emitToParent(message), []);

  return (
    <BridgeContext.Provider value={{ context, status, emit }}>
      {children}
    </BridgeContext.Provider>
  );
}

export function useBridge(): BridgeValue {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error('useBridge must be used within ConsoleBridgeProvider');
  return ctx;
}

/** Convenience: the console context (null until handshake completes). */
export function useConsoleContext(): ConsoleContext | null {
  return useBridge().context;
}

/** Typed outbound emitters. */
export function useBridgeEmitter() {
  const { emit } = useBridge();
  return {
    progress: (stepId: string, percent: number) =>
      emit({ type: 'onboarding:progress', payload: { stepId, percent } }),
    stepComplete: (stepId: string) =>
      emit({ type: 'onboarding:step-complete', payload: { stepId } }),
    /** Surface a settings screen's progress state up to Console so its
     *  sidebar can update the chip for that screen. Fires on state transitions
     *  (e.g., pending → completed). */
    screenComplete: (screenId: SettingsScreenId, state: ScreenCompletionState) =>
      emit({
        type: 'onboarding:screen-complete',
        payload: { screenId, state },
      }),
    finished: () => emit({ type: 'onboarding:finished' }),
    error: (message: string) =>
      emit({ type: 'onboarding:error', payload: { message } }),
  };
}
