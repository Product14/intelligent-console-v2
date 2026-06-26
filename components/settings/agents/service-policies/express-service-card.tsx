'use client';

import { useMemo } from 'react';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  FeatureSwitch,
  FormRow,
  NumberInput,
  SegmentedControl,
} from '@/components/settings/agents/policies/policy-form-bits';
import { RulesListEditor } from '@/components/settings/ui/rules-list-editor';
import { CatalogServicePicker } from './catalog-service-picker';
import { validateExpressService } from '@/lib/settings/service-policies-validation';
import type {
  ExpressAvailability,
  ExpressServiceRules,
  ExpressTimeGuarantee,
  ServiceCatalogEntry,
} from '@/types/settings/service-policies';

const TIME_GUARANTEE_OPTIONS: { value: ExpressTimeGuarantee; label: string }[] = [
  { value: '30_min', label: '30 min' },
  { value: '45_min', label: '45 min' },
  { value: '60_min', label: '60 min' },
  { value: 'dont_commit', label: "Don't commit" },
  { value: 'other', label: 'Other' },
];

const AVAILABILITY_OPTIONS: { value: ExpressAvailability; label: string }[] = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'always', label: 'Always' },
];

interface Props {
  value: ExpressServiceRules;
  catalog: ServiceCatalogEntry[];
  onChange(next: ExpressServiceRules): void;
}

export function ExpressServiceCard({ value, catalog, onChange }: Props) {
  const errors = useMemo(() => validateExpressService(value), [value]);
  const update = (patch: Partial<ExpressServiceRules>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Express service"
      description="Quick services the agent can promise turnaround on at booking."
      status={value.offered ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Express service offered"
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
              label="Time guarantee"
              info="The agent quotes this to callers: “we can have you in and out in X.”"
              control={
                <SegmentedControl
                  value={value.timeGuarantee}
                  options={TIME_GUARANTEE_OPTIONS}
                  onChange={(timeGuarantee) => update({ timeGuarantee })}
                />
              }
            />
            {value.timeGuarantee === 'other' && (
              <FormRow
                label="Custom time guarantee"
                required
                error={errors?.timeGuaranteeCustomMinutes}
                control={
                  <NumberInput
                    value={value.timeGuaranteeCustomMinutes}
                    onChange={(timeGuaranteeCustomMinutes) =>
                      update({ timeGuaranteeCustomMinutes })
                    }
                    min={5}
                    max={240}
                    suffix="minutes"
                    placeholder="90"
                  />
                }
              />
            )}
            <FormRow
              label="Eligible services"
              fullWidthControl
              info="Only these services qualify as express on a call. Pick from your Service Catalog."
              control={
                <CatalogServicePicker
                  catalog={catalog}
                  values={value.eligibleServiceIds}
                  onChange={(eligibleServiceIds) => update({ eligibleServiceIds })}
                  ariaLabel="Eligible express services"
                />
              }
            />
            <FormRow
              label="Walk-ins for express"
              info="Whether the agent can offer same-day express service to walk-ins without an appointment."
              control={
                <FeatureSwitch
                  enabled={value.walkInsForExpress}
                  onChange={(walkInsForExpress) => update({ walkInsForExpress })}
                />
              }
            />
            <FormRow
              label="Availability"
              control={
                <SegmentedControl
                  value={value.availability}
                  options={AVAILABILITY_OPTIONS}
                  onChange={(availability) => update({ availability })}
                />
              }
            />
            <FormRow
              label="Notes for the agent"
              fullWidthControl
              info="One note per row. The agent reads these aloud when callers ask follow-up questions."
              control={
                <RulesListEditor
                  values={value.notes}
                  onChange={(notes) => update({ notes })}
                  placeholder="e.g. Express is limited to 4 bays — quote the time only when there's availability"
                  addLabel="Add note"
                  emptyLabel="No notes added yet."
                />
              }
            />
          </>
        )}
      </div>
    </PolicyCard>
  );
}
