// Domain DTOs for the onboarding flow (Phase 1: Rooftop).
// These double as the zod-inferred shapes the forms produce.

import type { RequestPayloadAvailabilityHours } from '@/types/settings/vini-config';
import type { ParsedAddress } from '@/lib/settings/google-places';
export type { RequestPayloadAvailabilityHours };
export type { ParsedAddress };

export interface RooftopProfile {
  rooftopName: string;
  websiteUrl: string;
  rooftopAddress: string;
  timezone: string;
  region?: string;
  dealerType?: string;
  vehicleType: { new: boolean; preOwned: boolean };
}

export interface CallerIdConfig {
  ein: string;
  legalBusinessName: string;
  businessClassification: string;
  areaCode: string;
  authorizedReps: AuthorizedRep[];
}

export interface AuthorizedRep {
  name: string;
  email: string;
  phone: string;
}

export type DepartmentKind = 'sales' | 'service' | 'parts' | 'finance' | 'custom';

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * Custom recurrence within a month — e.g. open only on the last Sunday,
 * or on the 1st and last Sunday. Empty/undefined means "every week".
 */
export interface DayRecurrencePattern {
  weeks: Array<1 | 2 | 3 | 4 | 'last'>;
}

export interface DepartmentConfig {
  id: string;
  kind: DepartmentKind;
  name: string;
  isCustom: boolean;
  email?: string;
  /** Dial code without leading 'tel:' — e.g. '+1' */
  countryCode: string;
  /** Number only, no dial code. */
  phone: string;
  isIvr?: boolean;
  address?: ParsedAddress | null;
  /** ID of another department whose hours this one mirrors. Sales never inherits. */
  hoursInheritFrom?: string;
  /** ID of another department whose address this one mirrors. */
  addressInheritFrom?: string;
  operatingHours: RequestPayloadAvailabilityHours;
  dayRecurrence?: Partial<Record<DayKey, DayRecurrencePattern>>;
  /** Opaque API field — preserved from GET so save round-trips losslessly.
   *  The form has no UI for contact-person name; we just echo it back. */
  _apiContactName?: string;
  /** True only for a custom dept that was added via the "+ Add Department"
   *  button in this session and hasn't been saved to the backend yet.
   *  Drives the editable name input (shown only while _isNew is true) — once
   *  saved, the name is locked and only the accordion title shows it,
   *  matching the standard departments' behaviour. Form state only;
   *  never sent on the wire. */
  _isNew?: boolean;
}

/**
 * Rooftop-wide holiday closure. Each entry targets one or more departments
 * (or "all"). The anchor `date` is the first occurrence; `recurrence` decides
 * whether it repeats.
 *
 * - `recurrence: 'none'`   — one-off on the anchor date.
 * - `recurrence: 'yearly'` — repeats on the same month/day every year.
 * - `recurrence: 'monthly'` — repeats on the same day-of-month each month.
 */
export type HolidayRecurrence = 'none' | 'yearly' | 'monthly';

export interface HolidayConfig {
  id: string;
  name: string;
  /** ISO YYYY-MM-DD anchor date. */
  date: string;
  /** When true, applies to every department and `departmentIds` is ignored. */
  appliesToAll: boolean;
  /** Department IDs (matching DepartmentConfig.id) when `appliesToAll` is false. */
  departmentIds: string[];
  recurrence: HolidayRecurrence;
  /** When true, the dept(s) are closed all day; `startTime`/`endTime` ignored. */
  isFullDay: boolean;
  /** HH:MM — only meaningful when `isFullDay` is false. */
  startTime?: string;
  endTime?: string;
  /** Opaque API field — preserved from GET so save round-trips losslessly.
   *  The form has no UI for the holiday reason; we just echo it back. */
  _apiReason?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  designation: string;
  status: 'active' | 'invited';
}

export interface Preferences {
  emailDailySummary: boolean;
  emailPostCall: boolean;
  emailCampaigns: boolean;
  smsPostCall: boolean;
}

export interface PlanInfo {
  contractId: string;
  planName: string;
  agents: string[];
  addOns: string[];
}

/** Generic draft envelope: status flips to "published" on explicit publish. */
export type DraftStatus = 'draft' | 'published';

// ---- Agent setup (Sales + Service) ----

export type AgentTone = 'professional' | 'warm' | 'energetic' | 'custom';

export interface Voice {
  id: string;
  name: string;
  descriptor: string;
  /** Display-name languages this voice supports (e.g. ['English','Spanish']). */
  languages: string[];
  /** Preview audio URL — short sample of the voice. */
  previewUrl?: string;
}

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  gender: 'male' | 'female' | 'neutral';
  /** Display-name languages this avatar is intended for. */
  languages: string[];
}

export interface AgentPersona {
  name: string;
  gender: 'male' | 'female';
  languages: string[];
  tone: AgentTone;
  customPrompt: string;
  voiceId: string;
  avatarId: string;
  firstMessage: string;
  voicemail: string;
  /** Preferred area code used to issue this agent's phone number on save. */
  areaCode: string;
}

export interface IntegrationPartner {
  id: string;
  name: string;
}

export interface ImsConfig {
  provider: string;
  dealerId: string;
  status: 'not_connected' | 'connected';
}

export interface CrmConfig {
  provider: string;
  status: 'not_connected' | 'connected';
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface LeadSourceGroup {
  id: string;
  label: string;
  sources: LeadSource[];
}

export type STLChannel = 'sms' | 'call';
export type STLNudgeChannel = STLChannel | 'none';

export interface STLTouchpoint {
  id: string;
  day: number;
  time: string; // "09:00 AM" or 24h "HH:MM"; UI shows 12h
  channel: STLChannel;
}

/** How Instant Reachout decides which sources qualify across all enabled
 *  externalTypes: 'all' = every source under any enabled externalType;
 *  'customize' = only the names in `selectedSources`. The mode + selection
 *  apply globally (not per externalType). */
export type LeadTypeMode = 'all' | 'customize';

/** Per-externalType toggle. Sources live at the SpeedToLead level (shared
 *  across all enabled externalTypes), not inside this struct. */
export interface LeadTypeSelection {
  externalType: string;
  enabled: boolean;
}

export interface SpeedToLead {
  enabled: boolean;
  /** Read-only ingest address shown back to the operator. */
  forwardEmail: string;
  /** Old field kept for back-compat; superseded by sources[] groups. */
  leadsToPick: string;
  /** Per-externalType enable toggles. */
  leadTypes: LeadTypeSelection[];
  /** Shared source-selection mode. Applies across every enabled
   *  externalType — the UI shows one source picker, not one per type. */
  sourceMode: LeadTypeMode;
  /** Source names selected when sourceMode === 'customize'. Held even
   *  when mode === 'all' so flipping modes preserves the user's prior
   *  custom picks. */
  selectedSources: string[];
  firstTouchChannel: STLChannel;
  silenceNudge: {
    channel: STLNudgeChannel;
    delayMinutes: number;
  };
  followUp: {
    enabled: boolean;
    touchpoints: STLTouchpoint[];
  };
}

export interface PhoneAssignment {
  areaCode: string;
  number: string | null;
}

export interface VoiceTestCheck {
  label: string;
  detail: string;
  status: 'pass' | 'review' | 'pending';
}

export interface VoiceTestResult {
  checks: VoiceTestCheck[];
  ready: boolean;
}

export interface ChatbotConfig {
  enabled: boolean;
  visibility: 'entire' | 'selected';
}
