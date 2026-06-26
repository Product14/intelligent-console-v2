import React, { useEffect, useState } from 'react';
import { PiWarningCircle } from 'react-icons/pi';

import { SvgRenderer } from '@/components/settings/shared/RenderSvg/SvgRenderer';
import TelephoneInput from './telephone-input';

interface GenericInputProps {
  type?: 'text' | 'email' | 'number' | 'password';
  value?: string | number;
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
  icon?: string;
  prefixIcon?: React.ReactNode; // New prop for prefix icon as React node
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  floatingLabel?: boolean;
  labelColor?: string; // New prop for custom label color
  allowFocusStyles?: boolean;
}

const GenericInput: React.FC<GenericInputProps> = ({
  type = 'text',
  value = '',
  onChange,
  placeholder = '',
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
  icon,
  prefixIcon, // New prop
  min,
  max,
  step,
  maxLength,
  labelColor, // New prop,
  allowFocusStyles = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBlurred, setHasBlurred] = useState(false); // Track if field has been blurred
  const [showError, setShowError] = useState(false); // Track if we should show error

  const stringValue = typeof value === 'number' ? value.toString() : value;

  // Validation patterns
  const validationPatterns = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Enter a valid email address',
    },
    number: {
      validate: (val: string) => {
        const num = parseFloat(val);
        if (val !== '' && isNaN(num)) return 'Enter a valid number';
        if (min !== undefined && num < min)
          return `Value must be at least ${min}`;
        if (max !== undefined && num > max)
          return `Value must be at most ${max}`;
        return null;
      },
    },
  };

  // Validate input value
  const validateValue = (inputValue: string): string | null => {
    if (required && !inputValue.trim()) {
      return `${label || 'This field'} is required`;
    }

    if (!inputValue.trim()) {
      return null; // Empty but not required is valid
    }

    // Custom validation takes precedence
    if (customValidation) {
      return customValidation(inputValue);
    }

    // Built-in validation based on type
    if (type === 'email' && validationPatterns.email.pattern) {
      if (!validationPatterns.email.pattern.test(inputValue)) {
        return validationPatterns.email.message;
      }
    }

    if (type === 'number' && validationPatterns.number.validate) {
      return validationPatterns.number.validate(inputValue);
    }

    return null;
  };

  // Handle validation on value change - only after first blur
  useEffect(() => {
    if (autoValidate && hasBlurred) {
      const validationError = validateValue(stringValue);
      setError(validationError);

      // Show error immediately if there is one, hide immediately if resolved
      setShowError(!!validationError);

      if (onValidationChange) {
        onValidationChange(!validationError, validationError);
      }
    }
  }, [stringValue, autoValidate, hasBlurred]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // For number inputs, allow empty string or valid numbers
    if (type === 'number') {
      // Allow empty string, numbers, and decimal points
      if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
        if (onChange && !disabled) {
          onChange(inputValue);
        }
      }
    } else {
      if (onChange && !disabled) {
        onChange(inputValue);
      }
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBlurred(true); // Mark that field has been blurred

    if (autoValidate) {
      const validationError = validateValue(stringValue);
      setError(validationError);
      setShowError(!!validationError); // Show error on first blur if there is one

      if (onValidationChange) {
        onValidationChange(!validationError, validationError);
      }
    }
  };

  // Enhanced size-based styling with new large size
  const sizeClasses = {
    small: {
      container: 'h-8',
      text: 'text-sm',
      padding: 'px-3',
      labelText: 'text-xs',
      iconSize: 'h-3 w-3',
      prefixPadding: 'pl-8', // Padding when prefix icon is present
    },
    medium: {
      container: 'h-10',
      text: 'text-sm',
      padding: 'px-3',
      labelText: 'text-xs font-medium',
      iconSize: 'h-4 w-4',
      prefixPadding: 'pl-10', // Padding when prefix icon is present
    },
    large: {
      container: 'h-12',
      text: 'text-base',
      padding: 'px-4',
      labelText: 'text-sm',
      iconSize: 'h-5 w-5',
      prefixPadding: 'pl-12', // Padding when prefix icon is present
    },
  };

  const currentSize = sizeClasses[size];

  // Determine validation state - only show error if we should show it
  const hasError = error && showError;
  const isValid = !error && hasBlurred && stringValue.trim() !== '';

  // State-based styling matching Figma design and existing patterns
  const getContainerStyles = () => {
    let baseStyles = `relative flex ${currentSize.container} items-center rounded-[6px] bg-[rgba(255,255,255,0.9)] border transition-all duration-200`;

    if (disabled) {
      return `${baseStyles} border-[#cfcfcf] cursor-not-allowed opacity-60`;
    }

    if (hasError) {
      return `${baseStyles} border-red-400`;
    }

    if (isFocused && allowFocusStyles) {
      return `${baseStyles} border-[rgba(70,0,242,0.6)]`;
    }

    // Default state - matching Figma design
    return `${baseStyles} border-[#cfcfcf]`;
  };

  const getInputStyles = () => {
    let baseStyles = `w-full bg-white ${currentSize.text} outline-none font-normal leading-5`;

    // Apply appropriate padding based on prefix icon presence
    if (prefixIcon || icon) {
      baseStyles += ` ${currentSize.prefixPadding} pr-3`;
    } else {
      baseStyles += ` ${currentSize.padding}`;
    }

    if (disabled) {
      return `${baseStyles} text-gray-400 cursor-not-allowed placeholder:text-gray-300`;
    }

    if (hasError) {
      return `${baseStyles} text-red-700 placeholder:text-red-400`;
    }

    if (isFocused) {
      return `${baseStyles} text-neutral-950 placeholder:text-[#cfcfcf]`;
    }

    // Default state - matching Figma design
    return `${baseStyles} text-neutral-950 placeholder:text-[#cfcfcf]`;
  };

  const getLabelStyles = () => {
    const shouldFloatLabel = isFocused || stringValue !== '';

    if (floatingLabel) {
      // Floating label behavior
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

      // Default state for floating label
      return `${baseStyles} text-[rgba(0,5,29,0.45)]`;
    } else {
      // Static label above the field
      let baseStyles = `block mb-2 transition-all duration-200 ${currentSize.labelText}`;

      if (disabled) {
        return `${baseStyles} text-gray-400`;
      }

      // Default state for static label - use custom color if provided
      const defaultColor = labelColor || '#1a1a1a';
      return `${baseStyles} text-[${defaultColor}]`;
    }
  };

  const getIconStyles = () => {
    let baseStyles = currentSize.iconSize;

    if (disabled) {
      return `${baseStyles} text-gray-400`;
    }

    if (hasError) {
      return `${baseStyles} text-red-500`;
    }

    if (isFocused) {
      return `${baseStyles} text-[rgba(70,0,242,0.8)]`;
    }

    // Default state
    return `${baseStyles} text-[rgba(0,5,29,0.45)]`;
  };

  const getPrefixIconStyles = () => {
    let baseStyles = `absolute left-3 flex items-center justify-center ${currentSize.iconSize}`;

    if (disabled) {
      return `${baseStyles} text-gray-400`;
    }

    if (hasError) {
      return `${baseStyles} text-red-500`;
    }

    if (isFocused) {
      return `${baseStyles} text-[rgba(70,0,242,0.8)]`;
    }

    // Default state
    return `${baseStyles} text-[rgba(0,5,29,0.45)]`;
  };

  // Input attributes based on type
  const getInputAttributes = () => {
    const baseAttributes: any = {
      type,
      value: stringValue,
      onChange: handleInputChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled,
      className: getInputStyles(),
      maxLength,
      placeholder: placeholder || '',
    };

    // Always add placeholder if provided
    if (placeholder) {
      baseAttributes.placeholder = placeholder;
    }

    // Add number-specific attributes
    if (type === 'number') {
      if (min !== undefined) baseAttributes.min = min;
      if (max !== undefined) baseAttributes.max = max;
      if (step !== undefined) baseAttributes.step = step;
    }

    // Add email-specific attributes
    if (type === 'email') {
      baseAttributes.autoComplete = 'email';
    }

    return baseAttributes;
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
        {/* Prefix Icon (React Node) */}
        {prefixIcon && (
          <div className={getPrefixIconStyles()}>{prefixIcon}</div>
        )}

        {/* Legacy Icon (SVG) - only show if no prefix icon */}
        {icon && !prefixIcon && (
          <div className="flex items-center justify-center pl-3 pr-1">
            <SvgRenderer fileName={icon} className={getIconStyles()} />
          </div>
        )}

        {/* Input */}
        <input {...getInputAttributes()} />

        {/* Floating Label (when floatingLabel is true) */}
        {label && floatingLabel && (
          <label className={getLabelStyles()}>
            {label}
            {required && <span className="text-[#d92d20]">*</span>}
          </label>
        )}
      </div>

      {/* Error Message Container - Only render if there's an error */}
      {hasError && (
        <div className="mt-1 px-3">
          <div className="-ml-3 flex items-center gap-1 text-xs text-red-400">
            <PiWarningCircle className="h-4 w-4 text-red-400" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericInput;
