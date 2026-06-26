import React, { useEffect, useRef, useState } from 'react';
import { PiWarningCircle } from 'react-icons/pi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface TelephoneInputProps {
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
  initialCountry?: string;
}

const TelephoneInput: React.FC<TelephoneInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter phone number',
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
  initialCountry = 'us',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced size-based styling matching generic input
  const sizeClasses = {
    small: {
      container: 'h-8',
      text: 'text-sm',
      padding: 'px-3',
      labelText: 'text-xs',
      iconSize: 'h-3 w-3',
    },
    medium: {
      container: 'h-10',
      text: 'text-sm',
      padding: 'px-3',
      labelText: 'text-xs',
      iconSize: 'h-4 w-4',
    },
    large: {
      container: 'h-12',
      text: 'text-base',
      padding: 'px-4',
      labelText: 'text-sm',
      iconSize: 'h-5 w-5',
    },
  };

  const currentSize = sizeClasses[size];

  // Validation function
  const validatePhoneNumber = (phone: string): string | null => {
    if (required && !phone.trim()) {
      return `${label || 'Phone number'} is required`;
    }

    if (!phone.trim()) {
      return null; // Empty but not required is valid
    }

    // Custom validation takes precedence
    if (customValidation) {
      return customValidation(phone);
    }

    // Basic phone validation
    if (phone.length < 7) {
      return 'Enter a valid phone number';
    }

    return null;
  };

  // Debounced validation effect
  useEffect(() => {
    if (autoValidate && hasBlurred) {
      const validationError = validatePhoneNumber(value);
      setError(validationError);
      setShowError(!!validationError);

      if (onValidationChange) {
        onValidationChange(!validationError, validationError);
      }
    }
  }, [value, autoValidate, hasBlurred]);

  // Handle phone number change
  const handlePhoneChange = (phone: string) => {
    if (phone.length > 0) {
      setHasUserInteracted(true);
    }
    if (onChange && !disabled) {
      onChange(phone);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBlurred(true);

    if (autoValidate) {
      const validationError = validatePhoneNumber(value);
      setError(validationError);
      setShowError(!!validationError);

      if (onValidationChange) {
        onValidationChange(!validationError, validationError);
      }
    }
  };

  // Determine validation state
  const hasError = error && showError;
  const isValid = !error && hasBlurred && value.trim() !== '';

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

      return `${baseStyles} text-[#1a1a1a]`;
    }
  };

  // Get container styles based on state
  const getContainerStyles = () => {
    let baseStyles = ``;

    if (disabled) {
      return `${baseStyles} opacity-60 cursor-not-allowed`;
    }

    if (hasError) {
      return `${baseStyles} error-state`;
    }

    if (isFocused) {
      return `${baseStyles} focus-state`;
    }

    return baseStyles;
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

      <div className={getContainerStyles()}>
        <PhoneInput
          key={`phone-input-${initialCountry}`}
          specialLabel=""
          value={value}
          disableSearchIcon
          dropdownStyle={{ height: '150px' }}
          country={initialCountry}
          placeholder={placeholder}
          onChange={handlePhoneChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
        />

        {/* Floating Label (when floatingLabel is true) */}
        {label && floatingLabel && (
          <label className={getLabelStyles()}>
            {label}
            {required && <span className="ml-1 text-[#d92d20]">*</span>}
          </label>
        )}
      </div>

      {/* Error Message Container - Always present to prevent layout shift */}
      <div className="mt-1 min-h-[20px]">
        {hasError && (
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: '#d92d20' }}
          >
            <PiWarningCircle className="h-4 w-4" style={{ color: '#d92d20' }} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TelephoneInput;
