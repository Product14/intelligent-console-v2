'use client';

import { useEffect, useRef, useState } from 'react';
import { Check as CheckIcon, Copy, Lock, Trash2 } from 'lucide-react';
import { api } from '@/services/settings';
import type {
  LeadSourceGroup,
  LeadTypeMode,
  LeadTypeSelection,
  SpeedToLead as STL,
  STLChannel,
  STLNudgeChannel,
  STLTouchpoint,
} from '@/services/settings/types';
import { cn } from '@/lib/settings/cn';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { useConsoleContext } from '@/lib/settings/bridge/console-bridge-provider';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  FeatureSwitch,
  FormRow,
  NumberInput,
  SegmentedControl,
} from '@/components/settings/agents/policies/policy-form-bits';
import { TimePicker } from '@/components/settings/ui/time-picker';

const FIRST_TOUCH_OPTIONS: { value: STLChannel; label: string }[] = [
  { value: 'sms', label: 'SMS' },
  { value: 'call', label: 'Call' },
];

const NUDGE_OPTIONS: { value: STLNudgeChannel; label: string }[] = [
  { value: 'sms', label: 'SMS' },
  { value: 'call', label: 'Call' },
  { value: 'none', label: 'No nudge' },
];

const LEAD_TYPE_MODE_OPTIONS: { value: LeadTypeMode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'customize', label: 'Customize' },
];

/** True when the overall lead-type + sources state is shippable:
 *  - At least one externalType is enabled.
 *  - In customize mode, at least one source is selected.
 *  - In all mode, the shared available source list isn't empty. */
function isLeadTypeSelectionValid(
  leadTypes: LeadTypeSelection[] | undefined,
  sourceMode: LeadTypeMode,
  selectedSources: string[],
  availableSources: string[]
): boolean {
  const anyEnabled = !!leadTypes?.some((lt) => lt.enabled);
  if (!anyEnabled) return false;
  if (sourceMode === 'customize') return selectedSources.length > 0;
  return availableSources.length > 0;
}

/** Union of source names across the enabled externalTypes' groups.
 *  De-duplicated in insertion order. Drives the picker's available list. */
function collectAvailableSources(
  groups: LeadSourceGroup[],
  leadTypes: LeadTypeSelection[]
): string[] {
  const enabled = new Set(
    leadTypes.filter((lt) => lt.enabled).map((lt) => lt.externalType)
  );
  const out: string[] = [];
  for (const group of groups) {
    if (!enabled.has(group.id)) continue;
    for (const src of group.sources) {
      if (!out.includes(src.name)) out.push(src.name);
    }
  }
  return out;
}

