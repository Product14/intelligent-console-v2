'use client';

import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import { FeatureSwitch, FormRow } from '@/components/settings/agents/policies/policy-form-bits';
import { CatalogServicePicker } from './catalog-service-picker';
import type { ServiceCatalogEntry, UpsellRules } from '@/types/settings/service-policies';

interface Props {
  value: UpsellRules;
  catalog: ServiceCatalogEntry[];
  onChange(next: UpsellRules): void;
}

export function UpsellRulesCard({ value, catalog, onChange }: Props) {
  const update = (patch: Partial<UpsellRules>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Upsell rules"
      description="When the service agent suggests additional services on a call."
      status={value.nudgeDuringBooking ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Nudge during booking"
          info="At the end of an appointment booking, the agent suggests services from the list below."
          control={
            <FeatureSwitch
              enabled={value.nudgeDuringBooking}
              onChange={(nudgeDuringBooking) => update({ nudgeDuringBooking })}
            />
          }
        />
        {value.nudgeDuringBooking && (
          <FormRow
            label="Services to suggest"
            fullWidthControl
            info="Picked from your Service Catalog. The agent only suggests services on this list."
            control={
              <CatalogServicePicker
                catalog={catalog}
                values={value.suggestedServiceIds}
                onChange={(suggestedServiceIds) => update({ suggestedServiceIds })}
                ariaLabel="Services to suggest"
              />
            }
          />
        )}
      </div>
    </PolicyCard>
  );
}
