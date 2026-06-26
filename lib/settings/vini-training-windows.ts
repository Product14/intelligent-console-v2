// Pure helpers for the 4 training windows + lifecycle phase.
//
// All helpers take `today` explicitly so derivations stay deterministic
// (no Date.now() calls — supports ?today=YYYY-MM-DD overrides for fixtures).

import { TRAINING_PERIOD_DAYS, type WindowKey, type WindowState } from './vini-training-mock';

const WINDOW_LENGTH_DAYS = 30;

/** Each window's day-offset relative to trainingStartAt. */
const WINDOW_OFFSETS: Record<WindowKey, { fromDays: number; toDays: number }> = {
  baseline: { fromDays: -30, toDays: 0 },
  w1:       { fromDays: 0,   toDays: 30 },
  w2:       { fromDays: 30,  toDays: 60 },
  w3:       { fromDays: 60,  toDays: 90 },
};

export type LifecyclePhase = 'training' | 'just_completed' | 'post_training';

/** Whole days between two ISO dates (today - start). Truncates toward zero. */
export function daysBetween(start: string, today: string): number {
  const ms = Date.parse(today) - Date.parse(start);
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

/** "Day X of 90" — clamped to [1, 90]. */
export function trainingDay(trainingStartAt: string, today: string): number {
  const d = daysBetween(trainingStartAt, today) + 1;
  if (d < 1) return 1;
  if (d > TRAINING_PERIOD_DAYS) return TRAINING_PERIOD_DAYS;
  return d;
}

/** Lifecycle phase derived from how many days into training we are. */
export function lifecyclePhase(trainingStartAt: string, today: string): LifecyclePhase {
  const elapsed = daysBetween(trainingStartAt, today);
  if (elapsed < TRAINING_PERIOD_DAYS) return 'training';
  if (elapsed < TRAINING_PERIOD_DAYS + 14) return 'just_completed';
  return 'post_training';
}

/** Which window is "current" given trainingStartAt + today. Returns null
 *  if we're outside the 90-day training window. */
export function currentWindow(trainingStartAt: string, today: string): WindowKey | null {
  const elapsed = daysBetween(trainingStartAt, today);
  if (elapsed < 0) return 'w1'; // pre-Day-1 still positions us at the first window
  if (elapsed < 30) return 'w1';
  if (elapsed < 60) return 'w2';
  if (elapsed < 90) return 'w3';
  return null;
}

/** Window state given the current cursor. Baseline is always 'baseline';
 *  training windows resolve to completed / current / not_started by position. */
export function windowState(
  key: WindowKey,
  trainingStartAt: string,
  today: string
): WindowState {
  if (key === 'baseline') return 'baseline';
  const current = currentWindow(trainingStartAt, today);
  const order: WindowKey[] = ['w1', 'w2', 'w3'];
  const keyIdx = order.indexOf(key);
  const currentIdx = current ? order.indexOf(current) : order.length; // post-training: all completed
  if (keyIdx < currentIdx) return 'completed';
  if (keyIdx === currentIdx) return 'current';
  return 'not_started';
}

/** Progress through the 90-day training as a 0..1 fraction (for the hero bar). */
export function trainingProgress(trainingStartAt: string, today: string): number {
  const elapsed = daysBetween(trainingStartAt, today);
  if (elapsed < 0) return 0;
  if (elapsed >= TRAINING_PERIOD_DAYS) return 1;
  return elapsed / TRAINING_PERIOD_DAYS;
}

/** ISO date for the end of training (start + 90 days). */
export function trainingEndDate(trainingStartAt: string): string {
  const d = new Date(trainingStartAt);
  d.setUTCDate(d.getUTCDate() + TRAINING_PERIOD_DAYS);
  return d.toISOString().slice(0, 10);
}

/** "Started Jun 22, 2026" style display. */
export function formatLongDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Inclusive date range for a window relative to trainingStartAt.
 *  Returns null for not_started windows so the UI can render a placeholder. */
export function windowDateRange(
  key: WindowKey,
  trainingStartAt: string,
  today: string
): string | null {
  const state = windowState(key, trainingStartAt, today);
  if (state === 'not_started') return null;
  const offsets = WINDOW_OFFSETS[key];
  const from = new Date(trainingStartAt);
  from.setUTCDate(from.getUTCDate() + offsets.fromDays);
  const to = new Date(trainingStartAt);
  to.setUTCDate(to.getUTCDate() + offsets.toDays - 1);
  // For the current window, end at today rather than the nominal end.
  if (state === 'current') {
    const todayDate = new Date(today);
    if (todayDate < to) {
      return `${formatShortDay(from.toISOString().slice(0, 10))} – ${formatShortDay(today.slice(0, 10))}`;
    }
  }
  return `${formatShortDay(from.toISOString().slice(0, 10))} – ${formatShortDay(to.toISOString().slice(0, 10))}`;
}

function formatShortDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export { WINDOW_LENGTH_DAYS };
