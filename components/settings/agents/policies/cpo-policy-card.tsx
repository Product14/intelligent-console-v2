'use client';

import { PolicyCard } from './policy-card';
import {
  CheckboxList,
  FeatureSwitch,
  FormRow,
  NumberInput,
} from './policy-form-bits';
import type {
  CpoBenefit,
  CpoEligibility,
  CpoProgramPolicy,
  CpoWarrantyTerm,
} from '@/types/settings/sales-policies';

const WARRANTY_OPTIONS: { value: CpoWarrantyTerm; label: string }[] = [
  { value: 'powertrain_5yr_60k', label: '5-yr / 60k powertrain' },
  { value: 'powertrain_6yr_100k', label: '6-yr / 100k powertrain' },
  { value: 'powertrain_7yr_100k', label: '7-yr / 100k powertrain' },
  { value: 'bumper_12mo_12k', label: '12-mo / 12k bumper-to-bumper' },
  { value: 'bumper_24mo_unlimited', label: '24-mo / unlimited bumper-to-bumper' },
];

const ELIGIBILITY_OPTIONS: { value: CpoEligibility; label: string }[] = [
  { value: 'up_to_5_years', label: 'Up to 5 years old' },
  { value: 'up_to_6_years', label: 'Up to 6 years old' },
  { value: 'under_60k_miles', label: 'Under 60k miles' },
  { value: 'under_80k_miles', label: 'Under 80k miles' },
  { value: 'under_100k_miles', label: 'Under 100k miles' },
  { value: 'original_brand_only', label: 'Original brand only' },
  { value: 'no_accidents_carfax', label: 'No accidents on Carfax' },
  { value: 'clean_carfax', label: 'Clean Carfax' },
];

const BENEFIT_OPTIONS: { value: CpoBenefit; label: string }[] = [
  { value: 'roadside_assistance_247', label: '24/7 roadside assistance' },
  { value: 'trip_interruption', label: 'Trip-interruption coverage' },
  { value: 'carfax_report', label: 'Carfax report' },
  { value: 'carfax_buyback', label: 'Carfax buyback guarantee' },
  { value: 'return_period', label: 'Return / exchange period' },
  { value: 'loaner_vehicle', label: 'Loaner vehicle' },
  { value: 'maintenance_check', label: 'Free maintenance check' },
  { value: 'siriusxm_trial', label: 'SiriusXM trial' },
];

interface Props {
  value: CpoProgramPolicy;
  onChange(next: CpoProgramPolicy): void;
}

export function CpoPolicyCard({ value, onChange }: Props) {
  const update = (patch: Partial<CpoProgramPolicy>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Certified Pre-Owned (CPO)"
      description="The agent only references this on used-vehicle conversations."
      status={value.offered ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="CPO program offered"
          control={
            <FeatureSwitch
              enabled={value.offered}
              onChange={(offered) => update({ offered })}
            />
          }
        />

        {value.offered && (
          <>
            <FormRow
              label="Inspection points"
              info="The agent quotes this number when callers ask about the inspection."
              control={
                <NumberInput
                  value={value.inspectionPoints}
                  onChange={(inspectionPoints) => update({ inspectionPoints })}
                  min={1}
                  max={500}
                  suffix="points"
                  placeholder="167"
                />
              }
            />
            <FormRow
              label="Warranty terms"
              subtitle="Pick the warranty package(s) you actively promote."
              info="Plain-English summary the agent uses. Exact months and miles route to F&I."
              fullWidthControl
              control={
                <CheckboxList
                  values={value.warrantyTerms}
                  options={WARRANTY_OPTIONS}
                  onChange={(warrantyTerms) => update({ warrantyTerms })}
                  ariaLabel="Warranty terms"
                />
              }
            />
            <FormRow
              label="Eligibility criteria"
              subtitle="The agent cites all selected criteria when callers ask what qualifies."
              info="Limits the agent cites when callers ask what makes a car eligible for certification."
              fullWidthControl
              control={
                <CheckboxList
                  values={value.eligibilityCriteria}
                  options={ELIGIBILITY_OPTIONS}
                  onChange={(eligibilityCriteria) => update({ eligibilityCriteria })}
                  ariaLabel="Eligibility criteria"
                />
              }
            />
            <FormRow
              label="Customer-facing benefits"
              subtitle="Pick every benefit on your CPO marketing materials."
              fullWidthControl
              control={
                <CheckboxList
                  values={value.customerFacingBenefits}
                  options={BENEFIT_OPTIONS}
                  onChange={(customerFacingBenefits) => update({ customerFacingBenefits })}
                  ariaLabel="Customer-facing benefits"
                />
              }
            />
            <FormRow
              label="Multi-brand certification"
              info="For multi-brand stores — do you certify non-franchise brands under a house program?"
              control={
                <FeatureSwitch
                  enabled={value.multiBrandCertification}
                  onChange={(multiBrandCertification) =>
                    update({ multiBrandCertification })
                  }
                />
              }
            />
          </>
        )}
      </div>
    </PolicyCard>
  );
}
