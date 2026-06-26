'use client';

import React, { useState } from 'react';

import DateRangePicker from '@spyne-console/design-system/date-picker/date-range-picker';
import DropdownWrapper from '@spyne-console/design-system/dropdown/dropdown-wrapper';
import { Chevron } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

const DatePickerDropdown = ({
  id = 'date-picker',
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  className,
  dropdownClassName,
  disabled = false,
  placeholder = 'Date Range',
  closeOnScroll = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (range) => {
    if (onChange) {
      onChange(range);
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const triggerButton = (
    <button
      id={id}
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        'flex w-full items-end justify-between gap-1.5 text-nowrap rounded-lg border border-black/10 bg-white py-[10px] pl-4 pr-3 text-sm font-medium text-black/60 hover:bg-black/5',
        className,
        {
          'cursor-not-allowed opacity-50': disabled,
          'border-blue-light text-blue-light hover:bg-blue-light/5':
            startDate && endDate,
        }
      )}
      type="button"
    >
      <span className="text-nowrap">
        {startDate && endDate
          ? `${startDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} - ${endDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}`
          : placeholder}
      </span>
      <Chevron
        className={cn('h-5 w-3.5 text-black/60 transition-all duration-300', {
          '-rotate-90': isOpen,
          'text-blue-light': startDate && endDate,
        })}
      />
    </button>
  );

  const dropdownContent = (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      onChange={handleDateChange}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
    />
  );

  return (
    <DropdownWrapper
      dropdownContent={dropdownContent}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="w-fit"
      dropdownClassName={cn('overflow-auto', dropdownClassName)}
      closeOnScroll={closeOnScroll}
      closeOnOutsideClick={true}
      triggerId={id}
      dropdownId={`${id}-dropdown`}
      ariaLabel="Date range picker"
      role="dialog"
    >
      {triggerButton}
    </DropdownWrapper>
  );
};

export default DatePickerDropdown;
