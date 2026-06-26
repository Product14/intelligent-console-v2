'use client';

/**
 * Polished departments configuration form.
 *
 * - 4 default departments (Sales, Service, Parts, Finance), un-removable; name locked.
 * - Custom departments can be added/removed; name editable.
 * - Per department: country code + phone, IVR yes/no, optional email, address.
 * - Address and working hours can either be set per department or inherited
 *   from any other department ("Same as Sales", "Same as Service", …).
 *   Sales is always the base — it can never inherit.
 * - Hours support per-day custom monthly recurrence (e.g. "last Sunday only").
 * - Editable rooftop timezone via a searchable combobox. (TEMPORARILY DISABLED — see TIMEZONE comments below.)
 * - Autosave + explicit Save action.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { parsePhoneNumber } from 'libphonenumber-js';
import { api } from '@/services/settings';
import { useBridge, useConsoleContext } from '@/lib/settings/bridge/console-bridge-provider';
import type {
  DayKey,
  DayRecurrencePattern,
  DepartmentConfig,
  DepartmentKind,
  HolidayConfig,
  RooftopProfile,
} from '@/services/settings/types';
import type {
  RequestPayloadAvailabilityHours,
  RequestPayloadDayAvailability,
} from '@/types/settings/vini-config';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { LoadErrorState } from '@/components/settings/shell/states';
import { Input, DsButton } from '@/components/settings/ds';
import Toggle from '@/vendor-settings/design-system/toggle/toggle';
import TimeInput from '@/components/settings/shared/time-input';
import { TimeUtils, weekDays } from '@/lib/settings/time-utils';
import { AddressField } from '@/components/settings/ui/address-field';
import { FloatingPanel } from '@/components/settings/ui/floating-panel';
import { GatedControl } from '@/components/settings/ui/gated-control';
import { PhoneNumberField } from '@/components/settings/ui/phone-number-field';
import { buildGatingMessage, getMissingMandatoryFields } from '@/lib/settings/dept-validation';
import {
  hasValidContactFormat,
  validateEmail,
} from '@/lib/settings/field-validation';
import type { ParsedAddress } from '@/lib/settings/google-places';
import { HolidaysSection } from './holidays-section';
import { AutofillBanner } from './autofill-banner';
import { AutofillLoader } from './autofill-loader';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_KEYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const WEEK_OPTIONS: Array<{ value: 1 | 2 | 3 | 4 | 'last'; label: string }> = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: 'last', label: 'Last' },
];

const KIND_BADGE: Record<DepartmentKind, string> = {
  sales: 'bg-blue-50 text-blue-700',
  service: 'bg-emerald-50 text-emerald-700',
  parts: 'bg-amber-50 text-amber-700',
  finance: 'bg-violet-50 text-violet-700',
  custom: 'bg-slate-100 text-slate-700',
};

/** Sentinel used as `addressInheritFrom` when a department inherits the
 *  rooftop-level address (instead of another department's). */
const ROOFTOP_ADDRESS_ID = 'rooftop';

// Service department capability facts the dealership offers. The agent
// communicates these as truths to callers ("Yes, we offer a loaner").
// These are dealership facts, not agent behavior rules.
const SERVICE_CAPABILITY_ITEMS: ReadonlyArray<{
  id: string;
  label: string;
  desc: string;
}> = [
  {
    id: 'loaner',
    label: 'Loaner Vehicle',
    desc: 'Loaner car while the customer’s vehicle is being serviced.',
  },
  {
    id: 'pickup-drop',
    label: 'Pickup & Drop',
    desc: 'Pickup and drop-off for the customer’s vehicle.',
  },
  {
    id: 'drop-box',
    label: 'Drop Box',
    desc: 'After-hours key drop-off.',
  },
  {
    id: 'roadside',
    label: 'Roadside Assistance',
    desc: 'Roadside assistance for service customers.',
  },
];

