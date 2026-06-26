'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/settings';
import { useServicePolicies } from '@/hooks/settings/use-service-policies';
import type { ParsedAddress } from '@/lib/settings/google-places';
import { AfterHoursPolicyCard } from './after-hours-policy-card';
import { AllowedMakesCard } from './allowed-makes-card';
import { DiagnosticServiceCard } from './diagnostic-service-card';
import { ExpressServiceCard } from './express-service-card';
import { PricingVisibilityCard } from './pricing-visibility-card';
import { ServiceCatalogCard } from './service-catalog-card';
import { ServicePolicyCard } from './service-policy-card';
import { SlotCapacityCard } from './slot-capacity-card';
import { TransferCallbackCard } from './transfer-callback-card';
import { TransportationFacilitiesCard } from './transportation-facilities-card';
import { UpsellRulesCard } from './upsell-rules-card';

/** Builds a stub ParsedAddress from the rooftop profile's formatted-address
 *  string. The "Use rooftop address" quick action sets this directly on the
 *  AddressField — the dealer can hit "Edit details" to fill structured fields
 *  (city/state/zip) afterward, or pick a different address from autocomplete. */
function rooftopParsedAddress(formattedAddress: string | undefined): ParsedAddress | null {
  if (!formattedAddress || !formattedAddress.trim()) return null;
  return {
    formattedAddress,
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    country: '',
    countryCode: '',
    zipcode: '',
    lat: null,
    lng: null,
  };
}

interface ServicePoliciesTabProps {
  saveSignal?: number;
}

/**
 * Service agent → Policies tab. Hosts all service-side dealership facts the
 * agent reads on every call.
 */
export function ServicePoliciesTab({ saveSignal = 0 }: ServicePoliciesTabProps) {
  const { policies, setSection, loading } = useServicePolicies(saveSignal);
  const [rooftopAddress, setRooftopAddress] = useState<ParsedAddress | null>(null);

  useEffect(() => {
    api.rooftop.getProfile().then((profile) => {
      setRooftopAddress(rooftopParsedAddress(profile.rooftopAddress));
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-2xl border border-black/10 bg-black/[0.02]"
          />
        ))}
      </div>
    );
  }

  const catalog = policies.serviceCatalog.services;

  return (
    <div className="space-y-3">
      <p className="mb-4 text-xs text-black-60">
        Facts the service agent reads on every call. Flip the ones this rooftop actually offers.
      </p>

      <AfterHoursPolicyCard
        value={policies.afterHours}
        rooftopAddress={rooftopAddress}
        onChange={(v) => setSection('afterHours', v)}
      />
      <TransportationFacilitiesCard
        value={policies.transportationFacilities}
        onChange={(v) => setSection('transportationFacilities', v)}
      />
      <AllowedMakesCard
        value={policies.allowedMakes}
        onChange={(v) => setSection('allowedMakes', v)}
      />
      <ServiceCatalogCard
        value={policies.serviceCatalog}
        onChange={(v) => setSection('serviceCatalog', v)}
      />
      <TransferCallbackCard
        value={policies.transferCallback}
        onChange={(v) => setSection('transferCallback', v)}
      />
      <ServicePolicyCard
        value={policies.servicePolicyRules}
        onChange={(v) => setSection('servicePolicyRules', v)}
      />
      <ExpressServiceCard
        value={policies.expressService}
        catalog={catalog}
        onChange={(v) => setSection('expressService', v)}
      />
      <DiagnosticServiceCard
        value={policies.diagnosticService}
        onChange={(v) => setSection('diagnosticService', v)}
      />
      <UpsellRulesCard
        value={policies.upsellRules}
        catalog={catalog}
        onChange={(v) => setSection('upsellRules', v)}
      />
      <PricingVisibilityCard
        value={policies.pricingVisibility}
        onChange={(v) => setSection('pricingVisibility', v)}
      />
      <SlotCapacityCard
        value={policies.slotCapacity}
        onChange={(v) => setSection('slotCapacity', v)}
      />
    </div>
  );
}
