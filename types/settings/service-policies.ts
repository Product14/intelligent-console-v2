// Per-rooftop policy facts the Service voice agent reads at runtime.

import type { ParsedAddress } from '@/lib/settings/google-places';

export type AfterHoursWindow = 'weeknights' | 'weekends' | 'all_nights';

/** After-Hours: drop-off and pickup. A rooftop can offer one, the other, or
 *  both. Window / appointment / address / instructions are shared — dealers
 *  almost always use the same drop box, hours, and instructions regardless of
 *  whether the customer is leaving a car or picking one up. */
export interface AfterHoursPolicy {
  dropOffAvailable: boolean;
  pickupAvailable: boolean;
  // Shared logistics — surfaced whenever either side is enabled.
  acceptedWindow: AfterHoursWindow;
  appointmentRequired: boolean;
  /** Physical location for the after-hours touchpoint. */
  address: ParsedAddress | null;
  /** Step-by-step instructions the agent reads on the call. One entry per
   *  step. */
  instructions: string[];
}

/** Phone with country code. Same shape as the Vini General trigger numbers. */
export interface ServicePhone {
  countryCode: string;
  phone: string;
}

export type LoanerEligibility = 'warranty' | 'paid' | 'either';

/** A single transportation facility. `enabled` gates the structured fields
 *  below. Each facility only uses a subset of these fields — the others stay
 *  undefined. See TransportationFacilitiesPolicy for which fields apply to
 *  which facility. */
export interface ServiceFacility {
  enabled: boolean;
  /** Per-facility notes the agent reads back when asked. */
  notes: string[];
  // Structured fields, per-facility. Only populated when the facility uses them:
  /** Waiter: maximum waiters the rooftop can serve per hour. */
  limitPerHour?: number;
  /** Shuttle & Concierge: pickup/drop-off radius. */
  radiusMiles?: number;
  /** Shuttle: free-text operating window (e.g. "Mon–Fri 8 AM – 5 PM"). */
  operatingHours?: string;
  /** Concierge: whether a fee applies. */
  feeApplies?: boolean;
  /** Loaner: minimum service amount in dollars for loaner eligibility. */
  minServiceAmount?: number;
  /** Loaner: which kinds of service qualify. */
  loanerEligibility?: LoanerEligibility[];
}

/** Transportation facilities — replaces the old Service Capabilities. */
export interface TransportationFacilitiesPolicy {
  waiter: ServiceFacility;
  selfDropoff: ServiceFacility;
  shuttle: ServiceFacility;
  concierge: ServiceFacility;
  loaner: ServiceFacility;
}

/** Vehicle makes the service department supports. Hardcoded to US-market
 *  brands for MVP. */
export type VehicleMake =
  | 'acura'
  | 'audi'
  | 'bmw'
  | 'buick'
  | 'cadillac'
  | 'chevrolet'
  | 'chrysler'
  | 'dodge'
  | 'fiat'
  | 'ford'
  | 'gmc'
  | 'genesis'
  | 'honda'
  | 'hyundai'
  | 'infiniti'
  | 'jaguar'
  | 'jeep'
  | 'kia'
  | 'land_rover'
  | 'lexus'
  | 'lincoln'
  | 'mazda'
  | 'mercedes_benz'
  | 'mini'
  | 'mitsubishi'
  | 'nissan'
  | 'porsche'
  | 'ram'
  | 'subaru'
  | 'tesla'
  | 'toyota'
  | 'volkswagen'
  | 'volvo';

export interface AllowedMakesPolicy {
  /** Shortcut for rooftops that service every make. Short-circuits the
   *  `makes` picker when true. */
  allMakes: boolean;
  makes: VehicleMake[];
}

/** One row in the dealer's service catalog. Free text for op code / name /
 *  description because every dealer's catalog is bespoke. */
export interface ServiceCatalogEntry {
  /** Stable client-side id for list reconciliation. */
  id: string;
  opCode: string;
  name: string;
  description?: string;
  /** Dealer-quoted price in dollars. Null = "varies" / "ask team". */
  price: number | null;
}

export interface ServiceCatalogPolicy {
  services: ServiceCatalogEntry[];
}

