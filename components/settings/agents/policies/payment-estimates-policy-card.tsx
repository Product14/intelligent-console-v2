'use client';

import { PolicyCard } from './policy-card';
import { FeatureSwitch, FormRow } from './policy-form-bits';
import type { PaymentEstimatesPolicy } from '@/types/settings/sales-policies';

interface Props {
  value: PaymentEstimatesPolicy;
  /** Dealer zip code from Rooftop Profile — surfaced read-only so the GM
   *  understands what the API uses as buyer-location fallback. */
  dealerZip?: string;
  onChange(next: PaymentEstimatesPolicy): void;
}

export function PaymentEstimatesPolicyCard({ value, dealerZip, onChange }: Props) {
  const update = (patch: Partial<PaymentEstimatesPolicy>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Payment Estimates (Informativ)"
      description="Estimated monthly lease and finance payments to help close hesitant callers."
      status={value.enabled ? 'enabled' : 'off'}
    >
      <div className="space-y-3">
        <FormRow
          label="Enable payment estimates"
          subtitle="The agent quotes monthly lease/finance for a specific vehicle when the caller hesitates on budget."
          info="Excludes taxes & fees. Assumes top-tier credit. Lender, APR, due-at-signing, and incentives are surfaced only when the caller asks."
          control={
            <FeatureSwitch
              enabled={value.enabled}
              onChange={(enabled) => update({ enabled })}
            />
          }
        />

        <p className="text-xs text-black-40">
          Informativ access is provisioned by Spyne ops. Buyer-location uses dealer zip{' '}
          <strong className="text-black-60">{dealerZip ?? '(set on Rooftop Profile)'}</strong>.
        </p>
      </div>
    </PolicyCard>
  );
}
