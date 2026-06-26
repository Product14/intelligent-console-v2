// Validation helpers for the service policies form.

import type {
  AfterHoursPolicy,
  DiagnosticServiceRules,
  ExpressServiceRules,
  ServiceCatalogEntry,
  ServiceCatalogPolicy,
  SlotCapacity,
  TransferCallbackPolicy,
  TransportationFacilitiesPolicy,
} from '@/types/settings/service-policies';

export interface ServicePolicyErrors {
  afterHours?: Partial<Record<'address', string>>;
  transportationFacilities?: {
    waiter?: Partial<Record<'limitPerHour', string>>;
    shuttle?: Partial<Record<'radiusMiles', string>>;
    concierge?: Partial<Record<'radiusMiles', string>>;
    loaner?: Partial<Record<'minServiceAmount', string>>;
  };
  serviceCatalog?: {
    rows?: Record<string, Partial<Record<keyof ServiceCatalogEntry, string>>>;
  };
  transferCallback?: Partial<Record<'transferPhone', string>>;
  expressService?: Partial<Record<'timeGuaranteeCustomMinutes', string>>;
  diagnosticService?: Partial<Record<'feeAmount', string>>;
  slotCapacity?: Partial<Record<'durationMinutes' | 'maxAppointmentsPerSlot', string>>;
}

export function validateAfterHours(
  p: AfterHoursPolicy
): ServicePolicyErrors['afterHours'] {
  const anyEnabled = p.dropOffAvailable || p.pickupAvailable;
  if (!anyEnabled) return undefined;
  const errors: NonNullable<ServicePolicyErrors['afterHours']> = {};
  if (!p.address || !p.address.formattedAddress) {
    errors.address = 'Enter an address';
  }
  return Object.keys(errors).length ? errors : undefined;
}

export function validateTransportationFacilities(
  p: TransportationFacilitiesPolicy
): ServicePolicyErrors['transportationFacilities'] {
  const errors: NonNullable<ServicePolicyErrors['transportationFacilities']> = {};
  if (p.waiter.enabled && p.waiter.limitPerHour !== undefined && p.waiter.limitPerHour < 1) {
    errors.waiter = { limitPerHour: 'Limit must be at least 1 per hour' };
  }
  if (p.shuttle.enabled && p.shuttle.radiusMiles !== undefined && p.shuttle.radiusMiles < 1) {
    errors.shuttle = { radiusMiles: 'Radius must be at least 1 mile' };
  }
  if (p.concierge.enabled && p.concierge.radiusMiles !== undefined && p.concierge.radiusMiles < 1) {
    errors.concierge = { radiusMiles: 'Radius must be at least 1 mile' };
  }
  if (p.loaner.enabled && p.loaner.minServiceAmount !== undefined && p.loaner.minServiceAmount < 0) {
    errors.loaner = { minServiceAmount: 'Amount cannot be negative' };
  }
  return Object.keys(errors).length ? errors : undefined;
}

export function validateServiceCatalog(
  p: ServiceCatalogPolicy
): ServicePolicyErrors['serviceCatalog'] {
  const rows: Record<string, Partial<Record<keyof ServiceCatalogEntry, string>>> = {};
  for (const row of p.services) {
    const rowErrors: Partial<Record<keyof ServiceCatalogEntry, string>> = {};
    if (!row.opCode.trim()) rowErrors.opCode = 'Op code is required';
    if (!row.name.trim()) rowErrors.name = 'Service name is required';
    if (Object.keys(rowErrors).length) rows[row.id] = rowErrors;
  }
  return Object.keys(rows).length ? { rows } : undefined;
}

export function validateTransferCallback(
  p: TransferCallbackPolicy
): ServicePolicyErrors['transferCallback'] {
  const hasTransfer = Object.values(p.scenarios).includes('transfer');
  if (!hasTransfer) return undefined;
  if (!p.transferPhone || !p.transferPhone.phone || p.transferPhone.phone.length < 6) {
    return { transferPhone: 'Add a transfer number — at least one scenario routes to Transfer.' };
  }
  return undefined;
}

export function validateExpressService(
  p: ExpressServiceRules
): ServicePolicyErrors['expressService'] {
  if (!p.offered) return undefined;
  if (p.timeGuarantee === 'other') {
    if (!p.timeGuaranteeCustomMinutes || p.timeGuaranteeCustomMinutes < 1) {
      return { timeGuaranteeCustomMinutes: 'Enter a minute value' };
    }
  }
  return undefined;
}

export function validateDiagnosticService(
  p: DiagnosticServiceRules
): ServicePolicyErrors['diagnosticService'] {
  if (!p.offered || !p.feeCharged) return undefined;
  if (p.feeAmount === undefined || p.feeAmount <= 0) {
    return { feeAmount: 'Enter the diagnostic fee' };
  }
  return undefined;
}

export function validateSlotCapacity(
  p: SlotCapacity
): ServicePolicyErrors['slotCapacity'] {
  const errors: NonNullable<ServicePolicyErrors['slotCapacity']> = {};
  if (!p.durationMinutes || p.durationMinutes < 5) {
    errors.durationMinutes = 'At least 5 minutes';
  }
  if (!p.maxAppointmentsPerSlot || p.maxAppointmentsPerSlot < 1) {
    errors.maxAppointmentsPerSlot = 'At least 1 appointment per slot';
  }
  return Object.keys(errors).length ? errors : undefined;
}
