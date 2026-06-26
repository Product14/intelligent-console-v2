'use client';

import { useMemo } from 'react';
import { PolicyCard } from './policy-card';
import {
  CheckboxList,
  FeatureSwitch,
  FormRow,
  NumberInput,
  SegmentedControl,
  SubSection,
} from './policy-form-bits';
import { validateTestDrive } from '@/lib/settings/sales-policies-validation';
import type {
  DocumentType,
  LicenseType,
  SalespersonRideAlong,
  TestDrivePolicy,
  TestDriveRoute,
} from '@/types/settings/sales-policies';

const LICENSE_OPTIONS: { value: LicenseType; label: string }[] = [
  { value: 'domestic', label: 'Domestic license' },
  { value: 'international', label: 'International license' },
  { value: 'learner_permit', label: 'Learner permit' },
];

const ACCOMPANIED_OPTIONS: { value: SalespersonRideAlong; label: string }[] = [
  { value: 'always', label: 'Always accompanied' },
  { value: 'optional', label: 'Customer’s choice' },
  { value: 'unaccompanied', label: 'Unaccompanied' },
];

const ROUTE_OPTIONS: { value: TestDriveRoute; label: string }[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'customer_chooses', label: 'Customer chooses' },
];

const DOCUMENT_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'drivers_license', label: "Driver's license" },
  { value: 'proof_of_insurance', label: 'Proof of insurance' },
  { value: 'credit_card_hold', label: 'Credit card hold' },
  { value: 'two_forms_of_id', label: 'Two forms of ID' },
];

const EXTENDED_OPTIONS: { value: string; label: string }[] = [
  { value: '24h', label: '24-hour' },
  { value: '48h', label: '48-hour' },
  { value: 'weekend', label: 'Weekend' },
];

interface Props {
  value: TestDrivePolicy;
  onChange(next: TestDrivePolicy): void;
}