export function SpeedToLeadForm({
  subStepId,
  segment,
  saveSignal = 0,
  onValidityChange,
}: {
  subStepId: string;
  segment: string;
  saveSignal?: number;
  /** Live signal: false while Instant Reachout is on with zero lead types
   *  selected. Parent uses this to disable its Save button so the user
   *  can't fire a half-configured save. */
  onValidityChange?: (isValid: boolean) => void;
}) {
  const [stl, setStl] = useState<STL | null>(null);
  const [groups, setGroups] = useState<LeadSourceGroup[]>([]);
  const consoleCtx = useConsoleContext();
  // Forward email is derived from the rooftop's teamId so each rooftop has a
  // unique ingest address. Backend-stored `forwardEmail` is ignored for
  // display — teamId is the source of truth.
  const forwardEmail = `leads_${consoleCtx?.teamId ?? 'demo'}@thevini.ai`;
  useSubStep(subStepId, true);

  const stlRef = useRef<STL | null>(stl);
  stlRef.current = stl;
  // Snapshot of the last server-confirmed state. Save diffs against this to
  // send only changed blocks; on save success it advances to the new state
  // so subsequent saves diff against the latest server-confirmed values.
  const lastSavedRef = useRef<STL | null>(null);
  const groupsRef = useRef<LeadSourceGroup[]>(groups);
  groupsRef.current = groups;

  useEffect(() => {
    api.speedToLead.get(segment).then((data) => {
      setStl(data);
      lastSavedRef.current = data;
    });
    api.speedToLead.listSourceGroups().then(setGroups);
  }, [segment]);

  // Available sources derived from the union of sources under the enabled
  // externalType groups. Drives both the picker UI and the validity check.
  const availableSources = stl
    ? collectAvailableSources(groups, stl.leadTypes)
    : [];

  // Live validity — Instant Reachout being on without any lead type
  // enabled (or in customize mode with zero source picks) means the agent
  // has nothing to react to. Reported up to the page so the Save button
  // can disable itself. On unmount we report valid so a teardown race
  // doesn't strand Save in disabled state.
  const isValid =
    !stl ||
    !stl.enabled ||
    isLeadTypeSelectionValid(
      stl.leadTypes,
      stl.sourceMode,
      stl.selectedSources,
      availableSources
    );
  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);
  useEffect(() => () => onValidityChange?.(true), [onValidityChange]);

  useEffect(() => {
    if (saveSignal > 0 && stlRef.current) {
      const current = stlRef.current;
      // Defense in depth — even if the page's disabled state slips, refuse
      // to POST a half-configured Reachout.
      const currentAvailable = collectAvailableSources(
        groupsRef.current,
        current.leadTypes
      );
      if (
        current.enabled &&
        !isLeadTypeSelectionValid(
          current.leadTypes,
          current.sourceMode,
          current.selectedSources,
          currentAvailable
        )
      ) {
        return;
      }
      api.speedToLead
        .save(segment, current, {
          previous: lastSavedRef.current,
          groups: groupsRef.current,
        })
        .then((result) => {
          if (result.success) {
            // Advance the snapshot only on success — a failed save should
            // still let the next attempt see the user's edits as "dirty".
            lastSavedRef.current = result.saved ?? current;
          }
        });
    }
  }, [saveSignal, segment]);

  if (!stl) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-2xl border border-black/10 bg-black/[0.02]"
          />
        ))}
      </div>
    );
  }

  const update = (patch: Partial<STL>) =>
    setStl((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div className="space-y-3">
      <p className="mb-4 text-xs text-black-60">
        How the agent reaches new leads on the inbound sales segment.
      </p>

      <InstantReachoutCard
        enabled={stl.enabled}
        forwardEmail={forwardEmail}
        firstTouchChannel={stl.firstTouchChannel}
        silenceNudge={stl.silenceNudge}
        sourceGroups={groups}
        leadTypes={stl.leadTypes}
        sourceMode={stl.sourceMode}
        selectedSources={stl.selectedSources}
        availableSources={availableSources}
        onEnabledChange={(enabled) => update({ enabled })}
        onFirstTouchChange={(firstTouchChannel) => update({ firstTouchChannel })}
        onSilenceNudgeChange={(silenceNudge) => update({ silenceNudge })}
        onLeadTypesChange={(leadTypes) => update({ leadTypes })}
        onSourceModeChange={(sourceMode) => update({ sourceMode })}
        onSelectedSourcesChange={(selectedSources) =>
          update({ selectedSources })
        }
      />

      <FollowUpSequenceCard
        followUp={stl.followUp}
        onChange={(followUp) => update({ followUp })}
      />
    </div>
  );
}

// ---- Cards ---------------------------------------------------------------

interface InstantReachoutProps {
  enabled: boolean;
  forwardEmail: string;
  firstTouchChannel: STLChannel;
  silenceNudge: STL['silenceNudge'];
  sourceGroups: LeadSourceGroup[];
  leadTypes: LeadTypeSelection[];
  sourceMode: LeadTypeMode;
  selectedSources: string[];
  availableSources: string[];
  onEnabledChange(next: boolean): void;
  onFirstTouchChange(next: STLChannel): void;
  onSilenceNudgeChange(next: STL['silenceNudge']): void;
  onLeadTypesChange(next: LeadTypeSelection[]): void;
  onSourceModeChange(next: LeadTypeMode): void;
  onSelectedSourcesChange(next: string[]): void;
}

