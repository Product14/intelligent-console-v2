import { RequestPayloadAvailabilityHours } from '@/types/settings/vini-config';

import React, { useEffect, useState } from 'react';
import { FcCallTransfer } from 'react-icons/fc';

import Toggle from '@/vendor-settings/design-system/toggle/toggle';


import TimeInput from '@/components/settings/shared/time-input';

import { TimeUtils, TimeValue, weekDays } from '@/lib/settings/time-utils';

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

export default WorkingHours;
