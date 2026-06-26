// Safest defaults for the service-side policies.

import type {
  AfterHoursPolicy,
  AllowedMakesPolicy,
  DiagnosticServiceRules,
  EscalationAction,
  ExpressServiceRules,
  PricingVisibility,
  ServiceCatalogPolicy,
  ServiceFacility,
  ServicePolicies,
  ServicePolicyRules,
  SlotCapacity,
  TransferCallbackPolicy,
  TransferScenarioId,
  TransportationFacilitiesPolicy,
  UpsellRules,
} from '@/types/settings/service-policies';

export const AFTER_HOURS_DEFAULTS: AfterHoursPolicy = {
  dropOffAvailable: false,
  pickupAvailable: false,
  acceptedWindow: 'all_nights',
  appointmentRequired: false,
  address: null,
  instructions: [],
};

const FACILITY_DEFAULTS: ServiceFacility = {
  enabled: false,
  notes: [],
};

export const TRANSPORTATION_FACILITIES_DEFAULTS: TransportationFacilitiesPolicy = {
  waiter: { ...FACILITY_DEFAULTS },
  selfDropoff: { ...FACILITY_DEFAULTS },
  shuttle: { ...FACILITY_DEFAULTS },
  concierge: { ...FACILITY_DEFAULTS },
  loaner: { ...FACILITY_DEFAULTS },
};

export const ALLOWED_MAKES_DEFAULTS: AllowedMakesPolicy = {
  allMakes: false,
  makes: [],
};

export const SERVICE_CATALOG_DEFAULTS: ServiceCatalogPolicy = {
  services: [],
};

// ── F1. Transfer & Callback ─────────────────────────────────────────────

const TRANSFER_SCENARIO_IDS: TransferScenarioId[] = [
  'asks_for_person',
  'asks_for_manager',
  'quote_outside_catalog',
  'warranty_or_recall',
  'insurance_accident',
  'complaint_prior_service',
  'language_unavailable',
];

function defaultScenarios(): Record<TransferScenarioId, EscalationAction> {
  return TRANSFER_SCENARIO_IDS.reduce(
    (acc, id) => {
      acc[id] = 'callback';
      return acc;
    },
    {} as Record<TransferScenarioId, EscalationAction>
  );
}

export const TRANSFER_CALLBACK_DEFAULTS: TransferCallbackPolicy = {
  scenarios: defaultScenarios(),
  callbackSla: 'within_24h',
  customEscalations: [],
};

// ── F2. Service Rules ───────────────────────────────────────────────────

export const SERVICE_POLICY_DEFAULTS: ServicePolicyRules = {
  otherRules: [],
};

// ── F3. Express Service ─────────────────────────────────────────────────

export const EXPRESS_SERVICE_DEFAULTS: ExpressServiceRules = {
  offered: false,
  timeGuarantee: '60_min',
  eligibleServiceIds: [],
  walkInsForExpress: false,
  availability: 'always',
  notes: [],
};

// ── F4. Diagnostic Service ──────────────────────────────────────────────

export const DIAGNOSTIC_SERVICE_DEFAULTS: DiagnosticServiceRules = {
  offered: false,
  feeCharged: false,
  feeWaivedIfWorkPerformed: true,
  appointmentRequired: true,
  notes: [],
};

// ── F5. Upsell Rules ────────────────────────────────────────────────────

export const UPSELL_RULES_DEFAULTS: UpsellRules = {
  nudgeDuringBooking: false,
  suggestedServiceIds: [],
};

// ── F6. Pricing Visibility ──────────────────────────────────────────────

export const PRICING_VISIBILITY_DEFAULTS: PricingVisibility = {
  sharePrices: false,
  varianceBehavior: 'range',
};

// ── F7. Slot Capacity ───────────────────────────────────────────────────

export const SLOT_CAPACITY_DEFAULTS: SlotCapacity = {
  durationMinutes: 60,
  maxAppointmentsPerSlot: 3,
  startTimes: 'on_the_hour',
  bufferMinutes: 0,
};

// ── Aggregate ───────────────────────────────────────────────────────────

export const SERVICE_POLICIES_DEFAULTS: Required<ServicePolicies> = {
  afterHours: AFTER_HOURS_DEFAULTS,
  transportationFacilities: TRANSPORTATION_FACILITIES_DEFAULTS,
  allowedMakes: ALLOWED_MAKES_DEFAULTS,
  serviceCatalog: SERVICE_CATALOG_DEFAULTS,
  transferCallback: TRANSFER_CALLBACK_DEFAULTS,
  servicePolicyRules: SERVICE_POLICY_DEFAULTS,
  expressService: EXPRESS_SERVICE_DEFAULTS,
  diagnosticService: DIAGNOSTIC_SERVICE_DEFAULTS,
  upsellRules: UPSELL_RULES_DEFAULTS,
  pricingVisibility: PRICING_VISIBILITY_DEFAULTS,
  slotCapacity: SLOT_CAPACITY_DEFAULTS,
};

function mergeFacility(stored: Partial<ServiceFacility> | undefined): ServiceFacility {
  return {
    ...FACILITY_DEFAULTS,
    ...(stored ?? {}),
    notes: stored?.notes ?? [],
  };
}

export function hydrateServicePolicies(
  stored?: ServicePolicies | null
): Required<ServicePolicies> {
  return {
    afterHours: {
      ...AFTER_HOURS_DEFAULTS,
      ...(stored?.afterHours ?? {}),
      instructions: stored?.afterHours?.instructions ?? [],
    },
    transportationFacilities: {
      waiter: mergeFacility(stored?.transportationFacilities?.waiter),
      selfDropoff: mergeFacility(stored?.transportationFacilities?.selfDropoff),
      shuttle: mergeFacility(stored?.transportationFacilities?.shuttle),
      concierge: mergeFacility(stored?.transportationFacilities?.concierge),
      loaner: mergeFacility(stored?.transportationFacilities?.loaner),
    },
    allowedMakes: { ...ALLOWED_MAKES_DEFAULTS, ...(stored?.allowedMakes ?? {}) },
    serviceCatalog: { ...SERVICE_CATALOG_DEFAULTS, ...(stored?.serviceCatalog ?? {}) },
    transferCallback: {
      ...TRANSFER_CALLBACK_DEFAULTS,
      ...(stored?.transferCallback ?? {}),
      scenarios: {
        ...TRANSFER_CALLBACK_DEFAULTS.scenarios,
        ...(stored?.transferCallback?.scenarios ?? {}),
      },
      customEscalations: stored?.transferCallback?.customEscalations ?? [],
    },
    servicePolicyRules: {
      ...SERVICE_POLICY_DEFAULTS,
      ...(stored?.servicePolicyRules ?? {}),
      otherRules: stored?.servicePolicyRules?.otherRules ?? [],
    },
    expressService: {
      ...EXPRESS_SERVICE_DEFAULTS,
      ...(stored?.expressService ?? {}),
      notes: stored?.expressService?.notes ?? [],
    },
    diagnosticService: {
      ...DIAGNOSTIC_SERVICE_DEFAULTS,
      ...(stored?.diagnosticService ?? {}),
      notes: stored?.diagnosticService?.notes ?? [],
    },
    upsellRules: { ...UPSELL_RULES_DEFAULTS, ...(stored?.upsellRules ?? {}) },
    pricingVisibility: { ...PRICING_VISIBILITY_DEFAULTS, ...(stored?.pricingVisibility ?? {}) },
    slotCapacity: { ...SLOT_CAPACITY_DEFAULTS, ...(stored?.slotCapacity ?? {}) },
  };
}
