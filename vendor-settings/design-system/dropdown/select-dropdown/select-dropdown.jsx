'use client';

import React, { useEffect, useState } from 'react';

import DropdownWrapper from '@spyne-console/design-system/dropdown/dropdown-wrapper';
import { Chevron } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

const SelectDropdown = ({
  options = [],
  onChange = () => {},
  selectedOption = null,
  onDropdownToggle = () => {},
  dropdownClassName = '',
  dropdownOptionClassName = '',
  selectedOptionClass = '',
  maxHeight = '300px',
  id = 'select-dropdown',
  placeholder = 'Select an option',
  disabled = false,
  label = '',
  required = false,
  textAtTop = '',
  error = '',
  className = '',
  closeOnScroll = false,
  useSimplePositioning = true,
  selectedOptionClassName = '',
  icon = null,
  dropdownDrawerClassName = '',
  placeholderClassName = '',
  valueClassName = '',
  width = 'auto',
  scrollIntoView,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedOption);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    setSelected(selectedOption);
  }, [selectedOption]);

  const handleOptionClick = (option) => {
    setSelected(option);
    const hasValue = !!option;
    setIsEmpty(!hasValue);
    onChange(option);
    // Close dropdown without re-checking isEmpty since we just set it
    setIsOpen(false);
    setIsFocused(false);
    onDropdownToggle(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      const newState = !isOpen;
      setIsOpen(newState);
      setIsFocused(newState);
      onDropdownToggle(newState);
    }
  };

  const handleClose = () => {
    if (!selected) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
    setIsOpen(false);
    setIsFocused(false);
    onDropdownToggle(false);
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(!isFocused);
    }
  };

  const triggerButton = (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        onFocus={handleFocus}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 hover:bg-gray-50',
          selectedOptionClass,
          dropdownClassName,
          {
            'cursor-not-allowed opacity-50': disabled,
            'cursor-pointer': !disabled,
            'border-error': error || (required && isEmpty),
            'border-primary focus:border-blue-light border-blue-light':
              isFocused && !error && !(required && isEmpty),
          }
        )}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label || placeholder}
        disabled={disabled}
      >
        <div className={cn('flex w-full items-center gap-2', valueClassName)}>
          {icon && icon}
          <span
            className={cn(
              'truncate',
              `${!selected?.text ? placeholderClassName : ''}`
            )}
          >
            {selected?.text || placeholder}
          </span>
        </div>
        <Chevron
          className={cn('transition-all duration-300', {
            '-rotate-90': isOpen,
          })}
        />
      </button>

      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-black-60 pointer-events-none absolute z-[2] bg-white px-0.5 text-xs font-normal transition-all duration-300 ease-in-out',
            {
              '-top-2 left-4': true, // Always show label at top
              'text-blue-light': isFocused && !error && !(required && isEmpty),
              'text-error': error || (required && isEmpty),
            }
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
    </div>
  );

  const dropdownContent = (
    <div
      className={cn('w-full overflow-auto', dropdownOptionClassName)}
      style={{ maxHeight }}
      role="listbox"
      aria-labelledby={id}
    >
      <ul className="py-1">
        {options.map((option) => {
          const isDisabled = option.disabled === true;
          return (
            <li
              key={option.value}
              onClick={() => !isDisabled && handleOptionClick(option)}
              className={cn(
                'px-4 py-2 text-sm',
                isDisabled
                  ? 'cursor-not-allowed text-gray-400 opacity-50'
                  : 'cursor-pointer text-gray-900 hover:bg-gray-100',
                selected?.value === option.value && !isDisabled
                  ? selectedOptionClassName
                  : ''
              )}
              role="option"
              aria-selected={selected?.value === option.value}
              aria-disabled={isDisabled}
            >
              {option.text}
            </li>
          );
        })}
        {options.length === 0 && (
          <li className="px-4 py-2 text-sm text-gray-500">
            No options available
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {textAtTop && (
        <div className="mb-1 text-xs font-medium text-gray-500">
          {textAtTop}
        </div>
      )}

      <DropdownWrapper
        dropdownContent={dropdownContent}
        isOpen={isOpen}
        onClose={handleClose}
        className="relative"
        dropdownClassName={`rounded-lg border border-gray-200 bg-white shadow-lg ${dropdownDrawerClassName}`}
        closeOnScroll={closeOnScroll}
        triggerId={id}
        dropdownId={`${id}-dropdown`}
        ariaLabel={label || placeholder}
        role="listbox"
        useSimplePositioning={useSimplePositioning ? true : false}
        horizontalOffset={0}
        width={width}
        scrollIntoView={scrollIntoView}
      >
        {triggerButton}
      </DropdownWrapper>

      {error && (
        <span id={`${id}-error`} className="text-error ml-3 mt-1 block text-xs">
          {error}
        </span>
      )}

      {!error && required && isEmpty && (
        <span
          id={`${id}-error`}
          className="text-error text-red ml-3 mt-1 block text-xs"
        >
          This field is required
        </span>
      )}
    </div>
  );
};

export default SelectDropdown;
