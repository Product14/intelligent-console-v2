'use client';

import CIDropdown from '@/internal-design-system-settings/dropdown/ci-dropdown';
import { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';
import GenericInput from '@/internal-design-system-settings/input/generic-input';
import { RequestPayloadAvailabilityHours } from '@/types/settings/vini-config';

import React, { useEffect, useRef, useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { MdCalendarToday, MdClose, MdCreditCard } from 'react-icons/md';

import Toggle from '@spyne-console/design-system/toggle';

import OnboardingPrimaryButton from '@spyne-console/components/onboarding/buttons/onboarding-primary-button';
import OnboardingSecondaryButton from '@spyne-console/components/onboarding/buttons/onboarding-secondary-button';

import { Calendar } from '@/components/settings/ui/calendar';

import TimeInput from '@/components/settings/shared/TimeInput';

import { TimeValue } from '@/utils-settings/TimeUtils';

import { PreviewHolidayItem } from './PreviewHolidayItem';

export interface HolidayData {
  id?: string;
  festivalName: string;
  reason: string;
  date: string;
  isFullDay: boolean;
  startTime?: TimeValue;
  endTime?: TimeValue;
}

interface HolidaySettingModalProps {
  category: 'sales' | 'service' | 'parts' | 'finance';
  isOpen: boolean;
  onClose: () => void;
  onSave: (holiday: HolidayData) => void;
  onSaveBatch?: (holidays: HolidayData[]) => void;
  initialData?: HolidayData | null;
  operatingHours?: RequestPayloadAvailabilityHours;
  existingHolidays?: HolidayData[];
}

// Helper function to get the nth occurrence of a weekday in a month
const getNthWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number,
  n: number
): Date => {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysUntilWeekday = (weekday - firstWeekday + 7) % 7;
  const date = 1 + daysUntilWeekday + (n - 1) * 7;
  return new Date(year, month, date);
};

// Helper function to get the last occurrence of a weekday in a month
const getLastWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number
): Date => {
  // Start from the last day of the month and work backwards
  const lastDay = new Date(year, month + 1, 0);
  const lastDayWeekday = lastDay.getDay();
  const daysBack = (lastDayWeekday - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - daysBack);
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to check if a holiday already exists in saved or previewed holidays
const isHolidayAlreadyAdded = (
  holidayName: string,
  existingHolidays: HolidayData[],
  previewHolidays: HolidayData[]
): boolean => {
  const allHolidays = [...existingHolidays, ...previewHolidays];
  return allHolidays.some(
    (h) => h.festivalName.toLowerCase() === holidayName.toLowerCase()
  );
};

// Function to calculate predefined holidays based on current date and existing holidays
const calculatePredefinedHolidays = (
  existingHolidays: HolidayData[] = [],
  previewHolidays: HolidayData[] = []
): Array<{
  label: string;
  value: string;
  date: string;
  reason: string;
}> => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const holidays = [
    {
      label: 'New Year',
      value: 'new-year',
      month: 0, // January
      day: 1,
      reason: 'New Year',
    },
    {
      label: 'Christmas',
      value: 'christmas',
      month: 11, // December
      day: 25,
      reason: 'Christmas',
    },
    {
      label: 'Thanksgiving',
      value: 'thanksgiving',
      month: 10, // November
      day: null, // Fourth Thursday
      calculateDate: (year: number) => getNthWeekdayOfMonth(year, 10, 4, 4), // 4th Thursday of November
      reason: 'Thanksgiving',
    },
    {
      label: 'Memorial Day',
      value: 'memorial-day',
      month: 4, // May
      day: null, // Last Monday
      calculateDate: (year: number) => getLastWeekdayOfMonth(year, 4, 1), // Last Monday of May
      reason: 'Memorial Day',
    },
    {
      label: 'Labor Day',
      value: 'labor-day',
      month: 8, // September
      day: null, // First Monday
      calculateDate: (year: number) => getNthWeekdayOfMonth(year, 8, 1, 1), // 1st Monday of September
      reason: 'Labor Day',
    },
  ];

  return holidays.map((holiday) => {
    let holidayDate: Date;

    // Calculate the date for this year
    if (holiday.calculateDate) {
      holidayDate = holiday.calculateDate(currentYear);
    } else {
      holidayDate = new Date(currentYear, holiday.month, holiday.day!);
    }

    // Check if holiday has passed this year or is already added
    const hasPassedThisYear = today > holidayDate;
    const isAlreadyAdded = isHolidayAlreadyAdded(
      holiday.label,
      existingHolidays,
      previewHolidays
    );

    // If holiday has passed or is already added, use next year's date
    if (hasPassedThisYear || isAlreadyAdded) {
      if (holiday.calculateDate) {
        holidayDate = holiday.calculateDate(currentYear + 1);
      } else {
        holidayDate = new Date(currentYear + 1, holiday.month, holiday.day!);
      }
    }

    return {
      label: holiday.label,
      value: holiday.value,
      date: formatDate(holidayDate),
      reason: holiday.reason,
    };
  });
};

