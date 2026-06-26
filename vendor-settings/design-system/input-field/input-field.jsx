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
  floatingLabel = true,
  labelClassName = '',
  leftIcon,
  rightIcon,
  maxLength = undefined,
  max = undefined,
  inputClassName = '',
}) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceTime);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [validationError, setValidationError] = useState('');
  const [debouncedValidationError, setDebouncedValidationError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  // Validate input based on type
  const validateInput = (val) => {
    if (!val) return '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    switch (type) {
      case 'email':
        return emailRegex.test(val) ? '' : 'Please enter a valid email address';
      case 'number':
        return isNaN(Number(val)) ? 'Please enter a valid number' : '';
      case 'password':
        return passwordRegex.test(val)
          ? ''
          : 'Password must be at least 8 characters with at least one letter and one number';

      default:
        return '';
    }
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
  }, [value, type]);

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

  // Compute the input classNames based on the state and error
  const inputClassNames = cn(
    'w-full peer border rounded-lg py-3 px-3 text-base font-normal leading-5 border-gray-200 text-black-60 focus:border-primary focus-visible:border-blue-light focus:outline-none focus-visible:outline-none placeholder:text-black-40',
    (mandatory ||
      error ||
      shouldShowValidationError ||
      shouldShowRequiredError) &&
      '!border-red-500',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className,
    inputClassName
  );

  // Compute label classNames
  const labelClassNames = floatingLabel
    ? cn(
        'absolute z-[1] px-0.5 pointer-events-none bg-white transition-all duration-300 ease-in-out text-xs font-normal text-black-60 peer-focus:text-blue-light',
        labelClassName,
        isFocused || !isEmpty
          ? leftIcon
            ? '-top-2 left-10'
            : '-top-2 left-4'
          : leftIcon
            ? 'top-3 left-10 text-base text-black-40'
            : 'top-3 left-3 text-base text-black-40',
        (mandatory ||
          error ||
          shouldShowValidationError ||
          shouldShowRequiredError) &&
          '!text-red-500'
      )
    : cn(
        'block mb-1 text-base font-normal text-black-60',
        labelClassName,
        (mandatory ||
          error ||
          shouldShowValidationError ||
          shouldShowRequiredError) &&
          '!text-red-500'
      );

  // Determine the actual input type for the HTML element
  const inputType = type === 'number' ? 'text' : type;

  return (
    <div className={cn('relative items-start justify-start', className)}>
      {floatingLabel ? null : (
        <label htmlFor={id} className={labelClassNames}>
          {label}
          {required && label && (
            <span className={cn('ml-1', { 'text-red-500': error })}>*</span>
          )}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 z-[2] -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={inputType}
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
          aria-invalid={
            !!error || shouldShowValidationError || shouldShowRequiredError
          }
          aria-describedby={
            error || shouldShowValidationError ? `${id}-error` : undefined
          }
          className={cn(
            inputClassNames,
            disabled && 'cursor-not-allowed bg-gray-100 opacity-70'
          )}
          pattern={type === 'number' ? '[0-9]*' : undefined}
          inputMode={type === 'number' ? 'numeric' : undefined}
          maxLength={maxLength}
          max={max}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 z-[2] -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {floatingLabel && (
        <label htmlFor={id} className={labelClassNames}>
          {label}
          {required && (
            <span className={cn('ml-1', { 'text-red-500': error })}>*</span>
          )}
        </label>
      )}
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
    </div>
  );
}
