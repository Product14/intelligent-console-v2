'use client';

import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  FeatureSwitch,
  FormRow,
  SegmentedControl,
} from '@/components/settings/agents/policies/policy-form-bits';
import type {
  PricingVarianceBehavior,
  PricingVisibility,
} from '@/types/settings/service-policies';

const VARIANCE_OPTIONS: { value: PricingVarianceBehavior; label: string }[] = [
  { value: 'range', label: 'Quote a range from catalog' },
  { value: 'dont_quote', label: "Don't quote" },
];

interface Props {
  value: PricingVisibility;
  onChange(next: PricingVisibility): void;
}

export function PricingVisibilityCard({ value, onChange }: Props) {
  const update = (patch: Partial<PricingVisibility>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Pricing visibility"
      description="Whether the agent shares service prices with callers."
      status={value.sharePrices ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Share prices on call"
          info="The agent quotes prices from the Service Catalog when this is on."
          control={
            <FeatureSwitch
              enabled={value.sharePrices}
              onChange={(sharePrices) => update({ sharePrices })}
            />
          }
        />
        {value.sharePrices && (
          <FormRow
            label="When pricing varies"
            info="What the agent says if a service's exact price depends on the vehicle or scope."
            control={
              <SegmentedControl
                value={value.varianceBehavior}
                options={VARIANCE_OPTIONS}
                onChange={(varianceBehavior) => update({ varianceBehavior })}
              />
            }
          />
        )}
      </div>
    </PolicyCard>
  );
}
