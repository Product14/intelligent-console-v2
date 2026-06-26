// Single source of truth for Vini Settings screen progress.
// Event-driven: a screen flips to `completed` when the underlying data lands,
// not when a button is clicked. Sticky once completed. Mock-mode safe.

import {
  VINI_SETTINGS_SCREENS,
  type SettingsScreen,
  type SettingsScreenId,
} from '@/lib/settings/onboarding-model';
import type { ContractedAgent } from '@/lib/settings/resolve-onboarding';

export type ProgressState = 'pending' | 'in-progress' | 'completed' | 'skipped';

export type ScreenProgress = Record<SettingsScreenId, ProgressState>;

/** Server-shaped data the progress derivation reads. All fields optional so
 *  mock mode (empty payload) doesn't throw. */
export interface SettingsProgressInput {
  rooftop?: {
    name?: string;
    website?: string;
    websiteListingUrl?: string;
  } | null;
  team?: {
    users?: ReadonlyArray<unknown>;
  } | null;
  departments?: {
    sales?: { hasShifts?: boolean };
    service?: { hasShifts?: boolean };
    parts?: { hasShifts?: boolean };
    finance?: { hasShifts?: boolean };
  } | null;
  integrations?: {
    viniPartnersConnected?: number;
    explicitlySkipped?: boolean;
  } | null;
  telephony?: {
    phoneNumbersAssigned?: number;
    cnamSet?: boolean;
  } | null;
  agents?: {
    sales?: {
      personaSaved?: boolean;
      firstMessageSaved?: boolean;
      voiceTestPassed?: boolean;
      deployed?: boolean;
    };
    service?: {
      personaSaved?: boolean;
      firstMessageSaved?: boolean;
      voiceTestPassed?: boolean;
      deployed?: boolean;
    };
  } | null;
  chatbot?: {
    masterToggleSet?: boolean;
  } | null;
  /** Stickiness: once a screen completes, server marks it sticky so user edits
   *  don't revert the chip. The progress derivation honors this regardless of
   *  current data state. */
  stickyCompletions?: Partial<Record<SettingsScreenId, boolean>>;
  /** User explicitly skipped these screens (consequence copy was acknowledged). */
  skipped?: Partial<Record<SettingsScreenId, boolean>>;
}

/** Resolves which screens render for this rooftop's contracted agents. Screens
 *  with `requiresAgent` are hidden when the dealer hasn't contracted that type. */
export function resolveSettingsScreens(agents: ContractedAgent[]): SettingsScreen[] {
  const types = new Set(agents.map((a) => a.agentType));
  return VINI_SETTINGS_SCREENS.filter(
    (s) => !s.requiresAgent || types.has(s.requiresAgent)
  );
}

function isScreenComplete(
  id: SettingsScreenId,
  input: SettingsProgressInput
): boolean {
  switch (id) {
    case 'rooftop':
      return Boolean(
        input.rooftop?.name &&
          input.rooftop?.website &&
          input.rooftop?.websiteListingUrl
      );
    case 'team':
      return Boolean(input.team?.users && input.team.users.length > 0);
    case 'departments':
      // Sales is the inheritance root; if it has shifts, treat as configured.
      return Boolean(input.departments?.sales?.hasShifts);
    case 'integrations-vini':
      return Boolean(
        (input.integrations?.viniPartnersConnected ?? 0) > 0 ||
          input.integrations?.explicitlySkipped
      );
    case 'telephony':
      return Boolean(
        (input.telephony?.phoneNumbersAssigned ?? 0) > 0 &&
          input.telephony?.cnamSet
      );
    case 'sales':
      return Boolean(
        input.agents?.sales?.personaSaved &&
          input.agents?.sales?.firstMessageSaved &&
          input.agents?.sales?.voiceTestPassed
      );
    case 'service':
      return Boolean(
        input.agents?.service?.personaSaved &&
          input.agents?.service?.firstMessageSaved &&
          input.agents?.service?.voiceTestPassed
      );
    case 'chatbot':
      return Boolean(input.chatbot?.masterToggleSet);
    // Reception and Vini General are settings-only surfaces — no onboarding
    // tasks gate them, so they never auto-complete from data.
    case 'reception':
    case 'vini-general':
    // Studio AI screens are Coming Soon placeholders — never auto-complete
    // from data in this codebase. Real progress would come from Studio's app.
    case 'studio-general':
    case 'studio-app':
    case 'studio-smart-campaigns':
    case 'studio-smart-match':
    case 'studio-smart-view':
      return false;
  }
}

export function getScreenState(input: SettingsProgressInput): ScreenProgress {
  const sticky = input.stickyCompletions ?? {};
  const skipped = input.skipped ?? {};
  const ids: SettingsScreenId[] = VINI_SETTINGS_SCREENS.map((s) => s.id);

  const entries = ids.map((id): [SettingsScreenId, ProgressState] => {
    if (sticky[id]) return [id, 'completed'];
    if (isScreenComplete(id, input)) return [id, 'completed'];
    if (skipped[id]) return [id, 'skipped'];
    return [id, 'pending'];
  });

  return Object.fromEntries(entries) as ScreenProgress;
}

/** True when every visible screen is completed — used to auto-hide progress chrome. */
export function isAllComplete(
  progress: ScreenProgress,
  screens: SettingsScreen[]
): boolean {
  return screens.every((s) => progress[s.id] === 'completed');
}
