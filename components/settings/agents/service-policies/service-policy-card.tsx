'use client';

import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import { FormRow } from '@/components/settings/agents/policies/policy-form-bits';
import { RulesListEditor } from '@/components/settings/ui/rules-list-editor';
import type { ServicePolicyRules } from '@/types/settings/service-policies';

interface Props {
  value: ServicePolicyRules;
  onChange(next: ServicePolicyRules): void;
}

export function ServicePolicyCard({ value, onChange }: Props) {
  const update = (patch: Partial<ServicePolicyRules>) => onChange({ ...value, ...patch });

  const isDefault = value.otherRules.length === 0;

  return (
    <PolicyCard
      title="Service Rules"
      description="Free-form rules the agent quotes when callers ask."
      status={isDefault ? 'defaults' : 'enabled'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Rules"
          fullWidthControl
          info="One rule per row. The agent reads these back to callers when relevant."
          control={
            <RulesListEditor
              values={value.otherRules}
              onChange={(otherRules) => update({ otherRules })}
              placeholder="e.g. No same-day reschedules on Saturdays"
              addLabel="Add rule"
              emptyLabel="No rules added yet. Add one below."
            />
          }
        />
      </div>
    </PolicyCard>
  );
}
