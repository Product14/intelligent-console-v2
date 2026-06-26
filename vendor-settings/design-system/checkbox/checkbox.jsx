'use client';

import React, { useEffect, useRef } from 'react';

import { cn } from '@spyne-console/utils/cn';

const INDETERMINATE_CHECKBOX_BG =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Crect width=%2720%27 height=%2720%27 rx=%274%27 fill=%27%234600F2%27/%3E%3Cline x1=%275%27 y1=%2710%27 x2=%2715%27 y2=%2710%27 stroke=%27white%27 stroke-width=%272%27/%3E%3C/svg%3E")';

function Checkbox({
  value = false,
  id,
  label,
  onChange,
  isChecked,
  isIndeterminate = false,
  name,
  labelStyles = '',
  allowDeselect = true,
  disabled = false,
  onFocus = () => {},
  onBlur = () => {},
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(isIndeterminate);
    }
  }, [isIndeterminate]);

  // Indeterminate must render with checked=false on the input for native mixed state.
  const checked =
    isIndeterminate === true
      ? false
      : isChecked !== undefined
        ? isChecked
        : value === true;

  // Extract background classes from labelStyles to apply to label
  const bgClasses = labelStyles
    ? labelStyles
        .split(' ')
        .map((cls) => cls.trim())
        .filter((cls) => cls && cls.startsWith('bg-'))
        .join(' ')
        .trim()
    : '';
  const textClasses = labelStyles
    ? labelStyles
        .split(' ')
        .map((cls) => cls.trim())
        .filter((cls) => cls && !cls.startsWith('bg-'))
        .join(' ')
        .trim()
    : '';

  return (
    <div
      className="design-system relative flex w-full items-center"
      style={
        isIndeterminate ? { '--cb-ind': INDETERMINATE_CHECKBOX_BG } : undefined
      }
    >
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn('peer absolute bg-white opacity-0', {
          'cursor-not-allowed': disabled,
        })}
        aria-checked={isIndeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
      />
      <label
        htmlFor={id}
        className={cn(
          'before:border-typography-100 relative flex w-full cursor-pointer items-center transition-colors duration-200 before:mr-2 before:h-5 before:w-5 before:flex-shrink-0 before:rounded before:border-2 before:bg-[var(--backdrop)] before:content-[""]',
          bgClasses ? `${bgClasses} -mx-2 px-2 py-1` : 'bg-transparent',
          {
            // When checked and not disabled, show the tick icon
            'peer-checked:before:border-0 peer-checked:before:bg-[url("https://spyne-static.s3.amazonaws.com/console/project/checkbox-icon.svg")] peer-checked:before:bg-cover':
              checked && !disabled,

            // When checked and allowDeselect is true, show the tick icon normally
            // The "deselect" icon will be shown on hover when allowDeselect is true
            'peer-checked:hover:before:bg-[url("https://spyne-static.s3.amazonaws.com/console/project/deselect_checkbox.svg")] peer-checked:hover:before:bg-cover':
              checked && allowDeselect && !disabled,

            // When disabled and checked, show the disabled tick icon
            'peer-disabled:peer-checked:before:border-0 peer-disabled:peer-checked:before:bg-[url("https://spyne-static.s3.amazonaws.com/console/project/checkbox_disable.svg")] peer-disabled:peer-checked:before:bg-cover':
              disabled && checked,

            // When disabled and unchecked, show the disabled deselect icon
            'peer-disabled:before:border-0 peer-disabled:before:bg-[url("https://spyne-static.s3.amazonaws.com/console/project/deselect_disable.svg")] peer-disabled:before:bg-cover':
              disabled && !checked,

            'peer-indeterminate:before:border-0 peer-indeterminate:before:bg-cover peer-indeterminate:before:bg-center peer-indeterminate:before:bg-no-repeat peer-indeterminate:before:[background-image:var(--cb-ind)]': true,

            // Default unchecked state
            'before:bg-white': !checked && !disabled && !isIndeterminate,

            // Cursor styles based on disabled state
            'cursor-default before:border-[rgb(145,158,171)]/80 hover:after:bg-white':
              disabled,
          }
        )}
      >
        <span className={textClasses || ''}>{label}</span>
      </label>
    </div>
  );
}

export default Checkbox;
