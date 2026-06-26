// PRD-specified safest defaults for every sales policy section
// (`dealership-configs-prd.md` §5–§11). Every default is the most restrictive
// realistic value so the agent never promises something the dealership doesn't
// actually offer. A positive surprise on the floor is acceptable; a false
// promise is not.

import type {
  CpoProgramPolicy,
  FinancePreQualifyPolicy,
  PaymentEstimatesPolicy,
  SalesPolicies,
  ShippingPolicy,
  TestDrivePolicy,
  TradeInPolicy,
  VehicleHoldPolicy,
} from '@/types/settings/sales-policies';

export const TEST_DRIVE_DEFAULTS: TestDrivePolicy = {
  minDriverAge: 18,
  licenseTypesAccepted: ['domestic'],
  insuranceRequired: false,
  salespersonRideAlong: 'always',
  standardDurationMinutes: 30,
  testDriveRoute: 'fixed',
  multipleVehiclesInOneVisit: true,
  bookingCutoffBeforeCloseMinutes: 60,
  documentsToBring: ['drivers_license'],
  extendedOvernightDrives: { overnightAvailable: false, formatsOffered: [] },
  atHomeTestDrive: { offered: false },
};

export const SHIPPING_DEFAULTS: ShippingPolicy = {
  homeDelivery: { offered: false },
  outOfStateShipping: { offered: false },
  airportPickup: { offered: false },
  outOfStateRegistration: { available: false, statesSupported: [] },
};

export const CPO_PROGRAM_DEFAULTS: CpoProgramPolicy = {
  offered: false,
  inspectionPoints: 150,
  warrantyTerms: [],
  eligibilityCriteria: [],
  customerFacingBenefits: [],
  multiBrandCertification: false,
};

export const FINANCE_PRE_QUALIFY_DEFAULTS: FinancePreQualifyPolicy = {
  onlinePreQualifyPageOffered: false,
  softCreditPull: false,
  whatHappensAfterSubmit: 'finance_team_calls_back',
};

export const TRADE_IN_DEFAULTS: TradeInPolicy = {
  acceptTradeIns: false,
  phoneEstimateOffered: false,
};

export const VEHICLE_HOLD_DEFAULTS: VehicleHoldPolicy = {
  offered: false,
  depositPolicy: 'applies_to_purchase_only',
  maxHoldDurationDays: 1,
  depositPaymentMethod: 'in_person_only',
};

export const PAYMENT_ESTIMATES_DEFAULTS: PaymentEstimatesPolicy = {
  enabled: false,
};

export const SALES_POLICIES_DEFAULTS: Required<SalesPolicies> = {
  testDrive: TEST_DRIVE_DEFAULTS,
  shipping: SHIPPING_DEFAULTS,
  cpoProgram: CPO_PROGRAM_DEFAULTS,
  financePreQualify: FINANCE_PRE_QUALIFY_DEFAULTS,
  tradeIn: TRADE_IN_DEFAULTS,
  vehicleHold: VEHICLE_HOLD_DEFAULTS,
  paymentEstimates: PAYMENT_ESTIMATES_DEFAULTS,
};

/** Merge persisted policies on top of defaults so the form never reads
 *  undefined on nested access. */
export function hydrateSalesPolicies(stored?: SalesPolicies | null): Required<SalesPolicies> {
  return {
    testDrive: {
      ...TEST_DRIVE_DEFAULTS,
      ...(stored?.testDrive ?? {}),
      extendedOvernightDrives: {
        ...TEST_DRIVE_DEFAULTS.extendedOvernightDrives,
        ...(stored?.testDrive?.extendedOvernightDrives ?? {}),
      },
      atHomeTestDrive: {
        ...TEST_DRIVE_DEFAULTS.atHomeTestDrive,
        ...(stored?.testDrive?.atHomeTestDrive ?? {}),
      },
    },
    shipping: {
      ...SHIPPING_DEFAULTS,
      ...(stored?.shipping ?? {}),
      homeDelivery: { ...SHIPPING_DEFAULTS.homeDelivery, ...(stored?.shipping?.homeDelivery ?? {}) },
      outOfStateShipping: { ...SHIPPING_DEFAULTS.outOfStateShipping, ...(stored?.shipping?.outOfStateShipping ?? {}) },
      airportPickup: { ...SHIPPING_DEFAULTS.airportPickup, ...(stored?.shipping?.airportPickup ?? {}) },
      outOfStateRegistration: {
        ...SHIPPING_DEFAULTS.outOfStateRegistration,
        ...(stored?.shipping?.outOfStateRegistration ?? {}),
      },
    },
    cpoProgram: { ...CPO_PROGRAM_DEFAULTS, ...(stored?.cpoProgram ?? {}) },
    financePreQualify: { ...FINANCE_PRE_QUALIFY_DEFAULTS, ...(stored?.financePreQualify ?? {}) },
    tradeIn: { ...TRADE_IN_DEFAULTS, ...(stored?.tradeIn ?? {}) },
    vehicleHold: { ...VEHICLE_HOLD_DEFAULTS, ...(stored?.vehicleHold ?? {}) },
    paymentEstimates: { ...PAYMENT_ESTIMATES_DEFAULTS, ...(stored?.paymentEstimates ?? {}) },
  };
}
