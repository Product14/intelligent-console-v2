'use client';

import { useMemo } from 'react';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  CheckboxList,
  FeatureSwitch,
  FormRow,
  NumberInput,
  SubSection,
  TextInput,
} from '@/components/settings/agents/policies/policy-form-bits';
import { RulesListEditor } from '@/components/settings/ui/rules-list-editor';
import { validateTransportationFacilities } from '@/lib/settings/service-policies-validation';
import type {
  LoanerEligibility,
  ServiceFacility,
  TransportationFacilitiesPolicy,
} from '@/types/settings/service-policies';

const LOANER_ELIGIBILITY_OPTIONS: { value: LoanerEligibility; label: string }[] = [
  { value: 'warranty', label: 'Warranty work' },
  { value: 'paid', label: 'Paid service' },
  { value: 'either', label: 'Either' },
];

type FacilityKey = keyof TransportationFacilitiesPolicy;

interface Props {
  value: TransportationFacilitiesPolicy;
  onChange(next: TransportationFacilitiesPolicy): void;
}

export function TransportationFacilitiesCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateTransportationFacilities(value), [value]);

  const updateFacility = (key: FacilityKey, patch: Partial<ServiceFacility>) =>
    onChange({ ...value, [key]: { ...value[key], ...patch } });

  const anyEnabled =
    value.waiter.enabled ||
    value.selfDropoff.enabled ||
    value.shuttle.enabled ||
    value.concierge.enabled ||
    value.loaner.enabled;

  return (
    <PolicyCard
      title="Transportation facilities"
      description="How the rooftop gets customers to and from service appointments."
      status={anyEnabled ? 'enabled' : 'all_off'}
    >
      <div className="space-y-4">
        <FacilityBlock
          title="Waiter"
          subtitle="Customer waits at the dealership while the work is done."
          facility={value.waiter}
          onChange={(p) => updateFacility('waiter', p)}
        >
          <FormRow
            label="Limit per hour"
            info="The agent uses this to set caller expectations on busy days — “we can take up to N waiter appointments in any given hour.”"
            control={
              <NumberInput
                value={value.waiter.limitPerHour}
                onChange={(limitPerHour) =>
                  updateFacility('waiter', { limitPerHour })
                }
                min={1}
                max={50}
                suffix="per hour"
                placeholder="6"
              />
            }
            error={errors?.waiter?.limitPerHour}
          />
          <NotesRow
            value={value.waiter.notes}
            onChange={(notes) => updateFacility('waiter', { notes })}
            placeholder="e.g. Available 8 AM – 4 PM weekdays only"
          />
        </FacilityBlock>

        <FacilityBlock
          title="Self drop-off"
          subtitle="Customer leaves the car and arranges their own ride."
          facility={value.selfDropoff}
          onChange={(p) => updateFacility('selfDropoff', p)}
        >
          <NotesRow
            value={value.selfDropoff.notes}
            onChange={(notes) => updateFacility('selfDropoff', { notes })}
            placeholder="e.g. Park in lot B; key drop is to the right of the service entrance"
          />
        </FacilityBlock>

        <FacilityBlock
          title="Shuttle"
          subtitle="Dealership transports the customer to/from a nearby location."
          facility={value.shuttle}
          onChange={(p) => updateFacility('shuttle', p)}
        >
          <FormRow
            label="Radius"
            info="How far the shuttle will go from the rooftop."
            control={
              <NumberInput
                value={value.shuttle.radiusMiles}
                onChange={(radiusMiles) =>
                  updateFacility('shuttle', { radiusMiles })
                }
                min={1}
                max={100}
                suffix="miles"
                placeholder="10"
              />
            }
            error={errors?.shuttle?.radiusMiles}
          />
          <FormRow
            label="Operating hours"
            info="Free text — the agent quotes this when callers ask if the shuttle runs at a specific time."
            control={
              <TextInput
                value={value.shuttle.operatingHours}
                onChange={(operatingHours) =>
                  updateFacility('shuttle', { operatingHours })
                }
                placeholder="Mon–Fri 8 AM – 5 PM"
                width="w-72"
              />
            }
          />
          <NotesRow
            value={value.shuttle.notes}
            onChange={(notes) => updateFacility('shuttle', { notes })}
            placeholder="e.g. Two-person max per trip; appointment-only on Saturdays"
          />
        </FacilityBlock>

        <FacilityBlock
          title="Pickup & drop-off concierge"
          subtitle="Dealership picks the car up at the customer’s home/office and returns it."
          facility={value.concierge}
          onChange={(p) => updateFacility('concierge', p)}
        >
          <FormRow
            label="Radius"
            info="How far the concierge service will travel for pickup/drop-off."
            control={
              <NumberInput
                value={value.concierge.radiusMiles}
                onChange={(radiusMiles) =>
                  updateFacility('concierge', { radiusMiles })
                }
                min={1}
                max={100}
                suffix="miles"
                placeholder="15"
              />
            }
            error={errors?.concierge?.radiusMiles}
          />
          <FormRow
            label="Fee applies"
            control={
              <FeatureSwitch
                enabled={!!value.concierge.feeApplies}
                onChange={(feeApplies) =>
                  updateFacility('concierge', { feeApplies })
                }
              />
            }
          />
          <NotesRow
            value={value.concierge.notes}
            onChange={(notes) => updateFacility('concierge', { notes })}
            placeholder="e.g. 24-hour notice required; weekdays only"
          />
        </FacilityBlock>

        <FacilityBlock
          title="Loaner vehicle"
          subtitle="Customer takes a loaner while their vehicle is being serviced."
          facility={value.loaner}
          onChange={(p) => updateFacility('loaner', p)}
        >
          <FormRow
            label="Minimum service amount"
            info="The agent says: “loaners are available on service tickets over $X.” Leave blank if no minimum."
            control={
              <NumberInput
                value={value.loaner.minServiceAmount}
                onChange={(minServiceAmount) =>
                  updateFacility('loaner', { minServiceAmount })
                }
                min={0}
                max={10000}
                step={50}
                suffix="$"
                placeholder="500"
              />
            }
            error={errors?.loaner?.minServiceAmount}
          />
          <FormRow
            label="Eligibility"
            fullWidthControl
            info="Which service categories qualify for a loaner."
            control={
              <CheckboxList
                values={value.loaner.loanerEligibility ?? []}
                options={LOANER_ELIGIBILITY_OPTIONS}
                onChange={(loanerEligibility) =>
                  updateFacility('loaner', { loanerEligibility })
                }
                ariaLabel="Loaner eligibility"
              />
            }
          />
          <NotesRow
            value={value.loaner.notes}
            onChange={(notes) => updateFacility('loaner', { notes })}
            placeholder="e.g. Loaner requires open service contract & valid insurance"
          />
        </FacilityBlock>
      </div>
    </PolicyCard>
  );
}

interface FacilityBlockProps {
  title: string;
  subtitle: string;
  facility: ServiceFacility;
  onChange(patch: Partial<ServiceFacility>): void;
  children?: React.ReactNode;
}

function FacilityBlock({
  title,
  subtitle,
  facility,
  onChange,
  children,
}: FacilityBlockProps) {
  return (
    <SubSection title={title} enabled={facility.enabled}>
      <FormRow
        label={title}
        subtitle={subtitle}
        control={
          <FeatureSwitch
            enabled={facility.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
        }
      />
      {facility.enabled && children}
    </SubSection>
  );
}

function NotesRow({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange(next: string[]): void;
  placeholder: string;
}) {
  return (
    <FormRow
      label="Notes"
      fullWidthControl
      info="One note per row. The agent reads these aloud when callers ask about this facility."
      control={
        <RulesListEditor
          values={value}
          onChange={onChange}
          placeholder={placeholder}
          addLabel="Add note"
          emptyLabel="No notes added yet."
        />
      }
    />
  );
}
