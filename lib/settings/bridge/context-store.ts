import type { ConsoleContext, OutboundMessage } from './bridge-types';

// Module-level store so the (non-React) API layer can read auth/context
// and emit messages without prop-drilling through React.

let currentContext: ConsoleContext | null = null;
let targetOrigin = '*';

const subscribers = new Set<(ctx: ConsoleContext | null) => void>();

export function setConsoleContext(ctx: ConsoleContext | null) {
  currentContext = ctx;
  subscribers.forEach((fn) => fn(ctx));
}

export function getConsoleContext(): ConsoleContext | null {
  return currentContext;
}

export function subscribeConsoleContext(fn: (ctx: ConsoleContext | null) => void) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function setTargetOrigin(origin: string) {
  targetOrigin = origin;
}

// --- Active agent segment + step navigation (set by the shell, read by shims) ---
let activeSegment: string | null = null;
export function setActiveSegment(segment: string | null) {
  activeSegment = segment;
}
export function getActiveSegment(): string | null {
  return activeSegment;
}

let navHandlers: { goNext: () => void; goPrev: () => void } = {
  goNext: () => {},
  goPrev: () => {},
};
export function setNavHandlers(h: { goNext: () => void; goPrev: () => void }) {
  navHandlers = h;
}
export function getNavHandlers() {
  return navHandlers;
}

/** Emit a message to the parent window (no-op if not embedded). */
export function emitToParent(message: OutboundMessage) {
  if (typeof window === 'undefined') return;
  if (window.parent === window) return; // not embedded
  window.parent.postMessage(message, targetOrigin);
}