// ── F1. Transfer & Callback ─────────────────────────────────────────────

export type EscalationAction = 'transfer' | 'callback' | 'take_message';
export type CallbackSla = 'same_day' | 'within_24h' | 'within_48h';
export type TransferScenarioId =
  | 'asks_for_person'
  | 'asks_for_manager'
  | 'quote_outside_catalog'
  | 'warranty_or_recall'
  | 'insurance_accident'
  | 'complaint_prior_service'
  | 'language_unavailable';

export interface TransferCallbackPolicy {
  scenarios: Record<TransferScenarioId, EscalationAction>;
  transferPhone?: ServicePhone;
  callbackSla: CallbackSla;
  /** Custom escalation rules the agent reads internally. One entry per rule. */
  customEscalations: string[];
}

// ── F2. Service Rules ───────────────────────────────────────────────────

export interface ServicePolicyRules {
  /** Free-form rules the agent reads back when asked. One entry per rule. */
  otherRules: string[];
}

// ── F3. Express Service ─────────────────────────────────────────────────

export type ExpressTimeGuarantee = '30_min' | '45_min' | '60_min' | 'other' | 'dont_commit';
export type ExpressAvailability = 'weekdays' | 'weekends' | 'always';

export interface ExpressServiceRules {
  offered: boolean;
  timeGuarantee: ExpressTimeGuarantee;
  /** Used only when timeGuarantee = 'other'. */
  timeGuaranteeCustomMinutes?: number;
  /** References ServiceCatalogEntry.id. */
  eligibleServiceIds: string[];
  walkInsForExpress: boolean;
  availability: ExpressAvailability;
  /** Notes the agent reads back when asked. One entry per note. */
  notes: string[];
}

// ── F4. Diagnostic Service ──────────────────────────────────────────────

export interface DiagnosticServiceRules {
  offered: boolean;
  feeCharged: boolean;
  feeAmount?: number;
  feeWaivedIfWorkPerformed: boolean;
  appointmentRequired: boolean;
  /** Notes the agent reads back when asked. One entry per note. */
  notes: string[];
}

// ── F5. Upsell Rules ────────────────────────────────────────────────────

export interface UpsellRules {
  nudgeDuringBooking: boolean;
  /** References ServiceCatalogEntry.id. */
  suggestedServiceIds: string[];
}

// ── F6. Pricing Visibility ──────────────────────────────────────────────

export type PricingVarianceBehavior = 'range' | 'dont_quote';

export interface PricingVisibility {
  sharePrices: boolean;
  varianceBehavior: PricingVarianceBehavior;
}

// ── F7. Slot Capacity ───────────────────────────────────────────────────

export type SlotStartTimes = 'on_the_hour' | 'every_30_min' | 'every_15_min';

export interface SlotCapacity {
  durationMinutes: number;
  maxAppointmentsPerSlot: number;
  startTimes: SlotStartTimes;
  bufferMinutes: number;
}

// ── ServicePolicies aggregate ───────────────────────────────────────────

export interface ServicePolicies {
  /** After-hours drop-off + pickup (replaces the prior drop-off-only shape). */
  afterHours?: AfterHoursPolicy;
  /** Transportation facilities (replaces the prior Service Capabilities). */
  transportationFacilities?: TransportationFacilitiesPolicy;
  allowedMakes?: AllowedMakesPolicy;
  serviceCatalog?: ServiceCatalogPolicy;
  transferCallback?: TransferCallbackPolicy;
  servicePolicyRules?: ServicePolicyRules;
  expressService?: ExpressServiceRules;
  diagnosticService?: DiagnosticServiceRules;
  upsellRules?: UpsellRules;
  pricingVisibility?: PricingVisibility;
  slotCapacity?: SlotCapacity;
}

export type ServicePolicySectionId =
  | 'afterHours'
  | 'transportationFacilities'
  | 'allowedMakes'
  | 'serviceCatalog'
  | 'transferCallback'
  | 'servicePolicyRules'
  | 'expressService'
  | 'diagnosticService'
  | 'upsellRules'
  | 'pricingVisibility'
  | 'slotCapacity';