function InstantReachoutCard({
  enabled,
  forwardEmail,
  firstTouchChannel,
  silenceNudge,
  sourceGroups,
  leadTypes,
  sourceMode,
  selectedSources,
  availableSources,
  onEnabledChange,
  onFirstTouchChange,
  onSilenceNudgeChange,
  onLeadTypesChange,
  onSourceModeChange,
  onSelectedSourcesChange,
}: InstantReachoutProps) {
  const hasValidLeadType = isLeadTypeSelectionValid(
    leadTypes,
    sourceMode,
    selectedSources,
    availableSources
  );
  return (
    <PolicyCard
      title="Instant Reachout"
      description="The first touch the agent fires the moment a lead lands, and which lead streams it applies to."
      status={enabled ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Enable Instant Reachout"
          info="When on, the agent reaches every new lead automatically using the channel chosen below."
          control={
            <FeatureSwitch enabled={enabled} onChange={onEnabledChange} />
          }
        />

        {enabled && (
          <>
            <FormRow
              label="Forward leads to"
              info="Point your CRM / IMS lead-forwarding rules at this address. Any email arriving here is parsed into a new lead the agent reacts to."
              control={
                <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
                  <span className="truncate text-sm text-black-60">{forwardEmail}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(forwardEmail)}
                    className="text-black-40 hover:text-blue-light"
                    aria-label="Copy email"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              }
            />
            <FormRow
              label="First touch channel"
              info="The channel used to reach a new lead for the very first contact."
              control={
                <SegmentedControl
                  value={firstTouchChannel}
                  options={FIRST_TOUCH_OPTIONS}
                  onChange={onFirstTouchChange}
                />
              }
            />
            <FormRow
              label="Silence nudge"
              info="If a lead replies to the first touch but then goes quiet, the agent sends one nudge after the delay below. Fires once; if still silent, the lead rolls into the follow-up sequence."
              control={
                <SegmentedControl
                  value={silenceNudge.channel}
                  options={NUDGE_OPTIONS}
                  onChange={(channel) =>
                    onSilenceNudgeChange({ ...silenceNudge, channel })
                  }
                />
              }
            />
            {silenceNudge.channel !== 'none' && (
              <FormRow
                label="Nudge delay"
                subtitle="How long to wait before firing the silence nudge."
                control={
                  <NumberInput
                    value={silenceNudge.delayMinutes}
                    onChange={(v) =>
                      onSilenceNudgeChange({
                        ...silenceNudge,
                        delayMinutes: Math.max(0, v ?? 0),
                      })
                    }
                    min={0}
                    max={1440}
                    suffix="minutes"
                  />
                }
              />
            )}
            <FormRow
              label="Eligible lead types"
              required
              fullWidthControl
              info="Toggle each lead type on, then choose whether the agent qualifies all sources or a custom subset. The sources picker below is shared across every enabled lead type."
              error={
                hasValidLeadType
                  ? undefined
                  : 'Enable at least one lead type, and (when customizing) select at least one source.'
              }
              control={
                <LeadTypePicker
                  groups={sourceGroups}
                  leadTypes={leadTypes}
                  sourceMode={sourceMode}
                  selectedSources={selectedSources}
                  availableSources={availableSources}
                  onLeadTypesChange={onLeadTypesChange}
                  onSourceModeChange={onSourceModeChange}
                  onSelectedSourcesChange={onSelectedSourcesChange}
                />
              }
            />
          </>
        )}
      </div>
    </PolicyCard>
  );
}

