'use client';

import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  FeatureSwitch,
  FormRow,
  SegmentedControl,
  SubSection,
} from '@/components/settings/agents/policies/policy-form-bits';
import { AddressField } from '@/components/settings/ui/address-field';
import { RulesListEditor } from '@/components/settings/ui/rules-list-editor';
import { validateAfterHours } from '@/lib/settings/service-policies-validation';
import type { ParsedAddress } from '@/lib/settings/google-places';
import type {
  AfterHoursPolicy,
  AfterHoursWindow,
} from '@/types/settings/service-policies';

const WINDOW_OPTIONS: { value: AfterHoursWindow; label: string }[] = [
  { value: 'weeknights', label: 'Weeknights' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'all_nights', label: 'All nights' },
];

interface Props {
  value: AfterHoursPolicy;
  /** When set, the AddressField shows a "Use rooftop address" quick action. */
  rooftopAddress?: ParsedAddress | null;
  onChange(next: AfterHoursPolicy): void;
}

export function AfterHoursPolicyCard({ value, rooftopAddress, onChange }: Props) {
  const errors = useMemo(() => validateAfterHours(value), [value]);
  const update = (patch: Partial<AfterHoursPolicy>) => onChange({ ...value, ...patch });

  const anyEnabled = value.dropOffAvailable || value.pickupAvailable;

  return (
    <PolicyCard
      title="After-Hours Drop-Off & Pickup"
      description="When customers can leave a car or pick one up outside business hours, and where they go to do it."
      status={anyEnabled ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="After-hours drop-off accepted"
          control={
            <FeatureSwitch
              enabled={value.dropOffAvailable}
              onChange={(dropOffAvailable) => update({ dropOffAvailable })}
            />
          }
        />
        <FormRow
          label="After-hours pickup accepted"
          control={
            <FeatureSwitch
              enabled={value.pickupAvailable}
              onChange={(pickupAvailable) => update({ pickupAvailable })}
            />
          }
        />
      </div>

      {anyEnabled && (
        <SubSection title="Logistics">
          <FormRow
            label="Accepted window"
            control={
              <SegmentedControl
                value={value.acceptedWindow}
                options={WINDOW_OPTIONS}
                onChange={(acceptedWindow) => update({ acceptedWindow })}
              />
            }
          />
          <FormRow
            label="Appointment required"
            control={
              <FeatureSwitch
                enabled={value.appointmentRequired}
                onChange={(appointmentRequired) => update({ appointmentRequired })}
              />
            }
          />
          <div className="py-3">
            <label className="mb-1 block text-sm font-medium text-black-80">
              Address <span className="text-red">*</span>
            </label>
            <AddressField
              value={value.address}
              onChange={(address) => update({ address })}
              error={errors?.address}
              quickActions={
                rooftopAddress ? (
                  <button
                    type="button"
                    onClick={() => update({ address: rooftopAddress })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-blue-light/30 px-2.5 py-1.5 text-xs font-medium text-blue-light transition-colors hover:bg-blue-2"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Use rooftop address
                  </button>
                ) : undefined
              }
            />
          </div>
          <FormRow
            label="Step-by-step instructions"
            fullWidthControl
            info="One step per row. The agent reads these aloud in order when callers ask what to do."
            control={
              <RulesListEditor
                values={value.instructions}
                onChange={(instructions) => update({ instructions })}
                placeholder="e.g. Park in the service drive lane"
                addLabel="Add step"
                emptyLabel="No instructions added yet."
              />
            }
          />
        </SubSection>
      )}
    </PolicyCard>
  );
}
