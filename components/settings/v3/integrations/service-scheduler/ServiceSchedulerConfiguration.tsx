import CIDropdown from '@/internal-design-system-settings/dropdown/ci-dropdown';
import { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';
import { Checkbox } from '@spyne-console/design-system';

import React, { useCallback } from 'react';

import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { cn } from '@spyne-console/utils/cn';

import ServiceFacilities, {
  ServiceFacilitiesValues,
} from '@/components/onboarding/v3/agent-customization/ServiceFacilities';
import UpsellPreferences from '@/components/onboarding/v3/agent-customization/UpsellPreferences';

import {
  AVAILABLE_SERVICES,
  SERVICE_SCHEDULER_PLATFORM,
  SLOT_CAPACITY,
  SLOT_DURATION,
  SUPPORTED_MAKES,
  ServiceSchedulerPlatformType,
} from './configuration';
import DynamicStringListField from './dynamic-string-list-field';

export { SERVICE_SCHEDULER_PLATFORM, type ServiceSchedulerPlatformType };

export interface ServiceSchedulerConfigData {
  supportedVehicles: string[];
  availableServices: string[];
  transportationOptions: ServiceFacilitiesValues;
  serviceRules: string[];
  returnPrice: boolean;
  additionalCallBackAndTransferRules: string[];
  upsellingRules: {
    isOpted?: boolean;
    data?: string;
  };
  slotDuration?: string;
  capacityPerSlot?: string;
}

export interface ServiceSchedulerConfigErrors {
  serviceRules?: string;
  additionalCallBackAndTransferRules?: string;
  upsellingRules?: string;
}

interface FieldVisibility {
  supportedMakes: boolean;
  availableServices: boolean;
  serviceFacilities: boolean;
  serviceRules: boolean;
  highlightPrices: boolean;
  transferScenarios: boolean;
  upselling: boolean;
  availableSlotsDuration?: boolean;
  availableSlotsCapacity?: boolean;
}

export const FIELD_VISIBILITY: Record<
  ServiceSchedulerPlatformType,
  FieldVisibility
> = {
  [SERVICE_SCHEDULER_PLATFORM.NOT_LISTED]: {
    supportedMakes: true,
    availableServices: true,
    serviceFacilities: true,
    serviceRules: true,
    highlightPrices: true,
    transferScenarios: true,
    upselling: true,
  },
  [SERVICE_SCHEDULER_PLATFORM.XTIME]: {
    supportedMakes: false,
    availableServices: false,
    serviceFacilities: true,
    serviceRules: true,
    highlightPrices: true,
    transferScenarios: true,
    upselling: true,
  },
  [SERVICE_SCHEDULER_PLATFORM.TEKION]: {
    supportedMakes: false,
    availableServices: false,
    serviceFacilities: false,
    serviceRules: true,
    highlightPrices: true,
    transferScenarios: true,
    upselling: true,
  },
  [SERVICE_SCHEDULER_PLATFORM.OTHER]: {
    supportedMakes: true,
    availableServices: true,
    serviceFacilities: true,
    serviceRules: true,
    highlightPrices: true,
    transferScenarios: true,
    upselling: true,
  },
  [SERVICE_SCHEDULER_PLATFORM.PBS]: {
    supportedMakes: true,
    availableServices: true,
    serviceFacilities: true,
    serviceRules: true,
    highlightPrices: true,
    transferScenarios: true,
    upselling: true,
    availableSlotsDuration: true,
    availableSlotsCapacity: true,
  },
  [SERVICE_SCHEDULER_PLATFORM.DEALERFX]: {
    supportedMakes: false,
    availableServices: false,
    serviceFacilities: false,
    serviceRules: true,
    highlightPrices: true,
    transferScenarios: true,
    upselling: true,
  },
  [SERVICE_SCHEDULER_PLATFORM.CDK]: {
    supportedMakes: true,
    availableServices: true,
    serviceFacilities: true,
    serviceRules: true,
    highlightPrices: true,
    transferScenarios: true,
    upselling: true,
    availableSlotsDuration: true,
    availableSlotsCapacity: true,
  },
};

interface ServiceSchedulerConfigurationProps {
  partnerName?: string;
  platformType?: ServiceSchedulerPlatformType;
  config: ServiceSchedulerConfigData | null;
  onConfigChange: (updates: Partial<ServiceSchedulerConfigData>) => void;
  errors?: ServiceSchedulerConfigErrors;
}

interface ConfigFieldProps {
  label: string;
  placeholder: string;
  helperText: string;
  value: string;
  onChange: (value: string) => void;
}

function ConfigField({
  label,
  placeholder,
  helperText,
  value,
  onChange,
}: ConfigFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-base font-semibold text-black">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-black/90 outline-none placeholder:text-black/40 focus:border-blue-500"
      />
      <p className="text-sm text-black/60">{helperText}</p>
    </div>
  );
}