export function TestDrivePolicyCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateTestDrive(value), [value]);

  const update = (patch: Partial<TestDrivePolicy>) => onChange({ ...value, ...patch });
  const updateAtHome = (patch: Partial<TestDrivePolicy['atHomeTestDrive']>) =>
    update({ atHomeTestDrive: { ...value.atHomeTestDrive, ...patch } });
  const updateOvernight = (patch: Partial<TestDrivePolicy['extendedOvernightDrives']>) =>
    update({
      extendedOvernightDrives: { ...value.extendedOvernightDrives, ...patch },
    });

  return (
    <PolicyCard
      title="Test Drive"
      description="Eligibility, format, and at-home logistics."
      status="defaults"
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Minimum driver age"
          control={
            <NumberInput
              value={value.minDriverAge}
              onChange={(v) => update({ minDriverAge: v ?? 18 })}
              min={16}
              max={25}
              suffix="years"
            />
          }
        />
        <FormRow
          label="License types accepted"
          info="“Domestic” resolves to the rooftop’s country at runtime — the same setting works for US, UK, Canadian, or any other dealer."
          error={errors?.licenseTypesAccepted}
          control={
            <CheckboxList
              values={value.licenseTypesAccepted}
              options={LICENSE_OPTIONS}
              onChange={(licenseTypesAccepted) => update({ licenseTypesAccepted })}
              ariaLabel="License types accepted"
            />
          }
        />
        <FormRow
          label="Insurance required"
          control={
            <FeatureSwitch
              enabled={value.insuranceRequired}
              onChange={(insuranceRequired) => update({ insuranceRequired })}
            />
          }
        />
        <FormRow
          label="Salesperson ride-along"
          control={
            <SegmentedControl
              value={value.salespersonRideAlong}
              options={ACCOMPANIED_OPTIONS}
              onChange={(salespersonRideAlong) => update({ salespersonRideAlong })}
            />
          }
        />
        <FormRow
          label="Standard duration"
          control={
            <NumberInput
              value={value.standardDurationMinutes}
              onChange={(v) => update({ standardDurationMinutes: v ?? 30 })}
              min={10}
              max={180}
              suffix="minutes"
            />
          }
        />
        <FormRow
          label="Test drive route"
          control={
            <SegmentedControl
              value={value.testDriveRoute}
              options={ROUTE_OPTIONS}
              onChange={(testDriveRoute) => update({ testDriveRoute })}
            />
          }
        />
        <FormRow
          label="Multiple vehicles in one visit"
          control={
            <FeatureSwitch
              enabled={value.multipleVehiclesInOneVisit}
              onChange={(multipleVehiclesInOneVisit) =>
                update({ multipleVehiclesInOneVisit })
              }
            />
          }
        />
        <FormRow
          label="Booking cutoff before close"
          subtitle="Closest to closing the agent will book."
          control={
            <NumberInput
              value={value.bookingCutoffBeforeCloseMinutes}
              onChange={(v) => update({ bookingCutoffBeforeCloseMinutes: v ?? 60 })}
              min={0}
              max={240}
              suffix="minutes"
            />
          }
        />
        <FormRow
          label="Documents to bring"
          info="The agent reads the checked items aloud on every test-drive booking confirmation."
          control={
            <CheckboxList
              values={value.documentsToBring}
              options={DOCUMENT_OPTIONS}
              onChange={(documentsToBring) => update({ documentsToBring })}
              ariaLabel="Documents to bring"
            />
          }
        />
      </div>

      <div className="mt-4 space-y-4">
        <SubSection title="Extended / overnight drives">
          <FormRow
            label="Overnight available"
            control={
              <FeatureSwitch
                enabled={value.extendedOvernightDrives.overnightAvailable}
                onChange={(overnightAvailable) => updateOvernight({ overnightAvailable })}
              />
            }
          />
          {value.extendedOvernightDrives.overnightAvailable && (
            <FormRow
              label="Formats offered"
              control={
                <CheckboxList
                  values={value.extendedOvernightDrives.formatsOffered}
                  options={EXTENDED_OPTIONS}
                  onChange={(formatsOffered) => updateOvernight({ formatsOffered })}
                  ariaLabel="Extended formats offered"
                />
              }
            />
          )}
        </SubSection>

        <SubSection title="At-home test drive" enabled={value.atHomeTestDrive.offered}>
          <FormRow
            label="Offered"
            control={
              <FeatureSwitch
                enabled={value.atHomeTestDrive.offered}
                onChange={(offered) => updateAtHome({ offered })}
              />
            }
          />
          {value.atHomeTestDrive.offered && (
            <>
              <FormRow
                label="Maximum radius"
                required
                error={errors?.['atHomeTestDrive.maxRadiusMiles']}
                control={
                  <NumberInput
                    value={value.atHomeTestDrive.maxRadiusMiles ?? undefined}
                    onChange={(maxRadiusMiles) => updateAtHome({ maxRadiusMiles })}
                    min={1}
                    max={500}
                    suffix="miles"
                  />
                }
              />
              <FormRow
                label="Minimum lead time"
                required
                info="The agent tells callers: “the team will need at least X hours to arrange this.”"
                error={errors?.['atHomeTestDrive.minLeadTimeHours']}
                control={
                  <NumberInput
                    value={value.atHomeTestDrive.minLeadTimeHours ?? undefined}
                    onChange={(minLeadTimeHours) => updateAtHome({ minLeadTimeHours })}
                    min={0}
                    max={168}
                    suffix="hours"
                  />
                }
              />
              <FormRow
                label="Fee applies"
                control={
                  <FeatureSwitch
                    enabled={!!value.atHomeTestDrive.feeApplies}
                    onChange={(feeApplies) => updateAtHome({ feeApplies })}
                  />
                }
              />
            </>
          )}
        </SubSection>
      </div>
    </PolicyCard>
  );
}