// Helper function to convert time string (HH:MM) to TimeValue
const convertTimeStringToTimeValue = (timeString: string): TimeValue => {
  const [hours, minutes] = timeString.split(':');
  const hour24 = parseInt(hours, 10);
  const isPM = hour24 >= 12;
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  return {
    hour: String(hour12).padStart(2, '0'),
    minute: minutes,
    period: isPM ? 'PM' : 'AM',
  };
};

// Helper function to get day name from date string
const getDayNameFromDate = (
  dateString: string
): keyof RequestPayloadAvailabilityHours => {
  const date = new Date(dateString + 'T00:00:00');
  const days: (keyof RequestPayloadAvailabilityHours)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()];
};

// Helper function to convert TimeValue to minutes for comparison
const timeToMinutes = (time: TimeValue): number => {
  let hours = parseInt(time.hour, 10);
  const minutes = parseInt(time.minute, 10);

  // Convert to 24-hour format
  if (time.period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (time.period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

export const HolidaySettingModal: React.FC<HolidaySettingModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
  onSaveBatch,
  initialData,
  operatingHours,
  existingHolidays = [],
}) => {
  const [selectedFestival, setSelectedFestival] = useState<
    CIDropdownMenuOption[]
  >([]);
  const [festivalName, setFestivalName] = useState(
    initialData?.festivalName || ''
  );
  const [reason, setReason] = useState(initialData?.reason || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [isFullDay, setIsFullDay] = useState(initialData?.isFullDay ?? false);
  const [startTime, setStartTime] = useState<TimeValue>(
    initialData?.startTime || { hour: '09', minute: '00', period: 'AM' }
  );
  const [endTime, setEndTime] = useState<TimeValue>(
    initialData?.endTime || { hour: '05', minute: '30', period: 'PM' }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewHolidays, setPreviewHolidays] = useState<HolidayData[]>([]);
  const [isFormTouched, setIsFormTouched] = useState(false);

  const isCustomFestival =
    selectedFestival.length > 0 && selectedFestival[0].value === 'custom';

  // Calculate predefined holidays based on existing and preview holidays
  const PREDEFINED_HOLIDAYS = React.useMemo(
    () => calculatePredefinedHolidays(existingHolidays, previewHolidays),
    [existingHolidays, previewHolidays]
  );

  const festivalOptions: CIDropdownMenuOption[] = [
    {
      id: 'custom',
      label: 'Custom Date',
      value: 'custom',
    },
    ...PREDEFINED_HOLIDAYS.map((holiday) => ({
      id: holiday.value,
      label: holiday.label,
      value: holiday.value,
    })),
  ];

  useEffect(() => {
    if (initialData) {
      const predefined = PREDEFINED_HOLIDAYS.find(
        (h) => h.label === initialData.festivalName
      );
      if (predefined) {
        setSelectedFestival([
          {
            id: predefined.value,
            label: predefined.label,
            value: predefined.value,
          },
        ]);
      } else {
        setSelectedFestival([
          {
            id: 'custom',
            label: 'Custom Date',
            value: 'custom',
          },
        ]);
      }
      setFestivalName(initialData.festivalName);
      setReason(initialData.reason);
      setDate(initialData.date);
      setIsFullDay(initialData.isFullDay);
      setStartTime(
        initialData.startTime || { hour: '09', minute: '00', period: 'AM' }
      );
      setEndTime(
        initialData.endTime || { hour: '05', minute: '30', period: 'PM' }
      );
    }
  }, [initialData]);

  useEffect(() => {
    if (selectedFestival.length > 0 && !initialData) {
      const selected = selectedFestival[0];
      if (selected.value !== 'custom') {
        const predefined = PREDEFINED_HOLIDAYS.find(
          (h) => h.value === selected.value
        );
        if (predefined) {
          setFestivalName(predefined.label);
          setReason(`${predefined.reason} (Holiday)`);
          setDate(predefined.date);
        }
      } else {
        setReason('');
        setDate('');
      }
    }
  }, [selectedFestival, initialData]);

  // Prefill timeslots based on the selected date's day of the week
  useEffect(() => {
    if (date && operatingHours && !initialData) {
      const dayName = getDayNameFromDate(date);
      const daySchedule = operatingHours[dayName];

      if (daySchedule && daySchedule.isAvailable) {
        const prefillStartTime = convertTimeStringToTimeValue(
          daySchedule.startTime
        );
        const prefillEndTime = convertTimeStringToTimeValue(
          daySchedule.endTime
        );

        setStartTime(prefillStartTime);
        setEndTime(prefillEndTime);
      }
    }
  }, [date, operatingHours, initialData]);

  // Clear time error when start or end time changes
  useEffect(() => {
    if (errors.time && !isFullDay) {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      if (endMinutes > startMinutes) {
        setErrors((prev) => {
          const { time, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [startTime, endTime, isFullDay, errors.time]);

  const validateForm = (): boolean => {
    setIsFormTouched(true);
    const newErrors: { [key: string]: string } = {};

    if (selectedFestival.length === 0) {
      newErrors.festival = 'Please select a festival';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    // Validate time range if not full day
    if (!isFullDay) {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      if (endMinutes <= startMinutes) {
        newErrors.time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToPreview = () => {
    if (validateForm()) {
      const newHoliday: HolidayData = {
        id: Date.now().toString(),
        festivalName,
        reason,
        date,
        isFullDay,
        startTime: !isFullDay ? startTime : undefined,
        endTime: !isFullDay ? endTime : undefined,
      };
      setPreviewHolidays((prev) => [...prev, newHoliday]);
      setSelectedFestival([]);
      setFestivalName('');
      setReason('');
      setDate('');
      setErrors({});
    }
  };

  const handleRemoveFromPreview = (id: string) => {
    setPreviewHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const handleConfirm = () => {
    if (previewHolidays.length > 0) {
      // Use batch save if available, otherwise fall back to individual saves
      if (onSaveBatch) {
        onSaveBatch(previewHolidays);
      } else {
        previewHolidays.forEach((holiday) => onSave(holiday));
      }
      // Reset all state and close modal
      setPreviewHolidays([]);
      resetFormState();
      onClose();
    }
  };

  const resetFormState = () => {
    setSelectedFestival([]);
    setFestivalName('');
    setReason('');
    setDate('');
    setIsFullDay(false);
    setStartTime({ hour: '09', minute: '00', period: 'AM' });
    setEndTime({ hour: '05', minute: '30', period: 'PM' });
    setErrors({});
    setIsFormTouched(false);
  };

  const handleCancel = () => {
    resetFormState();
    setPreviewHolidays([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-h-[90vh] w-[714px] flex-col rounded-lg border border-black/10 bg-white shadow-lg">
        {/* Fixed Header */}
        <div className="flex shrink-0 items-center gap-6 border-b border-black/10 p-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[28px] border-8 border-[rgba(70,0,242,0.04)] bg-[rgba(70,0,242,0.08)]">
            <MdCreditCard className="text-[24px] text-[#4600F2]" />
          </div>

          <div className="flex grow flex-col gap-2">
            <div className="flex items-start justify-between">
              <h2 className="font-['Inter'] text-lg font-semibold leading-7 text-black/90">
                Holiday Tracker- <span className="capitalize">{category}</span>
              </h2>
              <button
                onClick={handleCancel}
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

        {/* Scrollable Middle Section */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Form Section */}
          <div className="flex flex-col gap-4 rounded-[6.6px] border-[1.1px] border-black/10 bg-white p-4">
            <CIDropdown
              label="Holiday Name"
              selectedValues={selectedFestival}
              options={festivalOptions}
              onChange={setSelectedFestival}
              placeholder="Select Holiday"
              variant="default"
              error={isFormTouched ? errors.festival : undefined}
              required
            />

            <GenericInput
              label="Reason"
              value={reason}
              onChange={setReason}
              placeholder="eg. Christmas"
              size="medium"
              allowFocusStyles={false}
            />

            <DatePickerInput
              label="Date"
              value={date}
              onChange={setDate}
              placeholder="Select Date"
              hasError={isFormTouched && !!errors.date}
              required
              disabled={!isCustomFestival && selectedFestival.length > 0}
            />

            <div className="flex flex-col gap-3">
              <label
                className={`text-xs font-medium leading-5 ${
                  isFormTouched && errors.time
                    ? 'text-red-600'
                    : 'text-[rgba(0,0,0,0.8)]'
                }`}
              >
                Time*
              </label>
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                  Closed full day
                </p>
                <Toggle
                  id="fullday-toggle"
                  toggle={isFullDay}
                  toggleHandler={() => setIsFullDay(!isFullDay)}
                  className="[&_input:checked~div:first-of-type]:bg-black/20 [&_input:checked~div>div]:bg-black"
                />
              </div>
              {!isFullDay && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`relative flex h-[52px] items-center justify-between rounded-lg border ${
                        isFormTouched && errors.time
                          ? 'border-red-500'
                          : 'border-[#ececec]'
                      } bg-white px-5 py-0.5 font-['Inter'] text-sm font-medium leading-5 shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)]`}
                    >
                      <span className="text-[#999]">From</span>
                      <TimeInput
                        value={startTime}
                        disabled={false}
                        handleChange={setStartTime}
                        className="border-0 bg-transparent p-0 text-[#111] outline-none"
                      />
                    </div>
                    <div
                      className={`relative flex h-[52px] items-center justify-between rounded-lg border ${
                        isFormTouched && errors.time
                          ? 'border-red-500'
                          : 'border-[#ececec]'
                      } bg-white px-5 py-0.5 font-['Inter'] text-sm font-medium leading-5 shadow-[2px_2px_2px_0px_rgba(17,17,17,0.04)]`}
                    >
                      <span className="text-[#999]">To</span>
                      <TimeInput
                        value={endTime}
                        disabled={false}
                        handleChange={setEndTime}
                        className="border-0 bg-transparent p-0 text-[#111] outline-none"
                      />
                    </div>
                  </div>
                  {isFormTouched && errors.time && (
                    <p className="text-xs text-red-600">{errors.time}</p>
                  )}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToPreview}
              className="flex h-12 w-full items-center justify-center rounded-md border border-black bg-white px-4 py-1.5 text-lg font-semibold leading-6 text-[rgba(0,0,0,0.8)] shadow-sm transition-colors hover:bg-gray-50"
            >
              Add Holiday
            </button>
          </div>

          {/* Preview Section */}
          {previewHolidays.length > 0 && (
            <div className="flex flex-col gap-4 rounded-lg border border-black/10 bg-[#f7f8fa] p-5">
              <p className="text-base font-semibold leading-6 text-[rgba(0,0,0,0.6)]">
                Preview:
              </p>
              <div className="flex flex-col gap-4">
                {previewHolidays.map((holiday) => (
                  <PreviewHolidayItem
                    key={holiday.id}
                    holiday={holiday}
                    onRemove={handleRemoveFromPreview}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t border-black/10 p-4">
          <div className="grid grid-cols-2 gap-3">
            <OnboardingSecondaryButton
              onClick={handleCancel}
              className="w-full"
            >
              Cancel
            </OnboardingSecondaryButton>

            <OnboardingPrimaryButton
              onClick={handleConfirm}
              className="w-full"
              showIcon={false}
              disabled={previewHolidays.length === 0}
            >
              Confirm
            </OnboardingPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  min?: string;
  max?: string;
  required?: boolean;
}

function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  hasError = false,
  min,
  max,
  required = false,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;
  const minDate = min ? new Date(min + 'T00:00:00') : undefined;
  const maxDate = max ? new Date(max + 'T00:00:00') : undefined;

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    }
    setIsOpen(false);
  };

  return (
    <div>
      <label
        className={`mb-2 block text-xs font-medium leading-5 ${
          hasError ? 'text-red-600' : 'text-black/90'
        }`}
      >
        {label}{' '}
        {required && (
          <span className={hasError ? 'text-red-500' : 'text-black/90'}>*</span>
        )}
      </label>
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex h-11 w-full items-center gap-2 rounded-lg border bg-white px-4 text-sm font-medium leading-5 transition-colors ${
            hasError
              ? 'border-red-500 focus:border-red-500'
              : 'border-[#cfcfcf]'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <MdCalendarToday className="h-5 w-5 text-black/90" />
          <span className="text-black/90">{displayValue || placeholder}</span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              defaultMonth={selectedDate || new Date()}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
