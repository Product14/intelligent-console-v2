'use client';

import { useMemo } from 'react';
import { PolicyCard } from './policy-card';
import { SegmentedControl, FeatureSwitch, FormRow, NumberInput, SubSection } from './policy-form-bits';
import { validateVehicleHold } from '@/lib/settings/sales-policies-validation';
import type {
  DepositPaymentMethod,
  DepositPolicy,
  VehicleHoldPolicy,
} from '@/types/settings/sales-policies';

const DEPOSIT_POLICY_OPTIONS: { value: DepositPolicy; label: string }[] = [
  { value: 'fully_refundable', label: 'Fully refundable' },
  { value: 'non_refundable', label: 'Non-refundable' },
  { value: 'applies_to_purchase_only', label: 'Applies to purchase only' },
];

const PAYMENT_METHOD_OPTIONS: { value: DepositPaymentMethod; label: string }[] = [
  { value: 'online_link', label: 'Online payment link' },
  { value: 'phone', label: 'By phone' },
  { value: 'in_person_only', label: 'In person only' },
];

interface Props {
  value: VehicleHoldPolicy;
  onChange(next: VehicleHoldPolicy): void;
}

export function VehicleHoldPolicyCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateVehicleHold(value), [value]);
  const update = (patch: Partial<VehicleHoldPolicy>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Vehicle Hold / Reservation"
      description="What the agent says when a caller asks to hold a specific vehicle."
      status={value.offered ? 'enabled' : 'all_off'}
    >
      <div className="space-y-4">
        <SubSection title="Hold policy" enabled={value.offered}>
          <FormRow
            label="Offered"
            info="When on, the agent proactively offers to hold a vehicle whenever it’s booking an appointment for one."
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
                label="Deposit policy"
                fullWidthControl
                info="The agent confirms the refund rule. Specific dollar amounts always route to a salesperson."
                control={
                  <SegmentedControl
                    value={value.depositPolicy}
                    options={DEPOSIT_POLICY_OPTIONS}
                    onChange={(depositPolicy) => update({ depositPolicy })}
                  />
                }
              />
              <FormRow
                label="Maximum hold duration"
                required
                error={errors?.maxHoldDurationDays}
                control={
                  <NumberInput
                    value={value.maxHoldDurationDays}
                    onChange={(v) => update({ maxHoldDurationDays: v ?? 1 })}
                    min={1}
                    max={30}
                    suffix="days"
                  />
                }
              />
              <FormRow
                label="Deposit payment method"
                info="If “online link,” the team sends the link from the action item — the agent never triggers payment itself."
                control={
                  <SegmentedControl
                    value={value.depositPaymentMethod}
                    options={PAYMENT_METHOD_OPTIONS}
                    onChange={(depositPaymentMethod) => update({ depositPaymentMethod })}
                  />
                }
              />
            </>
          )}
        </SubSection>

        <p className="text-xs text-black-40">
          Every hold request creates a team task with caller details and vehicle. Specific
          deposit amounts and refund disputes escalate.
        </p>
      </div>
    </PolicyCard>
  );
}
