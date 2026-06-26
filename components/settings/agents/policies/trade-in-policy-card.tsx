'use client';

import { useMemo } from 'react';
import { PolicyCard } from './policy-card';
import { FeatureSwitch, FormRow, SubSection } from './policy-form-bits';
import { UrlField } from '@/components/settings/ui/url-field';
import { validateTradeIn } from '@/lib/settings/sales-policies-validation';
import type { TradeInPolicy } from '@/types/settings/sales-policies';

interface Props {
  value: TradeInPolicy;
  onChange(next: TradeInPolicy): void;
}

export function TradeInPolicyCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateTradeIn(value), [value]);
  const update = (patch: Partial<TradeInPolicy>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Trade-In"
      description="How the dealer handles trade valuation. Specific values always escalate."
      status={value.acceptTradeIns ? 'enabled' : 'all_off'}
    >
      <div className="space-y-4">
        <SubSection title="Trade-in handling" enabled={value.acceptTradeIns}>
          <FormRow
            label="Accept trade-ins"
            control={
              <FeatureSwitch
                enabled={value.acceptTradeIns}
                onChange={(acceptTradeIns) => update({ acceptTradeIns })}
              />
            }
          />
          {value.acceptTradeIns && (
            <>
              <FormRow
                label="Phone estimate offered"
                info="The agent collects vehicle basics (year, make, model, trim, mileage, condition) and schedules a follow-up call from your team. It never quotes a value itself."
                control={
                  <FeatureSwitch
                    enabled={value.phoneEstimateOffered}
                    onChange={(phoneEstimateOffered) => update({ phoneEstimateOffered })}
                  />
                }
              />
              <FormRow
                label="Online estimator URL"
                subtitle="Sent via SMS only."
                info="The agent offers to text this link (KBB Instant Cash Offer, vAuto, or your own tool) when callers want a self-serve estimate. It never reads URLs aloud."
                error={errors?.onlineEstimatorUrl}
                control={
                  <UrlField
                    value={value.onlineEstimatorUrl ?? undefined}
                    onChange={(onlineEstimatorUrl) => update({ onlineEstimatorUrl })}
                    placeholder="https://dealer.com/trade-in"
                  />
                }
              />
            </>
          )}
        </SubSection>

        <p className="text-xs text-black-40">
          The agent always offers an appraisal appointment when trade and vehicle interest come up
          together, and treats loan-payoff or lease-return mentions as a team-coordinated detail.
        </p>
      </div>
    </PolicyCard>
  );
}
