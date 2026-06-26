import { RequestPayloadAvailabilityHours } from '@/types/settings/vini-config';

import React, { useEffect, useState } from 'react';
import { FcCallTransfer } from 'react-icons/fc';
import { MdClose, MdCreditCard } from 'react-icons/md';

import Toggle from '@spyne-console/design-system/toggle';

import OnboardingPrimaryButton from '@spyne-console/components/onboarding/buttons/onboarding-primary-button';
import OnboardingSecondaryButton from '@spyne-console/components/onboarding/buttons/onboarding-secondary-button';

import TimeInput from '@/components/settings/shared/TimeInput';

import { TimeUtils, TimeValue, weekDays } from '@/utils-settings/TimeUtils';

interface WorkingHoursProps {
  operatingHours?: RequestPayloadAvailabilityHours | null;
  initialOperatingHours?: RequestPayloadAvailabilityHours | null;
  updateOperatingHours?: (hours: RequestPayloadAvailabilityHours) => void;
  readOnly?: boolean;
}

export interface DayAvailability {
  isAvailable: boolean;
  startTime: TimeValue;
  endTime: TimeValue;
  isTransferAvailable?: boolean;
}

export interface AvailabilityState {
  [key: string]: DayAvailability;
}

const WorkingHours: React.FC<WorkingHoursProps> = ({
  operatingHours,
  initialOperatingHours,
  updateOperatingHours,
  readOnly = false,
}) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Check if there's pre-existing data - check if any day has data
  const hasPreExistingData = initialOperatingHours
    ? Object.values(initialOperatingHours).some((day: any) => day?.isAvailable)
    : false;

  // Convert operatingHours to availability state format
  const initializeAvailability = (): AvailabilityState => {
    const availabilityData: AvailabilityState = {};

    weekDays.forEach((day) => {
      const dayKey = day.toLowerCase();
      if (operatingHours?.[dayKey as keyof RequestPayloadAvailabilityHours]) {
        const dayData = operatingHours[
          dayKey as keyof RequestPayloadAvailabilityHours
        ] as any;

        const isAvailable = dayData.isAvailable ?? false;
        const startTime = dayData.startTime ?? '09:00';
        const endTime = dayData.endTime ?? '17:00';
        const isTransferAvailable = isAvailable
          ? (dayData.isTransferAvailable ?? true)
          : false;

        availabilityData[dayKey] = {
          isAvailable,
          startTime: TimeUtils.convertTo12HourFormat(startTime),
          endTime: TimeUtils.convertTo12HourFormat(endTime),
          isTransferAvailable,
        };
      } else {
        const isWeekend = dayKey === 'saturday' || dayKey === 'sunday';
        availabilityData[dayKey] = {
          isAvailable: !isWeekend,
          startTime: { hour: '09', minute: '00', period: 'AM' },
          endTime: { hour: '05', minute: '00', period: 'PM' },
          isTransferAvailable: !isWeekend,
        };
      }
    });
    return availabilityData;
  };

  const [availability, setAvailability] = useState<AvailabilityState>(
    initializeAvailability()
  );

  useEffect(() => {
    if (operatingHours) {
      setAvailability(initializeAvailability());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingHours]);

  const validateTimeRange = (
    dayKey: string,
    startTime: TimeValue,
    endTime: TimeValue
  ) => {
    const errorMessage = TimeUtils.getTimeValidationError(startTime, endTime);

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[dayKey] = errorMessage;
      } else {
        delete newErrors[dayKey];
      }
      return newErrors;
    });
  };

  const handleToggleChange = (day: string) => {
    const dayKey = day.toLowerCase();
    setAvailability((prev) => {
      const currentDayData = prev[dayKey];
      const newIsAvailable = !currentDayData?.isAvailable;

      const newDayData = {
        ...currentDayData,
        isAvailable: newIsAvailable,
        isTransferAvailable: newIsAvailable
          ? (currentDayData?.isTransferAvailable ?? true)
          : false,
      };

      if (newIsAvailable) {
        validateTimeRange(dayKey, newDayData.startTime, newDayData.endTime);
      } else {
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[dayKey];
          return newErrors;
        });
      }

      const updatedAvailability = {
        ...prev,
        [dayKey]: newDayData,
      };

      // Update context immediately
      if (updateOperatingHours) {
        const availabilityHoursData: any = {};
        weekDays.forEach((d) => {
          const dKey = d.toLowerCase();
          const dayData = updatedAvailability[dKey];
          const isDayAvailable = dayData?.isAvailable ?? false;
          availabilityHoursData[dKey] = {
            isAvailable: isDayAvailable,
            startTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.startTime)
              : '09:00',
            endTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.endTime)
              : '17:00',
            isTransferAvailable: isDayAvailable
              ? (dayData?.isTransferAvailable ?? true)
              : false,
          };
        });
        updateOperatingHours(
          availabilityHoursData as RequestPayloadAvailabilityHours
        );
      }

      return updatedAvailability;
    });
  };

  const handleTimeChange = (
    day: string,
    type: 'startTime' | 'endTime',
    value: TimeValue
  ) => {
    const dayKey = day.toLowerCase();
    setAvailability((prev) => {
      const currentDayData = prev[dayKey] || {
        isAvailable: false,
        startTime: { hour: '09', minute: '00', period: 'AM' },
        endTime: { hour: '05', minute: '00', period: 'PM' },
      };

      const newDayData = {
        ...currentDayData,
        [type]: value,
      };

      if (newDayData.isAvailable) {
        validateTimeRange(dayKey, newDayData.startTime, newDayData.endTime);
      }

      const updatedAvailability = {
        ...prev,
        [dayKey]: newDayData,
      };

      // Update context immediately
      if (updateOperatingHours) {
        const availabilityHoursData: any = {};
        weekDays.forEach((d) => {
          const dKey = d.toLowerCase();
          const dayData = updatedAvailability[dKey];
          availabilityHoursData[dKey] = {
            isAvailable: dayData?.isAvailable ?? false,
            startTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.startTime)
              : '09:00',
            endTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.endTime)
              : '17:00',
          };
        });
        updateOperatingHours(
          availabilityHoursData as RequestPayloadAvailabilityHours
        );
      }

      return updatedAvailability;
    });
  };

  const formatTimeDisplay = (time: TimeValue) => {
    return `${time.hour}:${time.minute} ${time.period}`;
  };

  return (
    <div className="flex flex-col gap-5 rounded-[6.6px] border-[1.1px] border-black/10 bg-white p-4">
      {weekDays.map((day: string) => {
        const dayKey = day.toLowerCase();
        const dayAvailability = availability[dayKey] || {
          isAvailable: false,
          startTime: { hour: '09', minute: '00', period: 'AM' },
          endTime: { hour: '05', minute: '00', period: 'PM' },
        };

        const hasError = validationErrors[dayKey];

        return (
          <div key={day} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="shrink-0 font-['Inter'] text-sm font-medium leading-5 text-[#111]">
                {day}
              </p>

              <div className="flex shrink-0 items-center gap-3">
                {!readOnly && (
                  <div className="flex w-[100px] items-center justify-between">
                    <Toggle
                      id={day}
                      toggle={dayAvailability.isAvailable}
                      toggleHandler={() => handleToggleChange(day)}
                      disabled={hasPreExistingData}
                      className="[&_input:checked~div:first-of-type]:bg-black/20 [&_input:checked~div>div]:bg-black"
                    />
                    <p
                      className={`shrink-0 font-['Inter'] text-sm font-medium leading-5 ${
                        dayAvailability.isAvailable
                          ? 'text-[#111]'
                          : 'text-[#999]'
                      }`}
                    >
                      {dayAvailability.isAvailable ? 'Open' : 'Closed'}
                    </p>
                  </div>
                )}

                <div className={`flex w-[420px] items-center gap-3`}>
                  <div
                    className={`relative flex h-11 grow basis-0 items-center justify-between rounded-lg px-2 py-0.5 font-['Inter'] text-sm font-medium leading-5 ${
                      dayAvailability.isAvailable
                        ? 'border border-[#ececec] bg-white shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)]'
                        : 'bg-[#f0f0f0]'
                    } ${hasError ? 'border-red-500' : ''}`}
                  >
                    <span
                      className={
                        dayAvailability.isAvailable
                          ? 'text-[#999]'
                          : 'text-[#999]'
                      }
                    >
                      From
                    </span>
                    {dayAvailability.isAvailable &&
                    !hasPreExistingData &&
                    !readOnly ? (
                      <div className="absolute inset-0 flex items-center justify-end px-3">
                        <TimeInput
                          value={dayAvailability.startTime}
                          disabled={
                            !dayAvailability.isAvailable || hasPreExistingData
                          }
                          handleChange={(time) =>
                            handleTimeChange(day, 'startTime', time)
                          }
                          className="border-0 bg-transparent p-0 text-black/80 outline-none"
                        />
                      </div>
                    ) : (
                      <span
                        className={
                          dayAvailability.isAvailable
                            ? 'text-[#111]'
                            : 'text-[#999]'
                        }
                      >
                        {formatTimeDisplay(dayAvailability.startTime)}
                      </span>
                    )}
                  </div>

                  <div
                    className={`relative flex h-11 grow basis-0 items-center justify-between rounded-lg px-2 py-0.5 font-['Inter'] text-sm font-medium leading-5 ${
                      dayAvailability.isAvailable
                        ? 'border border-[#ececec] bg-white shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)]'
                        : 'bg-[#f0f0f0]'
                    } ${hasError ? 'border-red-500' : ''}`}
                  >
                    <span
                      className={
                        dayAvailability.isAvailable
                          ? 'text-[#999]'
                          : 'text-[#999]'
                      }
                    >
                      To
                    </span>
                    {dayAvailability.isAvailable &&
                    !hasPreExistingData &&
                    !readOnly ? (
                      <div className="absolute inset-0 flex items-center justify-end px-3">
                        <TimeInput
                          value={dayAvailability.endTime}
                          disabled={
                            !dayAvailability.isAvailable || hasPreExistingData
                          }
                          handleChange={(time) =>
                            handleTimeChange(day, 'endTime', time)
                          }
                          className="border-0 bg-transparent p-0 text-black/80 outline-none"
                        />
                      </div>
                    ) : (
                      <span
                        className={
                          dayAvailability.isAvailable
                            ? 'text-[#111]'
                            : 'text-[#999]'
                        }
                      >
                        {formatTimeDisplay(dayAvailability.endTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex w-10 items-center justify-center">
                    {dayAvailability.isTransferAvailable ? (
                      <FcCallTransfer className="h-6 w-6" />
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {hasError && (
              <div className="flex justify-end text-xs font-medium text-red-500">
                {hasError}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface WorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  operatingHours?: RequestPayloadAvailabilityHours | null;
  initialOperatingHours?: RequestPayloadAvailabilityHours | null;
  updateOperatingHours?: (hours: RequestPayloadAvailabilityHours) => void;
  readOnly?: boolean;
}

export const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  operatingHours,
  initialOperatingHours,
  updateOperatingHours,
  readOnly = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 max-h-[90vh] w-[814px] overflow-y-auto rounded-lg border border-black/10 bg-white shadow-lg">
        <div className="flex flex-col gap-6 p-4">
          <div className="flex items-center gap-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[28px] border-8 border-[rgba(70,0,242,0.04)] bg-[rgba(70,0,242,0.08)]">
              <MdCreditCard className="text-[24px] text-[#4600F2]" />
            </div>

            <div className="flex grow flex-col gap-2">
              <div className="flex items-start justify-between">
                <h2 className="font-['Inter'] text-lg font-semibold leading-7 text-black/90">
                  Rooftop Working Shift
                </h2>
                <button
                  onClick={onClose}
                  className="shrink-0 text-black/60 transition-colors hover:text-black"
                  aria-label="Close modal"
                >
                  <MdClose className="text-[24px]" />
                </button>
              </div>
              <p className="font-['Inter'] text-sm font-normal leading-5 text-black/60">
                Add users and assign them to their designated teams
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-[6.6px] border-[1.1px] border-black/10 bg-white p-4">
            <WorkingHoursContent
              operatingHours={operatingHours}
              initialOperatingHours={initialOperatingHours}
              updateOperatingHours={updateOperatingHours}
              readOnly={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <OnboardingSecondaryButton onClick={onClose} className="w-full">
              Cancel
            </OnboardingSecondaryButton>

            <OnboardingPrimaryButton
              onClick={onConfirm}
              className="w-full"
              showIcon={false}
            >
              Confirm
            </OnboardingPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkingHoursContent: React.FC<WorkingHoursProps> = ({
  operatingHours,
  initialOperatingHours,
  updateOperatingHours,
  readOnly = false,
}) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Check if there's pre-existing data - check if any day has data
  const hasPreExistingData = initialOperatingHours
    ? Object.values(initialOperatingHours).some((day: any) => day?.isAvailable)
    : false;

  // Convert operatingHours to availability state format
  const initializeAvailability = (): AvailabilityState => {
    const availabilityData: AvailabilityState = {};

    weekDays.forEach((day) => {
      const dayKey = day.toLowerCase();
      if (operatingHours?.[dayKey as keyof RequestPayloadAvailabilityHours]) {
        const dayData = operatingHours[
          dayKey as keyof RequestPayloadAvailabilityHours
        ] as any;

        const isAvailable = dayData.isAvailable ?? false;
        const startTime = dayData.startTime ?? '09:00';
        const endTime = dayData.endTime ?? '17:00';
        const isTransferAvailable = isAvailable
          ? (dayData.isTransferAvailable ?? true)
          : false;

        availabilityData[dayKey] = {
          isAvailable,
          startTime: TimeUtils.convertTo12HourFormat(startTime),
          endTime: TimeUtils.convertTo12HourFormat(endTime),
          isTransferAvailable,
        };
      } else {
        const isWeekend = dayKey === 'saturday' || dayKey === 'sunday';
        availabilityData[dayKey] = {
          isAvailable: !isWeekend,
          startTime: { hour: '09', minute: '00', period: 'AM' },
          endTime: { hour: '05', minute: '00', period: 'PM' },
          isTransferAvailable: !isWeekend,
        };
      }
    });
    return availabilityData;
  };

  const [availability, setAvailability] = useState<AvailabilityState>(
    initializeAvailability()
  );

  useEffect(() => {
    if (operatingHours) {
      setAvailability(initializeAvailability());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingHours]);

  const validateTimeRange = (
    dayKey: string,
    startTime: TimeValue,
    endTime: TimeValue
  ) => {
    const errorMessage = TimeUtils.getTimeValidationError(startTime, endTime);

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[dayKey] = errorMessage;
      } else {
        delete newErrors[dayKey];
      }
      return newErrors;
    });
  };

  const handleToggleChange = (day: string) => {
    const dayKey = day.toLowerCase();
    setAvailability((prev) => {
      const currentDayData = prev[dayKey];
      const newIsAvailable = !currentDayData?.isAvailable;

      const newDayData = {
        ...currentDayData,
        isAvailable: newIsAvailable,
        isTransferAvailable: newIsAvailable
          ? (currentDayData?.isTransferAvailable ?? true)
          : false,
      };

      if (newIsAvailable) {
        validateTimeRange(dayKey, newDayData.startTime, newDayData.endTime);
      } else {
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[dayKey];
          return newErrors;
        });
      }

      const updatedAvailability = {
        ...prev,
        [dayKey]: newDayData,
      };

      if (updateOperatingHours) {
        const availabilityHoursData: any = {};
        weekDays.forEach((d) => {
          const dKey = d.toLowerCase();
          const dayData = updatedAvailability[dKey];
          const isDayAvailable = dayData?.isAvailable ?? false;
          availabilityHoursData[dKey] = {
            isAvailable: isDayAvailable,
            startTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.startTime)
              : '09:00',
            endTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.endTime)
              : '17:00',
            isTransferAvailable: isDayAvailable
              ? (dayData?.isTransferAvailable ?? true)
              : false,
          };
        });
        updateOperatingHours(
          availabilityHoursData as RequestPayloadAvailabilityHours
        );
      }

      return updatedAvailability;
    });
  };

  const handleTimeChange = (
    day: string,
    type: 'startTime' | 'endTime',
    value: TimeValue
  ) => {
    const dayKey = day.toLowerCase();
    setAvailability((prev) => {
      const currentDayData = prev[dayKey] || {
        isAvailable: false,
        startTime: { hour: '09', minute: '00', period: 'AM' },
        endTime: { hour: '05', minute: '00', period: 'PM' },
        isTransferAvailable: false,
      };

      const newDayData = {
        ...currentDayData,
        [type]: value,
      };

      if (newDayData.isAvailable) {
        validateTimeRange(dayKey, newDayData.startTime, newDayData.endTime);
      }

      const updatedAvailability = {
        ...prev,
        [dayKey]: newDayData,
      };

      if (updateOperatingHours) {
        const availabilityHoursData: any = {};
        weekDays.forEach((d) => {
          const dKey = d.toLowerCase();
          const dayData = updatedAvailability[dKey];
          const isDayAvailable = dayData?.isAvailable ?? false;
          availabilityHoursData[dKey] = {
            isAvailable: isDayAvailable,
            startTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.startTime)
              : '09:00',
            endTime: dayData
              ? TimeUtils.convertTo24HourFormat(dayData.endTime)
              : '17:00',
            isTransferAvailable: isDayAvailable
              ? (dayData?.isTransferAvailable ?? true)
              : false,
          };
        });
        updateOperatingHours(
          availabilityHoursData as RequestPayloadAvailabilityHours
        );
      }

      return updatedAvailability;
    });
  };

  const formatTimeDisplay = (time: TimeValue) => {
    return `${time.hour}:${time.minute} ${time.period}`;
  };

  return (
    <>
      {weekDays.map((day: string) => {
        const dayKey = day.toLowerCase();
        const dayAvailability = availability[dayKey] || {
          isAvailable: false,
          startTime: { hour: '09', minute: '00', period: 'AM' },
          endTime: { hour: '05', minute: '00', period: 'PM' },
        };

        const hasError = validationErrors[dayKey];

        return (
          <div key={day} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="shrink-0 font-['Inter'] text-sm font-medium leading-5 text-[#111]">
                {day}
              </p>

              <div className="flex shrink-0 items-center gap-3">
                {!readOnly && (
                  <div className="flex w-[100px] items-center justify-between">
                    <Toggle
                      id={day}
                      toggle={dayAvailability.isAvailable}
                      toggleHandler={() => handleToggleChange(day)}
                      disabled={hasPreExistingData}
                      className="[&_input:checked~div:first-of-type]:bg-black/20 [&_input:checked~div>div]:bg-black"
                    />
                    <p
                      className={`shrink-0 font-['Inter'] text-sm font-medium leading-5 ${
                        dayAvailability.isAvailable
                          ? 'text-[#111]'
                          : 'text-[#999]'
                      }`}
                    >
                      {dayAvailability.isAvailable ? 'Open' : 'Closed'}
                    </p>
                  </div>
                )}

                <div
                  className={`flex items-center gap-4 ${readOnly ? 'w-full' : 'w-[500px] min-w-fit'}`}
                >
                  <div
                    className={`relative flex h-11 grow basis-0 items-center justify-between rounded-lg px-2 py-0.5 font-['Inter'] text-sm font-medium leading-5 ${
                      dayAvailability.isAvailable
                        ? 'border border-[#ececec] bg-white shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)]'
                        : 'bg-[#f0f0f0]'
                    } ${hasError ? 'border-red-500' : ''}`}
                  >
                    <span
                      className={
                        dayAvailability.isAvailable
                          ? 'text-[#999]'
                          : 'text-[#999]'
                      }
                    >
                      From
                    </span>
                    {dayAvailability.isAvailable &&
                    !hasPreExistingData &&
                    !readOnly ? (
                      <div className="absolute inset-0 flex items-center justify-end px-3">
                        <TimeInput
                          value={dayAvailability.startTime}
                          disabled={
                            !dayAvailability.isAvailable || hasPreExistingData
                          }
                          handleChange={(time) =>
                            handleTimeChange(day, 'startTime', time)
                          }
                          className="bg-transparent p-0 text-black/80"
                        />
                      </div>
                    ) : (
                      <span
                        className={
                          dayAvailability.isAvailable
                            ? 'text-[#111]'
                            : 'text-[#999]'
                        }
                      >
                        {formatTimeDisplay(dayAvailability.startTime)}
                      </span>
                    )}
                  </div>

                  <div
                    className={`relative flex h-11 grow basis-0 items-center justify-between rounded-lg px-2 py-0.5 font-['Inter'] text-sm font-medium leading-5 ${
                      dayAvailability.isAvailable
                        ? 'border border-[#ececec] bg-white shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)]'
                        : 'bg-[#f0f0f0]'
                    } ${hasError ? 'border-red-500' : ''}`}
                  >
                    <span
                      className={
                        dayAvailability.isAvailable
                          ? 'text-[#999]'
                          : 'text-[#999]'
                      }
                    >
                      To
                    </span>
                    {dayAvailability.isAvailable &&
                    !hasPreExistingData &&
                    !readOnly ? (
                      <div className="absolute inset-0 flex items-center justify-end px-3">
                        <TimeInput
                          value={dayAvailability.endTime}
                          disabled={
                            !dayAvailability.isAvailable || hasPreExistingData
                          }
                          handleChange={(time) =>
                            handleTimeChange(day, 'endTime', time)
                          }
                          className="bg-transparent p-0 text-black/80"
                        />
                      </div>
                    ) : (
                      <span
                        className={
                          dayAvailability.isAvailable
                            ? 'text-[#111]'
                            : 'text-[#999]'
                        }
                      >
                        {formatTimeDisplay(dayAvailability.endTime)}
                      </span>
                    )}
                  </div>

                  {!readOnly && (
                    <label className="flex flex-col items-center gap-1 text-xs font-medium text-[#555]">
                      <input
                        type="checkbox"
                        className={`h-4 w-4 accent-[#4600F2] ${!dayAvailability.isAvailable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        checked={!!dayAvailability.isTransferAvailable}
                        disabled={
                          readOnly ||
                          hasPreExistingData ||
                          !dayAvailability.isAvailable
                        }
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const dayKeyLocal = day.toLowerCase();
                          setAvailability((prev) => {
                            const current = prev[dayKeyLocal] || {
                              isAvailable: false,
                              startTime: {
                                hour: '09',
                                minute: '00',
                                period: 'AM',
                              },
                              endTime: {
                                hour: '05',
                                minute: '00',
                                period: 'PM',
                              },
                              isTransferAvailable: false,
                            };

                            const updated = {
                              ...current,
                              isTransferAvailable: checked,
                            };

                            const next = {
                              ...prev,
                              [dayKeyLocal]: updated,
                            };

                            if (updateOperatingHours) {
                              const availabilityHoursData: any = {};
                              weekDays.forEach((d) => {
                                const dKey = d.toLowerCase();
                                const dayData = next[dKey];
                                const isDayAvailable =
                                  dayData?.isAvailable ?? false;
                                availabilityHoursData[dKey] = {
                                  isAvailable: isDayAvailable,
                                  startTime: dayData
                                    ? TimeUtils.convertTo24HourFormat(
                                        dayData.startTime
                                      )
                                    : '09:00',
                                  endTime: dayData
                                    ? TimeUtils.convertTo24HourFormat(
                                        dayData.endTime
                                      )
                                    : '17:00',
                                  isTransferAvailable: isDayAvailable
                                    ? (dayData?.isTransferAvailable ?? true)
                                    : false,
                                };
                              });
                              updateOperatingHours(
                                availabilityHoursData as RequestPayloadAvailabilityHours
                              );
                            }

                            return next;
                          });
                        }}
                      />
                      <span>Allow Call Transfer</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
            {hasError && (
              <div className="flex justify-end text-xs text-red-500">
                {hasError}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default WorkingHours;
