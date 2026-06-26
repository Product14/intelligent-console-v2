import React, { useEffect, useState } from 'react';

import useDebounce from '@spyne-console/hooks/useDebounce';

import { cn } from '@spyne-console/utils/cn';

export default function TextArea({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  onKeyDown,
  disabled = false,
  readOnly = false,
  className = '',
  mandatory = false,
  error = '',
  debounceTime = 0,
  rows = 3,
  maxLength,
  minLength,
  autoComplete = 'on',
  showCharacterCount = false,
}) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceTime);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [validationError, setValidationError] = useState('');
  const [debouncedValidationError, setDebouncedValidationError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  // Validate input
  const validateInput = (val) => {
    if (!val) return '';

    if (minLength && val.length < minLength) {
      return `Input must be at least ${minLength} characters`;
    }

    return '';
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsEmpty(!newValue);
    setValidationError(validateInput(newValue));

    if (debounceTime === 0) {
      onChange(newValue);
    }
  };

  // Handle debounced value changes
  useEffect(() => {
    if (debounceTime > 0) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, debounceTime, onChange]);

  // Debounce validation errors (with 1 second delay)
  const debouncedError = useDebounce(validationError, 1000);

  // Update debounced validation error
  useEffect(() => {
    setDebouncedValidationError(debouncedError);
  }, [debouncedError]);

  // Update local input value when the prop `value` changes
  useEffect(() => {
    setInputValue(value);
    setIsEmpty(!value);
    setValidationError(validateInput(value));
  }, [value, minLength]);

  // Handle blur event
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);
    setHasBeenFocused(true);
  };

  // Determine if we should show validation errors
  const shouldShowValidationError = hasBeenFocused && debouncedValidationError;
  const shouldShowRequiredError =
    hasBeenFocused && required && isEmpty && !isFocused;

  // Compute the textarea classNames based on the state and error
  const textareaClassNames = cn(
    'w-full peer border rounded-lg py-3 px-3 text-base font-normal leading-5 border-gray-200 text-black-60 focus:border-blue-light focus-visible:border-blue-light focus:outline-none focus-visible:outline-none placeholder:text-black-40 resize-none',
    (mandatory ||
      error ||
      shouldShowValidationError ||
      shouldShowRequiredError) &&
      '!border-red-500',
    className
  );

  // Compute label classNames
  const labelClassNames = cn(
    'absolute z-[1] px-0.5 pointer-events-none bg-white transition-all duration-300 ease-in-out text-xs font-normal text-black-60 peer-focus:text-blue-light',
    isFocused || !isEmpty
      ? '-top-2 left-4'
      : 'top-3 left-3 text-base text-black-40',
    (mandatory ||
      error ||
      shouldShowValidationError ||
      shouldShowRequiredError) &&
      '!text-red-500'
  );

  // Calculate character count and limit
  const characterCount = inputValue ? inputValue.length : 0;
  const isNearMaxLength = maxLength && characterCount >= maxLength * 0.9;

  return (
    <div className={cn('relative items-start justify-start', className)}>
      <textarea
        id={id}
        name={name}
        value={inputValue}
        onKeyDown={onKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
        aria-invalid={
          !!error || shouldShowValidationError || shouldShowRequiredError
        }
        aria-describedby={
          error || shouldShowValidationError ? `${id}-error` : undefined
        }
        className={textareaClassNames}
      ></textarea>
      <label htmlFor={id} className={labelClassNames}>
        {label}
        {required && (
          <span className={cn('ml-1', { 'text-red-500': error })}>*</span>
        )}
      </label>

      {/* Error messages */}
      {error && (
        <span
          id={`${id}-error`}
          className="ml-3 mt-1 block text-xs text-red-500"
        >
          {error}
        </span>
      )}
      {!error && shouldShowValidationError && (
        <span
          id={`${id}-error`}
          className="ml-3 mt-1 block text-xs text-red-500"
        >
          {debouncedValidationError}
        </span>
      )}
      {!error && !shouldShowValidationError && shouldShowRequiredError && (
        <span
          id={`${id}-error`}
          className="ml-3 mt-1 block text-xs text-red-500"
        >
          This field is required
        </span>
      )}

      {/* Character count */}
      {showCharacterCount && maxLength && (
        <div
          className={cn(
            'mt-1 text-right text-xs',
            isNearMaxLength ? 'text-amber-600' : 'text-black-40',
            characterCount === maxLength && 'text-red-500'
          )}
        >
          {characterCount}/{maxLength}
        </div>
      )}
    </div>
  );
}
