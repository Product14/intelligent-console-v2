'use client';

import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import { FeatureSwitch, FormRow } from '@/components/settings/agents/policies/policy-form-bits';
import { MultiSelectWithSearch } from '@/components/settings/ui/multi-select-with-search';
import { VEHICLE_MAKES } from '@/lib/settings/vehicle-makes';
import type { AllowedMakesPolicy } from '@/types/settings/service-policies';

interface Props {
  value: AllowedMakesPolicy;
  onChange(next: AllowedMakesPolicy): void;
}

export function AllowedMakesCard({ value, onChange }: Props) {
  const status: 'enabled' | 'all_off' =
    value.allMakes || value.makes.length > 0 ? 'enabled' : 'all_off';

  return (
    <PolicyCard
      title="Allowed makes for service"
      description="Brands this rooftop's service department accepts. The agent declines bookings for makes outside this list."
      status={status}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="All makes serviced"
          info="Turn on if the service team works on every brand. Skips the per-brand picker below."
          control={
            <FeatureSwitch
              enabled={value.allMakes}
              onChange={(allMakes) =>
                onChange({
                  ...value,
                  allMakes,
                  // Clear the per-brand selection when opting into "all" so
                  // toggling back off doesn't restore stale data.
                  makes: allMakes ? [] : value.makes,
                })
              }
            />
          }
        />

        {!value.allMakes && (
          <FormRow
            label="Makes serviced"
            fullWidthControl
            info="Pick every brand the service team is qualified to work on. Customers calling about a make not on this list will be referred out per the agent’s escalation policy."
            control={
              <MultiSelectWithSearch
                columns={4}
                values={value.makes}
                options={VEHICLE_MAKES}
                onChange={(makes) => onChange({ ...value, makes })}
                ariaLabel="Vehicle makes serviced"
                searchPlaceholder="Search makes"
                countNoun="make"
              />
            }
          />
        )}
      </div>
    </PolicyCard>
  );
}