// Curated set — covers ~95% of dealer cases without a 400-entry list.
const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'America/Los_Angeles', label: 'Pacific Time — Los Angeles' },
  { value: 'America/Denver', label: 'Mountain Time — Denver' },
  { value: 'America/Phoenix', label: 'Mountain Time (no DST) — Phoenix' },
  { value: 'America/Chicago', label: 'Central Time — Chicago' },
  { value: 'America/New_York', label: 'Eastern Time — New York' },
  { value: 'America/Anchorage', label: 'Alaska Time — Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time — Honolulu' },
  { value: 'America/Toronto', label: 'Eastern Time — Toronto' },
  { value: 'America/Vancouver', label: 'Pacific Time — Vancouver' },
  { value: 'America/Mexico_City', label: 'Central Time — Mexico City' },
  { value: 'Europe/London', label: 'GMT/BST — London' },
  { value: 'Europe/Berlin', label: 'CET — Berlin' },
  { value: 'Asia/Kolkata', label: 'IST — Kolkata' },
  { value: 'Asia/Dubai', label: 'GST — Dubai' },
  { value: 'Asia/Singapore', label: 'SGT — Singapore' },
  { value: 'Asia/Tokyo', label: 'JST — Tokyo' },
  { value: 'Australia/Sydney', label: 'AEDT — Sydney' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function newDayHours(open: boolean): RequestPayloadDayAvailability {
  return {
    isAvailable: open,
    startTime: '09:00',
    endTime: '18:00',
    isTransferAvailable: open,
  };
}

function defaultOperatingHours(): RequestPayloadAvailabilityHours {
  return {
    monday: newDayHours(true),
    tuesday: newDayHours(true),
    wednesday: newDayHours(true),
    thursday: newDayHours(true),
    friday: newDayHours(true),
    saturday: newDayHours(true),
    sunday: newDayHours(false),
  };
}

function formatTime12(t24: string): string {
  return TimeUtils.convertTo12HourString(t24).replace(/^0/, '');
}

function timezoneLabel(value: string): string {
  return TIMEZONE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function summarizeRecurrence(
  pattern: DayRecurrencePattern | undefined,
  dayLabel: string
): string | null {
  if (!pattern || !pattern.weeks?.length) return null;
  const ordered = [...pattern.weeks].sort((a, b) => {
    const order = (v: 1 | 2 | 3 | 4 | 'last') => (v === 'last' ? 5 : v);
    return order(a) - order(b);
  });
  const labels = ordered.map(
    (w) => WEEK_OPTIONS.find((opt) => opt.value === w)!.label.toLowerCase()
  );
  const joined =
    labels.length === 1
      ? labels[0]
      : labels.length === 2
        ? `${labels[0]} & ${labels[1]}`
        : `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
  return `${joined} ${dayLabel} of the month`;
}

/** Structured per-group representation of a weekly schedule. `days` is the
 *  human-readable day range (short for inline use, long for vertical). `time`
 *  is the open–close range, or 'Closed' for a closed-day group. */
interface HoursLine {
  daysShort: string;
  daysLong: string;
  time: string;
}

function buildHoursLines(
  hours: RequestPayloadAvailabilityHours,
  recurrence: DepartmentConfig['dayRecurrence']
): HoursLine[] {
  const labelShort = (k: DayKey) => k.slice(0, 3).replace(/^./, (c) => c.toUpperCase());
  const labelLong = (k: DayKey) => k.replace(/^./, (c) => c.toUpperCase());

  // Group consecutive open days with identical times. Closed days form their
  // own contiguous group(s) so they still surface in the summary.
  type Group =
    | { kind: 'open'; start: DayKey; end: DayKey; start24: string; end24: string }
    | { kind: 'closed'; start: DayKey; end: DayKey };

  const groups: Group[] = [];
  for (const day of DAY_KEYS) {
    const h = hours[day];
    const isAvailable = !!h?.isAvailable;
    const hasRecurrence = !!recurrence?.[day]?.weeks?.length;
    const last = groups[groups.length - 1];
    const lastIdx = last ? DAY_KEYS.indexOf(last.end) : -1;
    const curIdx = DAY_KEYS.indexOf(day);
    const adjacent = curIdx === lastIdx + 1;

    if (!isAvailable) {
      if (last && last.kind === 'closed' && adjacent) {
        last.end = day;
      } else {
        groups.push({ kind: 'closed', start: day, end: day });
      }
      continue;
    }

    if (hasRecurrence) {
      groups.push({ kind: 'open', start: day, end: day, start24: h.startTime, end24: h.endTime });
      continue;
    }

    const lastRecurrence =
      last && last.kind === 'open'
        ? !!recurrence?.[last.start]?.weeks?.length || !!recurrence?.[last.end]?.weeks?.length
        : true;

    if (
      last &&
      last.kind === 'open' &&
      !lastRecurrence &&
      adjacent &&
      last.start24 === h.startTime &&
      last.end24 === h.endTime
    ) {
      last.end = day;
    } else {
      groups.push({ kind: 'open', start: day, end: day, start24: h.startTime, end24: h.endTime });
    }
  }

  return groups.map((g) => {
    if (g.kind === 'closed') {
      return {
        daysShort: g.start === g.end ? labelShort(g.start) : `${labelShort(g.start)}–${labelShort(g.end)}`,
        daysLong: g.start === g.end ? labelLong(g.start) : `${labelLong(g.start)} – ${labelLong(g.end)}`,
        time: 'Closed',
      };
    }
    const timeRange = `${formatTime12(g.start24)} – ${formatTime12(g.end24)}`;
    if (g.start === g.end) {
      const recLabelShort = summarizeRecurrence(recurrence?.[g.start], labelShort(g.start));
      const recLabelLong = summarizeRecurrence(recurrence?.[g.start], labelLong(g.start));
      return {
        daysShort: recLabelShort ?? labelShort(g.start),
        daysLong: recLabelLong ?? labelLong(g.start),
        time: timeRange,
      };
    }
    return {
      daysShort: `${labelShort(g.start)}–${labelShort(g.end)}`,
      daysLong: `${labelLong(g.start)} – ${labelLong(g.end)}`,
      time: timeRange,
    };
  });
}

/** Inline single-line summary — used in the collapsed card header. */
function summarizeWeek(
  hours: RequestPayloadAvailabilityHours,
  recurrence: DepartmentConfig['dayRecurrence']
): string {
  const openDays = DAY_KEYS.filter((d) => hours[d]?.isAvailable);
  if (openDays.length === 0) return 'Closed all week';
  return buildHoursLines(hours, recurrence)
    .filter((l) => l.time !== 'Closed') // collapsed header skips closed days for brevity
    .map((l) => `${l.daysShort} ${l.time}`)
    .join(' · ');
}

/** Vertical multi-line summary used in the expanded card body — each group
 *  on its own row, "Day Range: time" format. */
function HoursVertical({
  hours,
  recurrence,
}: {
  hours: RequestPayloadAvailabilityHours;
  recurrence: DepartmentConfig['dayRecurrence'];
}) {
  const lines = buildHoursLines(hours, recurrence);
  if (lines.length === 0) {
    return <div className="text-sm text-black-60">Closed all week</div>;
  }
  return (
    <div className="space-y-1">
      {lines.map((l, i) => (
        <div key={i} className="text-sm leading-5">
          <span className="font-semibold text-black-dark">{l.daysLong}:</span>{' '}
          <span className={l.time === 'Closed' ? 'text-black-60' : 'text-black-80'}>
            {l.time}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Resolve the dept whose hours/address this one mirrors. Walks chains
 *  defensively (a -> b -> c) and breaks cycles. The rooftop sentinel
 *  (`ROOFTOP_ADDRESS_ID`) is not a department — it terminates the walk and
 *  callers handle it separately. */
function resolveSource(
  depts: DepartmentConfig[],
  startId: string | undefined,
  field: 'hoursInheritFrom' | 'addressInheritFrom'
): DepartmentConfig | null {
  if (!startId || startId === ROOFTOP_ADDRESS_ID) return null;
  const seen = new Set<string>();
  let cursor = depts.find((d) => d.id === startId);
  while (
    cursor &&
    cursor[field] &&
    cursor[field] !== ROOFTOP_ADDRESS_ID &&
    !seen.has(cursor.id)
  ) {
    seen.add(cursor.id);
    cursor = depts.find((d) => d.id === cursor![field]);
  }
  return cursor ?? null;
}

/** True when the tenancy looks "never touched" — no holidays, no custom
 *  departments, and all 4 standard departments still hold the synthesised
 *  defaults (no phone / email / IVR / inheritance / per-day recurrence and
 *  either no address inheritance or the rooftop-address default the load
 *  effect injects). A single populated field breaks the gate, matching the
 *  product rule "if even one field is there, the autofill shall not trigger."
 *
 *  Operating hours are intentionally NOT checked: synthesised defaults and
 *  any future tenancy-saved overrides both flow through this code, and we
 *  don't want a user who manually adjusted hours-only to keep seeing the
 *  autofill prompt forever — at that point the form is no longer empty. */
function isTenancyBlank(
  depts: DepartmentConfig[],
  holidays: HolidayConfig[]
): boolean {
  if (holidays.length > 0) return false;
  if (depts.some((d) => d.isCustom)) return false;
  const standards = depts.filter((d) => !d.isCustom);
  if (standards.length !== 4) return false;
  return standards.every(
    (d) =>
      !d.phone?.trim() &&
      !d.email?.trim() &&
      typeof d.isIvr !== 'boolean' &&
      !d.address &&
      (!d.addressInheritFrom ||
        d.addressInheritFrom === ROOFTOP_ADDRESS_ID) &&
      !d.hoursInheritFrom &&
      !d.dayRecurrence
  );
}

// ---------------------------------------------------------------------------
// Top-level component
// ---------------------------------------------------------------------------

export function DepartmentsForm({ subStepId }: { subStepId: string }) {
  const [depts, setDepts] = useState<DepartmentConfig[] | null>(null);
  const [holidays, setHolidays] = useState<HolidayConfig[] | null>(null);
  // TIMEZONE (disabled): rooftop profile state — only used to seed/save the
  // timezone picker. Re-enable when timezone UI is restored.
  // const [profile, setProfile] = useState<RooftopProfile | null>(null);
  // const [savedTimezone, setSavedTimezone] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Surfaces a full-page error UI when any of the load fetches fail. Bumping
  // reloadKey via Retry refires the initial-load effect.
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const savedFlash = useRef<ReturnType<typeof setTimeout>>();

  // Autofill-with-AI state. The banner appears when the backend returns a
  // fully-blank tenancy on load; clicking it scrapes the rooftop website,
  // populates the form locally, and leaves the user to Save explicitly.
  const [profile, setProfile] = useState<RooftopProfile | null>(null);
  // True after the profile fetch settles in either direction. Used so the
  // banner can distinguish "still loading" from "no website on file" without
  // gating on success.
  const [profileSettled, setProfileSettled] = useState(false);
  const [autofillDismissed, setAutofillDismissed] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  // Increments on every Autofill click — if the tenancy switches between
  // request fire and response, the response is ignored (the load effect's
  // reset has already cleared state).
  const autofillReqRef = useRef(0);

  // Default departments (sales/service/parts/finance) are auto-synthesised
  // when the API doesn't return them — allow saving with empty contact info
  // on those, since the user never supplied it. Custom depts the operator
  // added must still carry a name + phone. Filled fields must also pass
  // format validation (phone shape per country, email regex) — empty values
  // pass validators so the mandatory-field gate stays the sole gate for
  // presence.
  // Name collisions block save too — the inline error inside each card
  // explains which one; isValid is a coarser "anything wrong anywhere?"
  // gate. Case-insensitive match across the list.
  const hasDeptNameCollision = useMemo(() => {
    if (!depts) return false;
    const seen = new Set<string>();
    for (const d of depts) {
      const key = d.name.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  }, [depts]);

  const hasHolidayNameCollision = useMemo(() => {
    if (!holidays) return false;
    const seen = new Set<string>();
    for (const h of holidays) {
      const key = h.name.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  }, [holidays]);

  const isValid =
    !!depts &&
    depts.length > 0 &&
    !hasDeptNameCollision &&
    !hasHolidayNameCollision &&
    depts.every((d) => {
      const presenceOk = d.isCustom
        ? d.name.trim() && d.phone.trim()
        : !!d.name.trim();
      return presenceOk && hasValidContactFormat(d);
    });
  // useSubStep used to receive autosave status pings; with autosave gone we
  // just keep the validity contract. reportSaving / reportSaved are unused.
  useSubStep(subStepId, isValid);

  // Tenancy may not be ready on first render in embedded mode — the bridge
  // hydrates from postMessage AFTER this component's effects run. Gate the
  // load so the API call only fires once enterpriseId / teamId are known.
  // Also refetch when the IDs change (operator switched enterprise via the
  // iframe URL) — depending on `tenancyReady` alone would leave the form
  // showing the previous tenancy's data because the boolean stays true.
  //
  // ALSO gate on bridge auth-readiness. The URL provides tenancy IDs as soon
  // as the iframe loads, but `authKey`/`deviceId` only arrive via the
  // `console:init` postMessage from Console. Firing API calls before that
  // arrives produces a bearer with empty credentials → 401. Wait for the
  // bridge to be `ready` (embedded mode after console:init) or `stub`
  // (standalone dev — uses STUB_CONTEXT which has real test creds).
  const consoleCtx = useConsoleContext();
  const { status: bridgeStatus } = useBridge();
  const enterpriseId = consoleCtx?.enterpriseId;
  const teamId = consoleCtx?.teamId;
  const authReady = bridgeStatus === 'ready' || bridgeStatus === 'stub';

  useEffect(() => {
    if (!enterpriseId || !teamId || !authReady) return;
    let cancelled = false;
    // Reset state on every load attempt — show skeleton again while the
    // next fetch runs, and clear any dirty/error state left over from the
    // previous tenancy.
    setFetchError(null);
    setDepts(null);
    setHolidays(null);
    // TIMEZONE (disabled): setProfile(null) reset — paired with the GET below.
    // setProfile(null);
    setExpanded({});
    setIsDirty(false);
    setSaveState('idle');
    setSaveError(null);
    // Autofill UI is tenancy-scoped — clear it whenever the load fires again.
    setProfile(null);
    setProfileSettled(false);
    setAutofillDismissed(false);
    setAutofillError(null);
    setAutofillLoading(false);
    Promise.all([
      api.departments.list(),
      api.holidays.list(),
      // TIMEZONE (disabled): rooftop profile GET — only used to seed timezone.
      // Restore as `api.rooftop.getProfile(),` (with the destructured `p` and
      // `setProfile(p)` / `setSavedTimezone(p.timezone)` below) when the
      // timezone UI is restored.
      // api.rooftop.getProfile(),
    ])
      .then(([list, hs]) => {
        if (cancelled) return;
        // Default any department with no explicit address and no inheritance
        // selection to inherit from the rooftop. Operators get one clean default
        // out of the box without having to set every department by hand.
        const normalized = list.map((d) =>
          !d.address && !d.addressInheritFrom
            ? { ...d, addressInheritFrom: ROOFTOP_ADDRESS_ID }
            : d
        );
        setDepts(normalized);
        const first = normalized[0];
        if (first) setExpanded({ [first.id]: true });
        setHolidays(hs);
        // TIMEZONE (disabled): setProfile(p) + setSavedTimezone(p.timezone)
        // — bring back when restoring the timezone UI.
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error('[DepartmentsForm] load failed', err);
        setFetchError(err instanceof Error ? err : new Error('Failed to load'));
      });
    return () => {
      cancelled = true;
    };
  }, [enterpriseId, teamId, authReady, reloadKey]);

  // Rooftop profile fetch — runs in parallel to the depts/holidays load, but
  // doesn't gate the page render. The only consumer is the autofill banner
  // (read-only website URL display); a profile-fetch failure is non-fatal,
  // so it sets profileSettled=true with a null profile and the banner shows
  // its "Add a website to your rooftop profile" helper.
  //
  // Gated on `authReady` for the same reason as the main load effect — see
  // the comment block above. Without this, `get-team-details` fires with
  // empty authKey/deviceId placeholders and 401s.
  useEffect(() => {
    if (!enterpriseId || !teamId || !authReady) return;
    let cancelled = false;
    api.rooftop
      .getProfile()
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn('[DepartmentsForm] rooftop profile fetch failed', err);
      })
      .finally(() => {
        if (cancelled) return;
        setProfileSettled(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enterpriseId, teamId, authReady, reloadKey]);

  // Stage changes locally — never persists to the server. Only the Save button
  // (saveNow) commits. Editing any field flips the screen into a dirty state.
  const persist = (next: DepartmentConfig[]) => {
    setDepts(next);
    setIsDirty(true);
    setSaveState('idle');
  };

  // Mirror of persist() for the holiday list — same dirty/idle bookkeeping.
  const persistHolidays = (next: HolidayConfig[]) => {
    setHolidays(next);
    setIsDirty(true);
    setSaveState('idle');
  };

  const saveNow = async () => {
    if (!depts || !holidays || !isDirty) return;
    setSaveState('saving');
    setSaveError(null);
    clearTimeout(savedFlash.current);
    try {
      // One POST for departments + holidays — see lib/adapters/departments-adapter.ts
      // for the wire shape. The mock-store writes inside viniConfig.save
      // double as a safety net for reload UX.
      const result = await api.viniConfig.save({ departments: depts, holidays });
      if (!result.success) {
        // Keep dirty state so the operator can retry; surface backend message
        // so they know WHY it failed instead of guessing.
        setSaveState('error');
        setSaveError(result.message || 'Save failed — please try again');
        return;
      }
      // TIMEZONE (disabled): the screen-level Save also flushed the partial
      // timezone update via api.rooftop.saveTimezone. Re-enable when the
      // timezone UI is restored.
      // if (profile && savedTimezone !== null && profile.timezone !== savedTimezone) {
      //   const tzResult = await api.rooftop.saveTimezone(
      //     profile.timezone,
      //     profile.rooftopName
      //   );
      //   if (!tzResult.success) {
      //     setSaveState('error');
      //     setSaveError(tzResult.message || 'Timezone update failed — please try again');
      //     return;
      //   }
      //   setSavedTimezone(profile.timezone);
      // }
      setIsDirty(false);
      // Newly-added custom depts have now been committed — clear the
      // _isNew flag so their name input collapses into the locked,
      // accordion-title-only view that matches standard depts.
      setDepts((prev) =>
        prev?.map((d) => (d._isNew ? { ...d, _isNew: false } : d)) ?? null
      );
      setSaveState('saved');
      savedFlash.current = setTimeout(() => setSaveState('idle'), 1800);
    } catch (err) {
      setSaveState('error');
      setSaveError(
        err instanceof Error ? err.message : 'Save failed — please try again'
      );
    }
  };

  /** Scrape the rooftop website and replace the form's blank initial state
   *  with the autofilled departments + holidays. Persistence still happens
   *  through the regular Save button — autofill only mutates local state. */
  const onAutofill = async () => {
    if (!profile?.websiteUrl) return;
    const reqId = ++autofillReqRef.current;
    setAutofillError(null);
    setAutofillLoading(true);
    const result = await api.viniConfig.autofill(profile.websiteUrl);
    // Tenancy switched mid-flight — drop the response; the load effect's
    // reset will have already cleared dependent state.
    if (autofillReqRef.current !== reqId) return;
    setAutofillLoading(false);
    if (!result.success || !result.departments || !result.holidays) {
      setAutofillError(
        result.message
          ? `Autofill failed: ${result.message}`
          : "Couldn't autofill — try again or fill manually."
      );
      return;
    }
    // Match the load effect: default any dept with no address and no
    // inheritance to inherit from the rooftop. Keeps the autofilled state
    // consistent with how a fresh load would look.
    const normalized = result.departments.map((d) =>
      !d.address && !d.addressInheritFrom
        ? { ...d, addressInheritFrom: ROOFTOP_ADDRESS_ID }
        : d
    );
    setDepts(normalized);
    setHolidays(result.holidays);
    // Expand the first dept so the operator can immediately verify the
    // autofilled values without a hunt.
    const first = normalized[0];
    if (first) setExpanded({ [first.id]: true });
    setIsDirty(true);
    setSaveState('idle');
    setSaveError(null);
    // Dismiss the banner — the tenancy is no longer blank by definition.
    setAutofillDismissed(true);
  };

  const updateDept = (id: string, patch: Partial<DepartmentConfig>) => {
    if (!depts) return;
    persist(depts.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const updateDay = (
    id: string,
    day: DayKey,
    patch: Partial<RequestPayloadDayAvailability>
  ) => {
    if (!depts) return;
    persist(
      depts.map((d) =>
        d.id === id
          ? {
              ...d,
              operatingHours: {
                ...d.operatingHours,
                [day]: { ...d.operatingHours[day], ...patch },
              },
            }
          : d
      )
    );
  };

  const updateDayRecurrence = (
    id: string,
    day: DayKey,
    pattern: DayRecurrencePattern | null
  ) => {
    if (!depts) return;
    persist(
      depts.map((d) => {
        if (d.id !== id) return d;
        const next = { ...(d.dayRecurrence ?? {}) };
        if (pattern && pattern.weeks.length > 0) next[day] = pattern;
        else delete next[day];
        return { ...d, dayRecurrence: next };
      })
    );
  };

  const addCustom = () => {
    if (!depts) return;
    const id = `custom-${Date.now()}`;
    const dept: DepartmentConfig = {
      id,
      kind: 'custom',
      name: '',
      isCustom: true,
      countryCode: '+1',
      phone: '',
      operatingHours: defaultOperatingHours(),
      // Default custom departments to share the rooftop's address.
      addressInheritFrom: ROOFTOP_ADDRESS_ID,
      // Marks the dept as "added in this session, not yet saved." Drives
      // the editable name input — once saved, the flag clears and the
      // name is locked (matching standard departments).
      _isNew: true,
    };
    persist([...depts, dept]);
    setExpanded((prev) => ({ ...prev, [id]: true }));
  };

  // TIMEZONE (disabled): staging handler for the rooftop-timezone picker.
  // Re-enable alongside the TimezoneStrip render below when timezone UI
  // comes back.
  // const saveTimezone = (tz: string) => {
  //   if (!profile || profile.timezone === tz) return;
  //   setProfile({ ...profile, timezone: tz });
  //   setIsDirty(true);
  //   setSaveState('idle');
  // };

  if (fetchError) {
    return <LoadErrorState onRetry={() => setReloadKey((k) => k + 1)} />;
  }

  // TIMEZONE (disabled): the loading gate previously also waited for
  // `!profile` since the timezone picker depended on it. Restore that
  // condition (`!depts || !profile || !holidays`) when re-enabling.
  if (!depts || !holidays) {
    return <DepartmentsFormSkeleton />;
  }

  // Show the autofill banner only when the tenancy is genuinely blank AND
  // the operator hasn't dismissed it this session. Suppressed while the
  // autofill request is in flight — the inline loader replaces the form
  // body, so showing the banner too would be redundant chrome.
  const showAutofillBanner =
    !autofillLoading &&
    !autofillDismissed &&
    isTenancyBlank(depts, holidays);

  return (
    <div className={showAutofillBanner ? 'pb-24' : undefined}>
      {/* TIMEZONE (disabled): rooftop timezone picker. Restore this line
          (and the saveTimezone handler / savedTimezone state / saveNow
          branch above) to re-enable the partial update flow. */}
      {/* <TimezoneStrip value={profile.timezone} onChange={saveTimezone} /> */}

      <div className="space-y-3">
        {depts.map((dept) => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            allDepts={depts}
            isOpen={!!expanded[dept.id]}
            onToggle={() =>
              setExpanded((p) => ({ ...p, [dept.id]: !p[dept.id] }))
            }
            onPatch={(patch) => updateDept(dept.id, patch)}
            onDayPatch={(day, patch) => updateDay(dept.id, day, patch)}
            onDayRecurrence={(day, pattern) =>
              updateDayRecurrence(dept.id, day, pattern)
            }
          />
        ))}
      </div>

      <div className="mt-5">
        <DsButton
          label="+ Add Department"
          type="bordered"
          size="AA"
          onClick={addCustom}
        />
      </div>

      <HolidaysSection
        holidays={holidays}
        allDepts={depts}
        onAdd={(h) => persistHolidays([...holidays, h])}
        onUpdate={(h) =>
          persistHolidays(holidays.map((x) => (x.id === h.id ? h : x)))
        }
        onDelete={(id) =>
          persistHolidays(holidays.filter((x) => x.id !== id))
        }
        onImport={(toAdd) => persistHolidays([...holidays, ...toAdd])}
      />

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-black/8 pt-5">
        <SaveStatus
          state={saveState}
          valid={isValid}
          isDirty={isDirty}
          errorMessage={saveError}
        />
        <DsButton
          label="Save changes"
          type="primary"
          size="AA"
          disabled={!isValid || !isDirty || saveState === 'saving'}
          isLoading={saveState === 'saving'}
          onClick={saveNow}
        />
      </div>

      {showAutofillBanner && (
        <AutofillBanner
          websiteUrl={profile?.websiteUrl ?? null}
          profileSettled={profileSettled}
          isLoading={autofillLoading}
          errorMessage={autofillError}
          onAutofill={onAutofill}
          onDismiss={() => setAutofillDismissed(true)}
        />
      )}
      {/* Full-viewport overlay — self-positions via `fixed inset-0`. Form
          stays mounted and visible through the frosted-glass backdrop. */}
      <AutofillLoader isOpen={autofillLoading} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Save status pill — reflects local dirty state; no autosave
// ---------------------------------------------------------------------------

function SaveStatus({
  state,
  valid,
  isDirty,
  errorMessage,
}: {
  state: 'idle' | 'saving' | 'saved' | 'error';
  valid: boolean;
  isDirty: boolean;
  errorMessage?: string | null;
}) {
  if (!valid) {
    return (
      <span className="text-xs font-medium text-red-600">
        Fix the highlighted fields to save
      </span>
    );
  }
  if (state === 'saving') {
    return <span className="text-xs text-black-60">Saving…</span>;
  }
  if (state === 'saved') {
    return <span className="text-xs font-medium text-emerald-600">Saved ✓</span>;
  }
  if (state === 'error') {
    // Surface the backend's actual error message so the operator knows what
    // to fix instead of seeing a silent no-op.
    return (
      <span
        className="max-w-[420px] truncate text-xs font-medium text-red-600"
        title={errorMessage || ''}
      >
        {errorMessage || 'Save failed — please try again'}
      </span>
    );
  }
  if (isDirty) {
    return <span className="text-xs font-medium text-amber-700">Unsaved changes</span>;
  }
  return <span className="text-xs text-black-40">All changes saved</span>;
}

// ---------------------------------------------------------------------------
// Timezone strip with searchable combobox
// ---------------------------------------------------------------------------

function TimezoneStrip({
  value,
  onChange,
}: {
  value: string;
  onChange: (tz: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center justify-between rounded-xl border border-black/8 bg-gray-light px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black-60 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <ClockIcon />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-black-40">
            Rooftop timezone
          </div>
          {editing ? (
            <div className="mt-1">
              <SearchableTimezone
                value={value}
                onChange={(tz) => {
                  onChange(tz);
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <div className="mt-0.5 truncate text-sm font-medium text-black-dark">
              {timezoneLabel(value)}
            </div>
          )}
        </div>
      </div>
      {!editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-black-dark underline-offset-4 hover:underline"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function SearchableTimezone({
  value,
  onChange,
  onCancel,
}: {
  value: string;
  onChange: (tz: string) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const lower = query.toLowerCase();
  const filtered = useMemo(
    () =>
      TIMEZONE_OPTIONS.filter(
        (o) =>
          o.label.toLowerCase().includes(lower) ||
          o.value.toLowerCase().includes(lower)
      ),
    [lower]
  );

  return (
    <div className="w-[320px]">
      <input
        ref={inputRef}
        autoFocus
        value={query}
        placeholder={timezoneLabel(value)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black-dark outline-none focus:border-black/40"
      />
      <FloatingPanel
        anchorRef={inputRef}
        open={open}
        onClose={onCancel}
        placement="bottom-start"
        width={320}
        className="max-h-72 overflow-auto rounded-md border border-black/10 bg-white py-1 shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
      >
        {filtered.length === 0 ? (
          <div className="px-3 py-2 text-xs text-black-40">
            No timezone matches “{query}”
          </div>
        ) : (
          filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-light ${
                opt.value === value ? 'text-black-dark' : 'text-black-80'
              }`}
            >
              <span>{opt.label}</span>
              {opt.value === value && (
                <span className="text-black-40">
                  <CheckIcon />
                </span>
              )}
            </button>
          ))
        )}
      </FloatingPanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department card
