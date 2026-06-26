import { getConsoleContext } from '@/lib/settings/bridge/context-store';

// Mirrors packages/utils/src/config.js -> generateBearerToken, but reads
// {authKey, deviceId, enterprise_id, team_id} from the bridge context
// (a cross-origin iframe cannot see the parent's localStorage).
// Token format is unchanged: `Bearer base64(JSON.stringify(payload))`.

function base64Payload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(unescape(encodeURIComponent(json)));
  }
  // SSR / node fallback
  return Buffer.from(json, 'utf-8').toString('base64');
}

export function generateBearerToken(additionalPayload: Record<string, unknown> = {}): string {
  const ctx = getConsoleContext();
  if (!ctx) return '';

  const payload: Record<string, unknown> = {
    ...additionalPayload,
    authKey: ctx.authKey,
    deviceId: ctx.deviceId,
  };
  if (ctx.enterpriseId) payload.enterprise_id = ctx.enterpriseId;
  if (ctx.teamId) payload.team_id = ctx.teamId;

  return `Bearer ${base64Payload(payload)}`;
}
