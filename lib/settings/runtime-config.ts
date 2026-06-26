// Runtime config loader — reads /config.json from the deployed origin at app
// boot. Lets a single static-export build serve UAT / staging / prod with
// different backend URLs (the per-environment value is written into the bucket
// by the deploy step from a CodeBuild env var). See HANDOFF_CONSOLE.md and
// code-deploy.yaml for the deploy-time wiring.
//
// Why not NEXT_PUBLIC_* env vars: those are substituted at *build* time. With
// `output: 'export'` one build = one URL. config.json is read at *runtime* in
// the browser, so the same artifact deploys to any environment.

export interface RuntimeConfig {
  /** Origin used as the prefix for every backend call (e.g.
   *  "https://uat-api.spyne.xyz"). No trailing slash. */
  apiBaseUrl: string;
  /** Origins permitted to embed this app in an <iframe> AND to postMessage
   *  the bridge handshake. Validated against `event.origin` on every inbound
   *  message — anything not in this list is silently dropped. Per-environment
   *  (UAT: console UAT origin; prod: console prod origin). */
  parentOrigins: string[];
  /** Optional Google Maps JS SDK key. Falls in priority order:
   *  ConsoleContext.googleMapsApiKey (postMessage) > this field > env var. */
  googleMapsApiKey?: string;
}

// Sensible local-dev fallback. Used only when /config.json is unreachable
// (e.g. running the unit-test renderer, or a network blip on first load).
// Local dev still typically loads /config.json from `public/config.json`.
const DEFAULT_CONFIG: RuntimeConfig = {
  apiBaseUrl: 'https://uat-api.spyne.xyz',
  parentOrigins: ['http://localhost:3010', 'http://localhost:3000'],
};

let configValue: RuntimeConfig | null = null;
let configPromise: Promise<RuntimeConfig> | null = null;

/** Kick off the config fetch (idempotent). Returns the loaded config. */
export function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (configValue) return Promise.resolve(configValue);
  if (configPromise) return configPromise;

  configPromise = (async () => {
    // SSR / static prerender — no fetch is possible. Components that call this
    // during build (none today, but defensive) get the default.
    if (typeof window === 'undefined') {
      configValue = DEFAULT_CONFIG;
      return configValue;
    }
    try {
      const res = await fetch('/config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`config.json HTTP ${res.status}`);
      const json = (await res.json()) as Record<string, unknown>;
      const rawOrigins = json.parentOrigins;
      const parentOrigins = Array.isArray(rawOrigins)
        ? (rawOrigins.filter((s) => typeof s === 'string') as string[])
        : typeof rawOrigins === 'string'
          ? rawOrigins.split(',').map((s) => s.trim()).filter(Boolean)
          : DEFAULT_CONFIG.parentOrigins;
      configValue = {
        ...DEFAULT_CONFIG,
        // Normalize: drop any trailing slash so callers can always concat
        // their path segment.
        apiBaseUrl: typeof json.apiBaseUrl === 'string' && json.apiBaseUrl
          ? json.apiBaseUrl.replace(/\/+$/, '')
          : DEFAULT_CONFIG.apiBaseUrl,
        // Accept either an array (preferred) or a comma-separated string
        // (so the deploy step can shell-substitute a single env var).
        parentOrigins,
        googleMapsApiKey:
          typeof json.googleMapsApiKey === 'string' && json.googleMapsApiKey
            ? json.googleMapsApiKey
            : DEFAULT_CONFIG.googleMapsApiKey,
      };
      return configValue;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[runtime-config] failed to load /config.json — using default', err);
      configValue = DEFAULT_CONFIG;
      return configValue;
    }
  })();

  return configPromise;
}

/** Synchronous read of the loaded config. Returns the default if loadRuntimeConfig
 *  hasn't resolved yet — callers that need a guaranteed value should await
 *  loadRuntimeConfig() first. */
export function getRuntimeConfig(): RuntimeConfig {
  return configValue ?? DEFAULT_CONFIG;
}

/** Convenience — most callers only want the base URL. Awaits the load so the
 *  returned string is always the resolved value. */
export async function getApiBaseUrl(): Promise<string> {
  const cfg = await loadRuntimeConfig();
  return cfg.apiBaseUrl;
}

/** Awaits the load and returns the parent-origins allow-list. */
export async function getParentOrigins(): Promise<string[]> {
  const cfg = await loadRuntimeConfig();
  return cfg.parentOrigins;
}