// ---------------------------------------------------------------------------

function DepartmentCard({
  dept,
  allDepts,
  isOpen,
  onToggle,
  onPatch,
  onDayPatch,
  onDayRecurrence,
}: {
  dept: DepartmentConfig;
  allDepts: DepartmentConfig[];
  isOpen: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<DepartmentConfig>) => void;
  onDayPatch: (day: DayKey, patch: Partial<RequestPayloadDayAvailability>) => void;
  onDayRecurrence: (day: DayKey, pattern: DayRecurrencePattern | null) => void;
}) {
  const isSales = dept.kind === 'sales';
  const displayName = dept.name || (dept.isCustom ? 'Untitled department' : '');
  const [hoursEditOpen, setHoursEditOpen] = useState(false);
  // Email's inline error is hidden while the field is focused — the
  // PhoneNumberField handles its own focus state internally.
  const [emailFocused, setEmailFocused] = useState(false);

  // Mandatory-field gate: optional fields (email, IVR, address, hours,
  // capabilities) are disabled until the dept has all its mandatory fields
  // filled. Saves us from sending an incomplete dept the backend will 4xx.
  const missingMandatory = useMemo(() => getMissingMandatoryFields(dept), [dept]);
  const isGated = missingMandatory.length > 0;
  const gatingMessage = useMemo(
    () => buildGatingMessage(missingMandatory),
    [missingMandatory]
  );

  // Name collision: case-insensitive match against every OTHER dept's name
  // (standard or custom). Surfaces inline below the name input and gates
  // the page-level Save via the form's isValid check.
  const nameCollisionError = useMemo(() => {
    if (!dept.isCustom) return null;
    const trimmed = dept.name.trim();
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();
    const collides = allDepts.some(
      (d) => d.id !== dept.id && d.name.trim().toLowerCase() === lower
    );
    return collides
      ? `A department named "${trimmed}" already exists. Pick a different name.`
      : null;
  }, [allDepts, dept.id, dept.isCustom, dept.name]);

  // Inline email format error. Empty fields return null (handled by the
  // gate); only fires once the user has typed something invalid. Blanked
  // while focused so it can't flicker on every keystroke. Save-button gating
  // uses the live validator (hasValidContactFormat) directly so invalid
  // input can't slip through.
  const emailError = useMemo(() => validateEmail(dept.email), [dept.email]);
  const visibleEmailError = emailFocused ? null : emailError;

  // Two different lookups from `hoursInheritFrom`, intentionally divergent:
  //
  // - `hoursInheritedDept` is the IMMEDIATE referenced dept (one hop). Used
  //   for the "Same as X" LABEL so it reflects the operator's stated intent,
  //   matching the dropdown selection. The UI's inheritOptions filter
  //   prevents creating chains today, but legacy data can still have them —
  //   without this we'd show the wrong label (e.g., "Same as Sales" when
  //   the operator set "Same as Service", because Service itself inherits
  //   from Sales).
  // - `hoursSource` is the chain-WALKED terminus (resolveSource). Used for
  //   the actual VALUES (operatingHours, dayRecurrence) because intermediate
  //   depts in a chain may carry stale values and we want the real numbers.
  const hoursInheritedDept = useMemo(
    () =>
      dept.hoursInheritFrom && dept.hoursInheritFrom !== ROOFTOP_ADDRESS_ID
        ? allDepts.find((d) => d.id === dept.hoursInheritFrom) ?? null
        : null,
    [allDepts, dept.hoursInheritFrom]
  );
  const hoursSource = useMemo(
    () => resolveSource(allDepts, dept.hoursInheritFrom, 'hoursInheritFrom'),
    [allDepts, dept.hoursInheritFrom]
  );
  const addressSource = useMemo(
    () => resolveSource(allDepts, dept.addressInheritFrom, 'addressInheritFrom'),
    [allDepts, dept.addressInheritFrom]
  );
  const usesRooftopAddress = dept.addressInheritFrom === ROOFTOP_ADDRESS_ID;

  const effectiveHours = hoursSource?.operatingHours ?? dept.operatingHours;
  const effectiveRecurrence = hoursSource?.dayRecurrence ?? dept.dayRecurrence;

  const summary = useMemo(
    () =>
      hoursInheritedDept
        ? `Same as ${hoursInheritedDept.name || hoursInheritedDept.kind}`
        : summarizeWeek(effectiveHours, effectiveRecurrence),
    [hoursInheritedDept, effectiveHours, effectiveRecurrence]
  );

  // Formatted phone for the collapsed-card subtitle. Falls back to the raw
  // "countryCode phone" if libphonenumber can't parse (e.g. partial typing).
  const headerPhone = useMemo(() => {
    if (!dept.phone.trim()) return '';
    try {
      const parsed = parsePhoneNumber(`${dept.countryCode}${dept.phone}`);
      if (parsed) return parsed.formatInternational();
    } catch {
      // fall through to the raw concat
    }
    return `${dept.countryCode} ${dept.phone}`;
  }, [dept.countryCode, dept.phone]);

  const inheritOptions = allDepts.filter(
    (d) => d.id !== dept.id && !d.hoursInheritFrom // don't allow chaining
  );

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white transition-shadow hover:shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          {/* Kind-tinted icon box. Color affordance lives here now instead of
              on a text chip — operators scan by icon, not by repeating the
              dept's name in a colored pill. */}
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${KIND_BADGE[dept.kind]}`}
          >
            <KindIcon kind={dept.kind} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-black-dark">
                {displayName || (
                  <span className="text-black-40">Name required</span>
                )}
              </span>
              {/* Custom chip sits inline with the title (right side) for
                  custom depts only — clarifies "this is operator-added"
                  without redundancy on the four standard kinds. */}
              {dept.isCustom && (
                <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-slate-100 px-2 text-[10px] font-semibold text-slate-700">
                  Custom
                </span>
              )}
            </div>
            {dept.phone.trim() ? (
              <div className="mt-0.5 truncate text-xs text-black-60">
                {headerPhone}
              </div>
            ) : (
              <div className="mt-0.5 truncate text-xs font-medium text-amber-700">
                Add phone number
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-black-40">
            <ChevronIcon open={isOpen} />
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-black/8 px-5 pb-5 pt-4">
          {/* Name input renders only while a custom dept is _isNew (i.e.
              added this session, not yet saved). Once committed, the name
              is locked and only the accordion title shows it — matching
              the standard sales/service/parts/finance behaviour. */}
          {dept.isCustom && dept._isNew && (
            <div className="mb-4">
              <Input
                label="Name"
                required
                value={dept.name}
                onChange={(v) => onPatch({ name: v })}
                error={nameCollisionError ?? undefined}
              />
            </div>
          )}

          {/* Contact row — Phone and Email together. Phone uses the same label
              style as Input ("text-base font-normal text-black-60") so the two
              columns are structurally identical (label + single input row).
              The IVR toggle is tucked inline at the end of the phone input row
              so it doesn't add visual height to the column. */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <div className="mb-1 block text-base font-normal text-black-60">
                Phone <span className="text-red-500">*</span>
              </div>
              <PhoneNumberField
                countryCode={dept.countryCode}
                phone={dept.phone}
                onChange={({ countryCode, phone }) =>
                  onPatch({ countryCode, phone })
                }
                size="md"
                trailing={
                  <GatedControl gated={isGated} message={gatingMessage}>
                    <label
                      htmlFor={`ivr-${dept.id}`}
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2"
                      title={isGated ? undefined : 'Mark this as an IVR (Interactive Voice Response) number'}
                    >
                      <Toggle
                        id={`ivr-${dept.id}`}
                        toggle={!!dept.isIvr}
                        toggleHandler={() => onPatch({ isIvr: !dept.isIvr })}
                        className="[&_input:checked~div:first-of-type]:bg-black/85 [&_input:checked~div>div]:bg-white"
                      />
                      <span className="text-xs font-medium text-black-60">IVR</span>
                    </label>
                  </GatedControl>
                }
              />
            </div>
            <GatedControl gated={isGated} message={gatingMessage}>
              {/* DS Input doesn't forward onFocus, so we listen on this
                  wrapper — React's onFocus/onBlur use focusin/focusout
                  under the hood, which bubble from the inner <input>. */}
              <div
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              >
                <Input
                  label="Email (optional)"
                  value={dept.email || ''}
                  onChange={(v) => onPatch({ email: v })}
                  error={visibleEmailError ?? undefined}
                />
              </div>
            </GatedControl>
          </div>

          {/* Affordance: tell the operator why downstream fields are dimmed. */}
          {isGated && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              {gatingMessage}
            </div>
          )}

          {/* Address block.
              - Default ("Same as rooftop address"): one compact row, label +
                selector. No inner body — the button conveys everything.
              - Inheriting from another dept: bordered box with the source's
                address line.
              - Setting its own: bordered box with the full AddressField. */}
          <GatedControl gated={isGated} message={gatingMessage} className="block">
          {usesRooftopAddress ? (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-black/8 bg-gray-light/40 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-black-40">
                Address
              </div>
              <InheritSelect
                selfId={dept.id}
                selfName={dept.name || 'this department'}
                allDepts={allDepts}
                field="addressInheritFrom"
                value={dept.addressInheritFrom}
                onChange={(id) => onPatch({ addressInheritFrom: id })}
                includeRooftop
                allowDeptInherit={!isSales}
              />
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-black/8 bg-gray-light/40 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-black-40">
                  Address
                </div>
                <InheritSelect
                  selfId={dept.id}
                  selfName={dept.name || 'this department'}
                  allDepts={allDepts}
                  field="addressInheritFrom"
                  value={dept.addressInheritFrom}
                  onChange={(id) => onPatch({ addressInheritFrom: id })}
                  includeRooftop
                  allowDeptInherit={!isSales}
                />
              </div>
              {addressSource ? (
                <div className="rounded-md bg-white px-3 py-2 text-sm text-black-60">
                  {addressSource.address?.formattedAddress ? (
                    <>
                      Using {addressSource.name || addressSource.kind}’s address:{' '}
                      <span className="text-black-dark">
                        {addressSource.address.formattedAddress}
                      </span>
                    </>
                  ) : (
                    <>
                      Will use {addressSource.name || addressSource.kind}’s
                      address once it’s entered.
                    </>
                  )}
                </div>
              ) : (
                <AddressField
                  label=""
                  value={dept.address ?? null}
                  onChange={(addr: ParsedAddress | null) =>
                    onPatch({ address: addr })
                  }
                />
              )}
            </div>
          )}
          </GatedControl>

          {/* Hours block */}
          <GatedControl gated={isGated} message={gatingMessage} className="block">
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-black-40">
                Working hours
              </div>
              {!isSales && (
                <InheritSelect
                  selfId={dept.id}
                  selfName={dept.name || 'this department'}
                  allDepts={allDepts}
                  field="hoursInheritFrom"
                  value={dept.hoursInheritFrom}
                  onChange={(id) => onPatch({ hoursInheritFrom: id })}
                />
              )}
            </div>
            {hoursInheritedDept ? (
              <div className="rounded-lg border border-black/8 bg-gray-light/40 px-4 py-3 text-sm text-black-60">
                <div className="font-medium text-black-dark">
                  Same as {hoursInheritedDept.name || hoursInheritedDept.kind}
                </div>
                <div className="mt-0.5 text-xs">
                  {summarizeWeek(effectiveHours, effectiveRecurrence)}
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-black/8 bg-gray-light/40 px-4 py-3">
                <div className="min-w-0">
                  <HoursVertical
                    hours={effectiveHours}
                    recurrence={effectiveRecurrence}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setHoursEditOpen(true)}
                  className="shrink-0 rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black-dark shadow-sm hover:bg-gray-light"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          </GatedControl>

          {/* SERVICE CAPABILITIES (hidden): the Loaner / Pickup & Drop / Drop
              Box / Roadside Assistance toggles are wired UI-side but the
              backend payload doesn't carry these fields yet. Hidden until
              the contract lands. Restore by uncommenting the block below
              (component + SERVICE_CAPABILITY_ITEMS at top of file remain
              defined). */}
          {/* {dept.kind === 'service' && (
            <GatedControl gated={isGated} message={gatingMessage} className="block">
              <ServiceCapabilities />
            </GatedControl>
          )} */}
        </div>
      )}

      {hoursEditOpen && (
        <HoursEditModal
          dept={dept}
          onDayPatch={onDayPatch}
          onDayRecurrence={onDayRecurrence}
          onClose={() => setHoursEditOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Working hours edit modal — opens from each DepartmentCard's Edit button
// ---------------------------------------------------------------------------

function HoursEditModal({
  dept,
  onDayPatch,
  onDayRecurrence,
  onClose,
}: {
  dept: DepartmentConfig;
  onDayPatch: (day: DayKey, patch: Partial<RequestPayloadDayAvailability>) => void;
  onDayRecurrence: (day: DayKey, pattern: DayRecurrencePattern | null) => void;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-neutral-950">
              Edit {dept.name || dept.kind} hours
            </h2>
            <p className="text-sm text-gray-500">
              Toggle days, set open/close times, or set a custom monthly recurrence.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        {/* Body scrolls when content exceeds 90vh minus chrome. No artificial
            padding — recurrence popovers on the last rows render normally;
            users scroll if their viewport is too short. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          <div className="rounded-lg border border-black/8 bg-gray-light/40">
            {weekDays.map((dayLabel, idx) => {
              const dayKey = dayLabel.toLowerCase() as DayKey;
              const day = dept.operatingHours[dayKey];
              const recurrence = dept.dayRecurrence?.[dayKey];
              return (
                <DayRow
                  key={dayKey}
                  last={idx === weekDays.length - 1}
                  dayKey={dayKey}
                  dayLabel={dayLabel}
                  day={day}
                  recurrence={recurrence}
                  onDayPatch={(patch) => onDayPatch(dayKey, patch)}
                  onRecurrence={(p) => onDayRecurrence(dayKey, p)}
                />
              );
            })}
          </div>
        </div>
        {/* Footer is a single "Done" — edits stream into the parent form state
            as the operator toggles days / changes times, so this button is
            just dismissal. Backend save lives on the main page's Save changes
            button (one canonical save path). */}
        <div className="shrink-0 border-t border-black/10 bg-white px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <DsButton label="Done" type="primary" size="AA" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Service capabilities — Service-department-only facts the agent communicates
// ---------------------------------------------------------------------------

function ServiceCapabilities() {
  // TODO (task #17): persist via DepartmentConfig once backend payload extends.
  // For the first pass, capability state is UI-local — toggles work but values
  // aren't saved server-side yet.
  const [state, setState] = useState<Record<string, boolean>>({});

  return (
    <div className="mt-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black-40">
        Service Capabilities
      </div>
      <div className="overflow-hidden rounded-lg border border-black/8 bg-gray-light/40">
        {SERVICE_CAPABILITY_ITEMS.map((cap, idx) => (
          <div
            key={cap.id}
            className={`flex items-start justify-between gap-4 bg-white px-4 py-3 ${
              idx === SERVICE_CAPABILITY_ITEMS.length - 1
                ? ''
                : 'border-b border-black/8'
            }`}
          >
            <div className="min-w-0 pr-4">
              <div className="text-sm font-medium text-black-dark">{cap.label}</div>
              <div className="mt-0.5 text-xs text-black-60">{cap.desc}</div>
            </div>
            <Toggle
              id={`cap-${cap.id}`}
              toggle={!!state[cap.id]}
              toggleHandler={() =>
                setState((s) => ({ ...s, [cap.id]: !s[cap.id] }))
              }
              className="[&_input:checked~div:first-of-type]:bg-black/85 [&_input:checked~div>div]:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inherit-from selector
// ---------------------------------------------------------------------------

function InheritSelect({
  selfId,
  selfName,
  allDepts,
  field,
  value,
  onChange,
  includeRooftop = false,
  allowDeptInherit = true,
}: {
  selfId: string;
  selfName: string;
  allDepts: DepartmentConfig[];
  field: 'hoursInheritFrom' | 'addressInheritFrom';
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  /** When true, render a "Same as rooftop address" option at the top. Only
   *  meaningful for the address field (the rooftop has no working hours). */
  includeRooftop?: boolean;
  /** When false, suppress "Same as <other dept>" options. Useful for Sales,
   *  which can inherit only from the rooftop, not from siblings. */
  allowDeptInherit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Other depts that aren't themselves inheriting (prevents chains/cycles).
  // Custom departments are NEVER offered as inheritance sources — "Same as"
  // only points to the 4 standard kinds (sales/service/parts/finance) or
  // the rooftop. Custom depts can still inherit FROM standard depts.
  const deptOptions = allowDeptInherit
    ? allDepts.filter(
        (d) =>
          d.id !== selfId &&
          !d.isCustom &&
          (!d[field] || d[field] === ROOFTOP_ADDRESS_ID)
      )
    : [];
  const usesRooftop = value === ROOFTOP_ADDRESS_ID;
  const currentDept = !usesRooftop ? allDepts.find((d) => d.id === value) : null;
  const buttonLabel = usesRooftop
    ? 'Same as rooftop address'
    : currentDept
      ? `Same as ${currentDept.name || currentDept.kind}`
      : 'Set its own';

  const isActive = !!value;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium ${
          isActive
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-black/10 bg-white text-black-60 hover:border-black/20'
        }`}
      >
        {buttonLabel}
        <ChevronIcon open={open} />
      </button>
      <FloatingPanel
        anchorRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
        placement="bottom-end"
        width={240}
        className="rounded-md border border-black/10 bg-white py-1 shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
      >
        <button
          type="button"
          onClick={() => {
            onChange(undefined);
            setOpen(false);
          }}
          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-light ${
            !value ? 'font-semibold text-black-dark' : 'text-black-80'
          }`}
        >
          <span>Set its own</span>
          {!value && <CheckIcon />}
        </button>
        {includeRooftop && (
          <>
            <div className="my-1 border-t border-black/8" />
            <button
              type="button"
              onClick={() => {
                onChange(ROOFTOP_ADDRESS_ID);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-light ${
                usesRooftop
                  ? 'font-semibold text-black-dark'
                  : 'text-black-80'
              }`}
            >
              <span>Same as rooftop address</span>
              {usesRooftop && <CheckIcon />}
            </button>
          </>
        )}
        {deptOptions.length > 0 && (
          <div className="my-1 border-t border-black/8" />
        )}
        {deptOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              onChange(opt.id);
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-light ${
              value === opt.id ? 'font-semibold text-black-dark' : 'text-black-80'
            }`}
          >
            <span className="truncate">Same as {opt.name || opt.kind}</span>
            {value === opt.id && <CheckIcon />}
          </button>
        ))}
      </FloatingPanel>
      <span className="sr-only">Apply settings for {selfName}</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Day row
// ---------------------------------------------------------------------------

function DayRow({
  dayKey,
  dayLabel,
  day,
  recurrence,
  last,
  onDayPatch,
  onRecurrence,
}: {
  dayKey: DayKey;
  dayLabel: string;
  day: RequestPayloadDayAvailability;
  recurrence?: DayRecurrencePattern;
  last: boolean;
  onDayPatch: (patch: Partial<RequestPayloadDayAvailability>) => void;
  onRecurrence: (pattern: DayRecurrencePattern | null) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const start = useMemo(
    () => TimeUtils.convertTo12HourFormat(day.startTime),
    [day.startTime]
  );
  const end = useMemo(
    () => TimeUtils.convertTo12HourFormat(day.endTime),
    [day.endTime]
  );
  const recurrenceLabel = summarizeRecurrence(recurrence, dayLabel);

  return (
    <div
      className={`grid grid-cols-[110px_1fr_auto] items-center gap-4 px-4 py-3 ${last ? '' : 'border-b border-black/8'} bg-white`}
    >
      <div className="flex items-center gap-3">
        <Toggle
          id={`toggle-${dayKey}`}
          toggle={day.isAvailable}
          toggleHandler={() =>
            onDayPatch({
              isAvailable: !day.isAvailable,
              isTransferAvailable: !day.isAvailable,
            })
          }
          className="[&_input:checked~div:first-of-type]:bg-black/85 [&_input:checked~div>div]:bg-white"
        />
        <span
          className={`text-sm font-medium ${day.isAvailable ? 'text-black-dark' : 'text-black-40'}`}
        >
          {dayLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {day.isAvailable ? (
          <>
            <div className="flex items-center gap-2 rounded-md border border-black/10 bg-white px-2 shadow-[0_1px_1px_rgba(16,24,40,0.04)]">
              <span className="text-[11px] uppercase tracking-wide text-black-40">
                From
              </span>
              <TimeInput
                value={start}
                handleChange={(t) =>
                  onDayPatch({ startTime: TimeUtils.convertTo24HourFormat(t) })
                }
                className="px-0 py-1"
              />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-black/10 bg-white px-2 shadow-[0_1px_1px_rgba(16,24,40,0.04)]">
              <span className="text-[11px] uppercase tracking-wide text-black-40">
                To
              </span>
              <TimeInput
                value={end}
                handleChange={(t) =>
                  onDayPatch({ endTime: TimeUtils.convertTo24HourFormat(t) })
                }
                className="px-0 py-1"
              />
            </div>
            {recurrenceLabel && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                {recurrenceLabel}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-black-40">Closed</span>
        )}
      </div>

      <div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setPopoverOpen((v) => !v)}
          className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium ${
            recurrence
              ? 'border-violet-200 bg-violet-50 text-violet-700'
              : 'border-black/10 bg-white text-black-60 hover:border-black/20'
          }`}
          disabled={!day.isAvailable}
        >
          <CalendarIcon />
          {recurrence ? 'Custom' : 'Every week'}
        </button>
        <RecurrencePopover
          anchorRef={triggerRef}
          open={popoverOpen}
          dayLabel={dayLabel}
          value={recurrence}
          onClose={() => setPopoverOpen(false)}
          onChange={(p) => {
            onRecurrence(p);
            setPopoverOpen(false);
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recurrence popover
// ---------------------------------------------------------------------------

function RecurrencePopover({
  anchorRef,
  open,
  dayLabel,
  value,
  onChange,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  dayLabel: string;
  value?: DayRecurrencePattern;
  onChange: (pattern: DayRecurrencePattern | null) => void;
  onClose: () => void;
}) {
  const [weeks, setWeeks] = useState<Set<1 | 2 | 3 | 4 | 'last'>>(
    new Set(value?.weeks ?? [])
  );

  // Sync local selection when the popover is reopened with a different value.
  useEffect(() => {
    if (open) setWeeks(new Set(value?.weeks ?? []));
  }, [open, value]);

  const toggle = (v: 1 | 2 | 3 | 4 | 'last') => {
    setWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  const apply = () => {
    if (weeks.size === 0) onChange(null);
    else onChange({ weeks: Array.from(weeks) });
  };

  return (
    <FloatingPanel
      anchorRef={anchorRef}
      open={open}
      onClose={onClose}
      placement="bottom-end"
      width={288}
      className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
    >
      <div className="mb-1 text-sm font-semibold text-black-dark">
        Custom {dayLabel} recurrence
      </div>
      <p className="mb-3 text-xs text-black-60">
        Open only on selected {dayLabel}s of the month. Leave empty for every
        week.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {WEEK_OPTIONS.map((opt) => {
          const active = weeks.has(opt.value);
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium ${
                active
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white text-black-80 hover:border-black/30'
              }`}
            >
              <span>
                {opt.label} {dayLabel}
              </span>
              {active && <CheckIcon />}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setWeeks(new Set());
            onChange(null);
          }}
          className="text-xs font-medium text-black-60 hover:text-black-dark"
        >
          Reset to weekly
        </button>
        <DsButton label="Apply" type="primary" size="A" onClick={apply} />
      </div>
    </FloatingPanel>
  );
}

// ---------------------------------------------------------------------------
// Inline icons
// ---------------------------------------------------------------------------

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}


function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton — mimics the real layout (four dept cards with icon-box
// + title + subtitle, add-department button, holidays strip, save footer).
// Tracks the actual content shape so there's no flicker / layout shift when
// data lands.
// TIMEZONE (disabled): the timezone strip placeholder is commented out below.
// Restore it when the timezone UI is brought back.
// ---------------------------------------------------------------------------

function DepartmentsFormSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      {/* TIMEZONE (disabled): timezone strip placeholder. Restore alongside
          the live TimezoneStrip render in DepartmentsForm.
      <div className="flex items-center justify-between rounded-xl border border-black/8 bg-gray-light px-4 py-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-black/8" />
          <div className="space-y-2">
            <div className="h-2.5 w-24 rounded bg-black/8" />
            <div className="h-3.5 w-44 rounded bg-black/10" />
          </div>
        </div>
        <div className="h-3 w-8 rounded bg-black/8" />
      </div>
      */}

      {/* Department cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-5 py-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-lg bg-black/8" />
              <div className="min-w-0 space-y-2">
                <div className="h-3.5 w-28 rounded bg-black/10" />
                <div className="h-3 w-36 rounded bg-black/8" />
              </div>
            </div>
            <div className="h-3 w-3 rounded bg-black/8" />
          </div>
        ))}
      </div>

      {/* Add Department button */}
      <div className="mt-5 h-9 w-44 rounded-md border border-black/10 bg-black/4" />

      {/* Holidays section heading */}
      <div className="mt-8 mb-3 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-black/10" />
          <div className="h-3 w-72 rounded bg-black/8" />
        </div>
        <div className="h-9 w-36 rounded-md border border-black/10 bg-black/4" />
      </div>

      {/* Holiday rows */}
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-5 py-4"
          >
            <div className="min-w-0 space-y-2">
              <div className="h-3.5 w-40 rounded bg-black/10" />
              <div className="h-3 w-28 rounded bg-black/8" />
            </div>
            <div className="h-6 w-16 rounded-full bg-black/8" />
          </div>
        ))}
      </div>

      {/* Save footer */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-black/8 pt-5">
        <div className="h-3 w-28 rounded bg-black/8" />
        <div className="h-9 w-32 rounded-md bg-black/10" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department-kind icons — one per kind, rendered inside the kind-tinted box
// at the left of each accordion card so the row reads as identifiable at a
// glance without the chip duplicating the title.
// ---------------------------------------------------------------------------

const KIND_ICON_STROKE = {
  width: '18',
  height: '18',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function KindIcon({ kind }: { kind: DepartmentKind }) {
  switch (kind) {
    case 'sales':
      return (
        // Briefcase — commerce / business
        <svg {...KIND_ICON_STROKE}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <path d="M2 13h20" />
        </svg>
      );
    case 'service':
      return (
        // Wrench — repair / service
        <svg {...KIND_ICON_STROKE}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.121 2.121 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'parts':
      return (
        // Package box — inventory / parts
        <svg {...KIND_ICON_STROKE}>
          <path d="M16.5 9.4 7.55 4.24" />
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'finance':
      return (
        // Dollar sign — money / finance
        <svg {...KIND_ICON_STROKE}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'custom':
    default:
      return (
        // Sparkles — operator-added / extra
        <svg {...KIND_ICON_STROKE}>
          <path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2z" />
          <path d="M19 14l.7 1.7L21.4 16l-1.7.6L19 18l-.6-1.4L16.6 16l1.7-.6z" />
        </svg>
      );
  }
}
