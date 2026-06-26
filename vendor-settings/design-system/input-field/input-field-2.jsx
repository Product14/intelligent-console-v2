'use client';

import React, { useEffect, useState } from 'react';

import useDebounce from '@spyne-console/hooks/useDebounce';

import { cn } from '@spyne-console/utils/cn';

export default function InputField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  labelClassName = '',
  type = 'text',
  placeholder = '',
  required = false,
  onKeyDown,
  disabled = false,
  readOnly = false,
  className = '',
  mandatory = false,
  error = '',
  debounceTime = 0,
  autoComplete = 'on',
}) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceTime);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  useEffect(() => {
    if (debounceTime > 0) {
      onChange(debouncedValue);
    } else {
      onChange(inputValue);
    }
  }, [debouncedValue, inputValue, debounceTime, onChange]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleBlur = (e) => {
    if (onBlur) onBlur(e);
  };

  return (
    <div className={cn('relative', className)}>
      <label
        htmlFor={id}
        className={cn(
          'text-typography-200 mb-2 block text-xs font-medium',
          labelClassName,
          {
            'text-error': mandatory || error,
          }
        )}
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={inputValue}
        onKeyDown={onKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'border-typography-100 text-typography-200 w-full rounded-lg border px-3 py-3 text-base font-normal leading-5',
          'focus:border-primary focus-visible:border-primary focus:outline-none focus-visible:outline-none',
          'placeholder:text-typography-100',
          {
            '!border-error': mandatory || error,
          }
        )}
      />
      {error && (
        <span id={`${id}-error`} className="text-error ml-3 mt-1 block text-xs">
          {error}
        </span>
      )}
    </div>
  );
}
