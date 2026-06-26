// Adapter between the backend agent-config payload and the UI's SpeedToLead
// form state. Reach-out / follow-ups live at
// `agentConfig.entityConfig.sales.reachOutAndFollowups`. Three jobs:
//
//   1. extractReachOutBlock — pull the reach-out subtree out of the agent-
//      config envelope. Other roots (ignoreAniNumbers, sales.policies,
//      service.policies) are opaque to this adapter.
//
//   2. apiToUi / groupsFromStlConfig — fold the block-level shapes (stl,
//      silenceNudge, speedToLeadSources, followUp) into the flat SpeedToLead
//      shape the form components consume.
//
//   3. diffBlocks — given a "before" and "after" SpeedToLead, return a
//      partial agent-config save payload containing only the changed blocks
//      under `entityConfig.sales.reachOutAndFollowups`. Backend deep-merges
//      so untouched blocks (and other entityConfig roots) keep their server
//      state.

import type {
  LeadSourceGroup,
  LeadTypeSelection,
  SpeedToLead,
  STLTouchpoint,
} from '@/services/settings/types';
import type {
  AgentConfigResponse,
  AgentConfigSavePayload,
  FollowUpBlock,
  FollowUpCadenceStep,
  ReachOutAndFollowupsBlock,
  ReachOutAndFollowupsSavePayloadBlock,
  SilenceNudgeBlock,
  SpeedToLeadSourceEntry,
  SpeedToLeadSourceSavePayloadEntry,
  StlBlock,
} from '@/services/settings/agent-config.service';

// ---- Time format helpers (24h HH:mm ↔ 12h "HH:MM AM") ----------------------

