'use client';

import { useMemo } from 'react';
import { PolicyCard } from './policy-card';
import {
  FeatureSwitch,
  FormRow,
  NumberInput,
  SegmentedControl,
} from './policy-form-bits';
import { UrlField } from '@/components/settings/ui/url-field';
import { validateFinancePreQualify } from '@/lib/settings/sales-policies-validation';
import type {
  FinancePreQualifyPolicy,
  WhatHappensAfterSubmit,
} from '@/types/settings/sales-policies';

const DELIVERY_OPTIONS: { value: WhatHappensAfterSubmit; label: string }[] = [
  { value: 'immediate', label: 'Immediate result' },
  { value: 'email', label: 'Emailed result' },
  { value: 'finance_team_calls_back', label: 'Finance team calls back' },
];

interface Props {
  value: FinancePreQualifyPolicy;
  onChange(next: FinancePreQualifyPolicy): void;
}

export function FinancePreQualifyPolicyCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateFinancePreQualify(value), [value]);

  const update = (patch: Partial<FinancePreQualifyPolicy>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Finance Pre-Qualify"
      description="Where the agent sends callers who want to apply for financing before visiting."
      status={value.onlinePreQualifyPageOffered ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Online pre-qualify page offered"
          control={
            <FeatureSwitch
              enabled={value.onlinePreQualifyPageOffered}
              onChange={(onlinePreQualifyPageOffered) => update({ onlinePreQualifyPageOffered })}
            />
          }
        />

        {value.onlinePreQualifyPageOffered && (
          <>
            <FormRow
              label="Pre-qualify page URL"
              required
              subtitle="Sent via SMS only."
              info="The agent offers to text the link after confirming financing intent. It never reads the URL aloud."
              error={errors?.preQualifyPageUrl}
              control={
                <UrlField
                  value={value.preQualifyPageUrl ?? undefined}
                  onChange={(preQualifyPageUrl) => update({ preQualifyPageUrl })}
                  placeholder="https://dealer.com/finance/pre-qualify"
                />
              }
            />
            <FormRow
              label="Soft credit pull"
              info="Turn on only if the linked page genuinely runs a soft inquiry. The agent will state this on the call — accuracy is the dealer’s responsibility."
              control={
                <FeatureSwitch
                  enabled={value.softCreditPull}
                  onChange={(softCreditPull) => update({ softCreditPull })}
                />
              }
            />
            <FormRow
              label="Estimated time to complete"
              control={
                <NumberInput
                  value={value.estimatedTimeMinutes ?? undefined}
                  onChange={(estimatedTimeMinutes) => update({ estimatedTimeMinutes })}
                  min={1}
                  max={120}
                  suffix="minutes"
                />
              }
            />
            <FormRow
              label="What happens after submit"
              control={
                <SegmentedControl
                  value={value.whatHappensAfterSubmit}
                  options={DELIVERY_OPTIONS}
                  onChange={(whatHappensAfterSubmit) => update({ whatHappensAfterSubmit })}
                />
              }
            />
          </>
        )}
      </div>
    </PolicyCard>
  );
}