export default function ServiceSchedulerConfiguration({
  partnerName = '',
  platformType = 'other',
  config,
  onConfigChange,
  errors = {},
}: ServiceSchedulerConfigurationProps) {
  const show = FIELD_VISIBILITY[platformType];

  const selectedMakeOptions = SUPPORTED_MAKES.filter((make) =>
    (config?.supportedVehicles ?? []).includes(make.value as string)
  );

  const handleMakesChange = (selected: CIDropdownMenuOption[]) => {
    onConfigChange({
      supportedVehicles: selected.map((opt) => opt.value as string),
    });
  };

  const selectedServiceOptions = AVAILABLE_SERVICES.filter((svc) =>
    (config?.availableServices ?? []).includes(svc.value as string)
  );

  const handleServicesChange = (selected: CIDropdownMenuOption[]) => {
    onConfigChange({
      availableServices: selected.map((opt) => opt.value as string),
    });
  };

  const selectedSlotDurationOptions = SLOT_DURATION.filter(
    (duration) => duration.value === config?.slotDuration
  );
  const handleSlotsDurationChange = useCallback(
    (selectedSlotDuration: CIDropdownMenuOption[]) => {
      onConfigChange({
        slotDuration: (selectedSlotDuration[0]?.value as string) ?? undefined,
      });
    },
    [onConfigChange]
  );

  const selectedSlotCapacityOptions = SLOT_CAPACITY.filter(
    (capacity) => capacity.value === config?.capacityPerSlot
  );
  const handleSlotsCapacityChange = useCallback(
    (selectedSlotCapacity: CIDropdownMenuOption[]) => {
      onConfigChange({
        capacityPerSlot:
          (selectedSlotCapacity[0]?.value as string) ?? undefined,
      });
    },
    [onConfigChange]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-black/10 p-8">
        <div className="flex flex-col gap-6">
          {show.supportedMakes && (
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-semibold text-black">
                Supported Makes
              </label>
              <CIDropdown
                options={SUPPORTED_MAKES}
                selectedValues={selectedMakeOptions}
                onChange={handleMakesChange}
                placeholder="Select vehicle makes"
                isMultiSelect={true}
                allowSearch={true}
                searchPlaceholder="Search makes..."
                showClearButton={true}
                showSelectAll={true}
                variant="clean"
              />
              <p className="text-sm text-black/60">
                Add all the makes that is supported for service appointments
              </p>
            </div>
          )}

          {show.availableServices && (
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-semibold text-black">
                Available Services
              </label>
              <CIDropdown
                options={AVAILABLE_SERVICES}
                selectedValues={selectedServiceOptions}
                onChange={handleServicesChange}
                placeholder="Select services"
                isMultiSelect={true}
                allowSearch={true}
                searchPlaceholder="Search services..."
                showClearButton={true}
                showSelectAll={true}
                variant="clean"
              />
              <p className="text-sm text-black/60">
                List of services supported
              </p>
            </div>
          )}

          {show.serviceFacilities && (
            <ServiceFacilities
              values={config?.transportationOptions ?? {}}
              onChange={(updated) =>
                onConfigChange({
                  transportationOptions: {
                    ...config?.transportationOptions,
                    ...updated,
                  },
                })
              }
            />
          )}

          {show.serviceRules && (
            <DynamicStringListField
              label="Service Rules"
              placeholder="e.g., 24-hour cancellation required"
              helperText="Policy statements defining special handling or restrictions for specific services."
              values={config?.serviceRules ?? []}
              onChange={(values) => onConfigChange({ serviceRules: values })}
              error={errors.serviceRules}
              addLabel="Add Rule"
            />
          )}

          {show.highlightPrices && (
            <div className="flex flex-col gap-1.5">
              <Checkbox
                id="return-price"
                name="returnPrice"
                value={config?.returnPrice ?? false}
                isChecked={config?.returnPrice ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onConfigChange({ returnPrice: e.target.checked })
                }
                label="Highlight Prices"
                labelStyles="text-base font-semibold text-black"
              />
              <p className="text-sm text-black/60">Agent should reveal price</p>
            </div>
          )}

          {show.transferScenarios && (
            <DynamicStringListField
              label="Transfer Scenarios"
              placeholder="e.g., Complex repair questions"
              helperText="Defines explicit scenarios where the bot must initiate a callback or transfer instead of booking."
              values={config?.additionalCallBackAndTransferRules ?? []}
              onChange={(values) =>
                onConfigChange({ additionalCallBackAndTransferRules: values })
              }
              error={errors.additionalCallBackAndTransferRules}
              addLabel="Add Scenario"
            />
          )}

          {show.upselling && (
            <UpsellPreferences
              value={config?.upsellingRules ?? {}}
              onChange={(field, value) =>
                onConfigChange({
                  upsellingRules: {
                    ...config?.upsellingRules,
                    [field]: value,
                  },
                })
              }
              errors={{ upsell: errors.upsellingRules }}
            />
          )}
          {show.availableSlotsDuration && (
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-semibold text-black">
                Slot Duration
              </label>
              <CIDropdown
                options={SLOT_DURATION}
                selectedValues={selectedSlotDurationOptions}
                onChange={handleSlotsDurationChange}
                placeholder="Select duration"
                isMultiSelect={false}
                allowSearch={false}
                showClearButton={true}
                showSelectAll={false}
                variant="clean"
              />
              <p className="text-sm text-black/60">List of slot durations</p>
            </div>
          )}
          {show.availableSlotsCapacity && (
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-semibold text-black">
                Slot Duration
              </label>
              <CIDropdown
                options={SLOT_CAPACITY}
                selectedValues={selectedSlotCapacityOptions}
                onChange={handleSlotsCapacityChange}
                placeholder="Select capacity"
                isMultiSelect={false}
                allowSearch={false}
                showClearButton={true}
                showSelectAll={false}
                variant="clean"
              />
              <p className="text-sm text-black/60">
                List of total capacities per slot
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
