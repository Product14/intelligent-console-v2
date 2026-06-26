import type {
  SpeedToLeadByLeadType,
  SpeedToLeadBySource,
  SpeedToLeadDataPayload,
  SpeedToLeadSourceConfig,
} from './speed-to-lead-responses';
import { isSpeedToLeadMode } from './speed-to-lead-responses';

export const SPEED_TO_LEAD_MODES = [
  { value: 'FULLDAY', label: 'Full day' },
  { value: 'SILENT_HOURS', label: 'After hours' },
  { value: 'WORKING_HOURS', label: 'Working hours' },
] as const;

export function getDefaultSourceConfig(): SpeedToLeadSourceConfig {
  return {
    isEnabled: true,
    mode: '',
  };
}

export const DEFAULT_SOURCE_CONFIG: SpeedToLeadSourceConfig = {
  isEnabled: true,
  mode: '',
};

export function getDefaultSpeedToLeadPayload(
  enterpriseId: string,
  teamId: string,
  agentId: string
): SpeedToLeadDataPayload {
  return {
    enterpriseId,
    teamId,
    agentId,
    isSpeedToLeadEnabled: true,
    speedToLeadByLeadType: {},
  };
}

export function mergeWithDefaultPayload(
  enterpriseId: string,
  teamId: string,
  agentId: string,
  data: {
    isSpeedToLeadEnabled: boolean;
    speedToLeadByLeadType?: SpeedToLeadByLeadType;
  } | null
): SpeedToLeadDataPayload {
  return {
    enterpriseId,
    teamId,
    agentId,
    isSpeedToLeadEnabled: data?.isSpeedToLeadEnabled,
    speedToLeadByLeadType: data?.speedToLeadByLeadType ?? {},
  };
}

/** Return entry keys in insertion order */
export function getOrderedEntryKeys(
  entries: Record<string, SpeedToLeadSourceConfig>
): string[] {
  return Object.keys(entries);
}

/** Options available for "Add" dropdown (excludes already present keys) */
export function getAvailableToAdd(
  options: readonly string[],
  entries: Record<string, SpeedToLeadSourceConfig>
): string[] {
  return options.filter((key) => !(key in entries));
}

/** Normalize config for API: empty mode becomes FULLDAY */
export function normalizeConfigForSubmit(
  config: SpeedToLeadSourceConfig
): SpeedToLeadSourceConfig & {
  mode: import('./speed-to-lead-responses').SpeedToLeadMode;
} {
  return {
    ...config,
    isEnabled: true,
    mode: isSpeedToLeadMode(config.mode) ? config.mode : 'FULLDAY',
  };
}
