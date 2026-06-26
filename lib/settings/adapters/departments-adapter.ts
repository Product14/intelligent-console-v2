// Adapter between the central-config departments API and the form's DTOs
// (DepartmentConfig / HolidayConfig). The form UI stays unaware of wire shape;
// translation happens here.
//
// Read path is wired today. Write path (mapDepartmentsToApi /
// mapHolidaysToApi) is stubbed for the POST/UPDATE integration that lands
// next; the signatures match what services/index.ts will call.

import type {
  DepartmentConfig,
  DepartmentKind,
  DayKey,
  DayRecurrencePattern,
  HolidayConfig,
  HolidayRecurrence,
  RequestPayloadAvailabilityHours,
} from '@/services/settings/types';
import type { RequestPayloadDayAvailability } from '@/types/settings/vini-config';
import type {
  ViniDepartmentsConfigResponse,
  ViniDepartmentsSavePayload,
  ViniDeptApiAddress,
  ViniDeptApiDayTimings,
  ViniDeptApiDepartment,
  ViniDeptApiHoliday,
  ViniDeptApiHolidayHours,
  ViniDeptApiHolidaySave,
  ViniDeptApiTimings,
} from '@/types/settings/vini-departments-api';
import type { ParsedAddress } from '@/lib/settings/google-places';

const KNOWN_KINDS: DepartmentKind[] = ['sales', 'service', 'parts', 'finance'];

/** The 4 standard departments are always shown in the UI, even if the API
 *  doesn't return one of them (the backend may not have records for every
 *  team). Canonical order — defaults always render in this sequence. */
const DEFAULT_DEPT_KINDS: ReadonlyArray<{
  id: string;
  kind: DepartmentKind;
  displayName: string;
}> = [
  { id: 'sales', kind: 'sales', displayName: 'Sales' },
  { id: 'service', kind: 'service', displayName: 'Service' },
  { id: 'parts', kind: 'parts', displayName: 'Parts' },
  { id: 'finance', kind: 'finance', displayName: 'Finance' },
];

const DAY_KEYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Longest-first so '+971' beats '+9' and '+44' beats '+4'.
const KNOWN_COUNTRY_CODES = ['+971', '+91', '+81', '+65', '+61', '+52', '+49', '+44', '+33', '+1'];

