// Wire types for the vini-config departments endpoints.
//
// GET  /central-config/v1/vini-config/departments?enterpriseId&teamId
//        → ViniDepartmentsConfigResponse
// POST /console/v1/product-onboarding/vini/departments
//        body: ViniDepartmentsSavePayload
//
// Both shapes share most fields; the differences are called out below.
// Kept separate from the form's DepartmentConfig / HolidayConfig so the
// adapter layer in lib/adapters/departments-adapter.ts owns translation.

export type ViniDepartmentName = 'sales' | 'service' | 'parts' | 'finance' | string;

export interface ViniDeptApiContact {
  /** Optional on save — omitted when the form has no value to round-trip. */
  name?: string;
  phone: string;
  /** Email + IVR live inside contact on both GET and POST — they belong to
   *  the contact channel, not the department-level extras. */
  email?: string;
  isIvr?: boolean;
}

/** Per-day timings. `weekOverrides` keys are week-of-month strings
 *  ("1"–"4" or "last") and override the base value on that week only. */
export interface ViniDeptApiDayTimings {
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  isTransferAvailable?: boolean;
  weekOverrides?: Record<string, Partial<ViniDeptApiDayTimings>>;
}

export interface ViniDeptApiTimings {
  /** Generic pointer: this department's hours mirror the named department. */
  sameAs?: ViniDepartmentName;
  /** Legacy/explicit shorthand variants returned by the API. */
  isSameAsSales?: boolean;
  isSameAsService?: boolean;
  monday?: ViniDeptApiDayTimings;
  tuesday?: ViniDeptApiDayTimings;
  wednesday?: ViniDeptApiDayTimings;
  thursday?: ViniDeptApiDayTimings;
  friday?: ViniDeptApiDayTimings;
  saturday?: ViniDeptApiDayTimings;
  sunday?: ViniDeptApiDayTimings;
}

/** Structured address payload — same shape on GET and POST. Mirrors the
 *  form's ParsedAddress; every key optional on the wire so the backend can
 *  omit unfilled parts without nulls. `sameAs` flips the address into an
 *  inheritance pointer; when present, the structured fields may also be
 *  populated with the resolved values (the backend echoes the source dept's
 *  address for convenience). */
export interface ViniDeptApiAddress {
  /** Inheritance pointer — another department's `name`, or 'rooftop'.
   *  When set, the form treats this dept as inheriting and ignores the
   *  resolved fields that may also be in the payload. */
  sameAs?: 'rooftop' | ViniDepartmentName;
  formattedAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  zipcode?: string;
  /** Sub-area between city and state (e.g. "San Francisco County" in the
   *  US). Form has no UI for this today — preserved opaquely so saves
   *  round-trip the backend-stored value losslessly. */
  district?: string;
  /** Coordinates from Google Places / Geocoder. Either may be null when the
   *  operator typed an address that didn't resolve cleanly. */
  lat?: number | null;
  lng?: number | null;
}

export interface ViniDeptApiDepartment {
  name: ViniDepartmentName;
  contact: ViniDeptApiContact;
  timings: ViniDeptApiTimings;
  address?: ViniDeptApiAddress | null;
}

export interface ViniDeptApiHolidayHours {
  start: string;
  end: string;
}

/** Holiday shape on GET — uses allDepartments:boolean + departments:string[]. */
export interface ViniDeptApiHoliday {
  name: string;
  reason?: string;
  /** ISO YYYY-MM-DD anchor. */
  date: string;
  recurrence?: 'yearly' | 'monthly' | 'none';
  /** false → closed all day; true → open during `hours`. */
  open: boolean;
  hours?: ViniDeptApiHolidayHours[];
  allDepartments: boolean;
  departments?: ViniDepartmentName[];
}

/** Holiday shape on POST — collapses to a single `departments` union:
 *  `"all"` or an array of department names. There is no allDepartments field. */
export interface ViniDeptApiHolidaySave {
  name: string;
  reason?: string;
  date: string;
  /** One-off holidays serialise as `null` (per backend contract), not the
   *  string 'none'. Read direction maps null/undefined back to 'none' for the
   *  form's HolidayRecurrence union. */
  recurrence: 'yearly' | 'monthly' | null;
  open: boolean;
  hours: ViniDeptApiHolidayHours[];
  departments: 'all' | ViniDepartmentName[];
}

export interface ViniDepartmentsConfigResponse {
  departments?: ViniDeptApiDepartment[];
  holidays?: ViniDeptApiHoliday[];
}

/** Body for POST /console/v1/product-onboarding/vini/departments. */
export interface ViniDepartmentsSavePayload {
  enterpriseId: string;
  teamId: string;
  departments: ViniDeptApiDepartment[];
  holidays: ViniDeptApiHolidaySave[];
}
