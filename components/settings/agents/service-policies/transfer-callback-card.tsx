'use client';

import { useMemo } from 'react';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  FormRow,
  SegmentedControl,
} from '@/components/settings/agents/policies/policy-form-bits';
import { PhoneInput } from '@/components/settings/ui/phone-input';
import { RulesListEditor } from '@/components/settings/ui/rules-list-editor';
import { validateTransferCallback } from '@/lib/settings/service-policies-validation';
import { TRANSFER_CALLBACK_DEFAULTS } from '@/lib/settings/service-policies-defaults';
import type {
  CallbackSla,
  EscalationAction,
  TransferCallbackPolicy,
  TransferScenarioId,
} from '@/types/settings/service-policies';

const ACTION_OPTIONS: { value: EscalationAction; label: string }[] = [
  { value: 'transfer', label: 'Transfer' },
  { value: 'callback', label: 'Callback' },
  { value: 'take_message', label: 'Take message' },
];

const SLA_OPTIONS: { value: CallbackSla; label: string }[] = [
  { value: 'same_day', label: 'Same day' },
  { value: 'within_24h', label: 'Within 24h' },
  { value: 'within_48h', label: 'Within 48h' },
];

const SCENARIO_LABELS: { id: TransferScenarioId; label: string }[] = [
  { id: 'asks_for_person', label: 'Caller asks for a specific person' },
  { id: 'asks_for_manager', label: 'Caller asks for a manager' },
  { id: 'quote_outside_catalog', label: 'Service quote outside catalog' },
  { id: 'warranty_or_recall', label: 'Warranty / recall question' },
  { id: 'insurance_accident', label: 'Insurance / accident damage' },
  { id: 'complaint_prior_service', label: 'Complaint about prior service' },
  { id: 'language_unavailable', label: "Caller's preferred language unavailable" },
];

interface Props {
  value: TransferCallbackPolicy;
  onChange(next: TransferCallbackPolicy): void;
}

export function TransferCallbackCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateTransferCallback(value), [value]);
  const update = (patch: Partial<TransferCallbackPolicy>) => onChange({ ...value, ...patch });

  const allDefault = Object.values(value.scenarios).every((a) => a === 'callback');
  const isConfigured =
    !!value.transferPhone?.phone || !allDefault || value.customEscalations.length > 0;

  const phone = value.transferPhone ?? { countryCode: '+1', phone: '' };

  return (
    <PolicyCard
      title="Transfer & callback rules"
      description="What the agent does when a caller wants a human, has a complaint, or asks something outside the agent's scope."
      status={isConfigured ? 'enabled' : 'defaults'}
    >
      <div className="divide-y divide-black/5">
        {SCENARIO_LABELS.map(({ id, label }) => (
          <FormRow
            key={id}
            label={label}
            control={
              <SegmentedControl
                value={value.scenarios[id]}
                options={ACTION_OPTIONS}
                onChange={(action) =>
                  update({
                    scenarios: { ...value.scenarios, [id]: action },
                  })
                }
              />
            }
          />
        ))}
        <FormRow
          label="Transfer phone number"
          info="Required if any scenario above is set to Transfer."
          error={errors?.transferPhone}
          control={
            <PhoneInput
              countryCode={phone.countryCode}
              phone={phone.phone}
              onChange={(transferPhone) => update({ transferPhone })}
            />
          }
        />
        <FormRow
          label="Callback SLA"
          info="When the agent promises a callback, this is the window the team commits to."
          control={
            <SegmentedControl
              value={value.callbackSla ?? TRANSFER_CALLBACK_DEFAULTS.callbackSla}
              options={SLA_OPTIONS}
              onChange={(callbackSla) => update({ callbackSla })}
            />
          }
        />
        <FormRow
          label="Other escalations"
          fullWidthControl
          info="One escalation per row. The agent reads these internally — not aloud to the caller."
          control={
            <RulesListEditor
              values={value.customEscalations}
              onChange={(customEscalations) => update({ customEscalations })}
              placeholder="e.g. Calls about service-loaner billing → transfer to F&I"
              addLabel="Add escalation"
              emptyLabel="No custom escalations added yet."
            />
          }
        />
      </div>
    </PolicyCard>
  );
}
