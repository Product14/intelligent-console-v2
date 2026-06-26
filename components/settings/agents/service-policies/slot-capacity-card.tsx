'use client';

import { useMemo } from 'react';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  FormRow,
  NumberInput,
  SegmentedControl,
} from '@/components/settings/agents/policies/policy-form-bits';
import { validateSlotCapacity } from '@/lib/settings/service-policies-validation';
import { SLOT_CAPACITY_DEFAULTS } from '@/lib/settings/service-policies-defaults';
import { cn } from '@/lib/settings/cn';
import type { SlotCapacity, SlotStartTimes } from '@/types/settings/service-policies';

const START_TIME_OPTIONS: { value: SlotStartTimes; label: string }[] = [
  { value: 'on_the_hour', label: 'On the hour' },
  { value: 'every_30_min', label: 'Every 30 min' },
  { value: 'every_15_min', label: 'Every 15 min' },
];

const DURATION_QUICK_PICKS = [30, 60, 90];

interface Props {
  value: SlotCapacity;
  onChange(next: SlotCapacity): void;
}

export function SlotCapacityCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateSlotCapacity(value), [value]);
  const update = (patch: Partial<SlotCapacity>) => onChange({ ...value, ...patch });

  const isDefault =
    value.durationMinutes === SLOT_CAPACITY_DEFAULTS.durationMinutes &&
    value.maxAppointmentsPerSlot === SLOT_CAPACITY_DEFAULTS.maxAppointmentsPerSlot &&
    value.startTimes === SLOT_CAPACITY_DEFAULTS.startTimes &&
    value.bufferMinutes === SLOT_CAPACITY_DEFAULTS.bufferMinutes;

  return (
    <PolicyCard
      title="Booking slots"
      description="How long each appointment slot is and how many cars you can take per slot. Used when the agent offers times on a call."
      status={isDefault ? 'defaults' : 'enabled'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Slot duration"
          info="Skip this card when your DMS drives booking — Vini reads slots from the integration in that case."
          control={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {DURATION_QUICK_PICKS.map((mins) => {
                const selected = value.durationMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => update({ durationMinutes: mins })}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      selected
                        ? 'border-blue-light bg-blue-2 text-blue-light'
                        : 'border-black/10 bg-white text-black-60 hover:border-blue-light/40'
                    )}
                  >
                    {mins} min
                  </button>
                );
              })}
              <NumberInput
                value={value.durationMinutes}
                onChange={(v) => update({ durationMinutes: v ?? SLOT_CAPACITY_DEFAULTS.durationMinutes })}
                min={5}
                max={240}
                suffix="minutes"
              />
            </div>
          }
          error={errors?.durationMinutes}
        />
        <FormRow
          label="Max appointments per slot"
          required
          error={errors?.maxAppointmentsPerSlot}
          control={
            <NumberInput
              value={value.maxAppointmentsPerSlot}
              onChange={(v) =>
                update({ maxAppointmentsPerSlot: v ?? SLOT_CAPACITY_DEFAULTS.maxAppointmentsPerSlot })
              }
              min={1}
              max={50}
            />
          }
        />
        <FormRow
          label="Slot start times"
          control={
            <SegmentedControl
              value={value.startTimes}
              options={START_TIME_OPTIONS}
              onChange={(startTimes) => update({ startTimes })}
            />
          }
        />
        <FormRow
          label="Buffer between appointments"
          control={
            <NumberInput
              value={value.bufferMinutes}
              onChange={(v) => update({ bufferMinutes: v ?? 0 })}
              min={0}
              max={60}
              suffix="minutes"
            />
          }
        />
      </div>
    </PolicyCard>
  );
}