/** "09:00 AM" / "01:30 PM" → "09:00" / "13:30" (24h). */
export function uiTimeTo24h(value: string): string {
  const trimmed = (value || '').trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):?(\d{0,2})\s*(AM|PM)?$/);
  if (!match) return '09:00';
  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] as 'AM' | 'PM' | undefined;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  else if (meridiem === 'PM' && hour < 12) hour = hour + 12;
  // Without meridiem, accept hour as-is (already 24h).
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** "13:30" → "01:30 PM"; "09:00" → "09:00 AM". */
export function backendTimeToUi(value: string): string {
  const trimmed = (value || '').trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '09:00 AM';
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour = hour - 12;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${meridiem}`;
}

// ---- Master list (stl-follow-up-config → LeadSourceGroup[]) ---------------

/** Backend's catch-all bucket — sources that don't fit a real vertical.
 *  We hide it from the UI entirely (no group rendered, never enabled, never
 *  sent on save). */
const EMPTY_EXTERNAL_TYPE = 'empty';

function isHiddenExternalType(externalType: string): boolean {
  return externalType === EMPTY_EXTERNAL_TYPE;
}

/** Display label for an externalType — title-cased snake/space form.
 *  "INTERNET" → "Internet"; "PHONE_UP" → "Phone Up". */
function externalTypeLabel(externalType: string): string {
  if (!externalType) return '';
  return externalType
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase())
    .join(' ');
}

/** Pull the reach-out subtree out of the agent-config envelope. Returns an
 *  empty block when missing so downstream defaults take over. */
export function extractReachOutBlock(
  response: AgentConfigResponse | null | undefined
): ReachOutAndFollowupsBlock {
  return response?.entityConfig?.sales?.reachOutAndFollowups ?? {};
}

/** Extract source NAMES from a `sources` field of unknown shape. Handles
 *  the three observed wire forms:
 *    - `Record<string, boolean>` — keys are the names.
 *    - `string[]` — each entry is a name.
 *    - `Array<{ name | source | sourceName | id }>` — pick the name-like
 *      field. */
function sourceNamesFrom(sources: unknown): string[] {
  if (!sources) return [];
  if (Array.isArray(sources)) {
    const out: string[] = [];
    for (const item of sources) {
      if (typeof item === 'string' && item) {
        if (!out.includes(item)) out.push(item);
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const name =
          (typeof obj.name === 'string' && obj.name) ||
          (typeof obj.source === 'string' && obj.source) ||
          (typeof obj.sourceName === 'string' && obj.sourceName) ||
          (typeof obj.id === 'string' && obj.id) ||
          '';
        if (name && !out.includes(name)) out.push(name);
      }
    }
    return out;
  }
  if (typeof sources === 'object') {
    return Object.keys(sources as Record<string, unknown>).filter(Boolean);
  }
  return [];
}

/** Extract source NAMES that are currently SELECTED. For a Record, names
 *  whose value is truthy. For an array of strings, every entry is selected.
 *  For an array of objects, an `enabled|selected|isEnabled|typeEnabled`
 *  flag drives selection (defaults to true when missing). */
function selectedSourceNamesFrom(sources: unknown): string[] {
  if (!sources) return [];
  if (Array.isArray(sources)) {
    const out: string[] = [];
    for (const item of sources) {
      if (typeof item === 'string' && item) {
        if (!out.includes(item)) out.push(item);
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const name =
          (typeof obj.name === 'string' && obj.name) ||
          (typeof obj.source === 'string' && obj.source) ||
          (typeof obj.sourceName === 'string' && obj.sourceName) ||
          (typeof obj.id === 'string' && obj.id) ||
          '';
        if (!name) continue;
        const enabled =
          obj.enabled ?? obj.selected ?? obj.isEnabled ?? obj.typeEnabled ?? true;
        if (enabled && !out.includes(name)) out.push(name);
      }
    }
    return out;
  }
  if (typeof sources === 'object') {
    const out: string[] = [];
    for (const [name, on] of Object.entries(sources as Record<string, unknown>)) {
      if (name && on) out.push(name);
    }
    return out;
  }
  return [];
}

/** Derive the externalType groups from the reach-out subtree. Each group
 *  carries the full list of available source names for that externalType
 *  (populated from the response's `sources` field). The hidden `"empty"`
 *  bucket is filtered out — it's a catch-all the operator shouldn't see. */
export function groupsFromStlConfig(
  block: ReachOutAndFollowupsBlock
): LeadSourceGroup[] {
  const entries = block?.speedToLeadSources ?? [];
  return entries
    .filter((entry) => !!entry?.externalType && !isHiddenExternalType(entry.externalType))
    .map((entry) => ({
      id: entry.externalType,
      label: externalTypeLabel(entry.externalType),
      sources: sourceNamesFrom(entry.sources).map((name) => ({ id: name, name })),
    }));
}

// ---- Backend → UI ----------------------------------------------------------

/** Build the per-externalType toggle list from the GET response. Source
 *  selection lives at the SpeedToLead level — not on each entry — so the
 *  per-type record is just `{ externalType, enabled }`. The hidden
 *  `"empty"` bucket is filtered out so it never reaches the form state. */
function leadTypesFromBackend(
  entries: SpeedToLeadSourceEntry[] | undefined
): LeadTypeSelection[] {
  if (!entries?.length) return [];
  const out: LeadTypeSelection[] = [];
  for (const entry of entries) {
    if (!entry?.externalType || isHiddenExternalType(entry.externalType)) continue;
    out.push({
      externalType: entry.externalType,
      enabled: entry.typeEnabled === true,
    });
  }
  return out;
}

/** Walk every (non-hidden) entry and union its source names + selected
 *  names into two flat lists. The picker shows one shared list across all
 *  externalTypes; mode is derived from "is every available source
 *  selected?". */
function unionSources(entries: SpeedToLeadSourceEntry[] | undefined): {
  available: string[];
  selected: string[];
} {
  if (!entries?.length) return { available: [], selected: [] };
  const available: string[] = [];
  const selected: string[] = [];
  const push = (list: string[], name: string) => {
    if (name && !list.includes(name)) list.push(name);
  };
  for (const entry of entries) {
    if (!entry?.externalType || isHiddenExternalType(entry.externalType)) continue;
    for (const name of sourceNamesFrom(entry.sources)) push(available, name);
    for (const name of selectedSourceNamesFrom(entry.sources)) push(selected, name);
  }
  return { available, selected };
}

export function apiToUi(
  block: ReachOutAndFollowupsBlock,
  options: { forwardEmail: string }
): SpeedToLead {
  const stl = block.stl;
  const silenceNudge = block.silenceNudge;
  const followUp = block.followUp;
  const { available, selected } = unionSources(block.speedToLeadSources);
  // Mode heuristic — `all` only when there's something available AND every
  // single available source is currently selected. Otherwise the user is
  // in customize mode; preserve the actual selected set.
  const sourceMode =
    available.length > 0 && available.length === selected.length
      ? 'all'
      : 'customize';
  return {
    enabled: stl?.enabled ?? false,
    forwardEmail: options.forwardEmail,
    leadsToPick: 'all',
    leadTypes: leadTypesFromBackend(block.speedToLeadSources),
    sourceMode,
    selectedSources: selected,
    firstTouchChannel: stl?.channel ?? 'sms',
    silenceNudge: {
      // Backend `enabled: false` collapses to UI 'none' so the SegmentedControl
      // can show a single combined selector.
      channel: silenceNudge && silenceNudge.enabled === false
        ? 'none'
        : (silenceNudge?.channel ?? 'sms'),
      delayMinutes: silenceNudge?.delayMinutes ?? 60,
    },
    followUp: {
      enabled: followUp?.enabled ?? false,
      touchpoints: (followUp?.cadence ?? []).map((step, idx) => ({
        id: `t-${idx}-${step.dayOffset}-${step.scheduledTime}`,
        day: step.dayOffset,
        time: backendTimeToUi(step.scheduledTime),
        channel: step.channel,
      })),
    },
  };
}

// ---- UI → backend (per block) ----------------------------------------------

export function uiStlBlock(ui: SpeedToLead): StlBlock {
  return { enabled: ui.enabled, channel: ui.firstTouchChannel };
}

export function uiSilenceNudgeBlock(ui: SpeedToLead): SilenceNudgeBlock {
  // UI's 'none' folds into backend `enabled: false`. The channel value sent
  // alongside is meaningless when disabled; default to 'sms' so the payload
  // type-checks without leaking an invalid value.
  if (ui.silenceNudge.channel === 'none') {
    return {
      enabled: false,
      channel: 'sms',
      delayMinutes: ui.silenceNudge.delayMinutes,
    };
  }
  return {
    enabled: true,
    channel: ui.silenceNudge.channel,
    delayMinutes: ui.silenceNudge.delayMinutes,
  };
}

export function uiFollowUpBlock(ui: SpeedToLead): FollowUpBlock {
  return {
    enabled: ui.followUp.enabled,
    cadence: ui.followUp.touchpoints.map<FollowUpCadenceStep>((t: STLTouchpoint) => ({
      dayOffset: t.day,
      scheduledTime: uiTimeTo24h(t.time),
      channel: t.channel,
    })),
  };
}

/** Build the speedToLeadSources block — one entry per externalType in the
 *  master `groups` list, each carrying `{ externalType, typeEnabled }`. The
 *  new (in-progress) UI tracks mode (all|customize) and per-source picks
 *  inside `ui.leadTypes`, but the wire schema for those is still being
 *  finalised; for now we emit only the toggle, matching the prior payload
 *  shape. The richer per-source data lives in `ui.leadTypes` ready to ship
 *  once the API contract lands. */
export function uiSpeedToLeadSourcesBlock(
  ui: SpeedToLead,
  groups: LeadSourceGroup[]
): SpeedToLeadSourceSavePayloadEntry[] {
  const byType = new Map(
    (ui.leadTypes ?? []).map((lt) => [lt.externalType, lt])
  );
  return groups.map((group) => ({
    externalType: group.id,
    typeEnabled: byType.get(group.id)?.enabled === true,
  }));
}

// ---- Diff (block-level) ----------------------------------------------------

function shallowEqualStl(a: StlBlock, b: StlBlock): boolean {
  return a.enabled === b.enabled && a.channel === b.channel;
}

function shallowEqualSilenceNudge(a: SilenceNudgeBlock, b: SilenceNudgeBlock): boolean {
  if (a.enabled !== b.enabled) return false;
  if (a.delayMinutes !== b.delayMinutes) return false;
  // Channel is only meaningful when enabled — ignore it on disabled blocks.
  if (a.enabled && a.channel !== b.channel) return false;
  return true;
}

function equalFollowUp(a: FollowUpBlock, b: FollowUpBlock): boolean {
  if (a.enabled !== b.enabled) return false;
  if (a.cadence.length !== b.cadence.length) return false;
  for (let i = 0; i < a.cadence.length; i++) {
    const ai = a.cadence[i];
    const bi = b.cadence[i];
    if (
      ai.dayOffset !== bi.dayOffset ||
      ai.scheduledTime !== bi.scheduledTime ||
      ai.channel !== bi.channel
    ) {
      return false;
    }
  }
  return true;
}

function sourceEntriesEqual(
  a: SpeedToLeadSourceSavePayloadEntry,
  b: SpeedToLeadSourceSavePayloadEntry
): boolean {
  return a.typeEnabled === b.typeEnabled;
}

/** Return only the externalType entries whose `typeEnabled` flipped between
 *  previous and current. Untouched buckets are omitted from the payload —
 *  the backend's "preserve omitted" rule keeps their server state intact. */
function changedSourceEntries(
  prev: SpeedToLeadSourceSavePayloadEntry[],
  next: SpeedToLeadSourceSavePayloadEntry[]
): SpeedToLeadSourceSavePayloadEntry[] {
  const prevByType = new Map(prev.map((e) => [e.externalType, e]));
  const changed: SpeedToLeadSourceSavePayloadEntry[] = [];
  for (const entry of next) {
    const before = prevByType.get(entry.externalType);
    if (!before || !sourceEntriesEqual(before, entry)) {
      changed.push(entry);
    }
  }
  return changed;
}

/** Compute only the reach-out blocks that changed between `previous` and
 *  `current`. Empty result means nothing to save. */
function computeChangedReachOut(
  previous: SpeedToLead,
  current: SpeedToLead,
  groups: LeadSourceGroup[]
): ReachOutAndFollowupsSavePayloadBlock {
  const block: ReachOutAndFollowupsSavePayloadBlock = {};

  const prevStl = uiStlBlock(previous);
  const nextStl = uiStlBlock(current);
  if (!shallowEqualStl(prevStl, nextStl)) {
    block.stl = nextStl;
  }

  const prevNudge = uiSilenceNudgeBlock(previous);
  const nextNudge = uiSilenceNudgeBlock(current);
  if (!shallowEqualSilenceNudge(prevNudge, nextNudge)) {
    block.silenceNudge = nextNudge;
  }

  const prevSources = uiSpeedToLeadSourcesBlock(previous, groups);
  const nextSources = uiSpeedToLeadSourcesBlock(current, groups);
  const changedSources = changedSourceEntries(prevSources, nextSources);
  if (changedSources.length > 0) {
    // Send ONLY the externalType entries that actually changed — buckets
    // the user didn't touch are omitted so the backend's "preserve omitted"
    // rule keeps them as-is.
    block.speedToLeadSources = changedSources;
  }

  const prevFu = uiFollowUpBlock(previous);
  const nextFu = uiFollowUpBlock(current);
  if (!equalFollowUp(prevFu, nextFu)) {
    block.followUp = nextFu;
  }

  return block;
}

function wrapPayload(
  tenancy: { enterpriseId: string; teamId: string },
  block: ReachOutAndFollowupsSavePayloadBlock
): AgentConfigSavePayload {
  return {
    enterpriseId: tenancy.enterpriseId,
    teamId: tenancy.teamId,
    entityConfig: {
      sales: {
        reachOutAndFollowups: block,
      },
    },
  };
}

/** Build a save payload (wrapped in the agent-config envelope) containing
 *  only the reach-out blocks that changed between `previous` and `current`.
 *  Backend deep-merges, so untouched blocks and other entityConfig roots
 *  (ignoreAniNumbers, sales.policies, service.policies) stay intact. */
export function diffBlocks(
  tenancy: { enterpriseId: string; teamId: string },
  previous: SpeedToLead,
  current: SpeedToLead,
  groups: LeadSourceGroup[]
): AgentConfigSavePayload {
  return wrapPayload(tenancy, computeChangedReachOut(previous, current, groups));
}

/** True when the diff payload would carry no actual reach-out blocks. The
 *  save layer skips the POST in that case. */
export function hasBlockChanges(payload: AgentConfigSavePayload): boolean {
  const block = payload.entityConfig?.sales?.reachOutAndFollowups;
  if (!block) return false;
  return (
    block.stl !== undefined ||
    block.silenceNudge !== undefined ||
    block.speedToLeadSources !== undefined ||
    block.followUp !== undefined
  );
}

/** Build a save payload that always includes all four reach-out blocks.
 *  Used on the first save (no prior snapshot to diff against) so the
 *  backend gets a complete picture for this subtree. */
export function buildFullPayload(
  tenancy: { enterpriseId: string; teamId: string },
  current: SpeedToLead,
  groups: LeadSourceGroup[]
): AgentConfigSavePayload {
  return wrapPayload(tenancy, {
    stl: uiStlBlock(current),
    silenceNudge: uiSilenceNudgeBlock(current),
    speedToLeadSources: uiSpeedToLeadSourcesBlock(current, groups),
    followUp: uiFollowUpBlock(current),
  });
}
