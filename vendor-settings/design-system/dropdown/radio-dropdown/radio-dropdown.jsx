'use client';

import React, { useEffect, useRef, useState } from 'react';

import DropdownWrapper from '@spyne-console/design-system/dropdown/dropdown-wrapper';
import { Chevron } from '@spyne-console/design-system/icons';
import RadioButton from '@spyne-console/design-system/radio-button';

import { cn } from '@spyne-console/utils/cn';

const RadioDropdown = ({
  options = [],
  onChange,
  selectedValue,
  mainClassName,
  className,
  dropdownClassName,
  dropdownOptionClassName,
  chevronClassName,
  maxHeight = '300px',
  id,
  placeholder = 'Select option',
  renderOption,
  closeOnScroll = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedValue);

  // Generate unique ID for this instance
  const uniqueId = useRef(
    `${id || 'radio-dropdown'}-${Math.random().toString(36).slice(2, 11)}`
  );

  useEffect(() => {
    setSelected(selectedValue);
  }, [selectedValue]);

  const handleOptionSelect = (value) => {
    setSelected(value);
    onChange?.(value);
    handleClose();
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const triggerButton = (
    <button
      onClick={handleToggle}
      className={cn(
        'flex w-full items-center justify-between gap-1 text-nowrap rounded-lg border border-black/10 bg-white py-[10px] pl-4 pr-3 text-sm font-medium text-black/60 transition-colors hover:bg-black/5',
        {
          'border-blue-light text-blue-light hover:bg-blue-light/5':
            selected?.length > 0,
        },
        className
      )}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={`${uniqueId.current}-options`}
    >
      <span>
        {selected
          ? options.find((opt) => opt.value === selected)?.label || placeholder
          : placeholder}
      </span>
      <Chevron
        className={cn(
          'h-5 w-3.5 text-black/60 transition-all duration-300',
          {
            '-rotate-90': isOpen,
            'text-blue-light': selected?.length > 0,
          },
          chevronClassName
        )}
        aria-hidden="true"
      />
    </button>
  );

  const dropdownContent = (
    <div
      id={`${uniqueId.current}-options`}
      role="listbox"
      className={cn('overflow-auto p-2', dropdownClassName)}
      style={{ maxHeight }}
    >
      <ul className="space-y-1" role="presentation">
        {options?.map((option) => (
          <li
            key={option.value}
            role="option"
            aria-selected={selected === option.value}
          >
            <button
              type="button"
              onClick={() => handleOptionSelect(option.value)}
              className={cn(
                'w-full rounded-lg p-2 text-left transition-colors',
                'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                dropdownOptionClassName
              )}
            >
              {renderOption ? (
                renderOption(option, selected === option.value)
              ) : (
                <RadioButton
                  id={`${uniqueId.current}-radio-${option.value}`}
                  name={uniqueId.current}
                  label={option.label}
                  check={selected === option.value}
                  onChange={() => handleOptionSelect(option.value)}
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <DropdownWrapper
      dropdownContent={dropdownContent}
      isOpen={isOpen}
      onClose={handleClose}
      className={cn('w-fit', mainClassName)}
      dropdownClassName="rounded-lg border border-black/10 bg-white shadow-lg"
      closeOnScroll={closeOnScroll}
      triggerId={uniqueId.current}
      dropdownId={`${uniqueId.current}-dropdown`}
      ariaLabel="Select option from dropdown"
      role="listbox"
    >
      {triggerButton}
    </DropdownWrapper>
  );
};

export default RadioDropdown;
