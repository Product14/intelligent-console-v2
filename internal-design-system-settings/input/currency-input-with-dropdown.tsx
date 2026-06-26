import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { PiWarningCircle } from 'react-icons/pi';

import classNames from 'classnames';

interface CurrencyOption {
  symbol: string;
  code: string;
  name: string;
}

interface CurrencyInputWithDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  width?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  required?: boolean;
  autoValidate?: boolean;
  customValidation?: (value: string) => string | null;
  onValidationChange?: (isValid: boolean, error: string | null) => void;
  floatingLabel?: boolean;
  selectedCurrency?: CurrencyOption;
  onCurrencyChange?: (currency: CurrencyOption) => void;
  currencies?: CurrencyOption[];
  labelColor?: string; // New prop for custom label color
}

const DEFAULT_CURRENCIES: CurrencyOption[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
];

const CurrencyInputWithDropdown: React.FC<CurrencyInputWithDropdownProps> = ({
  value = '',
  onChange,
  placeholder = 'Placeholder',
  label,
  floatingLabel = false,
  className = '',
  width = 'w-full',
  size = 'medium',
  disabled = false,
  required = false,
  autoValidate = true,
  customValidation,
  onValidationChange,
  selectedCurrency = DEFAULT_CURRENCIES[0], // Default to USD
  onCurrencyChange,
  currencies = DEFAULT_CURRENCIES,
  labelColor, // New prop
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Enhanced size-based styling matching generic input
  const sizeClasses = {
    small: {
      container: 'h-8',
      text: 'text-sm',
      padding: 'px-3',
      labelText: 'text-xs',
      iconSize: 'h-3 w-3',
      currencySection: 'px-2',
    },
    medium: {
      container: 'h-10',
      text: 'text-sm',
      padding: 'px-3',
      labelText: 'text-xs',
      iconSize: 'h-4 w-4',
      currencySection: 'px-2',
    },
    large: {
      container: 'h-12',
      text: 'text-base',
      padding: 'px-4',
      labelText: 'text-sm',
      iconSize: 'h-5 w-5',
      currencySection: 'px-3',
    },
  };

  const currentSize = sizeClasses[size];

  // Validation function
  const validateAmount = (amount: string): string | null => {
    if (required && !amount?.trim()) {
      return `${label || 'Amount'} is required`;
    }

    if (!amount?.trim()) {
      return null; // Empty but not required is valid
    }

    // Custom validation takes precedence
    if (customValidation) {
      return customValidation(amount);
    }

    // Basic amount validation
    const numericValue = parseFloat(amount);

    if (isNaN(numericValue)) {
      return 'Enter a valid amount';
    }

    if (numericValue < 0) {
      return 'Amount cannot be negative';
    }

    if (numericValue === 0 && required) {
      return 'Amount must be greater than zero';
    }

    return null;
  };

  // Debounced validation effect
  useEffect(() => {
    if (autoValidate && hasBlurred) {
      const validationError = validateAmount(value);
      setError(validationError);
      setShowError(!!validationError);

      if (onValidationChange) {
        onValidationChange(!validationError, validationError);
      }
    }
  }, [value, autoValidate, hasBlurred]);

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    if (amount.length > 0) {
      setHasUserInteracted(true);
    }
    if (onChange && !disabled) {
      onChange(amount);
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsFocused(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    setHasBlurred(true);

    if (autoValidate) {
      const validationError = validateAmount(value);
      setError(validationError);
      setShowError(!!validationError);

      if (onValidationChange) {
        onValidationChange(!validationError, validationError);
      }
    }
  };

  const handleCurrencySelect = (currency: CurrencyOption) => {
    if (onCurrencyChange && !disabled) {
      onCurrencyChange(currency);
    }
    setIsDropdownOpen(false);
  };

  // Determine validation state
  const hasError = error && showError;
  const isValid = !error && hasBlurred && value?.trim() !== '';

  // Label styles matching generic input
  const getLabelStyles = () => {
    const shouldFloatLabel = isFocused || value !== '';

    if (floatingLabel) {
      let baseStyles = `absolute left-3 transition-all duration-200 pointer-events-none ${currentSize.labelText}`;

      if (shouldFloatLabel) {
        baseStyles += ' -top-2 bg-white px-1';
      } else {
        baseStyles += ' top-1/2 -translate-y-1/2';
      }

      if (disabled) {
        return `${baseStyles} text-gray-400`;
      }

      if (hasError) {
        return `${baseStyles} text-red-500`;
      }

      if (isFocused) {
        return `${baseStyles} text-[rgba(70,0,242,0.8)]`;
      }

      return `${baseStyles} text-[rgba(0,5,29,0.45)]`;
    } else {
      let baseStyles = `block mb-2 transition-all duration-200 ${currentSize.labelText}`;

      if (disabled) {
        return `${baseStyles} text-gray-400`;
      }

      // Default state for static label - use custom color if provided
      const defaultColor = labelColor || '#1a1a1a';
      return `${baseStyles} text-[${defaultColor}]`;
    }
  };

  // Get container styles based on state
  const getContainerStyles = () => {
    let baseStyles = `w-full ${currentSize.container} border rounded-[6px] transition-all duration-200 flex items-center bg-[rgba(255,255,255,0.9)]`;

    if (disabled) {
      return `${baseStyles} border-gray-200 bg-gray-50 cursor-not-allowed opacity-60`;
    }

    if (hasError) {
      return `${baseStyles} border-red-400 bg-red-50 ring-1 ring-red-500`;
    }

    if (isFocused || isDropdownOpen) {
      return `${baseStyles} border-[rgba(70,0,242,0.6)]`;
    }

    return `${baseStyles} border-[#cfcfcf] hover:border-gray-400`;
  };

  return (
    <div className={`${width} ${className}`}>
      {/* Static Label (when floatingLabel is false) */}
      {label && !floatingLabel && (
        <label className={getLabelStyles()}>
          {label}
          {required && <span className="ml-1 text-[#d92d20]">*</span>}
        </label>
      )}

      <div className="relative">
        <div className={getContainerStyles()}>
          {/* Currency Dropdown Section */}
          <DropdownMenu.Root
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
          >
            <DropdownMenu.Trigger asChild>
              <button
                className={classNames(
                  'flex items-center gap-1 border-r border-[#cfcfcf] transition-colors',
                  currentSize.currencySection,
                  {
                    'cursor-not-allowed': disabled,
                    'hover:bg-gray-50': !disabled,
                  }
                )}
                disabled={disabled}
                type="button"
              >
                <span
                  className={`font-medium ${currentSize.text} text-gray-700`}
                >
                  {selectedCurrency.symbol}
                </span>
                <FiChevronDown
                  className={classNames(
                    currentSize.iconSize,
                    'text-gray-500 transition-transform',
                    { 'rotate-180': isDropdownOpen }
                  )}
                />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[120px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                sideOffset={4}
                align="start"
              >
                {currencies.map((currency) => (
                  <DropdownMenu.Item
                    key={currency.code}
                    className={classNames(
                      'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none transition-colors',
                      'hover:bg-gray-50 focus:bg-gray-50',
                      {
                        'bg-blue-50 text-blue-700':
                          selectedCurrency.code === currency.code,
                      }
                    )}
                    onSelect={() => handleCurrencySelect(currency)}
                  >
                    <span className="font-medium">{currency.symbol}</span>
                    <span className="text-gray-600">{currency.code}</span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Input Section */}
          <div className="flex flex-1 items-center">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleAmountChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={classNames(
                'flex-1 border-none bg-transparent outline-none',
                currentSize.text,
                currentSize.padding,
                {
                  'cursor-not-allowed': disabled,
                  'text-gray-400': disabled,
                  'text-gray-900': !disabled,
                  'placeholder:text-[#cfcfcf]': !disabled,
                  'placeholder:text-gray-400': disabled,
                }
              )}
            />
          </div>
        </div>

        {/* Floating Label (when floatingLabel is true) */}
        {label && floatingLabel && (
          <label className={getLabelStyles()}>
            {label}
            {required && <span className="ml-1 text-[#d92d20]">*</span>}
          </label>
        )}
      </div>

      {/* Error Message Container - only show when there's an error */}
      {hasError && (
        <div className="mt-1">
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: '#d92d20' }}
          >
            <PiWarningCircle className="h-4 w-4" style={{ color: '#d92d20' }} />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyInputWithDropdown;
