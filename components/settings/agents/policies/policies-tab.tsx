'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/settings';
import { useSalesPolicies } from '@/hooks/settings/use-sales-policies';
import { CpoPolicyCard } from './cpo-policy-card';
import { FinancePreQualifyPolicyCard } from './finance-prequalify-policy-card';
import { PaymentEstimatesPolicyCard } from './payment-estimates-policy-card';
import { ShippingPolicyCard } from './shipping-policy-card';
import { TestDrivePolicyCard } from './test-drive-policy-card';
import { TradeInPolicyCard } from './trade-in-policy-card';
import { VehicleHoldPolicyCard } from './vehicle-hold-policy-card';

interface PoliciesTabProps {
  saveSignal?: number;
}

/** Best-effort 5-digit US zip extraction from a free-text address. Used to
 *  surface the dealer zip read-only on the Informativ card. */
function extractZip(address?: string): string | undefined {
  if (!address) return undefined;
  const match = address.match(/\b\d{5}(?:-\d{4})?\b/);
  return match?.[0];
}

/**
 * Sales agent → Policies tab. Renders the eight policy cards and flushes the
 * load/save state on the page-level saveSignal tick.
 */
export function PoliciesTab({ saveSignal = 0 }: PoliciesTabProps) {
  const { policies, setSection, loading } = useSalesPolicies(saveSignal);
  const [dealerZip, setDealerZip] = useState<string>();

  useEffect(() => {
    api.rooftop.getProfile().then((profile) => {
      setDealerZip(extractZip(profile.rooftopAddress));
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-2xl border border-black/10 bg-black/[0.02]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="mb-4 text-xs text-black-60">
        Facts the sales agent reads on every call. Each card is a Yes/No question — flip
        the ones this rooftop actually offers.
      </p>

      <TestDrivePolicyCard
        value={policies.testDrive}
        onChange={(v) => setSection('testDrive', v)}
      />
      <ShippingPolicyCard
        value={policies.shipping}
        onChange={(v) => setSection('shipping', v)}
      />
      <CpoPolicyCard
        value={policies.cpoProgram}
        onChange={(v) => setSection('cpoProgram', v)}
      />
      <FinancePreQualifyPolicyCard
        value={policies.financePreQualify}
        onChange={(v) => setSection('financePreQualify', v)}
      />
      <TradeInPolicyCard
        value={policies.tradeIn}
        onChange={(v) => setSection('tradeIn', v)}
      />
      <VehicleHoldPolicyCard
        value={policies.vehicleHold}
        onChange={(v) => setSection('vehicleHold', v)}
      />
      <PaymentEstimatesPolicyCard
        value={policies.paymentEstimates}
        dealerZip={dealerZip}
        onChange={(v) => setSection('paymentEstimates', v)}
      />
    </div>
  );
}
