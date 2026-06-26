'use client';

import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-date-range';

import { cn } from '@spyne-console/utils/cn';

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  minDate = new Date(2000, 0, 1),
  maxDate,
  className,
  disabled = false,
}) => {
  // Helper to normalize dates to noon local time to avoid timezone issues
  const normalizeDate = (date) => {
    if (!date) return null;
    const normalized = new Date(date);
    normalized.setHours(12, 0, 0, 0);
    return normalized;
  };

  const [dateRange, setDateRange] = useState({
    startDate: normalizeDate(startDate) || normalizeDate(new Date()),
    endDate: normalizeDate(endDate) || normalizeDate(new Date()),
    key: 'selection',
  });

  useEffect(() => {
    setDateRange({
      startDate: normalizeDate(startDate) || normalizeDate(new Date()),
      endDate: normalizeDate(endDate) || normalizeDate(new Date()),
      key: 'selection',
    });
  }, [startDate, endDate]);

  const handleSelect = (ranges) => {
    const { startDate: newStartDate, endDate: newEndDate } = ranges.selection;
    // Normalize the dates to noon to avoid timezone issues
    const normalizedStartDate = normalizeDate(newStartDate);
    const normalizedEndDate = normalizeDate(newEndDate);

    setDateRange({
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      key: 'selection',
    });

    if (onChange) {
      onChange({
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
      });
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border border-gray-200 bg-white shadow-lg',
        className,
        { 'pointer-events-none opacity-50': disabled }
      )}
    >
      <DateRange
        ranges={[dateRange]}
        onChange={handleSelect}
        moveRangeOnFirstSelection={false}
        months={1}
        direction="horizontal"
        minDate={minDate || new Date(2000, 0, 1)}
        maxDate={maxDate || new Date()}
        rangeColors={['#4600f2']}
        showMonthAndYearPickers={true}
        showDateDisplay={true}
        retainEndDateOnFirstSelection={true}
      />
    </div>
  );
};

export default DateRangePicker;
