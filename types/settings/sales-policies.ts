// Per-rooftop policy facts the Sales voice agent reads at runtime.
//
// Shape matches the central-config agent-config wire contract exactly
// (entityConfig.sales.policies) so the adapter is a pure envelope wrap —
// no per-field translation. Backend reference:
//   GET/POST https://uat-api.spyne.xyz/central-config/v1/vini-config/agent-config

/** License categories accepted for a test drive. `domestic` resolves at
 *  runtime against the rooftop's country — same UI works for US, UK,
 *  Canadian, etc. dealers without baking in country-specific options. */
export type LicenseType = 'domestic' | 'international' | 'learner_permit';

/** Wire enum: 'unaccompanied' is the API's name for "never accompanied". */
export type SalespersonRideAlong = 'always' | 'optional' | 'unaccompanied';

export type TestDriveRoute = 'fixed' | 'customer_chooses';

/** Common identification documents a customer may need to bring. The agent
 *  reads the checked items aloud when confirming a test-drive booking. */
export type DocumentType =
  | 'drivers_license'
  | 'proof_of_insurance'
  | 'credit_card_hold'
  | 'two_forms_of_id';

/** Section A — Test Drive Policy (PRD §5). */
export interface TestDrivePolicy {
  minDriverAge: number;
  licenseTypesAccepted: LicenseType[];
  insuranceRequired: boolean;
  salespersonRideAlong: SalespersonRideAlong;
  standardDurationMinutes: number;
  testDriveRoute: TestDriveRoute;
  multipleVehiclesInOneVisit: boolean;
  bookingCutoffBeforeCloseMinutes: number;
  documentsToBring: DocumentType[];
  extendedOvernightDrives: {
    overnightAvailable: boolean;
    formatsOffered: string[]; // e.g. ['24h', '48h', 'weekend']
  };
  atHomeTestDrive: {
    offered: boolean;
    maxRadiusMiles?: number | null;
    minLeadTimeHours?: number | null;
    feeApplies?: boolean;
  };
}

export type HomeDeliveryFee = 'free' | 'flat' | 'distance_based';
export type OutOfStateHandledBy = 'dealer_arranges' | 'customer_arranges';
export type ShippingCostArrangement = 'included' | 'separate' | 'customer_arranged';

/** Section B — Shipping and Delivery Policy (PRD §6). */
export interface ShippingPolicy {
  homeDelivery: {
    offered: boolean;
    maxRadiusMiles?: number | null;
    deliveryFee?: HomeDeliveryFee;
  };
  outOfStateShipping: {
    offered: boolean;
    handledBy?: OutOfStateHandledBy;
    shippingCostArrangement?: ShippingCostArrangement;
  };
  airportPickup: {
    offered: boolean;
  };
  /** Combined out-of-state registration + temp tag handling. The dealer
   *  picks the supported state list via the picker (which has its own
   *  Select-all / Clear actions). */
  outOfStateRegistration: {
    available: boolean;
    statesSupported: string[]; // 2-letter US state codes (e.g., ['CA', 'TX'])
  };
}

/** Common warranty extension patterns for CPO programs. */
export type CpoWarrantyTerm =
  | 'powertrain_5yr_60k'
  | 'powertrain_6yr_100k'
  | 'powertrain_7yr_100k'
  | 'bumper_12mo_12k'
  | 'bumper_24mo_unlimited';

/** Common CPO eligibility limits. Includes `clean_carfax` from the API
 *  reference payload alongside the original PRD options. */
export type CpoEligibility =
  | 'up_to_5_years'
  | 'up_to_6_years'
  | 'under_60k_miles'
  | 'under_80k_miles'
  | 'under_100k_miles'
  | 'original_brand_only'
  | 'no_accidents_carfax'
  | 'clean_carfax';

/** Common CPO benefits. Wire name `roadside_assistance_247`. */
export type CpoBenefit =
  | 'roadside_assistance_247'
  | 'trip_interruption'
  | 'carfax_report'
  | 'carfax_buyback'
  | 'return_period'
  | 'loaner_vehicle'
  | 'maintenance_check'
  | 'siriusxm_trial';

/** Section C — Certified Pre-Owned Program (PRD §7). Wire key: `cpoProgram`. */
export interface CpoProgramPolicy {
  offered: boolean;
  inspectionPoints?: number;
  warrantyTerms: CpoWarrantyTerm[];
  eligibilityCriteria: CpoEligibility[];
  customerFacingBenefits: CpoBenefit[];
  multiBrandCertification: boolean;
}

export type WhatHappensAfterSubmit = 'immediate' | 'email' | 'finance_team_calls_back';

/** Section E — Finance Pre-Qualify (PRD §9). */
export interface FinancePreQualifyPolicy {
  onlinePreQualifyPageOffered: boolean;
  /** SMS-only URL — agent never reads aloud. (NoDataFabrication carve-out.) */
  preQualifyPageUrl?: string | null;
  softCreditPull: boolean;
  estimatedTimeMinutes?: number | null;
  whatHappensAfterSubmit: WhatHappensAfterSubmit;
}

/** Section F — Trade-In Process (PRD §10). */
export interface TradeInPolicy {
  acceptTradeIns: boolean;
  phoneEstimateOffered: boolean;
  /** SMS-only URL — agent never reads aloud. (NoDataFabrication carve-out.) */
  onlineEstimatorUrl?: string | null;
}

export type DepositPolicy = 'fully_refundable' | 'non_refundable' | 'applies_to_purchase_only';
export type DepositPaymentMethod = 'online_link' | 'phone' | 'in_person_only';

/** Section G — Vehicle Hold / Reservation (PRD §11). */
export interface VehicleHoldPolicy {
  offered: boolean;
  depositPolicy: DepositPolicy;
  maxHoldDurationDays: number;
  depositPaymentMethod: DepositPaymentMethod;
}

/** Informativ payment-aware conversations (RETCONVAI-2535). Per-dealer opt-in.
 *  Wire shape may also carry `provider` and `buyerLocationZip`, but the form
 *  only owns `enabled` — the adapter strips the others on save. */
export interface PaymentEstimatesPolicy {
  enabled: boolean;
}

export interface SalesPolicies {
  testDrive?: TestDrivePolicy;
  shipping?: ShippingPolicy;
  cpoProgram?: CpoProgramPolicy;
  financePreQualify?: FinancePreQualifyPolicy;
  tradeIn?: TradeInPolicy;
  vehicleHold?: VehicleHoldPolicy;
  paymentEstimates?: PaymentEstimatesPolicy;
}

export type SalesPolicySectionId =
  | 'testDrive'
  | 'shipping'
  | 'cpoProgram'
  | 'financePreQualify'
  | 'tradeIn'
  | 'vehicleHold'
  | 'paymentEstimates';