const DEFAULT_DAY: RequestPayloadDayAvailability = {
  isAvailable: false,
  startTime: '09:00',
  endTime: '18:00',
  isTransferAvailable: false,
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(name: string): string {
  return name
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** "sales" → {id:'sales', kind:'sales', isCustom:false, name:'Sales'}.
 *  Anything else becomes a custom department with a slugified id. */
function classify(name: string): {
  id: string;
  kind: DepartmentKind;
  isCustom: boolean;
  displayName: string;
} {
  const lower = name.toLowerCase();
  if ((KNOWN_KINDS as string[]).includes(lower)) {
    return {
      id: lower,
      kind: lower as DepartmentKind,
      isCustom: false,
      displayName: titleCase(lower),
    };
  }
  return {
    id: slugify(name) || `custom-${Math.abs(hash(name))}`,
    kind: 'custom',
    isCustom: true,
    displayName: titleCase(name),
  };
}

/** Tiny non-crypto hash, only used as a deterministic id fallback when slugify
 *  produces an empty string. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** Split an E.164-ish string ('+14155550101') into a known country code + the
 *  remaining digits. Tolerates formatted wire values ('+1-785-856-9220',
 *  '+1 (785) 856-9220') by stripping dashes / spaces / parens before
 *  splitting — the form's phone input is digits-only, so dashes inherited
 *  from an upstream adapter would render as a leading "-" and round-trip
 *  back to the backend unchanged.
 *
 *  Unknown prefixes default to '+1' with the sanitised digits preserved as
 *  the local number, which the operator can fix on first edit. */
function splitPhone(raw: string | undefined): { countryCode: string; phone: string } {
  if (!raw) return { countryCode: '+1', phone: '' };
  const sanitized = raw.trim().replace(/[\s\-().]/g, '');
  if (!sanitized) return { countryCode: '+1', phone: '' };
  const normalized = sanitized.startsWith('+') ? sanitized : `+${sanitized}`;
  for (const code of KNOWN_COUNTRY_CODES) {
    if (normalized.startsWith(code)) {
      return { countryCode: code, phone: normalized.slice(code.length) };
    }
  }
  return { countryCode: '+1', phone: sanitized };
}

function mapDay(api: ViniDeptApiDayTimings | undefined): RequestPayloadDayAvailability {
  if (!api) return { ...DEFAULT_DAY };
  return {
    isAvailable: !!api.isAvailable,
    startTime: api.startTime ?? '09:00',
    endTime: api.endTime ?? '18:00',
    isTransferAvailable: !!(api.isTransferAvailable ?? api.isAvailable),
  };
}

function mapTimingsToHours(t: ViniDeptApiTimings | undefined): RequestPayloadAvailabilityHours {
  return {
    monday: mapDay(t?.monday),
    tuesday: mapDay(t?.tuesday),
    wednesday: mapDay(t?.wednesday),
    thursday: mapDay(t?.thursday),
    friday: mapDay(t?.friday),
    saturday: mapDay(t?.saturday),
    sunday: mapDay(t?.sunday),
  };
}

/** API `weekOverrides: { "3": { isAvailable: false } }` means "on the 3rd
 *  occurrence of this weekday in the month, the day is closed." The form's
 *  DayRecurrencePattern is the inverse: it lists weeks the day IS open.
 *  So we compute the complement of overridden-closed weeks (best effort —
 *  time-only overrides aren't representable in the form and are dropped). */
function mapDayRecurrence(
  api: ViniDeptApiTimings | undefined
): DepartmentConfig['dayRecurrence'] | undefined {
  if (!api) return undefined;
  const ALL: Array<1 | 2 | 3 | 4 | 'last'> = [1, 2, 3, 4, 'last'];
  const result: Partial<Record<DayKey, DayRecurrencePattern>> = {};
  for (const day of DAY_KEYS) {
    const dayCfg = api[day];
    const overrides = dayCfg?.weekOverrides;
    if (!overrides || !dayCfg?.isAvailable) continue;
    const closedWeeks = new Set<1 | 2 | 3 | 4 | 'last'>();
    for (const [weekKey, override] of Object.entries(overrides)) {
      if (override && override.isAvailable === false) {
        const week = parseWeekKey(weekKey);
        if (week !== null) closedWeeks.add(week);
      }
    }
    if (closedWeeks.size === 0 || closedWeeks.size === ALL.length) continue;
    const openWeeks = ALL.filter((w) => !closedWeeks.has(w));
    if (openWeeks.length > 0 && openWeeks.length < ALL.length) {
      result[day] = { weeks: openWeeks };
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function parseWeekKey(key: string): 1 | 2 | 3 | 4 | 'last' | null {
  if (key === 'last') return 'last';
  const n = Number(key);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

/** "sameAs: 'sales'" / "isSameAsSales: true" / "isSameAsService: true" →
 *  the id of the source department (or undefined). */
function resolveHoursInheritFrom(t: ViniDeptApiTimings | undefined): string | undefined {
  if (!t) return undefined;
  if (t.sameAs) return classify(t.sameAs).id;
  if (t.isSameAsSales) return 'sales';
  if (t.isSameAsService) return 'service';
  return undefined;
}

export function mapApiResponseToDepartments(
  response: ViniDepartmentsConfigResponse | null | undefined
): DepartmentConfig[] {
  const list = response?.departments ?? [];
  const mapped = list.map((api) => mapDepartment(api));

  // Build the final list in canonical order: 4 defaults first (synthesised
  // when the API didn't return them), then customs in API order. This keeps
  // the UI's "always 4 standard departments" contract intact even when the
  // backend has only partial records for a team.
  const byId = new Map(mapped.map((d) => [d.id, d]));
  const ordered: DepartmentConfig[] = [];
  for (const def of DEFAULT_DEPT_KINDS) {
    ordered.push(byId.get(def.id) ?? synthesizeDefaultDepartment(def));
  }
  for (const d of mapped) {
    if (d.isCustom) ordered.push(d);
  }
  return ordered;
}

/** Build an empty default department when the API didn't return one.
 *  Empty phone + no contact name — the form's relaxed validation lets the
 *  user save with these blank, since they were never user-supplied. */
function synthesizeDefaultDepartment(def: (typeof DEFAULT_DEPT_KINDS)[number]): DepartmentConfig {
  return {
    id: def.id,
    kind: def.kind,
    name: def.displayName,
    isCustom: false,
    countryCode: '+1',
    phone: '',
    operatingHours: synthesizedOperatingHours(),
  };
}

function synthesizedOperatingHours(): RequestPayloadAvailabilityHours {
  const open = (): RequestPayloadDayAvailability => ({
    isAvailable: true,
    startTime: '09:00',
    endTime: '18:00',
    isTransferAvailable: true,
  });
  const closed = (): RequestPayloadDayAvailability => ({
    isAvailable: false,
    startTime: '09:00',
    endTime: '18:00',
    isTransferAvailable: false,
  });
  return {
    monday: open(),
    tuesday: open(),
    wednesday: open(),
    thursday: open(),
    friday: open(),
    saturday: open(),
    sunday: closed(),
  };
}

function mapDepartment(api: ViniDeptApiDepartment): DepartmentConfig {
  const { id, kind, isCustom, displayName } = classify(api.name);
  const { countryCode, phone } = splitPhone(api.contact?.phone);
  const hoursInheritFrom = resolveHoursInheritFrom(api.timings);
  const dayRecurrence = mapDayRecurrence(api.timings);

  // Address: when the backend returns `address.sameAs`, treat the dept as
  // inheriting and ignore the resolved structured fields it may also send
  // (the backend echoes the source dept's address for convenience but the
  // form's data model uses inheritance OR own-address, not both).
  //
  // Wire uses "rooftop address" (with the space) as the rooftop pointer;
  // the form uses ROOFTOP_ADDRESS_ID = 'rooftop' internally. Normalise at
  // the boundary so the form's resolveSource walks correctly.
  const addressInheritFrom = normalizeAddressInheritFrom(api.address?.sameAs);
  const address = addressInheritFrom ? null : mapAddressIn(api.address);

  // email + isIvr live INSIDE contact on this contract.
  const email = api.contact?.email;
  const isIvr = api.contact?.isIvr;

  return {
    id,
    kind,
    name: displayName,
    isCustom,
    countryCode,
    phone,
    operatingHours: mapTimingsToHours(api.timings),
    ...(hoursInheritFrom ? { hoursInheritFrom } : {}),
    ...(dayRecurrence ? { dayRecurrence } : {}),
    ...(email ? { email } : {}),
    ...(typeof isIvr === 'boolean' ? { isIvr } : {}),
    ...(addressInheritFrom ? { addressInheritFrom } : {}),
    ...(address ? { address } : {}),
    // Opaque preservation — echoed back on save so we don't clobber the
    // backend-stored contact-person name with empty strings.
    ...(api.contact?.name ? { _apiContactName: api.contact.name } : {}),
  };
}

/** Pull a structured address out of the API response into the form's
 *  ParsedAddress shape. Returns null when the wire value is missing or has
 *  no usable fields — the form treats that as "no address set" and shows
 *  the search input alone (no structured panel + map). */
function mapAddressIn(
  api: ViniDeptApiAddress | null | undefined
): ParsedAddress | null {
  if (!api) return null;
  // Backend keeps `city` and `district` as separate values (e.g.
  // city="San Francisco", district="San Francisco County"). The form
  // exposes them as two inputs and round-trips them independently.
  const fields = {
    formattedAddress: api.formattedAddress ?? '',
    addressLine1: api.addressLine1 ?? '',
    addressLine2: api.addressLine2 ?? '',
    city: api.city ?? '',
    district: api.district ?? '',
    state: api.state ?? '',
    country: api.country ?? '',
    countryCode: api.countryCode ?? '',
    zipcode: api.zipcode ?? '',
    lat: coerceCoord(api.lat),
    lng: coerceCoord(api.lng),
  };
  // If every text field AND both coordinates are empty, treat as no address.
  const hasAnyContent =
    fields.formattedAddress ||
    fields.addressLine1 ||
    fields.addressLine2 ||
    fields.city ||
    fields.district ||
    fields.state ||
    fields.country ||
    fields.zipcode ||
    fields.lat != null ||
    fields.lng != null;
  return hasAnyContent ? fields : null;
}

/** Wire sentinel for "use the rooftop's address" — has a space; the form's
 *  internal sentinel does not. Keep both spellings here so the form code
 *  doesn't need to know about the wire variant. */
const WIRE_ROOFTOP_SAMEAS = 'rooftop address';
const FORM_ROOFTOP_SAMEAS = 'rooftop';

function normalizeAddressInheritFrom(
  wire: string | undefined
): string | undefined {
  if (!wire) return undefined;
  if (wire === WIRE_ROOFTOP_SAMEAS) return FORM_ROOFTOP_SAMEAS;
  return wire;
}

function denormalizeAddressInheritFrom(form: string): string {
  if (form === FORM_ROOFTOP_SAMEAS) return WIRE_ROOFTOP_SAMEAS;
  return form;
}

/** Coerce wire `lat`/`lng` to a number — backend may send strings. */
function coerceCoord(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function mapApiResponseToHolidays(
  response: ViniDepartmentsConfigResponse | null | undefined
): HolidayConfig[] {
  const list = response?.holidays ?? [];
  return list.map((api, idx) => mapHoliday(api, idx));
}

const ALLOWED_RECURRENCE: HolidayRecurrence[] = ['none', 'yearly', 'monthly'];

function mapHoliday(api: ViniDeptApiHoliday, idx: number): HolidayConfig {
  const recurrence: HolidayRecurrence =
    api.recurrence && (ALLOWED_RECURRENCE as string[]).includes(api.recurrence)
      ? (api.recurrence as HolidayRecurrence)
      : 'none';

  const departmentIds = api.allDepartments
    ? []
    : (api.departments ?? []).map((name) => classify(name).id);

  const isFullDay = !api.open;
  const firstSlot = api.hours?.[0];

  return {
    id: `holiday-${slugify(api.name) || 'unnamed'}-${api.date}-${idx}`,
    name: api.name,
    date: api.date,
    appliesToAll: !!api.allDepartments,
    departmentIds,
    recurrence,
    isFullDay,
    ...(firstSlot && !isFullDay
      ? { startTime: firstSlot.start, endTime: firstSlot.end }
      : {}),
    // Opaque preservation — echoed back on save (form has no UI for reason).
    ...(api.reason ? { _apiReason: api.reason } : {}),
  };
}

// ---------------------------------------------------------------------------
// Reverse direction — form → API. Used by POST /vini/departments.
// ---------------------------------------------------------------------------

const ALL_WEEKS: Array<1 | 2 | 3 | 4 | 'last'> = [1, 2, 3, 4, 'last'];

/** Build a single day's timings for the save payload. Closed days collapse
 *  to just `{ isAvailable: false, isTransferAvailable }` (matches the GET
 *  shape, e.g. closed Sundays). Open days carry start/end + optional
 *  weekOverrides converted from the form's "open weeks" recurrence.
 *
 *  KNOWN BACKEND BUG (file with backend team, do NOT work around here):
 *  the POST handler deep-merges `weekOverrides` and provides no shape to
 *  clear a previously-saved entry — omitted key, `null`, `{}`, and per-key
 *  `null` are all ignored. As a result, removing a recurrence in the UI
 *  cannot be persisted today. Backend must accept either `weekOverrides:
 *  null` or `{}` as "delete this field" before the clear-recurrence flow
 *  can work end-to-end. */
function buildDayTimings(
  day: RequestPayloadDayAvailability,
  recurrence: DayRecurrencePattern | undefined
): ViniDeptApiDayTimings {
  if (!day.isAvailable) {
    return {
      isAvailable: false,
      isTransferAvailable: !!day.isTransferAvailable,
    };
  }
  const result: ViniDeptApiDayTimings = {
    isAvailable: true,
    startTime: day.startTime,
    endTime: day.endTime,
    isTransferAvailable: !!day.isTransferAvailable,
  };
  // Form: "open only these weeks" → API: weekOverrides closing the rest.
  if (recurrence && recurrence.weeks.length > 0 && recurrence.weeks.length < ALL_WEEKS.length) {
    const openSet = new Set(recurrence.weeks);
    const overrides: Record<string, { isAvailable: false }> = {};
    for (const w of ALL_WEEKS) {
      if (!openSet.has(w)) overrides[String(w)] = { isAvailable: false };
    }
    result.weekOverrides = overrides;
  }
  return result;
}

function buildTimings(
  hours: RequestPayloadAvailabilityHours,
  recurrence: DepartmentConfig['dayRecurrence']
): ViniDeptApiTimings {
  return {
    monday: buildDayTimings(hours.monday, recurrence?.monday),
    tuesday: buildDayTimings(hours.tuesday, recurrence?.tuesday),
    wednesday: buildDayTimings(hours.wednesday, recurrence?.wednesday),
    thursday: buildDayTimings(hours.thursday, recurrence?.thursday),
    friday: buildDayTimings(hours.friday, recurrence?.friday),
    saturday: buildDayTimings(hours.saturday, recurrence?.saturday),
    sunday: buildDayTimings(hours.sunday, recurrence?.sunday),
  };
}

/** Translate the form's `hoursInheritFrom` (a dept id) to the right API
 *  shorthand. The rule is based on the INHERITING dept's kind, not the
 *  source's:
 *   - Custom dept inheriting → always `sameAs: <name>` (backend rejects
 *     `isSameAsSales/Service` on custom depts with a validation error).
 *   - Standard (sales/service/parts/finance) → dedicated flags for
 *     sales/service sources, `sameAs` for other sources.
 *  When inheritance is set, the API expects only the pointer — no
 *  day-by-day timings. */
function buildInheritedTimings(
  hoursInheritFrom: string,
  isCustom: boolean
): ViniDeptApiTimings {
  if (isCustom) return { sameAs: hoursInheritFrom };
  if (hoursInheritFrom === 'sales') return { isSameAsSales: true };
  if (hoursInheritFrom === 'service') return { isSameAsService: true };
  return { sameAs: hoursInheritFrom };
}

export function mapDepartmentsToApi(
  departments: DepartmentConfig[]
): ViniDeptApiDepartment[] {
  return departments.map((d) => mapDepartmentToApi(d));
}

function mapDepartmentToApi(dept: DepartmentConfig): ViniDeptApiDepartment {
  // Skip the dial code on empty defaults so we don't send a bare "+1" with
  // no number behind it. Backend may or may not accept empty string — that's
  // the user's stated tolerance for now.
  const rawPhone = dept.phone?.trim() ?? '';
  const phone = rawPhone ? `${dept.countryCode ?? ''}${rawPhone}` : '';
  const timings = dept.hoursInheritFrom
    ? buildInheritedTimings(dept.hoursInheritFrom, dept.isCustom)
    : buildTimings(dept.operatingHours, dept.dayRecurrence);

  // Contact: phone + required name + optional email/isIvr. email and isIvr
  // live inside contact on the wire (verified via GET against a populated
  // tenancy) — not at the dept top level.
  const contactName = dept._apiContactName?.trim() || dept.name.trim();
  const contact: ViniDeptApiContactSave = { phone, name: contactName };
  if (dept.email) contact.email = dept.email;
  if (typeof dept.isIvr === 'boolean') contact.isIvr = dept.isIvr;

  // Address: inheritance is encoded as `address.sameAs`, not a top-level
  // addressInheritFrom field. When the dept inherits, send only the pointer
  // — the backend resolves the source. When it has its own address, send
  // the structured fields (district included for lossless round-trip).
  const address: ViniDeptApiAddress | undefined = dept.addressInheritFrom
    ? { sameAs: denormalizeAddressInheritFrom(dept.addressInheritFrom) }
    : dept.address
      ? {
          formattedAddress: dept.address.formattedAddress,
          addressLine1: dept.address.addressLine1,
          addressLine2: dept.address.addressLine2,
          city: dept.address.city,
          district: dept.address.district,
          state: dept.address.state,
          country: dept.address.country,
          countryCode: dept.address.countryCode,
          zipcode: dept.address.zipcode,
          lat: dept.address.lat,
          lng: dept.address.lng,
        }
      : undefined;

  // Wire identifier:
  //   - Default depts ('sales' / 'service' / 'parts' / 'finance'): always send
  //     the canonical lowercase id — that's the contract for the four
  //     well-known depts.
  //   - Custom depts: send the user's typed display name verbatim (e.g.
  //     "Body Shop") instead of the local slug ("body-shop"). The backend
  //     stores the display string, so a later GET round-trips back as
  //     "Body Shop" (correct casing + spaces) rather than "Body-shop".
  //     Without this, anything reading the backend saw the slug as the name.
  const wireName = dept.isCustom ? dept.name.trim() : dept.id;
  return {
    name: wireName,
    contact,
    timings,
    ...(address ? { address } : {}),
  };
}

/** Internal alias — same as ViniDeptApiContact but `name` typed optional to
 *  keep the local builder ergonomic. */
type ViniDeptApiContactSave = {
  phone: string;
  name?: string;
  email?: string;
  isIvr?: boolean;
};

export function mapHolidaysToApi(
  holidays: HolidayConfig[]
): ViniDeptApiHolidaySave[] {
  return holidays.map((h) => mapHolidayToApi(h));
}

function mapHolidayToApi(holiday: HolidayConfig): ViniDeptApiHolidaySave {
  const departments: ViniDeptApiHolidaySave['departments'] = holiday.appliesToAll
    ? 'all'
    : // Local ids are kebab/lowercase department names; that matches the
      // wire format used by the GET response and POST cURL example.
      holiday.departmentIds.slice();

  const open = !holiday.isFullDay;
  const hours: ViniDeptApiHolidayHours[] =
    open && holiday.startTime && holiday.endTime
      ? [{ start: holiday.startTime, end: holiday.endTime }]
      : [];

  // Backend treats `reason` as required. Prefer the preserved value from a
  // prior GET (round-trip fidelity); for new holidays the form has no UI
  // for reason, so fall back to the holiday name. Same fallback pattern we
  // use for contact.name.
  const reason = holiday._apiReason?.trim() || holiday.name.trim();

  return {
    name: holiday.name,
    date: holiday.date,
    // Backend contract: one-off holidays go on the wire as `null`, not the
    // string 'none'. The read adapter maps null/undefined back to 'none' for
    // the form's HolidayRecurrence union, so round-trip stays symmetric.
    recurrence: holiday.recurrence === 'none' ? null : holiday.recurrence,
    open,
    hours,
    departments,
    reason,
  };
}

export interface BuildSavePayloadArgs {
  enterpriseId: string;
  teamId: string;
  departments: DepartmentConfig[];
  holidays: HolidayConfig[];
}

/** Compose the full POST body. enterpriseName / teamName intentionally
 *  omitted — see decision in the integration thread. */
export function buildSavePayload(
  args: BuildSavePayloadArgs
): ViniDepartmentsSavePayload {
  return {
    enterpriseId: args.enterpriseId,
    teamId: args.teamId,
    departments: mapDepartmentsToApi(args.departments),
    holidays: mapHolidaysToApi(args.holidays),
  };
}
