import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import {
  AsYouType,
  CountryCode,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumber,
} from 'libphonenumber-js';

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  mandatory?: boolean;
  error?: string;
  disabled?: boolean;
  selectedCountryMobile?: string;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  label = 'Phone Number',
  mandatory = false,
  error,
  disabled = false,
  selectedCountryMobile,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    if (selectedCountryMobile) {
      const countryCode = selectedCountryMobile.replace('+', '');
      const country = getCountries().find(
        (country: CountryCode) => getCountryCallingCode(country) === countryCode
      );
      return country || 'IN';
    }
    return 'IN';
  });
  const [displayValue, setDisplayValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // console.log('Input value:', inputValue);

    // Remove any non-digit characters except + for country code
    const cleanedValue = inputValue.replace(/[^\d+]/g, '');
    // console.log('Cleaned value:', cleanedValue);

    // Check if the input starts with a country code
    const countryCodeMatch = cleanedValue.match(/^\+\d+/);
    if (countryCodeMatch) {
      // console.log('countryCodeMatch', countryCodeMatch, selectedCountryMobile);
      const countryCode = countryCodeMatch[0].replace('+', '');
      // console.log('Detected country code:', countryCode);

      // Find the country that matches this code
      const matchingCountry = getCountries().find(
        (country: CountryCode) => getCountryCallingCode(country) === countryCode
      );

      if (matchingCountry) {
        console.log('Found matching country:', matchingCountry);
        setSelectedCountry(matchingCountry);
      }
    }

    // Format the number with the current or detected country
    const formatter = new AsYouType(selectedCountry);
    const formattedNumber = formatter.input(cleanedValue);

    setDisplayValue(formattedNumber);
    onChange(formattedNumber);
  };

  useEffect(() => {
    if (value) {
      const cleanedValue = value.replace(/[^\d+]/g, '');

      const countryCodeMatch = cleanedValue.match(/^\+\d+/);
      if (countryCodeMatch) {
        const matchingCountry = getCountries().find(
          (country: CountryCode) =>
            '+' + getCountryCallingCode(country) === selectedCountryMobile
        );

        if (matchingCountry) {
          setSelectedCountry(matchingCountry);
        }
      }

      // Format the number with the current or detected country
      const formatter = new AsYouType(selectedCountry);
      const formattedNumber = formatter.input(cleanedValue);
      // console.log('Formatted number in effect:', formattedNumber);

      setDisplayValue(formattedNumber);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Update when selectedCountry changes
  useEffect(() => {
    // console.log('Selected country changed:', selectedCountry);
    if (value) {
      const formatter = new AsYouType(selectedCountry);
      const formattedNumber = formatter.input(value.replace(/[^\d+]/g, ''));
      // console.log('Reformatted number after country change:', formattedNumber);
      setDisplayValue(formattedNumber);
    }
  }, [selectedCountry]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={`relative h-fit rounded-lg outline outline-1 ${error ? 'outline-red-500' : isFocused ? 'outline-blue-light' : 'outline-black/10'} inline-flex flex-col items-start justify-center transition-all duration-200`}
    >
      <div className="inline-flex items-center gap-2 self-stretch rounded-lg p-3">
        <div className="flex items-center">
          <div
            className={`flex cursor-pointer items-center gap-1.5 pr-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <div
              className={`text-black-60 flex items-center text-sm font-normal ${disabled ? 'text-black/40' : ''} transition-colors duration-200`}
            >
              +{getCountryCallingCode(selectedCountry)}
            </div>
            <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
              <MdKeyboardArrowDown
                className={`text-black-40 h-5 w-5 ${disabled ? 'opacity-50' : ''} transition-colors duration-200`}
              />
            </div>
            <div className="bg-black-5 h-6 w-0.5"></div>
          </div>

          <input
            type="tel"
            value={displayValue}
            onChange={handlePhoneChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={`h-full w-full bg-white text-sm font-normal outline-none ${disabled ? 'cursor-not-allowed text-black/40' : 'text-black/80'} placeholder:text-black-60 transition-colors duration-200 placeholder:text-sm`}
          />
        </div>
      </div>

      {/* Floating Label */}
      <div className="pointer-events-none absolute -top-1.5 left-3 inline-flex items-center justify-start">
        <div className="flex items-center justify-start">
          <div
            className={`ml-2 ${displayValue || isFocused ? 'text-xs' : 'text-base'} font-normal ${error ? 'text-red-500' : isFocused ? 'text-blue-light' : 'text-black-40'} ${!displayValue && !isFocused ? 'translate-x-[60px] translate-y-[18px]' : '-translate-y-[2px]'} transition-all duration-200 ease-out ${isFocused || displayValue ? 'bg-white' : 'bg-transparent'} z-10 whitespace-nowrap px-1`}
          >
            {label}
            {mandatory && <span className="ml-0.5 text-red-500">*</span>}
          </div>
        </div>
      </div>

      {/* Country Selection Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-black/10 bg-white shadow-lg">
          {getCountries().map((country) => (
            <div
              key={country}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 ${selectedCountry === country ? 'bg-blue-50' : ''} `}
              onClick={() => {
                setSelectedCountry(country);
                setIsOpen(false);
              }}
            >
              <span
                className={`text-sm ${selectedCountry === country ? 'text-blue-light' : 'text-black/60'} w-10`}
              >
                +{getCountryCallingCode(country)}
              </span>
              <span
                className={`text-sm ${selectedCountry === country ? 'text-blue-light' : 'text-black'} `}
              >
                {new Intl.DisplayNames(['en'], { type: 'region' }).of(country)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-500 transition-colors duration-200">
          {error}
        </div>
      )}
    </div>
  );
};
