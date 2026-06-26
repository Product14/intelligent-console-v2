import { DateValue } from '@/models/date.model';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiCalendar, FiChevronDown } from 'react-icons/fi';
import OutsideClickHandler from 'react-outside-click-handler';

import { formatInTimeZone } from 'date-fns-tz';

import { formatDateInTimezoneToISO, getDateRange } from '@/utils-settings/DateUtils';

import CustomDatePickerDropdown from '../../components/overview/calendar-dropdown/DatePickerDropdown';
import CIDropdown from '../dropdown/ci-dropdown';
import { CIDropdownMenuOption } from '../dropdown/model';
import { DATE_FILTER_PAST_OPTIONS } from './datepicker-filter-configs';

// Renders the calendar day for the given Date. When `timezone` is provided the
// day/month/year are taken from that IANA zone (so the label matches the
// server-facing UTC boundary the CIDatepicker emits). Without `timezone` we
// fall back to the browser's local calendar day.
function formatDisplayRange(
  start?: Date | null,
  end?: Date | null,
  timezone?: string | null
) {
  if (!start || !end) return '';

  const fmt = (d: Date) => {
    if (timezone) {
      return formatInTimeZone(d, timezone, "d MMM ''yy");
    }

    const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = localDate.getDate();
    const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(
      localDate
    );
    const year = String(localDate.getFullYear()).slice(-2);
    return `${day} ${month} '${year}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

export interface CIDatepickerValue {
  start?: string; // ISO string
  end?: string; // ISO string
  dateValue?: DateValue;
  singleDate?: string; // ISO string for single date mode
}

interface CIDatepickerProps {
  label?: string;
  placeholder?: string;
  value?: CIDatepickerValue | null;
  onApply: (
    startISO: string,
    endISO: string,
    selectedValue?: DateValue
  ) => void;
  onSingleDateApply?: (dateISO: string) => void; // New prop for single date mode
  onCancel?: () => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string; // container
  variant?: 'default' | 'filter';
  disabled?: boolean;
  overflowWidth?: number;
  onDateChange?: (
    range: { startDate: Date; endDate: Date },
    selectedValue: DateValue
  ) => void;
  customTrigger?: React.ReactNode;
  allowCustomRange?: boolean;
  dateOptions?: CIDropdownMenuOption[];
  singleDateMode?: boolean; // New prop to enable single date selection
  inputMode?: boolean; // New prop to enable input field instead of dropdown
  labelColor?: string; // New prop for label color in input mode
  restrictPastDatesInCustom?: boolean; // Restrict past dates in custom range picker
  isOpen?: boolean; // Control the open state externally
  onOpenChange?: (open: boolean) => void; // Callback when open state changes
  clientTimezone?: string | null; // Client's IANA timezone for anchoring date boundaries
}

const CIDatepicker: FC<CIDatepickerProps> = ({
  label,
  placeholder = 'Date',
  value,
  allowCustomRange = true,
  onApply,
  onSingleDateApply,
  onCancel,
  minDate = new Date(2000, 0, 1),
  maxDate = new Date(),
  className = '',
  variant = 'default',
  disabled = false,
  overflowWidth = 250,
  dateOptions = DATE_FILTER_PAST_OPTIONS,
  onDateChange,
  customTrigger,
  singleDateMode = false,
  inputMode = false,
  labelColor = '#8f8f8f',
  restrictPastDatesInCustom = false,
  isOpen: externalIsOpen,
  onOpenChange,
  clientTimezone,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [customRangeOpen, setCustomRangeOpen] = useState<boolean>(false);

  // Use external isOpen if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // Update function that respects external control
  const updateIsOpen = useCallback(
    (newValue: boolean) => {
      if (onOpenChange) {
        onOpenChange(newValue);
      } else {
        setInternalIsOpen(newValue);
      }
    },
    [onOpenChange]
  );
  const [contentMaxHeight, setContentMaxHeight] = useState<number>(320);
  const [selectedValue, setSelectedValue] = useState<DateValue | null>(
    value?.dateValue || null
  );

  // Update selectedValue when value prop changes.
  // If the parent clears the preset but still has a start/end range (common when
  // consumers re-derive `dateValue` by matching ISO strings and no preset
  // matches), fall back to DateValue.CUSTOM so the custom range label keeps
  // rendering instead of disappearing.
  useEffect(() => {
    if (value?.dateValue) {
      setSelectedValue(value.dateValue);
    } else if (value?.start && value?.end) {
      setSelectedValue(DateValue.CUSTOM);
    } else {
      setSelectedValue(null);
    }
  }, [value?.dateValue, value?.start, value?.end]);

  // compute displayed dates - keep as raw UTC instants so formatDisplayRange
  // can render them in `clientTimezone` via formatInTimeZone without a
  // second (browser-local) conversion.
  const selectedStart = useMemo(() => {
    if (!value?.start) return null;
    const date = new Date(value.start);
    return isNaN(date.getTime()) ? null : date;
  }, [value?.start]);

  const selectedEnd = useMemo(() => {
    if (!value?.end) return null;
    const date = new Date(value.end);
    return isNaN(date.getTime()) ? null : date;
  }, [value?.end]);

  const selectedSingleDate = useMemo(
    () => (value?.singleDate ? new Date(value.singleDate) : null),
    [value?.singleDate]
  );

  // Add state for single date input value
  const [inputValue, setInputValue] = useState<string>('');

  // Update input value when single date changes
  useEffect(() => {
    if (singleDateMode && selectedSingleDate) {
      const formatted = selectedSingleDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setInputValue(formatted);
    }
  }, [selectedSingleDate, singleDateMode]);

  // Handle input change for single date mode
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);

      // Try to parse the input and call onSingleDateApply if valid
      if (newValue && newValue.trim()) {
        try {
          const parsedDate = new Date(newValue);
          if (!isNaN(parsedDate.getTime())) {
            onSingleDateApply?.(parsedDate.toISOString());
          }
        } catch (error) {
          // Invalid date, just update input value
        }
      }
    },
    [onSingleDateApply]
  );

  const displayText = useMemo(() => {
    // If the entire value is null/undefined (cleared state), show placeholder
    if (!value || (!value.start && !value.end && !value.dateValue)) {
      return placeholder;
    }

    // If we have a selectedValue (preset) that's not CUSTOM, show the preset label
    if (selectedValue && selectedValue !== DateValue.CUSTOM) {
      const matchingOption = dateOptions.find(
        (option) => option.value === selectedValue
      );
      if (matchingOption) {
        return matchingOption.label;
      }
    }

    if (singleDateMode) {
      if (inputValue) return inputValue;
      return placeholder;
    }

    // For CUSTOM or when no preset is selected, show formatted date range
    const txt = formatDisplayRange(selectedStart, selectedEnd, clientTimezone);
    return txt || placeholder;
  }, [
    selectedStart,
    selectedEnd,
    placeholder,
    selectedValue,
    dateOptions,
    value,
  ]);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const updateHeights = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const safeMax = Math.max(240, Math.min(420, spaceBelow - 12));
      setContentMaxHeight(safeMax);
    };
    updateHeights();
    window.addEventListener('resize', updateHeights);
    window.addEventListener('scroll', updateHeights, true);
    return () => {
      window.removeEventListener('resize', updateHeights);
      window.removeEventListener('scroll', updateHeights, true);
    };
  }, []);

  // Internal selection state mirrored from incoming value
  const getInitialRange = useCallback(() => {
    if (selectedStart && selectedEnd) {
      return {
        startDate: new Date(selectedStart),
        endDate: new Date(selectedEnd),
      };
    }
    const today = new Date();
    return { startDate: today, endDate: today };
  }, [selectedStart, selectedEnd]);

  const [appliedRange, setAppliedRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(getInitialRange());

  useEffect(() => {
    setAppliedRange(getInitialRange());
  }, [getInitialRange]);

  const handleDateChange = useCallback(
    (
      options?: CIDropdownMenuOption[],
      customRange?: { startDate: Date; endDate: Date }
    ) => {
      if (customRange) {
        setSelectedValue(DateValue.CUSTOM);
        setAppliedRange(customRange);
        onApply(
          formatDateInTimezoneToISO(
            customRange.startDate,
            false,
            clientTimezone
          ),
          formatDateInTimezoneToISO(customRange.endDate, true, clientTimezone),
          DateValue.CUSTOM
        );
        return;
      }

      if (!options || options?.length === 0) {
        // Clear or deselect - reset to normal state and call onCancel to clear the filter
        setSelectedValue(null);
        setAppliedRange(null);
        if (onCancel) {
          onCancel();
        } else {
          onApply('', '', undefined);
        }
        return;
      }

      const selectedOption = options[0] as CIDropdownMenuOption;
      const presetValue = selectedOption.value as DateValue;
      setSelectedValue(presetValue);

      // Compute the preset range in clientTimezone so it round-trips exactly
      // with any consumer that re-matches ISO strings against `getDateRange`.
      // Using the browser's local calendar day here (as before) caused a
      // mismatch when the user's browser TZ differs from `clientTimezone`,
      // leading consumers to fall back to DateValue.CUSTOM which in turn made
      // the CIDatepicker label render the range instead of the preset label.
      const { startDate: startISO, endDate: endISO } = getDateRange(
        presetValue,
        clientTimezone
      );
      setAppliedRange({
        startDate: new Date(startISO),
        endDate: new Date(endISO),
      });
      onApply(startISO, endISO, presetValue);
    },
    [onApply, onCancel, clientTimezone]
  );

  const handleCancel = useCallback(() => {
    setAppliedRange(getInitialRange());
    onCancel?.();
  }, [getInitialRange, onCancel]);

  const options: CIDropdownMenuOption[] = [...dateOptions];

  // Handle single date mode with calendar
  if (singleDateMode && allowCustomRange) {
    options.push({
      label: 'Custom date',
      value: DateValue.CUSTOM,
      id: 'date-custom',
      customContent: (
        <div className="w-[320px]">
          <CustomDatePickerDropdown
            selectedDate={
              selectedSingleDate
                ? {
                    start: selectedSingleDate.toISOString(),
                    end: selectedSingleDate.toISOString(),
                  }
                : null
            }
            onApply={(startISO) => {
              const date = new Date(startISO);
              const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              setInputValue(formatted);
              onSingleDateApply?.(startISO);
              updateIsOpen(false);
            }}
            onCancel={() => {}}
          />
        </div>
      ),
    });
  } else if (allowCustomRange) {
    options.push({
      label: 'Custom range',
      value: DateValue.CUSTOM,
      id: 'date-custom',
      subOpen: customRangeOpen,
      onSubOpenChange: setCustomRangeOpen,
      customContent: (
        <div className="w-[540px]">
          <CustomDatePickerDropdown
            selectedDate={
              selectedStart && selectedEnd
                ? {
                    start: selectedStart.toISOString(),
                    end: selectedEnd.toISOString(),
                  }
                : null
            }
            onApply={(startISO, endISO) => {
              setSelectedValue(DateValue.CUSTOM);
              setAppliedRange({
                startDate: new Date(startISO),
                endDate: new Date(endISO),
              });
              setCustomRangeOpen(false);
              setDropdownOpen(false);
              onApply(startISO, endISO, DateValue.CUSTOM);
            }}
            onCancel={() => {}}
            minDate={restrictPastDatesInCustom ? new Date() : minDate}
            maxDate={maxDate}
            timezone={clientTimezone ?? undefined}
          />
        </div>
      ),
    });
  }

  // Render input field for single date mode with input
  if (singleDateMode && inputMode) {
    return (
      <div className="relative">
        <div className="flex flex-col gap-2">
          {label && (
            <label
              className="text-xs font-medium"
              style={{ color: labelColor || '#8f8f8f' }}
            >
              {label}
            </label>
          )}
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => updateIsOpen(true)}
              disabled={disabled}
              className="h-10 w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-left text-sm text-gray-900 focus:border-[#4600f2] focus:outline-none focus:ring-1 focus:ring-[#4600f2] disabled:bg-gray-50 disabled:text-gray-500"
            >
              {inputValue || (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </button>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiCalendar className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0"
            style={{ zIndex: 99999 }}
            onClick={() => updateIsOpen(false)}
          >
            <OutsideClickHandler onOutsideClick={() => updateIsOpen(false)}>
              <div
                className="absolute overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg"
                style={{
                  zIndex: 99999,
                  left: triggerRef.current?.getBoundingClientRect().left || 0,
                  top:
                    (triggerRef.current?.getBoundingClientRect().bottom || 0) +
                    4,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <CustomDatePickerDropdown
                  selectedDate={
                    selectedSingleDate
                      ? {
                          start: selectedSingleDate.toISOString(),
                          end: selectedSingleDate.toISOString(),
                        }
                      : null
                  }
                  onApply={(startISO) => {
                    const date = new Date(startISO);
                    const formatted = date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                    setInputValue(formatted);
                    onSingleDateApply?.(startISO);
                    updateIsOpen(false);
                  }}
                  onCancel={() => updateIsOpen(false)}
                  minDate={minDate}
                  maxDate={maxDate}
                  timezone={clientTimezone ?? undefined}
                />
              </div>
            </OutsideClickHandler>
          </div>
        )}
      </div>
    );
  }

  return (
    <CIDropdown
      selectedValues={
        selectedValue === DateValue.CUSTOM
          ? [
              {
                label: formatDisplayRange(
                  appliedRange?.startDate,
                  appliedRange?.endDate,
                  clientTimezone
                ),
                value: DateValue.CUSTOM,
                id: 'date-custom-range',
                isSelected: true,
                showSeparator: true,
                disabled: true,
              },
            ]
          : selectedValue
            ? options.filter((option) => option.value === selectedValue)
            : []
      }
      options={
        selectedValue === DateValue.CUSTOM
          ? [
              {
                label: formatDisplayRange(
                  appliedRange?.startDate,
                  appliedRange?.endDate,
                  clientTimezone
                ),
                value: DateValue.CUSTOM,
                id: 'date-custom-range',
                isSelected: true,
                showSeparator: true,
                disabled: true,
              },
              ...options,
            ]
          : options
      }
      onChange={handleDateChange}
      placeholder={placeholder}
      variant="filter"
      allowContentOverflow
      showClearButton={true}
      allowDeselection={true}
      overflowWidth={overflowWidth}
      customTrigger={customTrigger}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
    />
  );
};

export default CIDatepicker;
