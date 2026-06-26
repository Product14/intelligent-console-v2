'use client';

import React, { useEffect, useState } from 'react';

import { cn } from '@spyne-console/utils/cn';

import Checkbox from '../../checkbox/checkbox';
import { Chevron } from '../../icons';
import DropdownWrapper from '../dropdown-wrapper';

const CheckboxDropdown = ({
  options = [],
  onChange = () => {},
  selectedValues = [],
  className = '',
  dropdownClassName = '',
  dropdownOptionClassName = '',
  maxHeight = '300px',
  id = 'checkbox-dropdown',
  placeholder = 'Select options',
  showFilterCount = true,
  disabled = false,
  showSelectAll = true,
  closeOnScroll = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedValues);

  useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  const handleCheckboxChange = (value) => {
    let newSelected;
    if (value === 'all') {
      // If "Select All" is clicked and everything was selected, clear all
      if (selected.length === options.length) {
        newSelected = [];
      }
      // Otherwise select everything
      else {
        newSelected = options.map((opt) => opt.value);
      }
    } else {
      // If deselecting an item and everything was selected,
      // remove "all" and the clicked item
      if (selected.length === options.length) {
        newSelected = options
          .map((opt) => opt.value)
          .filter((item) => item !== value);
      }
      // Otherwise toggle the clicked item
      else {
        newSelected = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value];
      }
    }

    setSelected(newSelected);
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    const allValues = options.map((opt) => opt.value);
    const newSelected = selected.length === options.length ? [] : allValues;
    setSelected(newSelected);
    onChange(newSelected);
  };

  const dropdownContent = (
    <>
      {showSelectAll && (
        <div className="sticky top-0 z-10 border-b border-black/10 bg-white p-2">
          <Checkbox
            id={`${id}-select-all`}
            value="all"
            label="Select All"
            isChecked={selected.length === options.length}
            onChange={handleSelectAll}
            allowDeselect={false}
            labelStyles="text-sm font-medium text-black/90 hover:bg-black/5 rounded p-2 w-full"
          />
        </div>
      )}
      <ul className="space-y-1 px-2 py-1">
        {options?.map(({ value, label }) => (
          <li key={value} className={dropdownOptionClassName}>
            <Checkbox
              id={`${id}-checkbox-${value}`}
              value={value}
              label={label}
              isChecked={selected.includes(value)}
              onChange={() => handleCheckboxChange(value)}
              allowDeselect={false}
              labelStyles="text-sm text-black/90 hover:bg-black/5 rounded p-2 w-full"
            />
          </li>
        ))}
      </ul>
    </>
  );

  const triggerButton = (
    <button
      onClick={() => {
        if (!disabled) {
          setIsOpen((prev) => !prev);
        }
      }}
      className={cn(
        'relative flex w-full items-center justify-between gap-1 text-nowrap rounded-lg border border-black/10 bg-white py-[10px] pl-4 pr-3 text-sm font-medium text-black/60 hover:bg-black/5',
        className,
        {
          'cursor-not-allowed opacity-50': disabled,
          'cursor-pointer': !disabled,
          'border-blue-light text-blue-light hover:bg-blue-light/5':
            selected?.length > 0,
        }
      )}
      type="button"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      disabled={disabled}
    >
      <span className="truncate">{placeholder}</span>
      <Chevron
        className={cn('h-5 w-3.5 text-black/60 transition-all duration-300', {
          '-rotate-90': isOpen,
          'text-blue-light': selected?.length > 0,
        })}
      />
      {showFilterCount && selected.length > 0 && (
        <div
          className="bg-blue-light absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white"
          aria-hidden="true"
        >
          {selected.length}
        </div>
      )}
    </button>
  );

  return (
    <div className="w-fit">
      <DropdownWrapper
        dropdownContent={dropdownContent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-full"
        dropdownClassName={cn(
          'hide-scrollbar max-w-[150px] overflow-auto',
          dropdownClassName
        )}
        closeOnScroll={closeOnScroll}
        maxHeight={maxHeight}
        triggerId={id}
        dropdownId={`${id}-dropdown`}
        ariaLabel="Checkbox dropdown options"
        role="listbox"
      >
        {triggerButton}
      </DropdownWrapper>
    </div>
  );
};

export default CheckboxDropdown;
