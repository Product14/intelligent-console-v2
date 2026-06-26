import React from 'react';
import PhoneInput from 'react-phone-input-2';

import { cn } from '@spyne-console/utils/cn';

export default function PhoneInputField({
  label,
  country = 'us',
  value,
  onChange,
  onCountryChange,
  error,
  onBlur,
  required = false,
  disabled = false,
}) {
  const handleChange = (phoneValue, countryData, event, formattedValue) => {
    // Extract the phone number without the country dial code
    const dialCode = countryData?.dialCode || '';
    const phoneWithoutCode = phoneValue.startsWith(dialCode)
      ? phoneValue.slice(dialCode.length)
      : phoneValue;

    // Call onChange with the full value (for backwards compatibility)
    onChange(phoneValue);

    // Call onCountryChange if provided, with ISD code formatted as "+XX"
    if (onCountryChange && dialCode) {
      onCountryChange({
        isdCode: `+${dialCode}`,
        phoneNumber: phoneWithoutCode,
        countryCode: countryData?.countryCode || '',
      });
    }
  };

  return (
    <div
      className={cn('input-login onboard-phone-input design-system relative', {
        'border-red': error,
      })}
    >
      <label
        className={cn('text-black-60 mb-1 block text-base font-normal', {
          'text-red-500': error,
        })}
        htmlFor="dealershipContact"
      >
        {label}
        {required && (
          <span className={cn('ml-1', { 'text-red-500': error })}>*</span>
        )}
      </label>
      <style>
        {`
          .design-system .react-tel-input {
            border: 1px solid ${error ? 'rgb(239 68 68)' : 'rgb(229 231 235)'} !important;
            background: white !important;
            border-radius: 6px !important;
            height: 46px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            opacity: ${disabled ? '0.6' : '1'} !important;
            cursor: ${disabled ? 'not-allowed' : 'auto'} !important;
        }
      
           .design-system .react-tel-input .special-label {
           display: none !important;
           }
          
          .design-system .form-control {
            background: transparent !important;   
          }

         
        `}
      </style>
      <PhoneInput
        country={country}
        enableSearch
        autoFocus
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
      />
      {error && (
        <div className="ml-3 mt-1 block text-xs text-red-500">{error}</div>
      )}
    </div>
  );
}