// Two-part picker:
//   1) A flat list of externalType rows, each a single toggle.
//   2) Below it, ONE shared Sources section (mode + checkboxes) that
//      applies across every enabled externalType. The available source
//      list is the union of sources under the enabled externalTypes,
//      deduped by name. The Sources section is hidden when no
//      externalType is enabled (nothing to pick from).
function LeadTypePicker({
  groups,
  leadTypes,
  sourceMode,
  selectedSources,
  availableSources,
  onLeadTypesChange,
  onSourceModeChange,
  onSelectedSourcesChange,
}: {
  groups: LeadSourceGroup[];
  leadTypes: LeadTypeSelection[];
  sourceMode: LeadTypeMode;
  selectedSources: string[];
  availableSources: string[];
  onLeadTypesChange(next: LeadTypeSelection[]): void;
  onSourceModeChange(next: LeadTypeMode): void;
  onSelectedSourcesChange(next: string[]): void;
}) {
  if (!groups.length) {
    return (
      <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-6 text-center text-sm text-black-40">
        No lead types available.
      </div>
    );
  }

  const enabledFor = (externalType: string): boolean =>
    !!leadTypes.find((lt) => lt.externalType === externalType)?.enabled;

  const toggleType = (externalType: string, enabled: boolean) => {
    const existing = leadTypes.find((lt) => lt.externalType === externalType);
    if (existing) {
      onLeadTypesChange(
        leadTypes.map((lt) =>
          lt.externalType === externalType ? { ...lt, enabled } : lt
        )
      );
    } else {
      onLeadTypesChange([...leadTypes, { externalType, enabled }]);
    }
  };

  const toggleSource = (name: string) => {
    onSelectedSourcesChange(
      selectedSources.includes(name)
        ? selectedSources.filter((n) => n !== name)
        : [...selectedSources, name]
    );
  };

  const anyEnabled = leadTypes.some((lt) => lt.enabled);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {groups.map((group) => {
          const on = enabledFor(group.id);
          return (
            <div
              key={group.id}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3"
            >
              <div className="text-sm font-medium text-black-80">
                {group.label}
              </div>
              <FeatureSwitch
                enabled={on}
                onChange={(next) => toggleType(group.id, next)}
              />
            </div>
          );
        })}
      </div>

      {anyEnabled && (
        <div className="space-y-3 rounded-xl border border-black/10 bg-black/[0.015] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-black-80">Sources</div>
              <div className="text-xs text-black-40">
                {sourceMode === 'all'
                  ? 'All sources from the enabled lead types qualify.'
                  : 'Pick the sources the agent should react to. Applies across every enabled lead type.'}
              </div>
            </div>
            <SegmentedControl
              size="sm"
              value={sourceMode}
              options={LEAD_TYPE_MODE_OPTIONS}
              onChange={onSourceModeChange}
            />
          </div>

          {availableSources.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/10 px-3 py-3 text-xs text-black-40">
              No sources available under the enabled lead types.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {availableSources.map((name) => {
                const isAll = sourceMode === 'all';
                const checked = isAll || selectedSources.includes(name);
                return (
                  <li
                    key={name}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5',
                      !isAll && 'hover:border-black/10 hover:bg-white'
                    )}
                  >
                    <SourceCheckbox
                      checked={checked}
                      disabled={isAll}
                      onChange={() => !isAll && toggleSource(name)}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        isAll ? 'text-black-40' : 'text-black-80'
                      )}
                    >
                      {name}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SourceCheckbox({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange(next: boolean): void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
        checked
          ? 'border-blue-light bg-blue-light text-white'
          : 'border-black/20 bg-white',
        disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
      )}
    >
      {checked ? <CheckIcon className="h-3 w-3" /> : null}
    </button>
  );
}

interface FollowUpSequenceCardProps {
  followUp: STL['followUp'];
  onChange(next: STL['followUp']): void;
}

function FollowUpSequenceCard({ followUp, onChange }: FollowUpSequenceCardProps) {
  const update = (patch: Partial<STL['followUp']>) =>
    onChange({ ...followUp, ...patch });

  return (
    <PolicyCard
      title="Follow-up sequence"
      description="Multi-day touches if a lead doesn't engage. Day 1 is handled by Instant Reachout, so this sequence starts at Day 2."
      status={followUp.enabled ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Run a follow-up sequence"
          info="When on, the agent sends additional touches on the days, times, and channels configured below."
          control={
            <FeatureSwitch
              enabled={followUp.enabled}
              onChange={(enabled) => update({ enabled })}
            />
          }
        />

        {followUp.enabled && (
          <FormRow
            label="Touchpoints"
            fullWidthControl
            info="Each row is one touch. The cadence is set centrally and isn't editable here."
            control={
              <div className="space-y-2">
                {followUp.touchpoints.map((tp) => (
                  <TouchpointRow key={tp.id} touchpoint={tp} />
                ))}
              </div>
            }
          />
        )}
      </div>
    </PolicyCard>
  );
}

// ---- Touchpoint row -----------------------------------------------------
//
// The cadence is read-only in this surface — controls keep their original
// look (day input + TimePicker + SMS/Call segmented control + a trailing
// icon button) but all interaction is disabled. The trailing icon swaps
// from a trash to a padlock on hover to signal "locked, not removable".

function TouchpointRow({ touchpoint }: { touchpoint: STLTouchpoint }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-black/10 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-black-40">Day</label>
        <input
          type="number"
          min={2}
          value={touchpoint.day}
          readOnly
          disabled
          className="w-16 cursor-not-allowed rounded-md border border-black/10 px-2 py-1 text-sm font-medium text-black-dark outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-black-40">Time</label>
        <TimePicker value={touchpoint.time} onChange={() => {}} disabled />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <label className="text-xs font-medium text-black-40">Channel</label>
        <SegmentedControl
          size="sm"
          value={touchpoint.channel}
          options={FIRST_TOUCH_OPTIONS}
          onChange={() => {}}
          disabled
        />
        <span
          aria-label="Locked — cadence isn't editable here"
          className="group inline-flex cursor-not-allowed rounded-md border border-black/10 p-1.5 text-black-40"
        >
          <Trash2 className="h-4 w-4 group-hover:hidden" />
          <Lock className="hidden h-4 w-4 group-hover:inline" />
        </span>
      </div>
    </div>
  );
}
