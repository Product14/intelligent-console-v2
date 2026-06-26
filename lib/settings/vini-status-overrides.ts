// Vini Status manual overrides — localStorage-backed for v1.
//
// OB/CS can mark any section or agent card as Ready / Blocked or attach a
// note. The override outranks the derived chip in the UI. Keyed by an
// enterprise scope + row id so different rooftops don't clobber each other.
//
// When a server-side persistence story arrives, swap the body of the four
// functions below — the API is what the screen consumes.

export type OverrideKind = 'ready' | 'blocked';

export interface ViniStatusOverride {
  /** `null` clears the chip-state override (note may still exist). */
  kind: OverrideKind | null;
  note?: string;
  /** ISO timestamp captured at set time. Displayed as "Updated 2 days ago". */
  updatedAt: string;
}

/** A stable id for the row being overridden. Sections use their section id
 *  ("rooftop", "integrations"); agent cards use "agent:<type>:<callType>"
 *  ("agent:sales:inbound"). */
export type OverrideRowId = string;

const STORAGE_PREFIX = 'vini-status-overrides';

function storageKey(scope: string): string {
  return `${STORAGE_PREFIX}:${scope}`;
}

interface OverrideMap {
  [rowId: string]: ViniStatusOverride;
}

function read(scope: string): OverrideMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function write(scope: string, map: OverrideMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(map));
    // Same-tab subscribers don't get the native `storage` event — dispatch a
    // synthetic one so the hook below picks it up everywhere it's mounted.
    window.dispatchEvent(new CustomEvent('vini-status-overrides:changed', { detail: { scope } }));
  } catch {
    // Quota exceeded or storage disabled — silent no-op; UI continues to
    // function with in-memory state until the next read returns whatever
    // got persisted.
  }
}

export function getAllOverrides(scope: string): OverrideMap {
  return read(scope);
}

export function getOverride(scope: string, rowId: OverrideRowId): ViniStatusOverride | null {
  return read(scope)[rowId] ?? null;
}

export function setOverride(
  scope: string,
  rowId: OverrideRowId,
  patch: { kind?: OverrideKind | null; note?: string | null }
): void {
  const map = read(scope);
  const prev = map[rowId];
  const next: ViniStatusOverride = {
    kind: patch.kind === undefined ? prev?.kind ?? null : patch.kind,
    note:
      patch.note === undefined
        ? prev?.note
        : patch.note === null
          ? undefined
          : patch.note,
    updatedAt: new Date().toISOString(),
  };
  // Don't persist a fully empty override — clear the slot instead.
  if (next.kind === null && !next.note) {
    delete map[rowId];
  } else {
    map[rowId] = next;
  }
  write(scope, map);
}

export function clearOverride(scope: string, rowId: OverrideRowId): void {
  const map = read(scope);
  if (rowId in map) {
    delete map[rowId];
    write(scope, map);
  }
}

/** Subscribe to override changes for a scope. Fires on both same-tab and
 *  cross-tab updates. Returns an unsubscribe function. */
export function subscribeOverrides(scope: string, listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey(scope)) listener();
  };
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || detail.scope === scope) listener();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('vini-status-overrides:changed', onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('vini-status-overrides:changed', onCustom);
  };
}

export function agentRowId(type: string, callType: string): OverrideRowId {
  return `agent:${type}:${callType}`;
}
