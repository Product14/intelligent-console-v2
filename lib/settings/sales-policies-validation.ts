// Validation helpers for the sales policies form.
//
// Three allow-listed URLs (financePreQualify.preQualifyPageUrl,
// afterHoursDropOff.keyDropMapPinUrl, tradeIn.onlineEstimatorUrl) must be HTTPS
// and ideally 200 OK. PRD §9 says the UI flags 4xx/5xx for the dealer to fix
// but does NOT block save.

import type {
  CpoProgramPolicy,
  FinancePreQualifyPolicy,
  ShippingPolicy,
  TestDrivePolicy,
  TradeInPolicy,
  VehicleHoldPolicy,
} from '@/types/settings/sales-policies';

export type UrlReachability =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'reachable'; status: number }
  | { state: 'unreachable'; status?: number; reason?: string };

const HTTPS_PREFIX = /^https:\/\//i;

export function isValidHttpsUrl(value: string): boolean {
  if (!value) return false;
  if (!HTTPS_PREFIX.test(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export async function checkUrlReachable(url: string): Promise<UrlReachability> {
  if (!isValidHttpsUrl(url)) {
    return { state: 'unreachable', reason: 'URL must start with https://' };
  }
  try {
    const res = await fetch(url, { method: 'GET', mode: 'no-cors' });
    if (res.type === 'opaque' || res.status === 0) {
      return { state: 'reachable', status: 0 };
    }
    if (res.status >= 200 && res.status < 400) {
      return { state: 'reachable', status: res.status };
    }
    return { state: 'unreachable', status: res.status, reason: `Server returned ${res.status}` };
  } catch (err) {
    return { state: 'unreachable', reason: err instanceof Error ? err.message : 'Network error' };
  }
}

export interface PolicyErrors {
  testDrive?: Partial<Record<'atHomeTestDrive.maxRadiusMiles' | 'atHomeTestDrive.minLeadTimeHours' | 'licenseTypesAccepted', string>>;
  shipping?: Partial<Record<'homeDelivery.maxRadiusMiles' | 'homeDelivery.deliveryFee' | 'outOfStateShipping.handledBy' | 'outOfStateShipping.shippingCostArrangement' | 'outOfStateRegistration.statesSupported', string>>;
  cpoProgram?: Partial<Record<keyof CpoProgramPolicy, string>>;
  financePreQualify?: Partial<Record<keyof FinancePreQualifyPolicy, string>>;
  tradeIn?: Partial<Record<keyof TradeInPolicy, string>>;
  vehicleHold?: Partial<Record<keyof VehicleHoldPolicy, string>>;
}

export function validateTestDrive(p: TestDrivePolicy): PolicyErrors['testDrive'] {
  const errors: NonNullable<PolicyErrors['testDrive']> = {};
  if (!p.licenseTypesAccepted.length) {
    errors.licenseTypesAccepted = 'Pick at least one license type';
  }
  if (p.atHomeTestDrive.offered) {
    if (!p.atHomeTestDrive.maxRadiusMiles || p.atHomeTestDrive.maxRadiusMiles <= 0) {
      errors['atHomeTestDrive.maxRadiusMiles'] = 'Radius is required for at-home test drives';
    }
    if (p.atHomeTestDrive.minLeadTimeHours === undefined || p.atHomeTestDrive.minLeadTimeHours === null || p.atHomeTestDrive.minLeadTimeHours < 0) {
      errors['atHomeTestDrive.minLeadTimeHours'] = 'Lead time is required';
    }
  }
  return Object.keys(errors).length ? errors : undefined;
}

export function validateShipping(p: ShippingPolicy): PolicyErrors['shipping'] {
  const errors: NonNullable<PolicyErrors['shipping']> = {};
  if (p.homeDelivery.offered) {
    if (!p.homeDelivery.maxRadiusMiles || p.homeDelivery.maxRadiusMiles <= 0) {
      errors['homeDelivery.maxRadiusMiles'] = 'Radius is required when home delivery is on';
    }
    if (!p.homeDelivery.deliveryFee) {
      errors['homeDelivery.deliveryFee'] = 'Choose a fee policy';
    }
  }
  if (p.outOfStateShipping.offered) {
    if (!p.outOfStateShipping.handledBy) {
      errors['outOfStateShipping.handledBy'] = 'Choose who arranges shipping';
    }
    if (!p.outOfStateShipping.shippingCostArrangement) {
      errors['outOfStateShipping.shippingCostArrangement'] = 'Choose a fee policy';
    }
  }
  if (p.outOfStateRegistration.available && !p.outOfStateRegistration.statesSupported.length) {
    errors['outOfStateRegistration.statesSupported'] = 'Pick at least one state';
  }
  return Object.keys(errors).length ? errors : undefined;
}

export function validateFinancePreQualify(p: FinancePreQualifyPolicy): PolicyErrors['financePreQualify'] {
  const errors: NonNullable<PolicyErrors['financePreQualify']> = {};
  if (p.onlinePreQualifyPageOffered) {
    if (!p.preQualifyPageUrl) errors.preQualifyPageUrl = 'Pre-qualify URL is required';
    else if (!isValidHttpsUrl(p.preQualifyPageUrl)) errors.preQualifyPageUrl = 'URL must start with https://';
  }
  return Object.keys(errors).length ? errors : undefined;
}

export function validateTradeIn(p: TradeInPolicy): PolicyErrors['tradeIn'] {
  const errors: NonNullable<PolicyErrors['tradeIn']> = {};
  if (p.onlineEstimatorUrl && !isValidHttpsUrl(p.onlineEstimatorUrl)) {
    errors.onlineEstimatorUrl = 'URL must start with https://';
  }
  return Object.keys(errors).length ? errors : undefined;
}

export function validateCpoProgram(_p: CpoProgramPolicy): PolicyErrors['cpoProgram'] {
  // CPO is fully selection-based — no required-fields validation needed.
  // The dealer's Yes/No answer plus any chosen options is always a valid save.
  return undefined;
}

export function validateVehicleHold(p: VehicleHoldPolicy): PolicyErrors['vehicleHold'] {
  const errors: NonNullable<PolicyErrors['vehicleHold']> = {};
  if (p.offered) {
    if (!p.maxHoldDurationDays || p.maxHoldDurationDays < 1) {
      errors.maxHoldDurationDays = 'Hold duration must be at least 1 day';
    }
  }
  return Object.keys(errors).length ? errors : undefined;
}
