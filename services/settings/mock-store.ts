// In-memory + sessionStorage backed store so mock autosave feels real across reloads.

const MEM: Record<string, unknown> = {};

function key(k: string) {
  return `vini-onboarding:${k}`;
}

export function readMock<T>(k: string, fallback: T): T {
  if (k in MEM) return MEM[k] as T;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem(key(k));
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        MEM[k] = parsed;
        return parsed;
      }
    } catch {
      /* ignore */
    }
  }
  return fallback;
}

export function writeMock<T>(k: string, value: T): T {
  MEM[k] = value;
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(key(k), JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }
  return value;
}

export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
