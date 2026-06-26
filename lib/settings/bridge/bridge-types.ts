// Message contracts for the Console <-> Onboarding iframe bridge.

import type { SettingsScreenId } from '@/lib/settings/onboarding-model';

/** Auth + tenancy context handed to the iframe by the parent Console. */
export interface ConsoleContext {
  /** Spyne auth key (from the parent's localStorage). */
  authKey: string;
  /** Device id paired with the auth key. */
  deviceId: string;
  enterpriseId: string;
  teamId: string;
  /** Product line being onboarded (Vini). */
  productLineId: string;
  /** "sales" | "service" — which agent family. */
  agentType: string;
  /** "inbound" | "outbound" — which call direction. */
  agentCallType: string;
  /** Optional deep-link to resume a specific top step. */
  resumeStep?: string;
  locale?: string;
  /** Google Maps JS SDK key — powers AddressField autocomplete + the map
   *  preview on Department Details. Provided by Console so it can be
   *  rotated / restricted per environment without rebuilding this app.
   *  Falls back to runtime config.json, then to the build-time env var
   *  for local dev. Restricted by referer on the GCP side. */
  googleMapsApiKey?: string;
}

/** Settings-screen completion states surfaced upstream so Console's sidebar
 *  can show progress chips. */
export type ScreenCompletionState =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'skipped';

/** Inbound: parent -> iframe. */
export type InboundMessage =
  | { type: 'console:init'; payload: ConsoleContext }
  | { type: 'console:token-refresh'; payload: Pick<ConsoleContext, 'authKey' | 'deviceId'> };

/** Outbound: iframe -> parent. */
export type OutboundMessage =
  | { type: 'onboarding:ready' }
  | { type: 'onboarding:progress'; payload: { stepId: string; percent: number } }
  | { type: 'onboarding:step-complete'; payload: { stepId: string } }
  | {
      type: 'onboarding:screen-complete';
      payload: { screenId: SettingsScreenId; state: ScreenCompletionState };
    }
  | { type: 'onboarding:finished' }
  | { type: 'onboarding:error'; payload: { message: string } }
  | { type: 'onboarding:resize'; payload: { height: number } };

export const INBOUND_TYPES = ['console:init', 'console:token-refresh'] as const;

export function isInboundMessage(data: unknown): data is InboundMessage {
  return (
    !!data &&
    typeof data === 'object' &&
    'type' in data &&
    (INBOUND_TYPES as readonly string[]).includes((data as { type: string }).type)
  );
}
